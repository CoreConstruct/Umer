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

jsonOk(['progress' => $progress]);
