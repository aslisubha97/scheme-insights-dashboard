
<?php
// Database configuration
$host = 'localhost'; // Usually 'localhost' for cPanel
$db_name = 'pmksy_bksy_db';
$username = 'your_db_username'; // Replace with your actual MySQL username
$password = 'your_db_password'; // Replace with your actual MySQL password

// Create database connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}
?>
