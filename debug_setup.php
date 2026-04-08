<?php
// ============================================================
//  debug_setup.php  –  Open in browser to diagnose everything
//  http://localhost/signbridge/debug_setup.php
//  DELETE this file before going live.
// ============================================================
echo "<pre style='font-family:monospace;font-size:13px;line-height:1.6;padding:20px'>";
echo "╔══════════════════════════════════════════════════╗\n";
echo "║   SignBridge – Setup Diagnostics                 ║\n";
echo "╚══════════════════════════════════════════════════╝\n\n";

// ── 1. PHP ───────────────────────────────────────────────────
echo "── PHP ──────────────────────────────────────────────\n";
echo "Version       : " . PHP_VERSION . "\n";
echo "OS            : " . PHP_OS . "\n";
echo "shell_exec    : " . (function_exists('shell_exec') ? '✅ enabled' : '❌ DISABLED – add to php.ini') . "\n";
echo "GD extension  : " . (function_exists('imagecreatetruecolor') ? '✅' : '❌ missing') . "\n";
echo "PDO MySQL     : " . (in_array('mysql', PDO::getAvailableDrivers()) ? '✅' : '❌ missing') . "\n\n";

// ── 2. Python ────────────────────────────────────────────────
echo "── Python ───────────────────────────────────────────\n";
$pythons = PHP_OS === 'WINNT'
    ? [__DIR__ . '/venv_new/Scripts/python.exe', 'python', 'py', 'python3']
    : ['python3', 'python'];
$found = null;
foreach ($pythons as $bin) {
    $ver = trim(shell_exec("$bin --version 2>&1") ?? '');
    $ok  = str_contains($ver, 'Python');
    echo str_pad($bin, 12) . ": " . ($ok ? "✅ $ver" : "✗  not found") . "\n";
    if ($ok && !$found) $found = $bin;
}
echo "Using         : " . ($found ?? '❌ NONE FOUND') . "\n\n";

// ── 3. Python packages ───────────────────────────────────────
echo "── Python Packages ──────────────────────────────────\n";
if ($found) {
    foreach (['mediapipe', 'cv2', 'numpy'] as $pkg) {
        $res = trim(shell_exec("$found -c \"import $pkg; print($pkg.__version__)\" 2>&1") ?? '');
        $ok  = !str_contains($res, 'No module') && !str_contains($res, 'Error') && $res !== '';
        echo str_pad($pkg, 14) . ": " . ($ok ? "✅ $res" : "❌ NOT INSTALLED") . "\n";
    }
} else {
    echo "Skipped – no Python found.\n";
}
echo "\n";

// ── 4. Files ─────────────────────────────────────────────────
echo "── Required Files ───────────────────────────────────\n";
$files = [
    'ml/model.py'                   => 'MediaPipe inference script',
    'api/analyze.php'               => 'Analysis endpoint',
    'api/login.php'                 => 'Login endpoint',
    'api/register.php'              => 'Register endpoint',
    'config/db.php'                 => 'Database config',
    'config/helpers.php'            => 'Shared helpers',
    'config/achievement_checker.php'=> 'Achievement logic',
    'sql/schema.sql'                => 'DB schema',
];
foreach ($files as $path => $desc) {
    $full = __DIR__ . '/' . $path;
    echo ($full && file_exists($full) ? '✅' : '❌') . " $path  ($desc)\n";
}
$uploadsDir = __DIR__ . '/uploads/';
if (!is_dir($uploadsDir)) @mkdir($uploadsDir, 0755, true);
echo (is_writable($uploadsDir) ? '✅' : '❌') . " uploads/ (writable)\n\n";

// ── 5. Live model test ───────────────────────────────────────
echo "── Live Model Test ──────────────────────────────────\n";
$modelScript = __DIR__ . '/ml/model.py';
if (!$found) {
    echo "⏭  Skipped – no Python binary.\n";
} elseif (!file_exists($modelScript)) {
    echo "⏭  Skipped – model.py missing.\n";
} else {
    // Create tiny test JPEG
    $testPath = $uploadsDir . 'debug_test.jpg';
    $gd = imagecreatetruecolor(64, 64);
    imagefilledrectangle($gd, 0, 0, 63, 63, imagecolorallocate($gd, 120, 120, 120));
    imagejpeg($gd, $testPath); imagedestroy($gd);

    $devNull = PHP_OS === 'WINNT' ? '2>NUL' : '2>/dev/null';
    $cmd     = "$found " . escapeshellarg($modelScript) . " " . escapeshellarg($testPath) . " $devNull";
    echo "Command : $cmd\n";
    $out = shell_exec($cmd) ?? '';
    // Extract JSON line
    $json = '';
    foreach (array_reverse(explode("\n", trim($out))) as $line) {
        $line = trim($line);
        if ($line && $line[0]==='{' && $line[-1]==='}') { $json=$line; break; }
    }
    if ($json) {
        $p = json_decode($json, true);
        if ($p && !isset($p['error'])) {
            echo "✅ Model ran OK. Detected: {$p['letter']} (".round($p['confidence']*100)."%)\n";
            echo "   (Grey test image = no real hand, result is a placeholder)\n";
        } elseif ($p && isset($p['error'])) {
            echo "❌ Model error: {$p['error']}\n";
        } else { echo "❌ Could not parse JSON: $json\n"; }
    } else {
        echo "❌ No JSON from Python. Raw output:\n" . htmlspecialchars(substr($out,0,600)) . "\n";
    }
    @unlink($testPath);
}

echo "\n── Database ─────────────────────────────────────────\n";
try {
    require_once __DIR__ . '/config/db.php';
    $db = getDB();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Connected to MySQL.\n";
    echo "Tables: " . (count($tables) ? implode(', ', $tables) : '❌ NONE – run sql/schema.sql') . "\n";
} catch (Exception $e) {
    echo "❌ DB connection failed: " . $e->getMessage() . "\n";
    echo "   → Edit config/db.php and check DB_USER / DB_PASS.\n";
}

echo "\n</pre>";
