<?php
// api/get_progress.php
// GET — returns lesson progress for authenticated user
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

$userId = requireAuth();
$db     = getDB();

$stmt = $db->prepare('SELECT lesson_id, completed, score FROM lesson_progress WHERE user_id = ?');
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

// Index by lesson_id
$progress = [];
foreach ($rows as $r) {
    $progress[(int)$r['lesson_id']] = [
        'completed' => (bool) $r['completed'],
        'score'     => (int)  $r['score'],
    ];
}

// Fetch mastered signs: where the user has been correct at least once
$stmtMastery = $db->prepare("
    SELECT letter, category 
    FROM history 
    WHERE user_id = ? AND is_correct = 1 
    GROUP BY letter, category 
    HAVING COUNT(*) >= 1
");
$stmtMastery->execute([$userId]);
$masteryRows = $stmtMastery->fetchAll();

$masteredSigns = [];
foreach ($masteryRows as $row) {
    $masteredSigns[] = [
        'id'       => $row['letter'],
        'category' => $row['category']
    ];
}

jsonOk([
    'progress'       => $progress,
    'mastered_signs' => $masteredSigns
]);
