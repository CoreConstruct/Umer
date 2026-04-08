<?php
// api/forgot_password.php
// POST { "email": "..." }
// Creates a reset token. In production, email it. Here we return it directly.
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$email = inputJson('email');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonErr('Invalid email address.');

$db   = getDB();
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Always respond OK to prevent email enumeration
if (!$user) {
    jsonOk(['message' => 'If that email exists, a reset link has been sent.', 'token' => null]);
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

// In a real app: send email with link. Here: return token directly for demo.
jsonOk([
    'message' => 'Password reset token generated. Use it at /api/reset_password.php',
    'token'   => $token,  // In production, send via email only
    'expires' => $expiresAt,
    'demo_note' => 'In production, remove the token from this response and email it instead.',
]);
