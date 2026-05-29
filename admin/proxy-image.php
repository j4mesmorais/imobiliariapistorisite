#!/usr/bin/php
<?php
/* =========================================
   Proxy Image — NextCloud WebDAV
   =========================================
   Usage:   proxy-image.php?file=imagem.jpg
   Security: Only accepts image extensions.
             Credentials are server-side only.
   ========================================= */

// ---- Config (duplicated from config.js for PHP) ----
$webdavUrl  = 'https://nextcloud.imobiliariapistori.com.br/remote.php/dav/files/admin/Documents/Site/Imagens/';
$webdavUser = 'admin';
$webdavPass = 'Pistori26Pistori26';

// ---- Validate filename ----
if (empty($_GET['file'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing "file" parameter']);
    exit;
}

$filename = basename($_GET['file']);

// Only allow image extensions
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if (!in_array($ext, $allowedExtensions)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'File type not allowed']);
    exit;
}

// ---- Fetch from NextCloud ----
$url = rtrim($webdavUrl, '/') . '/' . rawurlencode($filename);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
    CURLOPT_USERPWD        => $webdavUser . ':' . $webdavPass,
    CURLOPT_FAILONERROR    => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 15,
]);

$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$error = curl_error($ch);
curl_close($ch);

if ($data === false) {
    http_response_code($httpCode ?: 502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to fetch image', 'detail' => $error]);
    exit;
}

// ---- Stream response ----
// Use original Content-Type from NextCloud, fallback to mime_content_type
$mime = $contentType ?: mime_content_type('data://text/plain;base64,' . base64_encode(substr($data, 0, 12)));
if (!$mime || $mime === 'text/plain') {
    $map = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
    ];
    $mime = $map[$ext] ?? 'application/octet-stream';
}

header('Content-Type: ' . $mime);
header('Content-Length: ' . strlen($data));
header('Cache-Control: public, max-age=86400');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 86400) . ' GMT');

echo $data;
