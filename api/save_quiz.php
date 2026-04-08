<?php
// api/save_quiz.php
// POST { "lesson_id": 0, "results": [{ "question":"...", "correct_ans":"A", "user_ans":"A", "is_correct":true }] }
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/achievement_checker.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);
$userId = requireAuth();

$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$lessonId = (int) ($body['lesson_id'] ?? 0);
$results  = $body['results']   ?? [];

if (empty($results) || !is_array($results)) jsonErr('No quiz results provided.');

$db = getDB();
$totalCorrect = 0;
$totalXp      = 0;

foreach ($results as $r) {
    $question   = substr(trim($r['question']   ?? ''), 0, 255);
    $correctAns = substr(trim($r['correct_ans'] ?? ''), 0, 100);
    $userAns    = substr(trim($r['user_ans']    ?? ''), 0, 100);
    $isCorrect  = (bool) ($r['is_correct'] ?? false);
    $xpEarned   = $isCorrect ? 5 : 0;

    if ($isCorrect) $totalCorrect++;
    $totalXp += $xpEarned;

    $db->prepare(
        'INSERT INTO quiz_attempts (user_id, lesson_id, question, correct_ans, user_ans, is_correct, xp_earned)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$userId, $lessonId, $question, $correctAns, $userAns, $isCorrect ? 1 : 0, $xpEarned]);
}

$total    = count($results);
$score    = $total > 0 ? round($totalCorrect / $total * 100) : 0;
$isPerfect = $score === 100;

// Bonus XP for perfect score
if ($isPerfect) $totalXp += 20;

// Update lesson progress
$db->prepare(
    'INSERT INTO lesson_progress (user_id, lesson_id, score)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE score = GREATEST(score, ?), updated_at = NOW()'
)->execute([$userId, $lessonId, $score, $score]);

// Mark completed if score >= 70%
if ($score >= 70) {
    $db->prepare(
        'UPDATE lesson_progress SET completed = 1 WHERE user_id = ? AND lesson_id = ?'
    )->execute([$userId, $lessonId]);
}

// Award XP
if ($totalXp > 0) {
    $db->prepare(
        'UPDATE users SET xp = xp + ?, level = GREATEST(1, FLOOR((xp + ?) / 100) + 1) WHERE id = ?'
    )->execute([$totalXp, $totalXp, $userId]);
}

$newAchievements = checkAndAwardAchievements($db, $userId);

$stmt = $db->prepare('SELECT xp, level FROM users WHERE id = ?');
$stmt->execute([$userId]);
$updated = $stmt->fetch();

jsonOk([
    'score'            => $score,
    'correct'          => $totalCorrect,
    'total'            => $total,
    'xp_earned'        => $totalXp,
    'new_xp'           => (int) $updated['xp'],
    'new_level'        => (int) $updated['level'],
    'passed'           => $score >= 70,
    'perfect'          => $isPerfect,
    'new_achievements' => $newAchievements,
]);
