<?php
header('Content-Type: application/json; charset=utf-8');

// Directorio actual donde está este script (media)
$media_dir = __DIR__;
$data = ['categories' => []];

// Extensiones multimedia válidas
$valid_exts = ['png', 'jpg', 'jpeg', 'gif', 'gifv', 'webp', 'mp4', 'mov', 'webm', 'avi'];

$items = scandir($media_dir);

foreach ($items as $item) {
    // Ignorar directorios de sistema y archivos ocultos básicos
    if ($item === '.' || $item === '..' || strpos($item, '.') === 0) {
        continue;
    }
    
    $cat_path = $media_dir . '/' . $item;
    
    if (is_dir($cat_path)) {
        $files = [];
        $previews = [];
        
        $cat_items = scandir($cat_path);
        if ($cat_items === false) continue;
        
        foreach ($cat_items as $f) {
            if ($f === '.' || $f === '..' || strpos($f, '.') === 0) continue;
            
            $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
            if (in_array($ext, $valid_exts)) {
                $files[] = $f;
            }
        }
        
        if (!empty($files)) {
            // Filtrar solo imágenes para vistas previas (no videos)
            $image_exts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
            $image_files = [];
            foreach ($files as $f) {
                $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
                if (in_array($ext, $image_exts)) {
                    $image_files[] = $f;
                }
            }
            
            // Mezclar para obtener previews aleatorias
            shuffle($image_files);
            
            // Añadir hasta 4 vistas previas (mosaico 2x2) SOLO de imágenes
            $num_previews = min(4, count($image_files));
            for ($i = 0; $i < $num_previews; $i++) {
                $previews[] = $item . '/' . $image_files[$i];
            }
            
            // Volver a ordenar la lista real de archivos (que sí incluye videos)
            sort($files);
            
            $data['categories'][] = [
                'name' => $item,
                'files' => $files,
                'previews' => $previews
            ];
        }
    }
}

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
