<?php
// ============================================================
//  config/db.php  –  Shared PDO connection
//  Edit DB_HOST / DB_NAME / DB_USER / DB_PASS for your setup
// ============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'signbridge');
define('DB_USER', 'root');       // change if you set a MySQL password
define('DB_PASS', '');           // change to your MySQL password

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}
