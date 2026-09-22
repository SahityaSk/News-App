# Hostinger external-source worker

This worker is deliberately PHP so it can run from a Hostinger Single cron job. It synchronizes automatic RSS news articles, social/video metadata, and links into Firestore; it does not download video or image files.

## Installation

1. Copy `worker-config.example.php` to `worker-config.php`.
2. Put `worker-config.php` and the Firebase service-account JSON outside `public_html`.
3. Fill in the Firebase project ID and private service-account path.
4. Add YouTube channel IDs.
5. Add a Facebook Page ID and valid Page access token only if the client owns/administers the Page and the Meta permissions are approved.
6. Test with:

```text
/usr/bin/php /home/USERNAME/private/yugantar-worker/sync.php
```

7. Schedule one cron job every 10–15 minutes. Hostinger Single currently allows two cron jobs.

The default configuration mirrors the core RSS sources from the original Node worker. Review every feed's license, attribution, and republication terms before enabling it for the client. RSS is used for discovery/metadata here; it is not permission to republish full copyrighted articles.

## Security

- The service-account JSON has server-level write access. Never put it under `public_html`.
- Never commit `worker-config.php`, service-account JSON, YouTube API keys, or Facebook tokens.
- Restrict the service-account role to the minimum Firestore permissions possible.
- Rotate the Facebook token and API key if they are ever exposed.

## Provider behaviour

- YouTube RSS works without an API key for recent channel uploads and derives `i.ytimg.com` thumbnails.
- Individual YouTube links can also use the public oEmbed endpoint for title and thumbnail metadata.
- YouTube Data API live discovery is optional and uses the private API key.
- Facebook synchronization is for Pages through the Graph API. Arbitrary profile/group scraping is not supported.
- Provider terms, rate limits, attribution, and content rights still apply.
