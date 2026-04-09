<?php
// scripts/prepare_presentation.php
require_once __DIR__ . '/../config/db.php';

$users = [
    ['name' => 'Demo User 1', 'email' => 'demo1@signbridge.com'],
    ['name' => 'Demo User 2', 'email' => 'demo2@signbridge.com'],
    ['name' => 'Demo User 3', 'email' => 'demo3@signbridge.com'],
    ['name' => 'Demo User 4', 'email' => 'demo4@signbridge.com'],
    ['name' => 'Demo User 5', 'email' => 'demo5@signbridge.com'],
];

$lessons = [
    ['id' => 0, 'cat' => 'alphabet', 'items' => str_split('ABCDEFGHIJKLM')],
    ['id' => 1, 'cat' => 'alphabet', 'items' => str_split('NOPQRSTUVWXYZ')],
    ['id' => 2, 'cat' => 'greetings', 'items' => ['hello', 'goodbye', 'thank_you', 'please', 'sorry', 'yes', 'no', 'nice_meet', 'how_are', 'my_name']],
    ['id' => 3, 'cat' => 'numbers',  'items' => ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']],
    ['id' => 4, 'cat' => 'phrases',  'items' => ['help', 'understand', 'repeat', 'slow', 'bathroom', 'water2', 'food', 'love', 'family', 'friend']],
];

try {
    $db = getDB();
    
    foreach ($users as $u) {
        // 1. Create User
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$u['email']]);
        $userId = $stmt->fetchColumn();
        
        if (!$userId) {
            $stmt = $db->prepare("INSERT INTO users (name, email, password, xp, level, streak) VALUES (?, ?, 'password123', 450, 5, 3)");
            $stmt->execute([$u['name'], $u['email']]);
            $userId = $db->lastInsertId();
        } else {
            // Update stats for existing demo users
            $db->prepare("UPDATE users SET xp = 450, level = 5, streak = 3 WHERE id = ?")->execute([$userId]);
        }

        // 2. Clear old progress for this user to ensure we start fresh for the demo
        $db->prepare("DELETE FROM lesson_progress WHERE user_id = ?")->execute([$userId]);
        $db->prepare("DELETE FROM history WHERE user_id = ?")->execute([$userId]);
        // Note: user_achievements might exist but we'll leave them or add new ones

        foreach ($lessons as $l) {
            // Mark lesson as in-progress with high score
            $db->prepare("INSERT INTO lesson_progress (user_id, lesson_id, completed, score) VALUES (?, ?, 0, 90)")
               ->execute([$userId, $l['id']]);

            // Complete all items EXCEPT the last one
            $itemsToComplete = array_slice($l['items'], 0, -1);
            
            foreach ($itemsToComplete as $item) {
                // Add to history (is_correct=1)
                $db->prepare("INSERT INTO history (user_id, letter, category, confidence, is_correct) VALUES (?, ?, ?, 0.95, 1)")
                   ->execute([$userId, $item, $l['cat']]);
            }
        }
        
        // Give them a "First Sign" and "Lesson Complete" achievement for flavor
        $db->prepare("INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, 1), (?, 11)")
           ->execute([$userId, $userId]);
    }
    
    echo "Success: 5 demo users prepared with near-complete lesson progress.\n";
    echo "Login: demo1@signbridge.com / password123\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
