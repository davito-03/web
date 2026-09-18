<?php
// api/files.php - Sistema de archivos para hosting compartido
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://davito.es');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $category = basename($_GET['category'] ?? ''); // basename() elimina ../ y /
    if (empty($category)) {
        echo json_encode(['error' => 'Category parameter required']);
        exit;
    }

    // Validar que el path resuelto esté dentro de media/
    $mediaBase = realpath(__DIR__ . '/../media');
    $categoryDir = realpath(__DIR__ . '/../media/' . $category);
    
    if (!$categoryDir || !$mediaBase || !str_starts_with($categoryDir, $mediaBase)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category']);
        exit;
    }
    $categoryDir .= '/';
    $files = [];

    if (is_dir($categoryDir)) {
        // Extensiones multimedia soportadas
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'webm', 'avi', 'mov', 'mkv'];
        
        foreach ($extensions as $ext) {
            $foundFiles = glob($categoryDir . '*.' . $ext);
            $foundFiles = array_merge($foundFiles, glob($categoryDir . '*.' . strtoupper($ext)));
            
            foreach ($foundFiles as $file) {
                $filename = basename($file);
                if (!in_array($filename, $files)) {
                    $files[] = $filename;
                }
            }
        }
        
        // Mezclar archivos para orden aleatorio
        shuffle($files);
    }

    echo json_encode([
        'category' => $category,
        'files' => $files,
        'count' => count($files)
    ], JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>