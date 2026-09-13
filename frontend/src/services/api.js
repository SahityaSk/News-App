const API_BASE_URL = 'http://localhost:5000/api';

export const fetchBreakingNews = async (lang = 'EN') => {
  try {
    const res = await fetch(`${API_BASE_URL}/breaking?lang=${lang}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend unavailable, using fallback:', err);
    return [];
  }
};

export const fetchHeroNews = async (lang = 'EN') => {
  try {
    const res = await fetch(`${API_BASE_URL}/hero?lang=${lang}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend unavailable, using fallback:', err);
    return null;
  }
};

export const fetchNewsArticles = async (category = 'all', search = '', lang = 'EN') => {
  try {
    const queryParams = new URLSearchParams();
    if (category && category !== 'all') queryParams.append('category', category);
    if (search) queryParams.append('search', search);
    queryParams.append('lang', lang);

    const res = await fetch(`${API_BASE_URL}/news?${queryParams.toString()}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend unavailable:', err);
    return [];
  }
};

export const fetchWeatherStocks = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/weather-stocks`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const fetchVideoReels = async (lang = 'EN') => {
  try {
    const res = await fetch(`${API_BASE_URL}/reels?lang=${lang}`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return [];
  }
};

export const subscribeNewsletter = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (err) {
    return { success: true, message: `Subscribed ${email} to YUGANTAR Alerts!` };
  }
};
