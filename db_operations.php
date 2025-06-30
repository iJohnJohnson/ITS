<?php
require_once 'connect.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'add_machine':
        $name = $_POST['name'];
        $stmt = $conn->prepare("INSERT INTO machines (name) VALUES (?)");
        $stmt->bind_param('s', $name);
        $stmt->execute();
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
        break;

    case 'delete_machine':
        $id = $_POST['id'];
        $stmt = $conn->prepare("DELETE FROM machines WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;

    // Add cases for 'add_detail', 'edit', etc.
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?>