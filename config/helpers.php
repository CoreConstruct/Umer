<?php
// ============================================================
//  config/helpers.php  –  Shared utilities
// ============================================================

// ── CORS (allow your frontend origin, adjust as needed) ─────
header('Access-Control-Allow-Origin: *');          // lock to your domain in prod
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Session ─────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── JSON helpers ─────────────────────────────────────────────
function jsonOk(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => true, ...$data]);
    exit;
}

function jsonErr(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// ── Require authenticated user ───────────────────────────────
function requireAuth(): int {
    if (empty($_SESSION['user_id'])) {
        jsonErr('Not authenticated. Please log in.', 401);
    }
    return (int) $_SESSION['user_id'];
}

// ── XP → Level ───────────────────────────────────────────────
function calcLevel(int $xp): int {
    return max(1, (int) floor($xp / 100) + 1);
}

// ── Safe input ────────────────────────────────────────────────
function input(string $key, string $source = 'post'): string {
    if ($source === 'post') {
        return trim($_POST[$key] ?? '');
    }
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    return trim($body[$key] ?? '');
}

function inputJson(string $key): string {
    static $body = null;
    if ($body === null) {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return trim($body[$key] ?? '');
}
