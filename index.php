<?php
session_start();

// Redirect to login if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inventory Tracking System</title>
  <link rel="stylesheet" href="CSS/style.css">
</head>
<body>
  <div id="header">
    <h1>Inventory Tracker</h1>
  </div>

  <div id="main">
    <div id="sidebar">
      <ul>
        <li>Dashboard</li>
        <li id="add-machine-btn">Add Machine</li>
        <li id="add-machine-layer-btn" class="disabled">Add Machine Layer</li>
        <li id="add-detail-btn" class="disabled">Add Machine Detail</li>
        <li id="edit-btn" class="disabled">Edit</li>
        <li id="delete-machine-btn" class="disabled">Delete Item</li>
        <li id="move-btn" class="disabled">Move</li>
        <li>Smart Scan</li>
        <li id="theme-toggle-sidebar">Toggle Theme</li>
      </ul>
    </div>

    <div id="content">
      <div id="containerMiddle">
        <h2>Machines</h2>
        <div id="machine-list"></div>
      </div>

      <div id="containerRight">
        <h2>Inventory Details</h2>
        <div id="part-list"></div>
      </div>
    </div>
  </div>

  <div id="footer">
    <p>© 2025 Inventory Tracking System</p>
  </div>

  <script src="app.js"></script>
</body>
</html>
