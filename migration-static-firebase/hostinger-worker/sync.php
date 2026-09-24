<?php
declare(strict_types=1);

$configPath = getenv('YUGANTAR_WORKER_CONFIG') ?: __DIR__ . '/worker-config.php';
if (!is_file($configPath)) {
    fwrite(STDERR, "Missing worker-config.php. Copy worker-config.example.php and keep secrets outside public_html.\n");
    exit(1);
}
$config = require $configPath;

function b64url(string $value): string { return rtrim(strtr(base64_encode($value), '+/', '-_'), '='); }

function httpRequest(string $url, array $headers = [], ?string $body = null, string $method = 'GET'): array {
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'YUGANTAR-source-sync/1.0',
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CUSTOMREQUEST => $method
    ]);
    if ($body !== null) { curl_setopt($curl, CURLOPT_POSTFIELDS, $body); }
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    if ($response === false || $status >= 400) throw new RuntimeException("HTTP {$status} from {$url}: {$error}");
    return [$status, (string) $response];
}

function firestoreValue(mixed $value): array {
    if (is_bool($value)) return ['booleanValue' => $value];
    if (is_int($value) || is_float($value)) return ['doubleValue' => $value];
    if (is_array($value)) return ['mapValue' => ['fields' => array_map('firestoreValue', $value)]];
    return ['stringValue' => (string) $value];
}

function firestoreDocument(array $data): array {
    $fields = [];
    foreach ($data as $key => $value) $fields[$key] = firestoreValue($value);
    return ['fields' => $fields];
}

