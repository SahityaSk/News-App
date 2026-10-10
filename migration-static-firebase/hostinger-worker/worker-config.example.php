<?php
return [
    // Keep this file outside public_html and rename it to worker-config.php.
    'projectId' => 'YOUR_FIREBASE_PROJECT_ID',
    'serviceAccountPath' => '/home/USERNAME/private/firebase-service-account.json',
    'youtubeApiKey' => '', // Keep private. Needed for live discovery and the subscriber counter.
    'subscriberCountChannelId' => 'UC0w65H3lsOZiYJUzwqp0lBw', // Yugantar News channel.
    'subscriberCountChannelHandle' => '@Yugantar_News', // Public handle linked from the YUGANTAR News website; takes precedence over ID.
    'youtubeChannels' => [
        [
            'id' => 'yugantar-youtube',
            'name' => 'YUGANTAR News YouTube',
            'channelId' => 'UC0w65H3lsOZiYJUzwqp0lBw',
            'active' => true
        ]
    ],
    // Optional direct YouTube links supplied by the client.
    'youtubeLinks' => [],
];
