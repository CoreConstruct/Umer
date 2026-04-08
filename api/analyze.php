<?php
// ============================================================
//  api/analyze.php
//  POST  { "image": "<base64 jpeg/png>", "target_letter": "A" }
//  Returns JSON: { success, letter, confidence, feedback,
//                  xp_gained, new_xp, new_level, is_correct,
//                  new_achievements, top3, landmarks }
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/achievement_checker.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$userId = requireAuth();

// ── Read JSON body ────────────────────────────────────────────
$body         = json_decode(file_get_contents('php://input'), true) ?? [];
$base64Image  = $body['image']         ?? '';
$targetLetter = strtoupper(trim($body['target_letter'] ?? ''));

if (empty($base64Image)) jsonErr('No image provided.');

// ── Decode & save image ───────────────────────────────────────
$uploadsDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

// Strip data-URI prefix (data:image/jpeg;base64,...)
$base64Image = preg_replace('#^data:image/\w+;base64,#', '', $base64Image);
$imgData     = base64_decode($base64Image);

if ($imgData === false || strlen($imgData) < 100) {
    jsonErr('Invalid image data.');
}

$filename  = 'sign_' . $userId . '_' . time() . '_' . rand(1000,9999) . '.jpg';
$imagePath = $uploadsDir . $filename;
file_put_contents($imagePath, $imgData);

// ── Locate Python binary ──────────────────────────────────────
$isWindows  = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
$pythonBin  = $isWindows ? realpath(__DIR__ . '/../venv_new/Scripts/python.exe') : 'python3';
if (!$pythonBin && $isWindows) $pythonBin = 'python'; // fallback

// ── Locate model script ───────────────────────────────────────
$modelScript = realpath(__DIR__ . '/../ml/model.py');
if (!$modelScript) {
    @unlink($imagePath);
    jsonErr('ml/model.py not found. Check your project structure.', 500);
}

// ── Run Python — stderr → /dev/null so TF/MediaPipe noise
//    never pollutes stdout that PHP reads ──────────────────────
$devNull     = $isWindows ? '2>NUL' : '2>/dev/null';
$safeImgPath = escapeshellarg($imagePath);
$cmd         = "$pythonBin $modelScript $safeImgPath $devNull";
$rawOutput   = shell_exec($cmd);

// If devNull failed for any reason, retry capturing everything
if (empty(trim($rawOutput ?? ''))) {
    $rawOutput = shell_exec("$pythonBin $modelScript $safeImgPath 2>&1");
}

if ($rawOutput === null) {
    @unlink($imagePath);
    jsonErr(
        'shell_exec() returned null. ' .
        'Check that shell_exec is not disabled in php.ini (disable_functions).',
        500
    );
}

// ── Extract the JSON line from Python stdout ──────────────────
// (skip any stray warning lines that may have slipped through)
$jsonLine = '';
foreach (array_reverse(explode("\n", trim($rawOutput))) as $line) {
    $line = trim($line);
    if ($line !== '' && $line[0] === '{' && $line[-1] === '}') {
        $jsonLine = $line;
        break;
    }
}

if ($jsonLine === '') {
    @unlink($imagePath);
    jsonErr(
        'Python produced no JSON. Raw output: ' . substr(strip_tags($rawOutput), 0, 400),
        500
    );
}

$mlResult = json_decode($jsonLine, true);

if (!$mlResult) {
    @unlink($imagePath);
    jsonErr('Could not parse Python JSON: ' . substr($jsonLine, 0, 200), 500);
}

if (isset($mlResult['error'])) {
    @unlink($imagePath);
    jsonErr('ML error: ' . $mlResult['error'], 500);
}

// ── Unpack ML result ──────────────────────────────────────────
$detectedLetter = strtoupper($mlResult['letter']    ?? '?');
$confidence     = (float)  ($mlResult['confidence'] ?? 0.0);
$hasLandmarks   = (bool)   ($mlResult['landmarks']  ?? false);
$confidence_pct = (int) round($confidence * 100);

