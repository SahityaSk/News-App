const fs = require('fs');

const officialSvg = fs.readFileSync('westbengal_official.svg', 'utf8');

// Extract specific path d attributes by path id
function getPathD(pathId) {
  const pathTags = officialSvg.match(/<path[\s\S]*?(?:\/>|<\/path>)/gi) || [];
  for (const tag of pathTags) {
    const idMatch = tag.match(/id="([^"]+)"/i);
    if (idMatch && idMatch[1].toLowerCase() === pathId.toLowerCase()) {
      const dMatch = tag.match(/d="([^"]+)"/i);
      return dMatch ? dMatch[1] : '';
    }
  }
  return '';
}

function getPathsD(pathIds) {
  return pathIds.map(getPathD).filter(Boolean).join(' ');
}

// Map each district ID to its corresponding SVG path(s)
const pathMapping = {
  'darjeeling': { pathId: 'path14', labelPos: { x: 445, y: 110 } },
  'kalimpong': { pathId: 'path10', labelPos: { x: 513, y: 70 } },
  'jalpaiguri': { pathId: 'path11', labelPos: { x: 536, y: 145 } },
  'alipurduar': { pathId: 'path17', labelPos: { x: 635, y: 216 } },
  'cooch-behar': { pathId: 'path15', labelPos: { x: 659, y: 140 } },
  'uttar-dinajpur': { pathId: 'path19', labelPos: { x: 435, y: 295 } },
  'dakshin-dinajpur': { pathId: 'path16', labelPos: { x: 515, y: 386 } },
  'malda': { pathId: 'path18', labelPos: { x: 432, y: 445 } },
  'murshidabad': { pathId: 'path29', labelPos: { x: 466, y: 601 } },
  'birbhum': { pathId: 'path31', labelPos: { x: 339, y: 646 } },
  'nadia': { pathId: 'path23', labelPos: { x: 504, y: 752 } },
  'purba-bardhaman': { pathId: 'path24', labelPos: { x: 410, y: 775 } },
  'paschim-bardhaman': { pathId: 'path22', labelPos: { x: 273, y: 729 } },
  'purulia': { pathId: 'path27', labelPos: { x: 130, y: 819 } },
  'bankura': { pathId: 'path25', labelPos: { x: 280, y: 830 } },
  'jhargram': { pathId: 'path38', labelPos: { x: 233, y: 984 } },
  'paschim-medinipur': { pathIds: ['path36'], labelPos: { x: 275, y: 915 } },
  'purba-medinipur': { pathIds: ['path40', 'path33'], labelPos: { x: 360, y: 925 } },
  'hooghly': { pathId: 'path30', labelPos: { x: 425, y: 865 } },
  'howrah': { pathId: 'path32', labelPos: { x: 446, y: 945 } },
  'kolkata': { pathId: 'path20', labelPos: { x: 489, y: 935 } },
  'north-24-parganas': { pathIds: ['path47'], labelPos: { x: 555, y: 885 } },
  'south-24-parganas': { pathIds: ['path37', 'path39', 'path41', 'path43', 'path45', 'path48', 'path50'], labelPos: { x: 540, y: 975 } }
};

const shortNames = {
  'darjeeling': 'Darjeeling',
  'kalimpong': 'Kalimpong',
  'jalpaiguri': 'Jalpaiguri',
  'alipurduar': 'Alipurduar',
  'cooch-behar': 'Cooch Behar',
  'uttar-dinajpur': 'Uttar Dinajpur',
  'dakshin-dinajpur': 'Dakshin Dinajpur',
  'malda': 'Malda',
  'murshidabad': 'Murshidabad',
  'birbhum': 'Birbhum',
  'nadia': 'Nadia',
  'purba-bardhaman': 'Purba Bardhaman',
  'paschim-bardhaman': 'Pashchim Bardhaman',
  'purulia': 'Purulia',
  'bankura': 'Bankura',
  'jhargram': 'Jhargram',
  'paschim-medinipur': 'Pashchim Medinipur',
  'purba-medinipur': 'Purba Medinipur',
  'hooghly': 'Hooghly',
  'howrah': 'Howrah',
  'kolkata': 'Kolkata',
  'north-24-parganas': 'North 24 Parganas',
  'south-24-parganas': 'South 24 Parganas'
};

