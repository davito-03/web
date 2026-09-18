<?php
// api/get_ip.php
header('Content-Type: application/json');

// Get real client IP address validated by Nginx (via set_real_ip_from)
function get_client_ip() {
    return $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
}

echo json_encode(['ip' => get_client_ip()]);
?>
