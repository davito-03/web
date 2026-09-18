<?php
/**
 * Discord Game Tracker
 * Ejecutar con Cron cada 1 minuto: * * * * * php /var/www/davito.es/api/game_tracker.php
 */

// SECURITY: Only allow execution from CLI (cron), block web access
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die(json_encode(['error' => 'This script can only be run from the command line (cron).']));
}

$discord_id = "600041740124160011";
$lanyard_url = "https://api.lanyard.rest/v1/users/" . $discord_id;

$state_file = __DIR__ . '/../data/tracker_state.json';
$history_file = __DIR__ . '/../data/games_history.json';

// Fetch Lanyard API
$ch = curl_init($lanyard_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
curl_close($ch);

if (!$response) {
    die("Error fetching Lanyard API\n");
}

$data = json_decode($response, true);
if (!isset($data['data']['activities'])) {
    die("Invalid Lanyard response\n");
}

$playing = null;
foreach ($data['data']['activities'] as $activity) {
    if ($activity['type'] === 0) { // 0 = Playing a game
        $playing = $activity;
        break;
    }
}

// Load files
$state = file_exists($state_file) ? json_decode(file_get_contents($state_file), true) : ['current_game' => null, 'last_seen' => time()];
if (!is_array($state)) $state = ['current_game' => null, 'last_seen' => time()];

$history = file_exists($history_file) ? json_decode(file_get_contents($history_file), true) : [];
if (!is_array($history)) $history = [];

$now = time();
// Calculate minutes since last run. Max 10 minutes (to avoid huge jumps if PC sleeps and resumes with same game open).
$diff_minutes = max(0, min(10, round(($now - $state['last_seen']) / 60)));

if ($playing) {
    $game_name = $playing['name'];
    
    // Determine icon URL
    $icon_url = 'https://cdn.discordapp.com/embed/avatars/0.png';
    if (isset($playing['assets']['large_image'])) {
        $img = $playing['assets']['large_image'];
        if (strpos($img, 'mp:external/') === 0) {
            $icon_url = 'https://media.discordapp.net/external/' . substr($img, 12);
        } else {
            $icon_url = 'https://cdn.discordapp.com/app-assets/' . $playing['application_id'] . '/' . $img . '.png';
        }
    }

    // Init history entry if new game
    if (!isset($history[$game_name])) {
        $history[$game_name] = [
            'name' => $game_name,
            'icon' => $icon_url,
            'total_minutes' => 0,
            'first_played' => $now,
            'last_played' => $now
        ];
    }

    // Always update icon and last_played
    $history[$game_name]['icon'] = $icon_url;
    $history[$game_name]['last_played'] = $now;

    // Add time
    if ($state['current_game'] === $game_name) {
        if ($diff_minutes > 0) {
            $history[$game_name]['total_minutes'] += $diff_minutes;
        } else {
            // Less than a minute passed, no time added
        }
    } else {
        // Just started tracking this game. Assume 1 minute passed.
        $history[$game_name]['total_minutes'] += 1;
    }

    $state['current_game'] = $game_name;
} else {
    // Not playing anything
    $state['current_game'] = null;
}

// Update last seen
$state['last_seen'] = $now;

// Save files (LOCK_EX prevents race conditions with concurrent writes)
file_put_contents($state_file, json_encode($state, JSON_PRETTY_PRINT), LOCK_EX);
file_put_contents($history_file, json_encode($history, JSON_PRETTY_PRINT), LOCK_EX);

echo "Tracker run successfully. Playing: " . ($playing ? $playing['name'] : "None") . "\n";
?>
