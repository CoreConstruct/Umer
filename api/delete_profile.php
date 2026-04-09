<?php
// api/delete_profile.php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

$userId = requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST or DELETE only', 405);

$db = getDB();

// Delete user - constraints should cascade delete history, progress, attempts, etc.
$stmt = $db->prepare('DELETE FROM users WHERE id = ?');
$stmt->execute([$userId]);

// Clear session
session_destroy();
setcookie('sb_session', '', time() - 3600, '/');

jsonOk(['message' => 'Account deleted successfully']);
