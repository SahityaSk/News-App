<?php
return [
    // Keep this file outside public_html and rename it to worker-config.php.
    'projectId' => 'YOUR_FIREBASE_PROJECT_ID',
    'serviceAccountPath' => '/home/USERNAME/private/firebase-service-account.json',
    'youtubeApiKey' => '', // Optional; keep private. Needed for automatic live discovery.
    'graphApiVersion' => 'v23.0',
    // These are the core automatic news sources. Keep only feeds whose terms allow republication.
    'rssSources' => [
        ['id' => 'ndtv-national', 'name' => 'NDTV National Feed', 'url' => 'https://feeds.feedburner.com/ndtvnews-top-stories', 'category' => 'national', 'lang' => 'EN', 'active' => true],
        ['id' => 'abp-ananda-bengali', 'name' => 'ABP Ananda Bengali Feed', 'url' => 'https://bengali.abplive.com/home/feed', 'category' => 'world', 'lang' => 'BN', 'active' => true],
        ['id' => 'bbc-hindi', 'name' => 'BBC Hindi Feed', 'url' => 'https://feeds.bbci.co.uk/hindi/rss.xml', 'category' => 'world', 'lang' => 'HI', 'active' => true],
        ['id' => 'nytimes-world', 'name' => 'NYT World Feed', 'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', 'category' => 'world', 'lang' => 'EN', 'active' => true],
        ['id' => 'nytimes-technology', 'name' => 'NYT Technology Feed', 'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', 'category' => 'tech', 'lang' => 'EN', 'active' => true],
        ['id' => 'nytimes-business', 'name' => 'NYT Business Feed', 'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', 'category' => 'business', 'lang' => 'EN', 'active' => true],
        ['id' => 'nytimes-sports', 'name' => 'NYT Sports Feed', 'url' => 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', 'category' => 'sports', 'lang' => 'EN', 'active' => true]
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
