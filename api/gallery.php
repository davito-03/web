<?php
header('Content-Type: application/json; charset=utf-8');

$mediaDir = __DIR__ . '/../media';
$excludedDirs = ['css', 'js', 'thumbnails', 'icons', 'assets'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm', 'mkv', 'webp'];

$categories = [];

if (is_dir($mediaDir)) {
    $dirs = scandir($mediaDir);
    
    foreach ($dirs as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemPath = $mediaDir . '/' . $item;
        
        if (is_dir($itemPath) && !in_array($item, $excludedDirs)) {
            $categoryName = $item;
            $files = [];
            $previews = [];
            
            // Scan files in category directory
            $categoryFiles = scandir($itemPath);
            
            foreach ($categoryFiles as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, $allowedExtensions)) {
                    $files[] = $file;
                }
            }
            
            // Sort files alphabetically
            sort($files);
            
            if (!empty($files)) {
                // Select previews (images preferred)
                foreach ($files as $file) {
                    if (count($previews) >= 2) break;
                    
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $previews[] = $categoryName . '/' . $file;
                    }
                }
                
                // If not enough image previews, fill with any file
                if (count($previews) < 2) {
                    foreach ($files as $file) {
                        if (count($previews) >= 2) break;
                        $fullPath = $categoryName . '/' . $file;
                        if (!in_array($fullPath, $previews)) {
                            $previews[] = $fullPath;
                        }
                    }
                }
                
                $categories[] = [
                    'name' => $categoryName,
                    'files' => $files,
                    'previews' => $previews
                ];
            }
        }
    }
}

echo json_encode(['categories' => $categories], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
