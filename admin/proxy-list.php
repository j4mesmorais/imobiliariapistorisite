<?php
/* =========================================
   Proxy List — NextCloud WebDAV directory listing
   =========================================
   Usage:   proxy-list.php
   Returns: JSON array of {filename, url}
   Security: Credentials are server-side only.
   ========================================= */

// ---- Config ----
$webdavUrl  = 'https://nextcloud.imobiliariapistori.com.br/remote.php/dav/files/admin/Documents/Site/Imagens/';
$webdavUser = 'admin';
$webdavPass = 'Pistori26Pistori26';

// ---- PROPFIND request ----
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $webdavUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
    CURLOPT_USERPWD        => $webdavUser . ':' . $webdavPass,
    CURLOPT_FAILONERROR    => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_CUSTOMREQUEST  => 'PROPFIND',
    CURLOPT_HTTPHEADER     => ['Depth: 1'],
]);

$xml = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

header('Content-Type: application/json');

if ($xml === false || $httpCode !== 207) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to list directory', 'detail' => $error ?: 'HTTP ' . $httpCode]);
    exit;
}

// ---- Parse XML ----
$doc = new DOMDocument();
$doc->loadXML($xml);
$xpath = new DOMXPath($doc);

// Register WebDAV namespace
$xpath->registerNamespace('d', 'DAV:');

$hrefs = [];
$nodes = $xpath->query('//d:href');
foreach ($nodes as $node) {
    $href = trim($node->textContent);
    // Skip the directory itself
    $dirUrl = rtrim($webdavUrl, '/') . '/';
    if ($href === $dirUrl || $href === rtrim($webdavUrl, '/')) continue;
    $hrefs[] = $href;
}

// ---- Filter image files ----
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$images = [];
$seen = [];

foreach ($hrefs as $href) {
    $parts = explode('/', rtrim($href, '/'));
    $filename = rawurldecode(end($parts));
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExtensions)) continue;
    if (isset($seen[$filename])) continue;
    $seen[$filename] = true;

    $images[] = [
        'filename' => $filename,
        'url'      => $webdavUrl . rawurlencode($filename),
    ];
}

echo json_encode($images);
