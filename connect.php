<?php
$host = 'localhost';
$db = 'tvwcyumy_ITS_inventory';
$user = 'tvwcyumy_db_user';
$password = 'db_password';

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>