const districtsMeta = [
  {
    id: 'darjeeling',
    nameEn: 'Darjeeling',
    nameBn: 'দার্জিলিং',
    nameHi: 'दार्जिलिंग',
    hq: 'Darjeeling',
    region: 'North Bengal',
    color: '#fef08a',
    labelLines: ['Darjeeling'],
    desc: 'Queen of the Hills, UNESCO World Heritage Railway, Kanchenjunga view & world-famous tea.'
  },
  {
    id: 'kalimpong',
    nameEn: 'Kalimpong',
    nameBn: 'কালিম্পং',
    nameHi: 'কলিঙ্কপং',
    hq: 'Kalimpong',
    region: 'North Bengal',
    color: '#fbcfe8',
    labelLines: ['Kalimpong'],
    desc: 'Himalayan orchid hub, Deolo Hill, historic Silk Route trade link & eco-lodges.'
  },
  {
    id: 'jalpaiguri',
    nameEn: 'Jalpaiguri',
    nameBn: 'জলপাইগুড়ি',
    nameHi: 'जलपाईगुड़ी',
    hq: 'Jalpaiguri',
    region: 'North Bengal',
    color: '#dcfce7',
    labelLines: ['Jalpaiguri'],
    desc: 'Lush tea estates, Teesta river valley, Gorumara National Park & Dooars tourism.'
  },
  {
    id: 'alipurduar',
    nameEn: 'Alipurduar',
    nameBn: 'আলীপুরদুয়ার',
    nameHi: 'अलीपुरद्वार',
    hq: 'Alipurduar',
    region: 'North Bengal',
    color: '#e9d5ff',
    labelLines: ['Alipurduar'],
    desc: 'Buxa Tiger Reserve, Jayanti Hills, gateway to Bhutan & elephant corridors.'
  },
  {
    id: 'cooch-behar',
    nameEn: 'Cooch Behar',
    nameBn: 'কোচবিহার',
    nameHi: 'कूचबिहार',
    hq: 'Cooch Behar',
    region: 'North Bengal',
    color: '#fef08a',
    labelLines: ['Cooch Behar'],
    desc: 'Majestic Cooch Behar Royal Palace, Madan Mohan Temple & heritage town planning.'
  },
  {
    id: 'uttar-dinajpur',
    nameEn: 'Uttar Dinajpur',
    nameBn: 'উত্তর দিনাজপুর',
    nameHi: 'उत्तर दिनजपुर',
    hq: 'Raiganj',
    region: 'North Bengal',
    color: '#ffe4e6',
    labelLines: ['Uttar Dinajpur'],
    desc: 'Raiganj Kulik Wildlife Bird Sanctuary, strategic corridor connecting North & South Bengal.'
  },
  {
    id: 'dakshin-dinajpur',
    nameEn: 'Dakshin Dinajpur',
    nameBn: 'দক্ষিণ দিনাজপুর',
    nameHi: 'दक्षिण दिनजपुर',
    hq: 'Balurghat',
    region: 'North Bengal',
    color: '#dcfce7',
    labelLines: ['Dakshin', 'Dinajpur'],
    desc: 'Peaceful agricultural belt, Hili international border post & archaeological heritage.'
  },
  {
    id: 'malda',
    nameEn: 'Malda',
    nameBn: 'মালদা',
    nameHi: 'मालदा',
    hq: 'English Bazar',
    region: 'Central Bengal',
    color: '#e9d5ff',
    labelLines: ['Malda'],
    desc: 'Fazli Mango capital, historic Gour & Adina Mosque ruins, silk production center.'
  },
  {
    id: 'murshidabad',
    nameEn: 'Murshidabad',
    nameBn: 'মুর্শিদাবাদ',
    nameHi: 'मुरशिदाबाद',
    hq: 'Baharampur',
    region: 'Central Bengal',
    color: '#fef08a',
    labelLines: ['Murshidabad'],
    desc: 'Nawabi capital, Hazarduari Palace, Katra Mosque, Bhagirathi river heritage.'
  },
  {
    id: 'birbhum',
    nameEn: 'Birbhum',
    nameBn: 'বীরভূম',
    nameHi: 'बीरभूम',
    hq: 'Suri',
    region: 'Western Rarh',
    color: '#ffe4e6',
    labelLines: ['Birbhum'],
    desc: 'Land of Rabindranath Tagore Visva-Bharati Santiniketan, Baul music & Bakreshwar hot springs.'
  },
  {
    id: 'nadia',
    nameEn: 'Nadia',
    nameBn: 'নদীয়া',
    nameHi: 'नदिया',
    hq: 'Krishnanagar',
    region: 'Central Bengal',
    color: '#ffe4e6',
    labelLines: ['Nadia'],
    desc: 'Birthplace of Sri Chaitanya Mahaprabhu (Mayapur ISKCON HQ), clay models & Taant handloom.'
  },
  {
    id: 'purba-bardhaman',
    nameEn: 'Purba Bardhaman',
    nameBn: 'পূর্ব বর্ধমান',
    nameHi: 'पूर्व वर्धमान',
    hq: 'Bardhaman',
    region: 'Western Rarh',
    color: '#e9d5ff',
    labelLines: ['Purba Bardhaman'],
    desc: 'Rice bowl of Bengal, 108 Shiv Mandir, historic Curzon Gate & Mihidana sweets.'
  },
  {
    id: 'paschim-bardhaman',
    nameEn: 'Paschim Bardhaman',
    nameBn: 'পশ্চিম বর্ধমান',
    nameHi: 'पश्चिम वर्धमान',
    hq: 'Asansol',
    region: 'Western Rarh',
    color: '#dcfce7',
    labelLines: ['Pashchim', 'Bardhaman'],
    desc: 'Industrial heartland, Durgapur Steel Plant, IISCO Burnpur & Raniganj coalfields.'
  },
  {
    id: 'purulia',
    nameEn: 'Purulia',
    nameBn: 'পুরুলিয়া',
    nameHi: 'পুরুলিয়া',
    hq: 'Purulia',
    region: 'Western Rarh',
    color: '#e9d5ff',
    labelLines: ['Purulia'],
    desc: 'UNESCO recognized Chhau Mask dance, Ajodhya Hills, Bamni Falls & tribal folk art.'
  },
  {
    id: 'bankura',
    nameEn: 'Bankura',
    nameBn: 'বাঁকুড়া',
    nameHi: 'बांकुड़ा',
    hq: 'Bankura',
    region: 'Western Rarh',
    color: '#fef08a',
    labelLines: ['Bankura'],
    desc: 'Famous Terracotta Pancharatna Temples of Bishnupur, Mukutmanipur Dam & Susunia Hill.'
  },
  {
    id: 'jhargram',
    nameEn: 'Jhargram',
    nameBn: 'ঝাড়গ্রাম',
    nameHi: 'झाड़ग्राम',
    hq: 'Jhargram',
    region: 'Western Rarh',
    color: '#dcfce7',
    labelLines: ['Jhargram'],
    desc: 'Forest beauty, Jhargram Royal Palace, Belpahari eco-tourism & tribal culture.'
  },
  {
    id: 'paschim-medinipur',
    nameEn: 'Paschim Medinipur',
    nameBn: 'পশ্চিম মেদিনীপুর',
    nameHi: 'पश्चिम मेदनीपुर',
    hq: 'Midnapore',
    region: 'Western Rarh',
    color: '#ffe4e6',
    labelLines: ['Pashchim', 'Medinipur'],
    desc: 'Historic Midnapore town, Gongoni Grand Canyon of Bengal & Gopgarh Eco Park.'
  },
  {
    id: 'purba-medinipur',
    nameEn: 'Purba Medinipur',
    nameBn: 'পূর্ব মেদিনীপুর',
    nameHi: 'পূর্ব মেদনীপুর',
    hq: 'Tamluk',
    region: 'Coastal Delta',
    color: '#e9d5ff',
    labelLines: ['Purba', 'Medinipur'],
    desc: 'Digha & Mandarmani sea beaches, Haldia Petrochemical port & Tamralipta ancient kingdom.'
  },
  {
    id: 'hooghly',
    nameEn: 'Hooghly',
    nameBn: 'হুগলী',
    nameHi: 'हुगली',
    hq: 'Chinsurah',
    region: 'South Bengal',
    color: '#dcfce7',
    labelLines: ['Hooghly'],
    desc: 'Colonial heritage (French Chandannagar, Portuguese Bandel Church, Dutch Chinsurah) & Tarakeswar.'
  },
  {
    id: 'howrah',
    nameEn: 'Howrah',
    nameBn: 'হাওড়া',
    nameHi: 'हावड़ा',
    hq: 'Howrah',
    region: 'South Bengal',
    color: '#fef08a',
    labelLines: ['Howrah'],
    desc: 'Iconic Howrah Bridge (Rabindra Setu), Botanical Garden Great Banyan Tree & rail terminus.'
  },
  {
    id: 'kolkata',
    nameEn: 'Kolkata',
    nameBn: 'কলকাতা',
    nameHi: 'कोलकाता',
    hq: 'Kolkata',
    region: 'South Bengal',
    color: '#ffe4e6',
    labelLines: ['Kolkata'],
    desc: 'City of Joy, Victoria Memorial, Tramways, Eden Gardens, Durga Puja UNESCO Intangible Heritage.'
  },
  {
    id: 'north-24-parganas',
    nameEn: 'North 24 Parganas',
    nameBn: 'উত্তর ২৪ পরগণা',
    nameHi: 'उत्तर 24 परगना',
    hq: 'Barasat',
    region: 'South Bengal',
    color: '#e9d5ff',
    labelLines: ['North 24', 'Parganas'],
    desc: 'Most populous district, IT Hub Salt Lake Sector V, New Town & Netaji Subhash Airport.'
  },
  {
    id: 'south-24-parganas',
    nameEn: 'South 24 Parganas',
    nameBn: 'দক্ষিণ ২৪ পরগণা',
    nameHi: 'दक्षिण 24 परगना',
    hq: 'Alipore',
    region: 'Coastal Delta',
    color: '#dcfce7',
    labelLines: ['South 24', 'Parganas'],
    desc: 'Sundarbans UNESCO World Heritage Mangrove Forest, Royal Bengal Tigers & Gangasagar pilgrimage.'
  }
];