function accessToken(array $service): string {
    $header = b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
    $now = time();
    $claim = b64url(json_encode([
        'iss' => $service['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud' => 'https://oauth2.googleapis.com/token',
        'iat' => $now,
        'exp' => $now + 3600
    ], JSON_THROW_ON_ERROR));
    $unsigned = $header . '.' . $claim;
    if (!openssl_sign($unsigned, $signature, $service['private_key'], OPENSSL_ALGO_SHA256)) throw new RuntimeException('Could not sign Google OAuth assertion');
    [, $response] = httpRequest('https://oauth2.googleapis.com/token', ['Content-Type: application/x-www-form-urlencoded'], http_build_query(['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $unsigned . '.' . b64url($signature)]), 'POST');
    $json = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
    if (empty($json['access_token'])) throw new RuntimeException('Google OAuth response did not contain an access token');
    return $json['access_token'];
}

function upsertFirestore(string $projectId, string $token, string $collection, string $documentId, array $data): void {
    $url = 'https://firestore.googleapis.com/v1/projects/' . rawurlencode($projectId) . '/databases/(default)/documents/' . rawurlencode($collection) . '/' . rawurlencode($documentId);
    httpRequest($url, ['Authorization: Bearer ' . $token, 'Content-Type: application/json'], json_encode(firestoreDocument($data), JSON_THROW_ON_ERROR), 'PATCH');
}

function firestorePlainValue(array $field): mixed {
    if (array_key_exists('stringValue', $field)) return $field['stringValue'];
    if (array_key_exists('booleanValue', $field)) return $field['booleanValue'];
    if (array_key_exists('integerValue', $field)) return (int) $field['integerValue'];
    if (array_key_exists('doubleValue', $field)) return (float) $field['doubleValue'];
    if (array_key_exists('timestampValue', $field)) return $field['timestampValue'];
    if (isset($field['mapValue']['fields'])) {
        $result = [];
        foreach ($field['mapValue']['fields'] as $key => $value) $result[$key] = firestorePlainValue($value);
        return $result;
    }
    return null;
}

function listFirestoreCollection(string $projectId, string $token, string $collection): array {
    $url = 'https://firestore.googleapis.com/v1/projects/' . rawurlencode($projectId) . '/databases/(default)/documents/' . rawurlencode($collection);
    [, $body] = httpRequest($url, ['Authorization: Bearer ' . $token, 'Accept: application/json']);
    $json = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $result = [];
    foreach (($json['documents'] ?? []) as $document) {
        $parts = explode('/', (string) ($document['name'] ?? ''));
        $item = ['id' => end($parts)];
        foreach (($document['fields'] ?? []) as $key => $value) $item[$key] = firestorePlainValue($value);
        $result[] = $item;
    }
    return $result;
}

function publicImageUrl(string $value): string {
    $url = trim(html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    return preg_match('~^https?://~i', $url) ? $url : '';
}

function rssImage(SimpleXMLElement $item): string {
    $media = $item->children('http://search.yahoo.com/mrss/');
    foreach ([$media->content, $media->thumbnail] as $nodes) {
        foreach ($nodes as $node) {
            $url = publicImageUrl((string) $node->attributes()->url);
            if ($url) return $url;
        }
    }
    foreach ($item->enclosure as $node) {
        $url = publicImageUrl((string) $node->attributes()->url);
        if ($url) return $url;
    }
    $content = $item->children('http://purl.org/rss/1.0/modules/content/');
    $html = (string) ($content->encoded ?? '');
    $html .= ' ' . (string) ($item->description ?? '');
    if (preg_match('~<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']~i', $html, $matches)) {
        return publicImageUrl($matches[1]);
    }
    return '';
}

function rssArticles(array $source): array {
    [, $body] = httpRequest((string) $source['url'], ['Accept: application/rss+xml, application/atom+xml, application/xml']);
    $xml = simplexml_load_string($body);
    if (!$xml) throw new RuntimeException('Invalid RSS/XML feed: ' . ($source['name'] ?? $source['url']));
    $items = $xml->channel->item ?? $xml->entry ?? [];
    $articles = [];
    $lang = in_array(($source['lang'] ?? 'EN'), ['EN', 'BN', 'HI'], true) ? $source['lang'] : 'EN';
    $itemIndex = 0;
    foreach ($items as $item) {
        if ($itemIndex >= 12) break;
        $title = trim((string) ($item->title ?? ''));
        $link = trim((string) ($item->link ?? ''));
        $guid = trim((string) ($item->guid ?? $item->id ?? $link));
        $summary = trim((string) ($item->description ?? $item->summary ?? $title));
        $summary = mb_substr(preg_replace('/\s+/', ' ', strip_tags($summary)) ?: $title, 0, 320);
        if (!$title || !$guid) continue;
        $image = !empty($source['metadataOnly']) ? '' : rssImage($item);
        $published = trim((string) ($item->pubDate ?? $item->published ?? $item->updated ?? gmdate('c')));
        $date = strtotime($published) ? gmdate('c', strtotime($published)) : gmdate('c');
        $id = 'rss_' . substr(hash('sha256', ($source['id'] ?? $source['name']) . '|' . $guid), 0, 32);
        $empty = ['EN' => '', 'BN' => '', 'HI' => ''];
        $titleByLanguage = $empty; $titleByLanguage[$lang] = $title;
        $summaryByLanguage = $empty; $summaryByLanguage[$lang] = $summary;
        $articles[] = [
            'documentId' => $id,
            'title' => $titleByLanguage,
            'summary' => $summaryByLanguage,
            'content' => $summaryByLanguage,
            'category' => strtolower((string) ($source['category'] ?? 'general')),
            'author' => (string) ($source['name'] ?? 'Wire service'),
            'sourceAgency' => (string) ($source['name'] ?? 'Wire service'),
            'sourceUrl' => $link,
            'sourceLanguage' => $lang,
            'image' => $image,
            'status' => 'published',
            'hero' => $itemIndex === 0 && !empty($source['hero']),
            'breaking' => $itemIndex === 0,
            'trending' => $itemIndex < 3,
            'views' => 0,
            'publishedAt' => $date,
            'updatedAt' => gmdate('c')
        ];
        $itemIndex++;
    }
    return $articles;
}

function youtubeVideos(array $source): array {
    $feedUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' . rawurlencode($source['channelId']);
    [, $xmlBody] = httpRequest($feedUrl, ['Accept: application/atom+xml']);
    $xml = simplexml_load_string($xmlBody);
    if (!$xml) throw new RuntimeException('Invalid YouTube Atom feed');
    $atom = $xml->children('http://www.w3.org/2005/Atom');
    $videos = [];
    foreach ($atom->entry as $entry) {
        $yt = $entry->children('http://www.youtube.com/xml/schemas/2015');
        $media = $entry->children('http://search.yahoo.com/mrss/');
        $id = (string) $yt->videoId;
        if (!$id) continue;
        $videos[] = [
            'documentId' => 'yt_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $id),
            'provider' => 'youtube',
            'mediaType' => 'video',
            'title' => (string) $entry->title,
            'description' => (string) ($media->group->description ?? ''),
            'videoUrl' => 'https://www.youtube.com/watch?v=' . $id,
            'embedUrl' => 'https://www.youtube-nocookie.com/embed/' . rawurlencode($id),
            'thumbnail' => 'https://i.ytimg.com/vi/' . $id . '/hqdefault.jpg',
            'sourceUrl' => 'https://www.youtube.com/watch?v=' . $id,
            'publishedAt' => (string) $entry->published,
            'active' => true
        ];
    }
    return $videos;
}

function youtubeLive(array $source, string $apiKey): ?array {
    if (!$apiKey) return null;
    $url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' . rawurlencode($source['channelId']) . '&eventType=live&type=video&maxResults=1&key=' . rawurlencode($apiKey);
    [, $body] = httpRequest($url, ['Accept: application/json']);
    $json = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $item = $json['items'][0] ?? null;
    if (!$item) return null;
    $id = $item['id']['videoId'] ?? '';
    return $id ? ['title' => $item['snippet']['title'] ?? $source['name'], 'videoUrl' => 'https://www.youtube.com/watch?v=' . $id, 'embedUrl' => 'https://www.youtube-nocookie.com/embed/' . rawurlencode($id), 'provider' => 'youtube', 'mediaType' => 'live', 'active' => true, 'isLive' => true] : null;
}

function youtubeLink(string $url): ?array {
    [, $body] = httpRequest('https://www.youtube.com/oembed?url=' . rawurlencode($url) . '&format=json', ['Accept: application/json']);
    $json = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $id = preg_match('/(?:v=|youtu\.be\/|shorts\/|embed\/)([^?&\/]+)/i', $url, $matches) ? $matches[1] : '';
    return !empty($json['title']) ? ['documentId' => 'yt_link_' . substr(hash('sha256', $url), 0, 24), 'provider' => 'youtube', 'mediaType' => 'video', 'title' => $json['title'], 'description' => $json['author_name'] ?? '', 'videoUrl' => $url, 'embedUrl' => $id ? 'https://www.youtube-nocookie.com/embed/' . rawurlencode($id) : '', 'thumbnail' => $json['thumbnail_url'] ?? '', 'sourceUrl' => $url, 'publishedAt' => gmdate('c'), 'active' => true] : null;
}

function facebookPosts(array $source, string $token, string $version): array {
    if (!$token) return [];
    $url = 'https://graph.facebook.com/' . rawurlencode($version) . '/' . rawurlencode($source['pageId']) . '/posts?fields=id,message,created_time,full_picture,permalink_url,attachments{media_type,media,subattachments}&limit=25&access_token=' . rawurlencode($token);
    [, $body] = httpRequest($url, ['Accept: application/json']);
    $json = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $posts = [];
    foreach (($json['data'] ?? []) as $post) {
        $id = preg_replace('/[^A-Za-z0-9_-]/', '_', (string) ($post['id'] ?? ''));
        if (!$id) continue;
        $attachment = $post['attachments']['data'][0] ?? [];
        $attachmentType = strtolower((string) ($attachment['media_type'] ?? ''));
        $mediaType = str_contains($attachmentType, 'video') ? 'video' : ((str_contains($attachmentType, 'photo') || !empty($post['full_picture'])) ? 'photo' : 'post');
        $posts[] = ['documentId' => 'fb_' . $id, 'provider' => 'facebook', 'mediaType' => $mediaType, 'title' => mb_substr((string) ($post['message'] ?? $source['name']), 0, 180), 'description' => (string) ($post['message'] ?? ''), 'videoUrl' => (string) ($post['permalink_url'] ?? ''), 'embedUrl' => (string) ($post['permalink_url'] ?? ''), 'thumbnail' => (string) ($post['full_picture'] ?? ''), 'sourceUrl' => (string) ($post['permalink_url'] ?? ''), 'publishedAt' => (string) ($post['created_time'] ?? ''), 'active' => true];
    }
    return $posts;
}

function facebookPostLink(string $url, string $token, string $version): ?array {
    if (!$token) return null;
    $graphUrl = 'https://graph.facebook.com/' . rawurlencode($version) . '/?id=' . rawurlencode($url) . '&fields=id,message,created_time,full_picture,permalink_url,attachments{media_type,media,subattachments}&access_token=' . rawurlencode($token);
    [, $body] = httpRequest($graphUrl, ['Accept: application/json']);
    $post = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
    $id = preg_replace('/[^A-Za-z0-9_-]/', '_', (string) ($post['id'] ?? ''));
    $attachment = $post['attachments']['data'][0] ?? [];
    $attachmentType = strtolower((string) ($attachment['media_type'] ?? ''));
    $mediaType = str_contains($attachmentType, 'video') ? 'video' : ((str_contains($attachmentType, 'photo') || !empty($post['full_picture'])) ? 'photo' : 'post');
    return $id ? ['documentId' => 'fb_' . $id, 'provider' => 'facebook', 'mediaType' => $mediaType, 'title' => mb_substr((string) ($post['message'] ?? 'Facebook post'), 0, 180), 'description' => (string) ($post['message'] ?? ''), 'videoUrl' => (string) ($post['permalink_url'] ?? $url), 'embedUrl' => (string) ($post['permalink_url'] ?? $url), 'thumbnail' => (string) ($post['full_picture'] ?? ''), 'sourceUrl' => (string) ($post['permalink_url'] ?? $url), 'publishedAt' => (string) ($post['created_time'] ?? gmdate('c')), 'active' => true] : null;
}

try {
    $service = json_decode(file_get_contents($config['serviceAccountPath']), true, 512, JSON_THROW_ON_ERROR);
    $token = accessToken($service);
    $projectId = (string) $config['projectId'];
    $count = 0;
    if (!empty($config['allowExternalNews'])) {
        $rssSources = $config['rssSources'] ?? [];
        fwrite(STDOUT, 'External RSS mode enabled; configured sources: ' . count($rssSources) . "\n");
        foreach ($rssSources as $source) {
            if (empty($source['active'])) continue;
            try {
                $articles = rssArticles($source);
                foreach ($articles as $article) { $article['sourceType'] = 'external-news'; upsertFirestore($projectId, $token, 'articles', $article['documentId'], $article); $count++; }
                fwrite(STDOUT, 'RSS ' . ($source['id'] ?? $source['name'] ?? 'unknown') . ': ' . count($articles) . " articles\n");
            } catch (Throwable $sourceError) {
                fwrite(STDERR, 'RSS failed ' . ($source['id'] ?? $source['name'] ?? 'unknown') . ': ' . $sourceError->getMessage() . "\n");
            }
        }
    } else {
        fwrite(STDOUT, "External RSS mode disabled; no third-party news wires will be synchronized.\n");
    }
    $remoteSources = listFirestoreCollection($projectId, $token, 'externalSources');
    $videoControls = [];
    foreach (listFirestoreCollection($projectId, $token, 'videoControls') as $control) {
        if (!empty($control['hidden'])) $videoControls[(string) ($control['id'] ?? '')] = true;
    }
    $youtubeSources = array_values(array_filter($remoteSources, fn(array $source): bool => ($source['provider'] ?? '') === 'youtube' && ($source['active'] ?? false)));
    $facebookSources = array_values(array_filter($remoteSources, fn(array $source): bool => ($source['provider'] ?? '') === 'facebook' && ($source['active'] ?? false)));
    if (!$remoteSources) {
        $youtubeSources = $config['youtubeChannels'] ?? [];
        $facebookSources = $config['facebookPages'] ?? [];
    }
    foreach ($youtubeSources as $source) {
        if (empty($source['active'])) continue;
        $source['channelId'] = $source['channelId'] ?? $source['channelOrPageId'] ?? '';
        $source['id'] = $source['id'] ?? 'youtube-' . $source['channelId'];
        foreach (youtubeVideos($source) as $video) {
            $isHidden = !empty($videoControls[$video['documentId']]);
            $video['active'] = !$isHidden;
            $video['hidden'] = $isHidden;
            upsertFirestore($projectId, $token, 'videoItems', $video['documentId'], $video);
            $count++;
        }
        $live = youtubeLive($source, (string) ($config['youtubeApiKey'] ?? ''));
        if ($live) upsertFirestore($projectId, $token, 'liveStreams', 'youtube-' . preg_replace('/[^A-Za-z0-9_-]/', '_', $source['id']), $live + ['updatedAt' => gmdate('c')]);
    }
    foreach (($config['youtubeLinks'] ?? []) as $link) {
        $video = youtubeLink((string) $link);
        if ($video) {
            $isHidden = !empty($videoControls[$video['documentId']]);
            $video['active'] = !$isHidden;
            $video['hidden'] = $isHidden;
            upsertFirestore($projectId, $token, 'videoItems', $video['documentId'], $video);
            $count++;
        }
    }
    foreach ($facebookSources as $source) {
        if (empty($source['active'])) continue;
        $source['pageId'] = $source['pageId'] ?? $source['channelOrPageId'] ?? '';
        $source['id'] = $source['id'] ?? 'facebook-' . $source['pageId'];
        $pageToken = (string) ($config['facebookPageAccessTokens'][$source['id']] ?? '');
        foreach (facebookPosts($source, $pageToken, (string) ($config['graphApiVersion'] ?? 'v23.0')) as $post) { upsertFirestore($projectId, $token, 'videoItems', $post['documentId'], $post); $count++; }
        foreach (($config['facebookPostLinks'] ?? []) as $link) { $post = facebookPostLink((string) $link, $pageToken, (string) ($config['graphApiVersion'] ?? 'v23.0')); if ($post) { upsertFirestore($projectId, $token, 'videoItems', $post['documentId'], $post); $count++; } }
    }
    fwrite(STDOUT, "Sync complete: {$count} external items processed.\n");
} catch (Throwable $error) {
    fwrite(STDERR, 'Sync failed: ' . $error->getMessage() . "\n");
    exit(1);
}
