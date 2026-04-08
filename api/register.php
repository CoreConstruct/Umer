<?php
// ============================================================
//  api/register.php
//  POST  { "name": "...", "email": "...", "password": "..." }
//  Returns { success, user_id, name, email }
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);

// ── Read & validate input ────────────────────────────────────
$name     = inputJson('name');
$email    = inputJson('email');
$password = inputJson('password');

if (strlen($name) < 2)              jsonErr('Name must be at least 2 characters.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonErr('Invalid email address.');
if (strlen($password) < 6)          jsonErr('Password must be at least 6 characters.');

$db = getDB();

// ── Check for duplicate email ─────────────────────────────────
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonErr('An account with that email already exists.');
}

// ── Insert user ───────────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->execute([$name, $email, $hash]);
$userId = (int) $db->lastInsertId();

// ── Auto-login ────────────────────────────────────────────────
$_SESSION['user_id'] = $userId;
$_SESSION['name']    = $name;

jsonOk([
    'user_id' => $userId,
    'name'    => $name,
    'email'   => $email,
    'xp'      => 0,
    'level'   => 1,
    'message' => 'Account created successfully!',
], 201);
