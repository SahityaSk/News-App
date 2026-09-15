const TEMPORARY_LIVE_STREAM_URL = 'https://cdn.abplive.com/LiveStreams/260118/abpananda/streaming_bengali_vidgyor-new-nov2022.html';

const isDemoMediaUrl = (url = '') => {
  const value = String(url).toLowerCase();
  return value.includes('w3schools.com/html/mov_bbb.mp4')
    || value.includes('interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')
    || value.includes('youtube.com/embed/live_stream?channel=ucq-fj5jknlsuf-mwsy4_br')
    || value.includes('youtube.com/embed/live_stream?channel=ucv3rfzn-ghgtqzxiaq3swng');
};

const isYouTubeUrl = (url = '') => /(?:youtube\.com|youtu\.be)/i.test(String(url));

const isEmbeddedPageUrl = (url = '') => /cdn\.abplive\.com\/LiveStreams\//i.test(String(url));

const inferStreamType = (url = '') => {
  if (isYouTubeUrl(url)) return 'youtube_live';
  if (isEmbeddedPageUrl(url)) return 'web_embed';
  if (/\.m3u8(?:$|\?)/i.test(String(url))) return 'hls_m3u8';
  return 'mp4';
};

module.exports = {
  TEMPORARY_LIVE_STREAM_URL,
  isDemoMediaUrl,
  isYouTubeUrl,
  isEmbeddedPageUrl,
  inferStreamType
};
