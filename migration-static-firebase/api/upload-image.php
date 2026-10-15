<?php
declare(strict_types=1);

// Public endpoint, but uploads are allowed only for authenticated editorial staff.
// Keep worker-config.php and the service-account JSON outside public_html.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'POST is required.']);

$configCandidates = array_filter([
    getenv('YUGANTAR_WORKER_CONFIG') ?: null,
    __DIR__ . '/../../private/worker-config.php',
    __DIR__ . '/../../../private/worker-config.php',
]);
$configPath = null;
foreach ($configCandidates as $candidate) {
    if (is_file($candidate)) { $configPath = $candidate; break; }
}
if (!$configPath) respond(500, ['error' => 'Private upload configuration is missing.']);
$config = require $configPath;

$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
if (!$authorization && function_exists('getallheaders')) {
    foreach (getallheaders() as $headerName => $headerValue) {
        if (strcasecmp($headerName, 'Authorization') === 0) { $authorization = $headerValue; break; }
    }
}
if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) respond(401, ['error' => 'Sign in before uploading an image.']);
$idToken = trim($matches[1]);
if ($idToken === '' || strlen($idToken) > 8192) respond(401, ['error' => 'Invalid authentication token.']);
$action = (string) ($_POST['action'] ?? 'upload');
if (!in_array($action, ['upload', 'delete'], true)) respond(400, ['error' => 'Unsupported image action.']);

function httpJson(string $url, array $headers = [], ?string $body = null, string $method = 'GET'): array {
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method,
    ]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    if ($response === false) throw new RuntimeException('Network request failed: ' . $error);
    $json = json_decode((string) $response, true);
    return [$status, is_array($json) ? $json : []];
}

function base64UrlDecode(string $value): string {
    $remainder = strlen($value) % 4;
    if ($remainder) $value .= str_repeat('=', 4 - $remainder);
    $decoded = base64_decode(strtr($value, '-_', '+/'), true);
    if ($decoded === false) throw new RuntimeException('Invalid Firebase token encoding.');
    return $decoded;
}

