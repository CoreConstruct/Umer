<?php
// api/upload_pfp.php
// POST multipart/form-data { "pfp": FILE }
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/db.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonErr('POST only', 405);
if (empty($_FILES['pfp'])) jsonErr('No file uploaded.');

$file = $_FILES['pfp'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
$maxSize = 2 * 1024 * 1024; // 2MB

if (!in_array($file['type'], $allowedTypes)) {
    jsonErr('Invalid file type. Only JPG, PNG, and WEBP allowed.');
}
if ($file['size'] > $maxSize) {
    jsonErr('File too large. Max size is 2MB.');
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'pfp_' . $userId . '_' . time() . '.' . $ext;
$targetDir = __DIR__ . '/../uploads/pfps/';
$targetPath = $targetDir . $filename;

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $db = getDB();
    $db->prepare('UPDATE users SET pfp_path = ? WHERE id = ?')
       ->execute(['uploads/pfps/' . $filename, $userId]);
    
    jsonOk([
        'message' => 'Profile picture updated successfully.',
        'pfp_path' => 'uploads/pfps/' . $filename
    ]);
} else {
    jsonErr('Failed to save uploaded file.', 500);
}