// ── Correctness & XP ─────────────────────────────────────────
// A "?" means no hand was detected – never award XP
$isCorrect = (
    $hasLandmarks &&
    $targetLetter !== '' &&
    $detectedLetter === $targetLetter &&
    $confidence >= 0.60
) ? 1 : 0;

$xpGained = $isCorrect ? 10 : 0;

// ── Build feedback message ────────────────────────────────────
if (!$hasLandmarks) {
    $feedback = "👋 No hand detected in the frame. "
              . "Make sure your hand is clearly visible, well-lit, "
              . "and centred in the camera view.";
} elseif ($isCorrect) {
    $opts = [
        "Perfect! Your $detectedLetter sign is spot-on — {$confidence_pct}% confidence! 🎯",
        "Excellent $detectedLetter! Clean hand shape. Keep it up! 💪",
        "Textbook $detectedLetter — the model is very confident. ✅",
    ];
    $feedback = $opts[array_rand($opts)];
} elseif ($confidence >= 0.50) {
    $opts = [
        "Close! Detected $detectedLetter at {$confidence_pct}%. Try adjusting your finger position for $targetLetter.",
        "Almost there — got $detectedLetter. Double-check the guide for $targetLetter and try again.",
        "Good attempt! Model saw $detectedLetter. Review the hand shape for $targetLetter carefully.",
    ];
    $feedback = $opts[array_rand($opts)];
} else {
    $opts = [
        "Got $detectedLetter instead of $targetLetter. Check the step-by-step guide and try again!",
        "Not quite — saw $detectedLetter. Slow down and match the guide for $targetLetter.",
        "Keep practising! Detected $detectedLetter; review the hand shape for $targetLetter.",
    ];
    $feedback = $opts[array_rand($opts)];
}

// ── Persist to DB ─────────────────────────────────────────────
$db = getDB();

// history
$db->prepare(
    'INSERT INTO history (user_id, letter, confidence, is_correct) VALUES (?, ?, ?, ?)'
)->execute([$userId, $detectedLetter, $confidence, $isCorrect]);

// XP + level
if ($xpGained > 0) {
    $db->prepare(
        'UPDATE users
         SET xp    = xp + ?,
             level = GREATEST(1, FLOOR((xp + ?) / 100) + 1)
         WHERE id = ?'
    )->execute([$xpGained, $xpGained, $userId]);
}

// Today's practice session (upsert)
$today = date('Y-m-d');
if ($isCorrect) {
    $db->prepare(
        'INSERT INTO practice_sessions (user_id, correct, wrong, streak, date)
         VALUES (?, 1, 0, 1, ?)
         ON DUPLICATE KEY UPDATE correct = correct + 1, streak = streak + 1'
    )->execute([$userId, $today]);
} else {
    $db->prepare(
        'INSERT INTO practice_sessions (user_id, correct, wrong, streak, date)
         VALUES (?, 0, 1, 0, ?)
         ON DUPLICATE KEY UPDATE wrong = wrong + 1, streak = 0'
    )->execute([$userId, $today]);
}

// Achievements
$newAchievements = checkAndAwardAchievements($db, $userId);

// Updated user stats
$stmt = $db->prepare('SELECT xp, level FROM users WHERE id = ?');
$stmt->execute([$userId]);
$updated = $stmt->fetch();

// Clean up temp image
@unlink($imagePath);

// ── Respond ───────────────────────────────────────────────────
jsonOk([
    'letter'           => $detectedLetter,
    'confidence'       => $confidence,
    'confidence_pct'   => $confidence_pct,
    'is_correct'       => (bool) $isCorrect,
    'landmarks'        => $hasLandmarks,
    'feedback'         => $feedback,
    'xp_gained'        => $xpGained,
    'new_xp'           => (int) ($updated['xp']    ?? 0),
    'new_level'        => (int) ($updated['level'] ?? 1),
    'new_achievements' => $newAchievements,
    'top3'             => $mlResult['top3'] ?? [],
]);