try {
    $projectId = (string) ($config['projectId'] ?? '');
    if ($projectId === '') respond(500, ['error' => 'Firebase project configuration is missing.']);

    // Verify the Firebase ID token directly. This avoids relying on tokeninfo's
    // response shape and checks the claims Firebase documents for ID tokens.
    $tokenParts = explode('.', $idToken);
    if (count($tokenParts) !== 3) respond(401, ['error' => 'Invalid Firebase ID token.']);
    $tokenHeader = json_decode(base64UrlDecode($tokenParts[0]), true, 512, JSON_THROW_ON_ERROR);
    $tokenClaims = json_decode(base64UrlDecode($tokenParts[1]), true, 512, JSON_THROW_ON_ERROR);
    $signature = base64UrlDecode($tokenParts[2]);
    if (($tokenHeader['alg'] ?? '') !== 'RS256' || empty($tokenHeader['kid'])) respond(401, ['error' => 'Unsupported Firebase ID token.']);
    $expectedIssuer = 'https://securetoken.google.com/' . $projectId;
    $uid = (string) ($tokenClaims['sub'] ?? '');
    if (($tokenClaims['aud'] ?? '') !== $projectId || ($tokenClaims['iss'] ?? '') !== $expectedIssuer || $uid === '' || strlen($uid) > 256) respond(401, ['error' => 'Firebase token claims do not match this project.']);
    if (!isset($tokenClaims['exp']) || (int) $tokenClaims['exp'] <= time()) respond(401, ['error' => 'Firebase login has expired. Sign in again.']);
    if (isset($tokenClaims['iat']) && (int) $tokenClaims['iat'] > time() + 60) respond(401, ['error' => 'Firebase token time is invalid.']);

    [$certStatus, $certificates] = httpJson('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    $certificate = $certificates[$tokenHeader['kid']] ?? '';
    if ($certStatus !== 200 || !is_string($certificate) || $certificate === '') respond(502, ['error' => 'Could not retrieve Firebase signing certificates.']);
    $verified = openssl_verify($tokenParts[0] . '.' . $tokenParts[1], $signature, $certificate, OPENSSL_ALGO_SHA256);
    if ($verified !== 1) respond(401, ['error' => 'Firebase ID-token signature is invalid.']);

    $servicePath = (string) ($config['serviceAccountPath'] ?? '');
    if (!is_file($servicePath)) respond(500, ['error' => 'Private Firebase service-account file is missing.']);
    $service = json_decode((string) file_get_contents($servicePath), true, 512, JSON_THROW_ON_ERROR);
    if (empty($service['client_email']) || empty($service['private_key'])) respond(500, ['error' => 'Firebase service-account configuration is incomplete.']);

    $b64url = static fn(string $value): string => rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    $now = time();
    $header = $b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
    $claim = $b64url(json_encode(['iss' => $service['client_email'], 'scope' => 'https://www.googleapis.com/auth/datastore', 'aud' => 'https://oauth2.googleapis.com/token', 'iat' => $now, 'exp' => $now + 3600], JSON_THROW_ON_ERROR));
    $unsigned = $header . '.' . $claim;
    if (!openssl_sign($unsigned, $signature, $service['private_key'], OPENSSL_ALGO_SHA256)) respond(500, ['error' => 'Could not authorize the upload service.']);
    [$oauthStatus, $oauth] = httpJson('https://oauth2.googleapis.com/token', ['Content-Type: application/x-www-form-urlencoded'], http_build_query(['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $unsigned . '.' . $b64url($signature)]), 'POST');
    if ($oauthStatus >= 400 || empty($oauth['access_token'])) respond(500, ['error' => 'Could not authorize the upload service.']);

    $userUrl = 'https://firestore.googleapis.com/v1/projects/' . rawurlencode($projectId) . '/databases/(default)/documents/users/' . rawurlencode($uid);
    [$userStatus, $userDocument] = httpJson($userUrl, ['Authorization: Bearer ' . $oauth['access_token']]);
    $role = $userDocument['fields']['role']['stringValue'] ?? '';
    $allowedRoles = $action === 'upload' ? ['superadmin', 'editor', 'reporter'] : ['superadmin', 'editor'];
    if ($userStatus >= 400 || !in_array($role, $allowedRoles, true)) respond(403, ['error' => $action === 'delete' ? 'Only editorial admins can delete article images.' : 'Only newsroom staff can upload article images.']);
} catch (Throwable $error) {
    error_log('YUGANTAR image upload auth error: ' . $error->getMessage());
    respond(502, ['error' => 'Could not verify your editorial session.']);
}

$mediaDirectory = dirname(__DIR__) . '/media/articles';
if ($action === 'delete') {
    $path = (string) ($_POST['path'] ?? '');
    if (!preg_match('#^/media/articles/([A-Za-z0-9_-]+)\.(jpg|png|webp)$#', $path, $pathParts)) respond(400, ['error' => 'Only managed article images can be deleted.']);
    $target = $mediaDirectory . '/' . $pathParts[1] . '.' . $pathParts[2];
    if (is_file($target) && !unlink($target)) respond(500, ['error' => 'The article was deleted, but its image could not be removed.']);
    respond(200, ['deleted' => true, 'path' => $path]);
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) respond(400, ['error' => 'Choose an image first.']);
$file = $_FILES['image'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) respond(400, ['error' => 'The image upload failed.']);
if ((int) ($file['size'] ?? 0) <= 0 || (int) $file['size'] > 2 * 1024 * 1024) respond(400, ['error' => 'Image must be smaller than 2 MB.']);

$imageInfo = @getimagesize((string) $file['tmp_name']);
$mime = $imageInfo['mime'] ?? '';
$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
if (!$imageInfo || !isset($allowed[$mime])) respond(400, ['error' => 'Use a valid JPG, PNG or WebP image.']);

if (!is_dir($mediaDirectory) && !mkdir($mediaDirectory, 0755, true)) respond(500, ['error' => 'Could not create the article media directory.']);
$baseName = bin2hex(random_bytes(16));
$extension = $allowed[$mime];
$target = $mediaDirectory . '/' . $baseName . '.' . $extension;

// Prefer WebP conversion when the Hostinger PHP GD extension supports it.
$converted = false;
if (function_exists('imagewebp') && (($mime === 'image/jpeg' && function_exists('imagecreatefromjpeg')) || ($mime === 'image/png' && function_exists('imagecreatefrompng')) || ($mime === 'image/webp' && function_exists('imagecreatefromwebp')))) {
    $source = $mime === 'image/jpeg' ? @imagecreatefromjpeg($file['tmp_name']) : ($mime === 'image/png' ? @imagecreatefrompng($file['tmp_name']) : @imagecreatefromwebp($file['tmp_name']));
    if ($source !== false) {
        $width = imagesx($source); $height = imagesy($source); $maxWidth = 1800;
        $output = $source;
        if ($width > $maxWidth) {
            $newWidth = $maxWidth; $newHeight = (int) round($height * $newWidth / $width); $output = imagecreatetruecolor($newWidth, $newHeight);
            imagealphablending($output, false); imagesavealpha($output, true); imagecopyresampled($output, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        }
        $target = $mediaDirectory . '/' . $baseName . '.webp';
        $converted = @imagewebp($output, $target, 82);
        if ($output !== $source) imagedestroy($output); imagedestroy($source);
    }
}
if (!$converted && !move_uploaded_file((string) $file['tmp_name'], $target)) respond(500, ['error' => 'Could not save the article image.']);

$relativeUrl = '/media/articles/' . basename($target);
respond(200, ['url' => $relativeUrl, 'path' => $relativeUrl, 'mime' => $mime]);
