
<?php
// Database configuration
$host = $_ENV['DB_HOST'] ?? 'localhost'; // Usually 'localhost' for cPanel
$db_name = $_ENV['DB_NAME'] ?? 'pmksy_bksy_db';
$username = $_ENV['DB_USERNAME'] ?? 'your_db_username'; // Replace with your actual MySQL username
$password = $_ENV['DB_PASSWORD'] ?? 'your_db_password'; // Replace with your actual MySQL password

// Create database connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set charset to UTF-8
    $conn->exec("set names utf8mb4");
} catch(PDOException $e) {
    // Return JSON response for API errors
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
