<?php
// api/forgot_password.php
// POST { "email": "..." }
// Demo mode: returns token directly in JSON response (no email sent).
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$email = inputJson('email');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonErr('Invalid email address.');

$db   = getDB();
$stmt = $db->prepare('SELECT id, name FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Always respond OK to prevent email enumeration
if (!$user) {
    jsonOk(['message' => 'If that email exists, a reset link has been sent.']);
}

// Generate a secure token
$token     = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour

// Invalidate old tokens for this email
$db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?')->execute([$email]);

// Insert new token
$db->prepare(
    'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)'
)->execute([$email, $token, $expiresAt]);

// Demo mode: return token directly in JSON (no PHPMailer dependency).
// In production, you'd send an email instead.
jsonOk([
    'message' => 'Reset token generated! Use it to set a new password.',
    'token'   => $token,
]);
