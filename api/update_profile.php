<?php
// api/update_profile.php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

$userId = requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

$name = inputJson('name');
$email = inputJson('email');
$pass = inputJson('password');

if (!$name || !$email) jsonErr('Name and email are required.');

$db = getDB();

// Check if email is taken by another user
$stmt = $db->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $userId]);
if ($stmt->fetch()) jsonErr('Email is already in use by another account.');

if ($pass) {
    if (strlen($pass) < 6) jsonErr('Password must be at least 6 characters.');
    $stmt = $db->prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
    $stmt->execute([$name, $email, $pass, $userId]);
} else {
    $stmt = $db->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    $stmt->execute([$name, $email, $userId]);
}

jsonOk(['message' => 'Profile updated successfully']);
