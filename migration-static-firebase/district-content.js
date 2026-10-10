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
