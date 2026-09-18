<?php
// Mock API to trigger a push notification
// This is for testing purposes. In production, you would use a library like web-push-php.

header('Content-Type: application/json');

$message = $_GET['message'] ?? 'Hola! Esto es una prueba.';
$url = $_GET['url'] ?? '/';

// In a real scenario, you would fetch subscriptions from DB and send via Web Push Protocol
// Here we just simulate the response

echo json_encode([
    'status' => 'success',
    'message' => 'Push notification queued',
    'details' => [
        'payload' => [
            'title' => 'davito_03',
            'body' => $message,
            'url' => $url
        ]
    ]
]);
?>
