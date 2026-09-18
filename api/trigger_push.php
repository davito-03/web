<?php
// api/trigger_push.php
header('Content-Type: application/json');

// SECURITY: Token loaded from environment variable
// Set via: SetEnv PUSH_SECRET_TOKEN "your_secret_here" in .htaccess or server config
$SECRET_TOKEN = getenv('PUSH_SECRET_TOKEN') ?: '';

// Verify Token - SECURITY: Also reject if SECRET_TOKEN is empty/unconfigured
// to prevent bypass when env var is missing (empty == empty would pass)
if (empty($SECRET_TOKEN) || !isset($_GET['token']) || $_GET['token'] !== $SECRET_TOKEN) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// Load Subscriptions
$file = '../data/subscriptions.json';
if (!file_exists($file)) {
    echo json_encode(['status' => 'error', 'message' => 'No subscriptions found']);
    exit;
}

$subscriptions = json_decode(file_get_contents($file), true);
$message = $_GET['message'] ?? '¡Nueva actualización en davito.es!';
$url = $_GET['url'] ?? 'https://davito.es';

// NOTE: To actually SEND the push notification from PHP, you need to handle VAPID encryption.
// Since shared hosting often lacks 'composer', the easiest way is to use a library like minishlink/web-push.
// For now, we will simulate the "sending" process and log it.

$logFile = '../data/push_log.txt';
$logEntry = date('Y-m-d H:i:s') . " - BROADCAST: '$message' to " . count($subscriptions) . " subscribers.\n";
file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

// TODO: Integrate with a Web Push library here.
// Example logic if library was present:
/*
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$webPush = new WebPush(['VAPID' => ['subject' => 'mailto:me@website.com', 'publicKey' => '...', 'privateKey' => '...']]);

foreach ($subscriptions as $subData) {
    $webPush->sendOneNotification(
        Subscription::create($subData),
        json_encode(['title' => 'Davito Update', 'body' => $message, 'url' => $url])
    );
}
*/

echo json_encode([
    'status' => 'success', 
    'message' => 'Broadcast simulated', 
    'recipient_count' => count($subscriptions),
    'note' => 'To enable real sending, install web-push-php library or use OneSignal API.'
]);
?>
