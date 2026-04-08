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
$stmt = $db->prepare(
    'SELECT email FROM password_resets
     WHERE token = ? AND used = 0 AND expires_at > NOW()'
);
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) jsonErr('This reset link is invalid or has expired. Please request a new one.', 400);

$email = $row['email'];
$hash  = password_hash($password, PASSWORD_BCRYPT);

// Update password
$db->prepare('UPDATE users SET password = ? WHERE email = ?')->execute([$hash, $email]);

// Invalidate all tokens for this email
$db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?')->execute([$email]);

jsonOk(['message' => 'Password updated successfully. You can now log in.']);
