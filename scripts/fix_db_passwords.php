<?php
// scripts/fix_db_passwords.php
require_once __DIR__ . '/../config/db.php';

try {
    $db = getDB();
    
    // Set all existing users' passwords to 'password123' for simplicity
    // and to ensure they are all in plain-text.
    $stmt = $db->prepare("UPDATE users SET password = 'password123'");
    $stmt->execute();
    
    echo "Success: All user passwords updated to 'password123' (plain-text).\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
