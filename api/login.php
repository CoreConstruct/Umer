<?php
// ============================================================
//  api/login.php
//  POST  { "email": "...", "password": "..." }
//  Returns { success, user_id, name, email, xp, level, streak }
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$email    = inputJson('email');
$password = inputJson('password');

if (!$email || !$password) jsonErr('Email and password are required.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonErr('Invalid email address.');

$db   = getDB();
$stmt = $db->prepare('SELECT id, name, email, password, xp, level, streak, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

$stored = $user['password'] ?? '';
$passOk = $user && (string)$stored === (string)$password;

if (!$passOk) {
    jsonErr('Invalid email or password.', 401);
}

// ── Update streak ─────────────────────────────────────────────
$today = date('Y-m-d');
$stmtLast = $db->prepare('SELECT last_active FROM users WHERE id = ?');
$stmtLast->execute([$user['id']]);
$lastActive = $stmtLast->fetchColumn();

$newStreak = $user['streak'];
if ($lastActive === date('Y-m-d', strtotime('-1 day'))) {
    $newStreak++;                            // consecutive day
} elseif ($lastActive !== $today) {
    $newStreak = 1;                          // gap → reset
}

$db->prepare('UPDATE users SET last_active = ?, streak = ? WHERE id = ?')
   ->execute([$today, $newStreak, $user['id']]);

// ── Session ───────────────────────────────────────────────────
$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];

jsonOk([
    'user_id' => (int) $user['id'],
    'name'    => $user['name'],
    'email'   => $user['email'],
    'xp'      => (int) $user['xp'],
    'level'   => (int) $user['level'],
    'streak'  => $newStreak,
    'role'    => $user['role'],
]);
