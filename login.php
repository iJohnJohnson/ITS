<?php
session_start();
require_once 'connect.php';

// Enable detailed error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (isset($_POST['register'])) {
        // === Register New User ===
        if ($username && $password) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO ITS_users (username, password, verified) VALUES (?, ?, 0)");
            $stmt->bind_param('ss', $username, $hashedPassword);

            if ($stmt->execute()) {
                $success = "Account created! Waiting for admin verification.";
            } else {
                $error = "Username already taken or database error.";
            }
        } else {
            $error = "Please enter both username and password.";
        }
    } elseif (isset($_POST['login'])) {
        // === Login Attempt ===
        if ($username && $password) {
            $stmt = $conn->prepare("SELECT id, username, password, verified FROM ITS_users WHERE username = ?");
            $stmt->bind_param('s', $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($user = $result->fetch_assoc()) {
                if (password_verify($password, $user['password'])) {
                    if ((int)$user['verified'] === 1) {
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['username'] = $user['username'];
                        header('Location: index.php');
                        exit;
                    } else {
                        $error = "Your account exists but is not yet verified.";
                    }
                } else {
                    $error = "Incorrect password.";
                }
            } else {
                $error = "Account not found. Please register.";
            }
        } else {
            $error = "Both fields are required.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Inventory Tracker</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
            font-family: sans-serif;
        }
        #login-form {
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 0 12px rgba(0,0,0,0.1);
            width: 300px;
            text-align: center;
        }
        input {
            width: 100%;
            padding: 0.5rem;
            margin: 0.5rem 0;
        }
        button {
            width: 48%;
            padding: 0.5rem;
            margin: 0.5rem 1%;
        }
        .error {
            color: #c00;
            margin-bottom: 1rem;
        }
        .success {
            color: green;
            margin-bottom: 1rem;
        }
        .note {
            font-size: 0.8rem;
            color: #555;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
<div id="login-form">
    <h1>Inventory Tracker</h1>

    <?php if (!empty($error)): ?>
        <p class="error"> <?= htmlspecialchars($error) ?> </p>
    <?php elseif (!empty($success)): ?>
        <p class="success"> <?= htmlspecialchars($success) ?> </p>
    <?php endif; ?>

    <form method="post">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <div>
            <button type="submit" name="login">Login</button>
            <button type="submit" name="register">Create Account</button>
        </div>
    </form>
    <p class="note">* Accounts must be manually verified before access is granted.</p>
</div>
</body>
</html>
