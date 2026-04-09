<?php
require_once __DIR__ . '/../config/db.php';

$db = getDB();

// Check if admin@signbridge.com exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute(['admin@signbridge.com']);
$exists = $stmt->fetchColumn();

if (!$exists) {
    $db->prepare("INSERT INTO users (name, email, password, role, xp, level, streak) VALUES (?, ?, ?, 'admin', 0, 1, 0)")
       ->execute(['Admin', 'admin@signbridge.com', 'admin123']);
    echo "Created admin@signbridge.com / admin123\n";
} else {
    echo "admin@signbridge.com already exists\n";
}

// Also ensure hiteshk67@gmail.com is admin
$db->prepare("UPDATE users SET role = 'admin', password = 'password123' WHERE email = ?")
   ->execute(['hiteshk67@gmail.com']);
echo "Ensured hiteshk67@gmail.com is admin with password123\n";

// Show all users
$users = $db->query('SELECT id, name, email, role, password FROM users')->fetchAll();
foreach ($users as $u) {
    echo "  [{$u['id']}] {$u['name']} <{$u['email']}> role={$u['role']} pass={$u['password']}\n";
}
