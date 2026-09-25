<?php
return [
    // Keep this file outside public_html and rename it to worker-config.php.
    'projectId' => 'YOUR_FIREBASE_PROJECT_ID',
    'serviceAccountPath' => '/home/USERNAME/private/firebase-service-account.json',
    // Metadata/link-only feeds reviewed for conservative aggregation.
    'allowExternalNews' => true,
    'youtubeApiKey' => '', // Optional; keep private. Needed for automatic live discovery.
    'graphApiVersion' => 'v23.0',
    // Store headlines, short descriptions, dates, and source links only.
    'rssSources' => [
        ['id' => 'pib-press-releases', 'name' => 'Press Information Bureau', 'url' => 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=5', 'category' => 'national', 'lang' => 'EN', 'active' => true, 'metadataOnly' => true],
        ['id' => 'gdelt-article-list', 'name' => 'GDELT Article List', 'url' => 'https://data.gdeltproject.org/gdeltv3/gal/feed.rss', 'category' => 'general', 'lang' => 'EN', 'active' => true, 'metadataOnly' => true]
    ],
    'youtubeChannels' => [
        [
            'id' => 'client-youtube',
            'name' => 'Client YouTube channel',
            'channelId' => 'UC_REPLACE_WITH_CHANNEL_ID',
            'active' => true
        ]
    ],
    'facebookPages' => [
        [
            'id' => 'client-facebook',
            'name' => 'Client Facebook Page',
            'pageId' => 'REPLACE_WITH_PAGE_ID',
            'active' => false
        ]
    ],
    // Never place a Facebook Page token in Firestore or browser code.
    'facebookPageAccessTokens' => [
        // Key this by the Firestore externalSources document ID when using the admin form.
        'facebook-REPLACE_WITH_PAGE_ID' => 'REPLACE_WITH_PRIVATE_PAGE_ACCESS_TOKEN'
    ],
    // Optional direct links supplied by the client. YouTube oEmbed is public; Facebook still needs a Page token.
    'youtubeLinks' => [],
    'facebookPostLinks' => []
];
