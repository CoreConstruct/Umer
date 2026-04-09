<?php
// admin/dashboard.php — Admin Panel
// Access: http://localhost/signbridge/admin/dashboard.php
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

// Simple admin check
$userId = requireAuth();
$db     = getDB();
$stmt   = $db->prepare('SELECT role FROM users WHERE id = ?');
$stmt->execute([$userId]);
$row    = $stmt->fetch();
if (!$row || $row['role'] !== 'admin') {
    jsonErr('Admin access required.', 403);
}

// ── Stats ─────────────────────────────────────────────────────
$totalUsers = $db->query('SELECT COUNT(*) FROM users')->fetchColumn();
$totalAttempts = $db->query('SELECT COUNT(*) FROM history')->fetchColumn();
$totalCorrect  = $db->query('SELECT SUM(is_correct) FROM history')->fetchColumn();
$accuracy = $totalAttempts > 0 ? round($totalCorrect / $totalAttempts * 100, 1) : 0;

$activeToday = $db->query(
    "SELECT COUNT(DISTINCT user_id) FROM practice_sessions WHERE date = CURDATE()"
)->fetchColumn();

$activeWeek = $db->query(
    "SELECT COUNT(DISTINCT user_id) FROM practice_sessions WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
)->fetchColumn();

// Most difficult letters (highest wrong rate)
$hard = $db->query(
    "SELECT letter,
            COUNT(*) as attempts,
            SUM(is_correct) as correct,
            ROUND((1 - SUM(is_correct)/COUNT(*)) * 100, 1) as error_rate
     FROM history
     GROUP BY letter
     HAVING attempts >= 5
     ORDER BY error_rate DESC
     LIMIT 8"
)->fetchAll();

// Recent registrations
$newUsers = $db->query(
    "SELECT id, name, email, xp, level, created_at FROM users ORDER BY created_at DESC LIMIT 10"
)->fetchAll();

// XP leaderboard
$leaderboard = $db->query(
    "SELECT name, xp, level, streak FROM users ORDER BY xp DESC LIMIT 10"
)->fetchAll();

// Quiz stats
$quizStats = $db->query(
    "SELECT COUNT(*) as total, SUM(is_correct) as correct,
            ROUND(AVG(is_correct)*100,1) as accuracy
     FROM quiz_attempts"
)->fetch();

// Total sessions per day (last 7 days)
$dailySessions = $db->query(
    "SELECT date, COUNT(DISTINCT user_id) as users,
            SUM(correct) as correct, SUM(wrong) as wrong
     FROM practice_sessions
     WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY date ORDER BY date DESC"
)->fetchAll();

// All users for management table
$allUsers = $db->query("SELECT id, name, email, xp, level, role, created_at, streak FROM users ORDER BY created_at DESC")->fetchAll();

jsonOk([
    'overview' => [
        'total_users'      => (int) $totalUsers,
        'total_attempts'   => (int) $totalAttempts,
        'accuracy_pct'     => $accuracy,
        'active_today'     => (int) $activeToday,
        'active_this_week' => (int) $activeWeek,
    ],
    'hard_letters'   => $hard,
    'recent_users'   => $newUsers,
    'leaderboard'    => $leaderboard,
    'quiz_stats'     => $quizStats,
    'daily_sessions' => $dailySessions,
    'all_users'      => $allUsers,
]);
