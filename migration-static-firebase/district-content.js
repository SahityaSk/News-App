export const ARTICLE_CATEGORIES = [
  { id: 'national', label: { EN: 'National', BN: 'জাতীয়', HI: 'राष्ट्रीय' } },
  { id: 'world', label: { EN: 'World', BN: 'বিশ্ব', HI: 'विश्व' } },
  { id: 'business', label: { EN: 'Business', BN: 'ব্যবসা', HI: 'व्यवसाय' } },
  { id: 'sports', label: { EN: 'Sports', BN: 'খেলাধুলা', HI: 'खेल' } },
  { id: 'tech', label: { EN: 'Technology', BN: 'প্রযুক্তি', HI: 'प्रौद्योगिकी' } },
  { id: 'entertainment', label: { EN: 'Entertainment', BN: 'বিনোদন', HI: 'मनोरंजन' } },
  { id: 'science', label: { EN: 'Science', BN: 'বিজ্ঞান', HI: 'विज्ञान' } },
  { id: 'heritage', label: { EN: 'Heritage', BN: 'ঐতিহ্য', HI: 'विरासत' } }
];

export const DISTRICT_SUBCATEGORIES = [
  { id: 'politics', label: { BN: 'রাজনীতি', EN: 'Politics', HI: 'राजनीति' } },
  { id: 'crime', label: { BN: 'অপরাধ', EN: 'Crime', HI: 'अपराध' } },
  { id: 'infrastructure', label: { BN: 'পরিকাঠামো', EN: 'Infrastructure', HI: 'बुनियादी ढांचा' } },
  { id: 'education', label: { BN: 'শিক্ষা', EN: 'Education', HI: 'शिक्षा' } },
  { id: 'health', label: { BN: 'স্বাস্থ্য', EN: 'Health', HI: 'स्वास्थ्य' } },
  { id: 'business', label: { BN: 'ব্যবসা', EN: 'Business', HI: 'व्यवसाय' } },
  { id: 'agriculture', label: { BN: 'কৃষি', EN: 'Agriculture', HI: 'कृषि' } },
  { id: 'culture', label: { BN: 'সংস্কৃতি', EN: 'Culture', HI: 'संस्कृति' } },
  { id: 'tourism', label: { BN: 'পর্যটন', EN: 'Tourism', HI: 'पर्यटन' } },
  { id: 'environment', label: { BN: 'পরিবেশ', EN: 'Environment', HI: 'पर्यावरण' } },
  { id: 'weather', label: { BN: 'আবহাওয়া', EN: 'Weather', HI: 'मौसम' } },
  { id: 'sports', label: { BN: 'খেলা', EN: 'Sports', HI: 'खेल' } },
  { id: 'public-service', label: { BN: 'জনপরিষেবা', EN: 'Public service', HI: 'जनसेवा' } },
  { id: 'other', label: { BN: 'অন্যান্য', EN: 'Other', HI: 'अन्य' } }
];

export const districtSubcategoryLabel = (id, language = 'BN') => {
  const item = DISTRICT_SUBCATEGORIES.find(entry => entry.id === id);
  return item?.label?.[language] || item?.label?.EN || 'District news';
};