const processedDistricts = districtsMeta.map(d => {
  const mapInfo = pathMapping[d.id];
  const dPath = mapInfo.pathIds ? getPathsD(mapInfo.pathIds) : getPathD(mapInfo.pathId);
  return {
    ...d,
    shortName: shortNames[d.id] || d.nameEn,
    svgPath: dPath || 'M 100 100 L 200 100 L 200 200 L 100 200 Z',
    labelPos: mapInfo.labelPos
  };
});

const fileContent = `// West Bengal 23 Districts Official Vector SVG Data & News Generator
export const WB_REGIONS = [
  { id: 'all', name: 'All Bengal', color: 'var(--red)' },
  { id: 'North Bengal', name: 'North Bengal', color: '#10b981' },
  { id: 'Central Bengal', name: 'Central Bengal', color: '#f59e0b' },
  { id: 'Western Rarh', name: 'Western Rarh', color: '#f97316' },
  { id: 'South Bengal', name: 'South Bengal', color: '#3b82f6' },
  { id: 'Coastal Delta', name: 'Coastal Delta', color: '#14b8a6' }
];

export const WB_MAP_VIEWBOX = "0 0 768 1158.72";

export const WB_DISTRICTS = ${JSON.stringify(processedDistricts, null, 2)};
`;

fs.writeFileSync('wb-map-data.js', fileContent, 'utf8');
console.log('Successfully written official authentic SVG map data to wb-map-data.js!');
