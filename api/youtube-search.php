<?php
// Proxy para búsqueda de videos en YouTube y obtención de URL de audio de Invidious
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://davito.es');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rate limiting simple
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = '../data/yt_rate_limits.json';
$rateLimits = [];
if (file_exists($rateLimitFile)) {
    $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?? [];
}
$rateLimits = array_filter($rateLimits, fn($t) => $t > time() - 60);
if (isset($rateLimits[$clientIP]) && $rateLimits[$clientIP] > time() - 3) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please wait a few seconds.']);
    exit;
}
$rateLimits[$clientIP] = time();
@file_put_contents($rateLimitFile, json_encode($rateLimits), LOCK_EX);

// Obtener búsqueda y validar
$search = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($search) || strlen($search) > 200) {
    http_response_code(400);
    echo json_encode(['error' => 'Search query required (max 200 chars)']);
    exit;
}

$searchEncoded = urlencode($search);
$videoId = null;

// --- Paso 1: Buscar Video ID en YouTube (usando scraping existente) ---
$youtubeSearchUrl = "https://www.youtube.com/results?search_query=" . $searchEncoded;
$context = stream_context_create([
    'http' => [
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ]
]);

try {
    $html = @file_get_contents($youtubeSearchUrl, false, $context);
    if ($html) {
        if (preg_match('/"videoId":"([a-zA-Z0-9_-]{11})"/', $html, $matches)) {
            $videoId = $matches[1];
        }
    }
} catch (Exception $e) {
    // Log error, continue
}

if (!$videoId) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'No YouTube video ID found for the search query.',
        'search' => $search
    ]);
    exit;
}

// --- Paso 2: Obtener URL de audio de Invidious usando el Video ID ---
$invidiousInstance = 'https://invidious.weblibre.org'; // Usar una instancia de Invidious permitida por CSP
$invidiousApiUrl = "{$invidiousInstance}/api/v1/videos/{$videoId}?fields=adaptiveFormats";

$audioUrl = null;

// Preferir cURL si está disponible para peticiones HTTP más robustas
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $invidiousApiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if ($data && isset($data['adaptiveFormats'])) {
            foreach ($data['adaptiveFormats'] as $format) {
                // Buscar un formato de audio-only
                if (isset($format['mimeType']) && str_starts_with($format['mimeType'], 'audio/') && isset($format['url'])) {
                    $audioUrl = $format['url'];
                    break; // Tomar el primer audio-only encontrado
                }
            }
        }
    }
} else {
    // Fallback a file_get_contents si cURL no está disponible
    try {
        $response = @file_get_contents($invidiousApiUrl, false, $context);
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['adaptiveFormats'])) {
                foreach ($data['adaptiveFormats'] as $format) {
                    if (isset($format['mimeType']) && str_starts_with($format['mimeType'], 'audio/') && isset($format['url'])) {
                        $audioUrl = $format['url'];
                        break;
                    }
                }
            }
            
        }
    } catch (Exception $e) {
        // Log error, continue
    }
}

if ($audioUrl) {
    echo json_encode([
        'success' => true,
        'videoId' => $videoId,
        'audioUrl' => $audioUrl,
        'search' => $search,
        'source' => 'invidious'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'videoId' => $videoId,
        'audioUrl' => null,
        'search' => $search,
        'message' => 'Could not find a direct audio URL from Invidious.',
        'suggestion' => 'The Invidious instance might be down or the video might not have suitable audio formats.'
    ]);
}
?>
