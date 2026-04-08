<?php
// ============================================================
//  api/get_profile.php
//  GET  (session required)
//  Returns full profile: user, history, achievements, sessions
// ============================================================

require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

$userId = requireAuth();
$db     = getDB();

// ── User row ──────────────────────────────────────────────────
$stmt = $db->prepare('SELECT id, name, email, xp, level, streak, role, last_active, created_at FROM users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();
if (!$user) jsonErr('User not found.', 404);

// ── Recent history (last 20) ──────────────────────────────────
$stmt = $db->prepare(
    'SELECT letter, confidence, is_correct, timestamp
     FROM history
     WHERE user_id = ?
     ORDER BY timestamp DESC
     LIMIT 20'
);
$stmt->execute([$userId]);
$history = $stmt->fetchAll();

// ── Session stats (today) ─────────────────────────────────────
$today = date('Y-m-d');
$stmt  = $db->prepare(
    'SELECT correct, wrong, streak FROM practice_sessions WHERE user_id = ? AND date = ?'
);
$stmt->execute([$userId, $today]);
$todaySession = $stmt->fetch() ?: ['correct' => 0, 'wrong' => 0, 'streak' => 0];

// ── Total stats ────────────────────────────────────────────────
$stmt = $db->prepare(
    'SELECT COUNT(*) as total,
            SUM(is_correct) as total_correct,
            COUNT(DISTINCT DATE(timestamp)) as active_days
     FROM history WHERE user_id = ?'
);
$stmt->execute([$userId]);
$totals = $stmt->fetch();

// ── All achievements + which ones earned ─────────────────────
$stmt = $db->prepare(
    'SELECT a.id, a.name, a.description, a.icon, a.xp_reward,
            ua.earned_at
     FROM achievements a
     LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
     ORDER BY a.id'
);
$stmt->execute([$userId]);
$achievements = $stmt->fetchAll();

// ── Build response ────────────────────────────────────────────
jsonOk([
    'user' => [
        'id'          => (int) $user['id'],
        'name'        => $user['name'],
        'email'       => $user['email'],
        'xp'          => (int) $user['xp'],
        'level'       => (int) $user['level'],
        'streak'      => (int) $user['streak'],
        'role'        => $user['role'],
        'last_active' => $user['last_active'],
        'created_at'  => $user['created_at'],
    ],
    'history'       => $history,
    'today_session' => $todaySession,
    'totals'        => [
        'attempts'     => (int) ($totals['total'] ?? 0),
        'correct'      => (int) ($totals['total_correct'] ?? 0),
        'active_days'  => (int) ($totals['active_days'] ?? 0),
    ],
    'achievements'  => $achievements,
]);
