<?php
$ch = curl_init('http://localhost/umer/api/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email'=>'admin@signbridge.com','password'=>'admin123']));
$r = curl_exec($ch);
echo "Admin login: $r\n\n";
curl_close($ch);

$ch = curl_init('http://localhost/umer/api/login.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email'=>'demo1@signbridge.com','password'=>'password123']));
$r = curl_exec($ch);
echo "Demo1 login: $r\n\n";
curl_close($ch);

// Test forgot password
$ch = curl_init('http://localhost/umer/api/forgot_password.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email'=>'demo1@signbridge.com']));
$r = curl_exec($ch);
echo "Forgot password: $r\n\n";
$data = json_decode($r, true);
$token = $data['token'] ?? 'NO_TOKEN';

// Test reset password with the token we just got
$ch = curl_init('http://localhost/umer/api/reset_password.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['token'=>$token,'password'=>'newpass123']));
$r = curl_exec($ch);
echo "Reset password: $r\n";
curl_close($ch);
