
<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // Adjust in production for security
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// === Database connection ===
// Replace the placeholders with your actual DB credentials
$mysqli = new mysqli("localhost", "tvwcyumy_db_user", "db_password", "tvwcyumy_ITS_inventory");

if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to MySQL: " . $mysqli->connect_error]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

if ($method === "OPTIONS") {
    // CORS preflight
    http_response_code(204);
    exit();
}

if ($method === "GET" && isset($_GET['load'])) {
    // Load all machines & parts with hierarchy

    // Fetch all machines
    $res = $mysqli->query("SELECT * FROM ITS_machines ORDER BY id ASC");
    if (!$res) {
        respond(["error" => "Failed to query ITS_machines: " . $mysqli->error], 500);
    }

    $machines = [];
    $machineMap = [];

    while ($row = $res->fetch_assoc()) {
        $row['children'] = [];
        $row['parts'] = [];
        $machineMap[$row['id']] = $row;
    }

    // Build hierarchy
    foreach ($machineMap as $id => $machine) {
        // Treat parent_id as null if empty, 0, or null
        if (empty($machine['parent_id'])) {
            $machines[$id] = &$machineMap[$id];
        } else {
            $parentId = (int)$machine['parent_id'];
            // Check parent exists before assigning to avoid warnings
            if (isset($machineMap[$parentId])) {
                $machineMap[$parentId]['children'][] = &$machineMap[$id];
            }
        }
    }
    $machines = array_values($machines); // reset keys to 0-based indexes

    // Fetch parts and assign to machines
    $res = $mysqli->query("SELECT * FROM ITS_parts ORDER BY id ASC");
    if (!$res) {
        respond(["error" => "Failed to query ITS_parts: " . $mysqli->error], 500);
    }

    while ($part = $res->fetch_assoc()) {
        $mid = $part['machine_id'];
        if (isset($machineMap[$mid])) {
            $machineMap[$mid]['parts'][] = [
                "id" => (int)$part['id'],
                "partNumber" => $part['part_number'],
                "quantity" => (int)$part['quantity'],
                "location" => $part['location'],
            ];
        }
    }

    respond(["machines" => $machines]);
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        respond(["error" => "Invalid JSON"], 400);
    }

    $action = $input['action'] ?? '';

    switch ($action) {
        case 'add_machine':
            $name = trim($input['name'] ?? '');
            $parent_id = isset($input['parent_id']) && $input['parent_id'] !== '' ? (int)$input['parent_id'] : null;

            if (!$name) {
                respond(["error" => "Name is required"], 400);
            }

            if ($parent_id === null) {
                $stmt = $mysqli->prepare("INSERT INTO ITS_machines (name, parent_id) VALUES (?, NULL)");
                $stmt->bind_param("s", $name);
            } else {
                $stmt = $mysqli->prepare("INSERT INTO ITS_machines (name, parent_id) VALUES (?, ?)");
                $stmt->bind_param("si", $name, $parent_id);
            }
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true, "id" => $stmt->insert_id]);
            break;

        case 'edit_machine':
            $id = (int)($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');

            if (!$id || !$name) {
                respond(["error" => "ID and name are required"], 400);
            }

            $stmt = $mysqli->prepare("UPDATE ITS_machines SET name = ? WHERE id = ?");
            $stmt->bind_param("si", $name, $id);
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true]);
            break;

        case 'delete_machine':
            $id = (int)($input['id'] ?? 0);

            if (!$id) {
                respond(["error" => "ID is required"], 400);
            }

            $stmt = $mysqli->prepare("DELETE FROM ITS_machines WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true]);
            break;

        case 'add_part':
            $machine_id = (int)($input['machine_id'] ?? 0);
            $part_number = trim($input['partNumber'] ?? '');
            $quantity = (int)($input['quantity'] ?? -1);
            $location = trim($input['location'] ?? '');

            if (!$machine_id || !$part_number || $quantity < 0 || !$location) {
                respond(["error" => "Missing or invalid part data"], 400);
            }

            $stmt = $mysqli->prepare("INSERT INTO ITS_parts (machine_id, part_number, quantity, location) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isis", $machine_id, $part_number, $quantity, $location);
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true, "id" => $stmt->insert_id]);
            break;

        case 'edit_part':
            $id = (int)($input['id'] ?? 0);
            $part_number = trim($input['partNumber'] ?? '');
            $quantity = (int)($input['quantity'] ?? -1);
            $location = trim($input['location'] ?? '');

            if (!$id || !$part_number || $quantity < 0 || !$location) {
                respond(["error" => "Missing or invalid part data"], 400);
            }

            $stmt = $mysqli->prepare("UPDATE ITS_parts SET part_number = ?, quantity = ?, location = ? WHERE id = ?");
            $stmt->bind_param("sisi", $part_number, $quantity, $location, $id);
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true]);
            break;

        case 'delete_part':
            $id = (int)($input['id'] ?? 0);

            if (!$id) {
                respond(["error" => "ID is required"], 400);
            }

            $stmt = $mysqli->prepare("DELETE FROM ITS_parts WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->error) {
                respond(["error" => "DB error: " . $stmt->error], 500);
            }

            respond(["success" => true]);
            break;

        default:
            respond(["error" => "Unknown action"], 400);
    }
}

// If no route matched:
respond(["error" => "Method not allowed"], 405);
