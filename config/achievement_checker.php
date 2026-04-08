<?php
// ============================================================
//  config/achievement_checker.php
//  Called after every detection to unlock achievements.
//  Returns array of newly earned achievement names.
// ============================================================

function checkAndAwardAchievements(PDO $db, int $userId): array {
    $newly = [];

    // ── Fetch counts needed for all checks ─────────────────
    $stmt = $db->prepare(
        'SELECT
           COUNT(*)            AS total_attempts,
           SUM(is_correct)     AS total_correct,
           (SELECT COUNT(*) FROM practice_sessions WHERE user_id = :uid2) AS session_count
         FROM history
         WHERE user_id = :uid1'
    );
    $stmt->execute([':uid1' => $userId, ':uid2' => $userId]);
    $stats = $stmt->fetch();

    $totalCorrect  = (int) ($stats['total_correct'] ?? 0);
    $totalAttempts = (int) ($stats['total_attempts'] ?? 0);
    $sessionCount  = (int) ($stats['session_count'] ?? 0);

    // Letters signed at least once
    $stmtLetters = $db->prepare(
        'SELECT COUNT(DISTINCT letter) as unique_letters FROM history WHERE user_id = ? AND is_correct = 1'
    );
    $stmtLetters->execute([$userId]);
    $uniqueLetters = (int) $stmtLetters->fetchColumn();

    // XP
    $stmtXp = $db->prepare('SELECT xp FROM users WHERE id = ?');
    $stmtXp->execute([$userId]);
    $xp = (int) $stmtXp->fetchColumn();

    // Streak
    $stmtStreak = $db->prepare('SELECT streak FROM users WHERE id = ?');
    $stmtStreak->execute([$userId]);
    $streak = (int) $stmtStreak->fetchColumn();

    // Today's session accuracy
    $today = date('Y-m-d');
    $stmtSess = $db->prepare(
        'SELECT correct, wrong FROM practice_sessions WHERE user_id = ? AND date = ?'
    );
    $stmtSess->execute([$userId, $today]);
    $sess = $stmtSess->fetch();
    $sessCorrect = (int) ($sess['correct'] ?? 0);
    $sessTotal   = $sessCorrect + (int) ($sess['wrong'] ?? 0);
    $accuracy    = $sessTotal > 0 ? ($sessCorrect / $sessTotal * 100) : 0;

    // ── Conditions map ─────────────────────────────────────
    //  achievement name (must match DB exactly)  =>  bool condition
    $checks = [
        'First Sign'        => $totalAttempts >= 1,
        '10 Correct'        => $totalCorrect >= 10,
        '50 Correct'        => $totalCorrect >= 50,
        '7-Day Streak'      => $streak >= 7,
        'Speed Signer'      => $sessCorrect >= 10,
        'Perfectionist'     => $sessTotal >= 10 && $accuracy >= 90,
        'Alphabet Master'   => $uniqueLetters >= 26,
        'Conversationalist' => $xp >= 500,
        'Dedicated Learner' => $sessionCount >= 30,
    ];

    // ── Which ones already earned? ──────────────────────────
    $stmtEarned = $db->prepare(
        'SELECT a.name FROM user_achievements ua
         JOIN achievements a ON a.id = ua.achievement_id
         WHERE ua.user_id = ?'
    );
    $stmtEarned->execute([$userId]);
    $alreadyEarned = array_column($stmtEarned->fetchAll(), 'name');

    // ── Award new ones ──────────────────────────────────────
    foreach ($checks as $achName => $met) {
        if (!$met || in_array($achName, $alreadyEarned, true)) continue;

        // Get achievement id + xp_reward
        $stmtAch = $db->prepare(
            'SELECT id, xp_reward FROM achievements WHERE name = ?'
        );
        $stmtAch->execute([$achName]);
        $ach = $stmtAch->fetch();
        if (!$ach) continue;

        // Insert user_achievement
        $db->prepare(
            'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)'
        )->execute([$userId, $ach['id']]);

        // Bonus XP for the achievement itself
        $db->prepare('UPDATE users SET xp = xp + ?, level = ? WHERE id = ?')
           ->execute([$ach['xp_reward'], calcLevel($xp + $ach['xp_reward']), $userId]);

        $newly[] = ['name' => $achName, 'xp_reward' => (int) $ach['xp_reward']];
    }

    return $newly;
}
