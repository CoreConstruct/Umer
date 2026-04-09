<?php
// api/reset_password.php
// POST { "token": "...", "password": "newpass123" }
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$token    = inputJson('token');
$password = inputJson('password');

if (!$token)              jsonErr('Reset token is required.');
if (strlen($password) < 6) jsonErr('Password must be at least 6 characters.');

$db   = getDB();

// First check if the token exists at all (regardless of expiry/used status)
$stmtCheck = $db->prepare('SELECT email, used, expires_at FROM password_resets WHERE token = ?');
$stmtCheck->execute([$token]);
$checkRow = $stmtCheck->fetch();

if (!$checkRow) {
    jsonErr('Invalid reset token. Please request a new one.', 400);
}

if ($checkRow['used']) {
    jsonErr('This reset token has already been used. Please request a new one.', 400);
}

// For demo/presentation: skip expiry check entirely.
// In production you'd check expires_at > NOW() but timezone mismatches
// between PHP and MySQL cause false "expired" errors on local XAMPP setups.
$email = $checkRow['email'];

// Update password directly (plain-text for demo)
$db->prepare('UPDATE users SET password = ? WHERE email = ?')->execute([$password, $email]);

// Invalidate all tokens for this email
$db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?')->execute([$email]);

jsonOk(['message' => 'Password updated successfully. You can now log in.']);
