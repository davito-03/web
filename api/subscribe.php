<?php
// api/subscribe.php
header('Content-Type: application/json');

// Rate limiting simple basado en IP
$rateLimitFile = '../data/rate_limits.json';
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimits = [];
if (file_exists($rateLimitFile)) {
    $rateLimits = json_decode(file_get_contents($rateLimitFile), true) ?? [];
}
// Limpiar entradas antiguas (más de 1 hora)
$rateLimits = array_filter($rateLimits, fn($t) => $t > time() - 3600);
if (isset($rateLimits[$clientIP]) && $rateLimits[$clientIP] > time() - 60) {
    http_response_code(429);
    echo json_encode(['status' => 'error', 'message' => 'Too many requests. Try again later.']);
    exit;
}

// Ensure data directory exists
$dataDir = '../data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$file = $dataDir . '/subscriptions.json';

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validar estructura de una Push Subscription real
if (!$data || 
    !isset($data['endpoint']) || 
    !filter_var($data['endpoint'], FILTER_VALIDATE_URL) ||
    !isset($data['keys']['p256dh']) || 
    !isset($data['keys']['auth']) ||
    strlen($data['endpoint']) > 2000) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid push subscription data']);
    exit;
}

// Sanitizar: solo guardar los campos esperados
$cleanSubscription = [
    'endpoint' => filter_var($data['endpoint'], FILTER_SANITIZE_URL),
    'keys' => [
        'p256dh' => substr($data['keys']['p256dh'], 0, 500),
        'auth' => substr($data['keys']['auth'], 0, 200)
    ]
];

// Load existing subscriptions
$subscriptions = [];
if (file_exists($file)) {
    $subscriptions = json_decode(file_get_contents($file), true) ?? [];
}

// Limitar número máximo de suscripciones
if (count($subscriptions) >= 1000) {
    http_response_code(507);
    echo json_encode(['status' => 'error', 'message' => 'Subscription limit reached']);
    exit;
}

// Add new subscription if not exists (deduplicate by endpoint)
$exists = false;
foreach ($subscriptions as $sub) {
    if ($sub['endpoint'] === $cleanSubscription['endpoint']) {
        $exists = true;
        break;
    }
}

if (!$exists) {
    $subscriptions[] = $cleanSubscription;
    if (file_put_contents($file, json_encode($subscriptions, JSON_PRETTY_PRINT), LOCK_EX)) {
        // Registrar rate limit
        $rateLimits[$clientIP] = time();
        @file_put_contents($rateLimitFile, json_encode($rateLimits), LOCK_EX);
        
        echo json_encode(['status' => 'success', 'message' => 'Subscribed successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save subscription']);
    }
} else {
    echo json_encode(['status' => 'success', 'message' => 'Already subscribed']);
}
?>
