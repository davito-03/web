<?php
/**
 * Webhook para recibir tuits desde IFTTT / Make.com
 * Recibe un POST JSON, verifica el token y añade el tuit a data/tweets.json
 */

// 1. Configuración de Seguridad
// Leemos la configuración desde el archivo INI protegido
$config = parse_ini_file(__DIR__ . '/../data/config.ini');
$SECRET_TOKEN = $config['WEBHOOK_TOKEN'] ?? '';

// Ruta al archivo JSON (absoluta desde este script)
$json_file = __DIR__ . '/../data/tweets.json';

// Configurar cabeceras para aceptar JSON
header('Content-Type: application/json');

// --- NUEVO: API GET PARA SERVIR LOS TUITS ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_tweets') {
    if (file_exists($json_file)) {
        echo file_get_contents($json_file);
    } else {
        echo '[]';
    }
    exit;
}
// --------------------------------------------

// 2. Leer la petición POST (Soporta JSON o Form-Data normal)
$input = [];
if (!empty($_POST)) {
    // Si viene como formulario estándar (x-www-form-urlencoded o multipart)
    $input = $_POST;
} else {
    // Si viene como JSON string
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);
}

// Si no hay datos, salir
if (empty($input)) {
    http_response_code(400);
    echo json_encode(["error" => "No se recibieron datos válidos. Envía JSON o Form-Data."]);
    exit;
}

// 3. Verificar el Token de Seguridad
if (empty($SECRET_TOKEN) || !isset($input['token']) || !hash_equals($SECRET_TOKEN, (string)$input['token'])) {
    http_response_code(401);
    echo json_encode(["error" => "Acceso denegado. Token inválido."]);
    exit;
}

// 4. Validar y procesar los datos del tuit
// Make.com a veces manda la clave pero vacía si la variable no existe en el RSS
$content = isset($input['content']) ? trim($input['content']) : '';

if (empty($content)) {
    http_response_code(400);
    echo json_encode(["error" => "El contenido del tuit está vacío. Revisa las variables en Make.com."]);
    exit;
}

// Limpiar el contenido pero permitiendo enlaces, imágenes y saltos de línea sin eventos maliciosos
$safe_content = strip_tags($content, '<a><img><br><p><strong><em>');
$safe_content = preg_replace('/\s*on\w+\s*=\s*(["\']).*?\1/i', '', $safe_content);
$safe_content = preg_replace('/\s*on\w+\s*=\s*[^>\s]+/i', '', $safe_content);
$safe_content = preg_replace('/href\s*=\s*(["\'])\s*javascript:[^"\']*\1/i', 'href="#"', $safe_content);

$is_rt = false;
$rt_author_text = "";

// RSS.app manda los RTs y citas con el formato embed de Twitter.
// El pie del embed tiene este formato: "— Nombre (@usuario) <a href=...>Fecha</a>"
// Detectamos este pie de página, extraemos el autor original y lo borramos del texto principal.
if (preg_match('/—\s*(.+?)\s*\((@.+?)\).*?<\/a>/isu', $safe_content, $matches)) {
    // Si encontramos la firma de otro usuario al final, es un RT
    $is_rt = true;
    $rt_author_text = trim(strip_tags($matches[1])) . " " . $matches[2];
    
    // Eliminamos todo ese pie de página ("— usuario (@handle) fecha") del contenido visual
    $safe_content = preg_replace('/—\s*.+?\s*\(@.+?\).*?<\/a>/isu', '', $safe_content);
} else {
    // Fallback: si empieza por "RT " en el texto plano
    if (substr(strip_tags($content), 0, 3) === 'RT ') {
        $is_rt = true;
    }
}

// Limpiar el HTML residual y espacios extra
$safe_content = trim($safe_content);

$new_tweet = [
    // Generar un ID único
    "id" => time() + rand(1, 1000), // rand para evitar colisiones si llegan varios en el mismo segundo
    "type" => $is_rt ? "rt" : "tweet",
    "author" => "davito_03",
    "handle" => "@davito_03",
    "rt_original" => $rt_author_text, // Guardamos a quién ha retuiteado
    // Usar la fecha enviada o la actual si viene vacía o es inválida
    "date" => (!empty($input['date']) && strtotime($input['date'])) ? date("Y-m-d\TH:i:s\Z", strtotime($input['date'])) : date("Y-m-d\TH:i:s\Z"),
    "content" => $safe_content,
    "media_url" => isset($input['media_url']) ? trim($input['media_url']) : '',
    "likes" => 0, // IFTTT/RSS básico no suele dar likes en tiempo real
    "rts" => 0,
    "isPinned" => false,
    "url" => !empty($input['url']) ? trim($input['url']) : ""
];

// 5. Leer el archivo JSON actual
$current_data = [];
if (file_exists($json_file)) {
    $json_content = file_get_contents($json_file);
    $decoded = json_decode($json_content, true);
    if (is_array($decoded)) {
        $current_data = $decoded;
    }
}

// 6. Añadir el nuevo tuit AL PRINCIPIO de la lista
array_unshift($current_data, $new_tweet);

// Mantener solo los últimos 1000 tuits para crear un archivo persistente en el blog
if (count($current_data) > 1000) {
    $current_data = array_slice($current_data, 0, 1000);
}

// 7. Guardar el archivo JSON
$result = file_put_contents($json_file, json_encode($current_data, JSON_PRETTY_PRINT), LOCK_EX);

if ($result !== false) {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Tuit guardado correctamente.", "tweet_id" => $new_tweet['id']]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar el archivo JSON en el servidor. Revisa los permisos de escritura."]);
}
?>
