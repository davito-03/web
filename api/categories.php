<?php
// api/categories.php - Sistema de galería para hosting compartido
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://davito.es');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $mediaDir = __DIR__ . '/../media/';
    $categories = [];

    if (is_dir($mediaDir)) {
        $folders = array_filter(glob($mediaDir . '*'), 'is_dir');
        
        foreach ($folders as $folder) {
            $categoryName = basename($folder);
            
            // Obtener archivos multimedia
            $extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'webm', 'avi', 'mov', 'mkv'];
            $files = [];
            
            foreach ($extensions as $ext) {
                $files = array_merge($files, glob($folder . '/*.' . $ext));
                $files = array_merge($files, glob($folder . '/*.' . strtoupper($ext)));
            }
            
            if (count($files) > 0) {
                // Seleccionar 2 previews aleatorias (preferir imágenes)
                $imageFiles = array_filter($files, function($file) {
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    return in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']);
                });
                
                if (count($imageFiles) >= 2) {
                    $previews = array_rand(array_flip($imageFiles), min(2, count($imageFiles)));
                    if (!is_array($previews)) $previews = [$previews];
                } elseif (count($imageFiles) >= 1) {
                    $previews = array_slice($imageFiles, 0, 1);
                } else {
                    $previews = array_slice($files, 0, min(2, count($files)));
                }
                
                // Convertir paths a relativos
                $previewPaths = [];
                foreach ($previews as $preview) {
                    $previewPaths[] = $categoryName . '/' . basename($preview);
                }
                
                $categories[] = [
                    'name' => $categoryName,
                    'previews' => $previewPaths
                ];
            }
        }
    }

    echo json_encode(['categories' => $categories], JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>