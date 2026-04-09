<?php
/**
 * scripts/seed_presentation.php
 *
 * Seeds a presentation-ready admin + 5 demo users with near-complete progress.
 * Run from browser:  http://localhost/umer/scripts/seed_presentation.php
 * Or CLI:            php scripts/seed_presentation.php
 *
 * NOTE: For demo simplicity, passwords are stored in plain text.
 */

require_once __DIR__ . '/../config/db.php';

function upsertUser(PDO $db, array $u): int {
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$u['email']]);
    $id = (int) ($stmt->fetchColumn() ?: 0);

    if ($id > 0) {
        $db->prepare(
            'UPDATE users SET name = ?, password = ?, role = ?, xp = ?, level = ?, streak = ?, last_active = CURDATE() WHERE id = ?'
        )->execute([
            $u['name'], $u['password'], $u['role'], $u['xp'], $u['level'], $u['streak'], $id
        ]);
        return $id;
    }

    $db->prepare(
        'INSERT INTO users (name, email, password, role, xp, level, streak, last_active) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())'
    )->execute([
        $u['name'], $u['email'], $u['password'], $u['role'], $u['xp'], $u['level'], $u['streak']
    ]);
    return (int) $db->lastInsertId();
}

function setLessonProgress(PDO $db, int $userId, int $lessonId, int $score, bool $completed): void {
    $db->prepare(
        'INSERT INTO lesson_progress (user_id, lesson_id, completed, score)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE completed = VALUES(completed), score = VALUES(score), updated_at = NOW()'
    )->execute([$userId, $lessonId, $completed ? 1 : 0, $score]);
}

function seedMastery(PDO $db, int $userId, string $category, array $items, array $leaveOut, int $repeat = 3): void {
    foreach ($items as $item) {
        if (in_array($item, $leaveOut, true)) continue;
        for ($i = 0; $i < $repeat; $i++) {
            $db->prepare(
                'INSERT INTO history (user_id, letter, confidence, is_correct, category, timestamp)
                 VALUES (?, ?, 0.92, 1, ?, NOW() - INTERVAL ? MINUTE)'
            )->execute([$userId, (string)$item, $category, rand(1, 5000)]);
        }
    }
}

$db = getDB();
$db->beginTransaction();

try {
    // Admin (known working credentials for presentation)
    $admin = [
        'name'     => 'Admin',
        'email'    => 'admin@signbridge.demo',
        'password' => 'admin123',
        'role'     => 'admin',
        'xp'       => 820,
        'level'    => 9,
        'streak'   => 7,
    ];
    $adminId = upsertUser($db, $admin);

    // Demo users: each is "almost complete" with a tiny gap per category
    $demos = [
        [
            'name' => 'Demo User 1 (Almost Finished)',
            'email' => 'demo1@signbridge.demo',
            'password' => 'demo123',
            'xp' => 640, 'level' => 7, 'streak' => 5,
            'gaps' => [
                'alphabet'  => ['Z'],
                'greetings' => ['Goodbye'],
                'numbers'   => ['10'],
                'phrases'   => ['How are you?'],
            ],
            'incomplete_lesson' => 4,
        ],
        [
            'name' => 'Demo User 2 (Last Lesson Pending)',
            'email' => 'demo2@signbridge.demo',
            'password' => 'demo123',
            'xp' => 520, 'level' => 6, 'streak' => 3,
            'gaps' => [
                'alphabet'  => ['Y','Z'],
                'greetings' => ['Nice to meet you'],
                'numbers'   => ['9','10'],
                'phrases'   => ['Please'],
            ],
            'incomplete_lesson' => 4,
        ],
        [
            'name' => 'Demo User 3 (Needs One Push)',
            'email' => 'demo3@signbridge.demo',
            'password' => 'demo123',
            'xp' => 430, 'level' => 5, 'streak' => 2,
            'gaps' => [
                'alphabet'  => ['X','Y','Z'],
                'greetings' => ['Thank you'],
                'numbers'   => ['8','9','10'],
                'phrases'   => ['Sorry'],
            ],
            'incomplete_lesson' => 3,
        ],
        [
            'name' => 'Demo User 4 (Nearly There)',
            'email' => 'demo4@signbridge.demo',
            'password' => 'demo123',
            'xp' => 350, 'level' => 4, 'streak' => 1,
            'gaps' => [
                'alphabet'  => ['W','X','Y','Z'],
                'greetings' => ['Hello'],
                'numbers'   => ['7','8','9','10'],
                'phrases'   => ['Help'],
            ],
            'incomplete_lesson' => 2,
        ],
        [
            'name' => 'Demo User 5 (Ready to Complete Live)',
            'email' => 'demo5@signbridge.demo',
            'password' => 'demo123',
            'xp' => 280, 'level' => 3, 'streak' => 0,
            'gaps' => [
                'alphabet'  => ['V','W','X','Y','Z'],
                'greetings' => ['Good morning'],
                'numbers'   => ['6','7','8','9','10'],
                'phrases'   => ['Good luck'],
            ],
            'incomplete_lesson' => 1,
        ],
    ];

    // Content used for mastery seeding (must match frontend labels for extra signs)
    $alphabet = str_split('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    $greetings = ['Hello','Goodbye','Thank you','Please','Sorry','Nice to meet you','Good morning'];
    $numbers = ['1','2','3','4','5','6','7','8','9','10'];
    $phrases = ['How are you?','I am fine','Help','Good luck','See you later','What is your name?','My name is'];

    // Ensure admin has complete lessons to showcase dashboard
    for ($lid = 0; $lid <= 4; $lid++) {
        setLessonProgress($db, $adminId, $lid, 95, true);
    }
    seedMastery($db, $adminId, 'alphabet', $alphabet, ['Z'], 3);

    foreach ($demos as $d) {
        $u = [
            'name' => $d['name'],
            'email' => $d['email'],
            'password' => $d['password'],
            'role' => 'user',
            'xp' => $d['xp'],
            'level' => $d['level'],
            'streak' => $d['streak'],
        ];
        $uid = upsertUser($db, $u);

        // Lesson progress: complete all lessons except one (near-pass but not completed)
        for ($lid = 0; $lid <= 4; $lid++) {
            if ($lid === (int)$d['incomplete_lesson']) {
                setLessonProgress($db, $uid, $lid, 60, false);
            } else {
                setLessonProgress($db, $uid, $lid, 90, true);
            }
        }

        // Mastery: seed "almost complete" per category
        seedMastery($db, $uid, 'alphabet',  $alphabet,  $d['gaps']['alphabet'],  3);
        seedMastery($db, $uid, 'greetings', $greetings, $d['gaps']['greetings'], 3);
        seedMastery($db, $uid, 'numbers',   $numbers,   $d['gaps']['numbers'],   3);
        seedMastery($db, $uid, 'phrases',   $phrases,   $d['gaps']['phrases'],   3);
    }

    $db->commit();

    header('Content-Type: text/plain; charset=utf-8');
    echo "Seed complete.\n\n";
    echo "ADMIN:\n";
    echo "  email: {$admin['email']}\n";
    echo "  password: {$admin['password']}\n\n";
    echo "DEMO USERS (password = demo123):\n";
    foreach ($demos as $d) {
        echo "  {$d['email']}  ({$d['name']})\n";
    }
} catch (Throwable $e) {
    $db->rollBack();
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code(500);
    echo "Seeding failed: " . $e->getMessage() . "\n";
}

