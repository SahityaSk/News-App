# Hostinger external-source worker

This worker is deliberately PHP so it can run from a Hostinger Single cron job. It synchronizes only YouTube channel videos, optional YouTube live status, and the YouTube subscriber count into Firestore; it does not fetch RSS articles or automatic Facebook posts, and it does not download video or image files.

## Installation

1. Copy `worker-config.example.php` to `worker-config.php`.
2. Put `worker-config.php` and the Firebase service-account JSON outside `public_html`.
3. Fill in the Firebase project ID and private service-account path.
4. The counter is preconfigured for the website's linked channel, `@Yugantar_News`. Confirm this is the channel with 682 subscribers. The counter uses `subscriberCountChannelHandle`, then `subscriberCountChannelId`, or the first active entry in `youtubeChannels` when both are blank. YouTube's public API returns exact counts below 1,000 subscribers.
5. Add a private YouTube Data API key as `youtubeApiKey`; the same key supports live discovery and refreshes the public subscriber count during each worker run.
6. Test with:

```text
/usr/bin/php /home/USERNAME/private/yugantar-worker/sync.php
```

7. Schedule one cron job every 10–15 minutes. Hostinger Single currently allows two cron jobs.

The worker intentionally has no RSS article ingestion. Articles, tickers, polls, sponsors, podcasts, and Facebook links are managed separately through the website workflows.

## Security

- The service-account JSON has server-level write access. Never put it under `public_html`.
- Never commit `worker-config.php`, service-account JSON, YouTube API keys, or Facebook tokens.
- Restrict the service-account role to the minimum Firestore permissions possible.
- Rotate the YouTube API key if it is ever exposed.

## Provider behaviour

- The YouTube channel feed works without an API key for recent channel uploads and derives `i.ytimg.com` thumbnails.
- Individual YouTube links can also use the public oEmbed endpoint for title and thumbnail metadata.
- YouTube Data API live discovery and subscriber-count refresh use the private API key. The displayed count follows the public subscriber count returned by YouTube and updates when the worker runs.
- Provider terms, rate limits, attribution, and content rights still apply to YouTube embeds and thumbnails.
