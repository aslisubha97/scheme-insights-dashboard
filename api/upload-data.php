
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST method is allowed']);
    exit;
}

// Check if a file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

require_once 'db-config.php';

$file = $_FILES['file'];
$file_name = $file['name'];
$file_tmp = $file['tmp_name'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Check if the file is a CSV or XLSX
if ($file_ext !== 'csv' && $file_ext !== 'xlsx') {
    echo json_encode(['error' => 'Only CSV and XLSX files are allowed']);
    exit;
}

try {
    // Start transaction
    $conn->beginTransaction();
    
    // Clear existing data
    $conn->exec("TRUNCATE TABLE farmers");
    
    // Process the file based on its extension
    if ($file_ext === 'csv') {
        // Process CSV file
        $handle = fopen($file_tmp, "r");
        $headers = fgetcsv($handle);
        
        // Prepare the SQL statement
        $placeholders = implode(',', array_fill(0, count($headers), '?'));
        $columns = implode(',', array_map(function($header) {
            return str_replace(' ', '_', strtolower($header));
        }, $headers));
        
        $stmt = $conn->prepare("INSERT INTO farmers ($columns) VALUES ($placeholders)");
        
        // Read and insert data
        $rowCount = 0;
        while (($data = fgetcsv($handle)) !== FALSE) {
            $stmt->execute($data);
            $rowCount++;
        }
        fclose($handle);
    } else {
        // Process XLSX file (would need a library like PhpSpreadsheet)
        // This is a placeholder - you would need to implement XLSX processing
        echo json_encode(['error' => 'XLSX processing not implemented in this demo']);
        exit;
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully imported $rowCount records"
    ]);
} catch(PDOException $e) {
    // Rollback transaction on error
    $conn->rollBack();
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
