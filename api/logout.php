<?php
// ============================================================
//  api/logout.php
//  POST (no body needed)
// ============================================================

require_once __DIR__ . '/../config/helpers.php';

session_unset();
session_destroy();
jsonOk(['message' => 'Logged out successfully.']);
