const breakingNews = {
  EN: [
    { id: "b1", text: "GLOBAL SUMMIT 2026: Leaders Sign Landmark Artificial Intelligence Safety & Climate Protocol in Geneva", category: "WORLD", time: "2 mins ago" },
    { id: "b2", text: "MARKETS ALERT: Nifty crosses 25,500 record high as Tech & Green Energy stocks rally sharply", category: "BUSINESS", time: "8 mins ago" },
    { id: "b3", text: "SPORTS BREAKING: India secures thrilling last-over victory against Australia in World T20 Championship", category: "SPORTS", time: "14 mins ago" },
    { id: "b4", text: "SPACE EXPLORATION: Lunar Odyssey 4 successfully lands on Moon's South Pole with rover deployed", category: "TECH", time: "25 mins ago" },
    { id: "b5", text: "INFRASTRUCTURE: Bullet Train trial run completes 350 km/h milestone speed test ahead of schedule", category: "NATIONAL", time: "40 mins ago" }
  ],
  BN: [
    { id: "b1", text: "আন্তর্জাতিক সম্মেলন ২০২৬: জেনেভায় কৃত্রিম বুদ্ধিমত্তা নিরাপত্তা ও জলবায়ু চুক্তি স্বাক্ষরিত", category: "আন্তর্জাতিক", time: "২ মিনিট আগে" },
    { id: "b2", text: "শেয়ার বাজার আপডেট: নিফটি ২৫,৫০০ রেকর্ড সূচক অতিক্রম করল, তুঙ্গে টেক ও শক্তি খাতের শেয়ার", category: "ব্যবসা-বাণিজ্য", time: "৮ মিনিট আগে" },
    { id: "b3", text: "বিশ্ব টি-টোয়েন্টি কাপ: অস্ট্রেলিয়াকে নাটকীয় শেষ ওভারে হারিয়ে জয়ী ভারত", category: "খেলাধুলা", time: "১৪ মিনিট আগে" },
    { id: "b4", text: "মহাকাশ অভিযান: চাঁদের দক্ষিণ মেরুতে সফলভাবে অবতরণ করল লুনার ওডিসি ৪ রোভার", category: "প্রযুক্তি", time: "২৫ মিনিট আগে" },
    { id: "b5", text: "মেগা পরিকাঠামো: বুলেট ট্রেন ট্রায়াল রান ৩৫০ কিমি/ঘণ্টা রেকর্ড গতি স্পর্শ করল", category: "জাতীয়", time: "৪০ মিনিট আগে" }
  ],
  HI: [
    { id: "b1", text: "ग्लोबल समिट 2026: जेनेवा में एआई सुरक्षा व जलवायु संधि पर हुए ऐतिहासिक हस्ताक्षर", category: "विश्व", time: "2 मिनट पहले" },
    { id: "b2", text: "शेयर बाजार अलर्ट: निफ्टी 25,500 के नए रिकॉर्ड स्तर पर पहुंचा, टेक शेयरों में उछाल", category: "व्यापार", time: "8 मिनट पहले" },
    { id: "b3", text: "टी20 विश्व कप: भारत ने ऑस्ट्रेलिया को आखिरी ओवर के रोमांच में हराकर ऐतिहासिक जीत दर्ज की", category: "खेल", time: "14 मिनट पहले" },
    { id: "b4", text: "अंतरिक्ष मिशन: चंद्रमा के दक्षिणी ध्रुव पर लूनर ओडिसी 4 की सफल लैंडिंग", category: "तकनीक", time: "25 मिनट पहले" },
    { id: "b5", text: "बुलेट ट्रेन: 350 किमी/घंटा की रफ्तार से ट्रायल रन समय से पहले सफलतापूर्वक पूरा", category: "राष्ट्रीय", time: "40 मिनट पहले" }
  ]
};

const heroCoverage = {
  EN: {
    id: "hero-101",
    badge: "LIVE COVERAGE",
    title: "Global Climate & Tech Accord 2026: Historic Consensus Reached on AI Governance & Energy Grid Modernization",
    summary: "Delegates from over 140 nations have finalized a unified protocol setting global safeguards for frontier AI while pledging $500 billion towards cross-border clean energy networks.",
    author: "Siddharth Sen & Global Bureau",
    timestamp: "12 SEP 2026 | 03:45 PM IST",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveBroadcastStream: "https://www.w3schools.com/html/mov_bbb.mp4",
    keyDevelopments: [
      { time: "03:42 PM", text: "UN Secretary General signs final accord document amidst standing ovation." },
      { time: "03:30 PM", text: "Tech Industry Consortium pledges full compliance with algorithmic transparency mandates." },
      { time: "03:15 PM", text: "India announces $50B national green grid initiative linked with global energy corridor." },
      { time: "02:50 PM", text: "Joint Declaration released: Full text published online for public review." },
      { time: "02:20 PM", text: "European Commission announces companion regulatory framework starting 2027." }
    ]
  },
  BN: {
    id: "hero-101",
    badge: "লাইভ কভারেজ",
    title: "গ্লোবাল ক্লাইমেট ও টেক সামিট ২০২৬: এআই গভর্ন্যান্স ও ক্লিন এনার্জি গ্রিড নিয়ে ঐতিহাসিক চুক্তি স্বাক্ষর",
    summary: "১৪০টিরও বেশি দেশের প্রতিনিধিরা এআই ব্যবহারের বিশ্বব্যাপী নির্দেশিকা এবং ৫০০ বিলিয়ন ডলারের ক্লিন এনার্জি চুক্তিতে সর্বসম্মত সম্মতি জানিয়েছেন।",
    author: "সিদ্ধার্থ সেন ও গ্লোবাল ব্যুরো",
    timestamp: "১২ সেপ ২০২৬ | বিকাল ০৩:৪৫ IST",
    readTime: "৫ মিনিট পাঠ",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveBroadcastStream: "https://www.w3schools.com/html/mov_bbb.mp4",
    keyDevelopments: [
      { time: "০৩:৪২ PM", text: "জাতিসংঘের মহাসচিব করতালি ধ্বনির মধ্যে চূড়ান্ত চুক্তিপত্রে স্বাক্ষর করলেন।" },
      { time: "০৩:৩০ PM", text: "টেক ইন্ডাস্ট্রি কনসোর্টিয়াম অ্যালগরিদমিক স্বচ্ছতার নীতি মেনে চলার প্রতিশ্রুতি দিয়েছে।" },
      { time: "০৩:১৫ PM", text: "ভারত ৫০০ কোটি ডলারের জাতীয় গ্রিন এনার্জি গ্রিড প্রকল্পের ঘোষণা করেছে।" },
      { time: "০২:৫০ PM", text: "যৌথ ঘোষণা প্রকাশিত: পূর্ণাঙ্গ খসড়া সর্বসাধারণের পর্যালোচনার জন্য ওয়েবসাইটে পাওয়া যাচ্ছে।" },
      { time: "০২:২০ PM", text: "ইউরোপীয় কমিশন ২০২৭ থেকে কার্যকর নতুন নিয়ন্ত্রক কাঠামোর ঘোষণা করেছে।" }
    ]
  },
  HI: {
    id: "hero-101",
    badge: "लाइव कवरेज",
    title: "ग्लोबल क्लाइमेट व टेक समिट 2026: एआई गवर्नेंस व ऊर्जा ग्रिड पर बना ऐतिहासिक सर्वसम्मति",
    summary: "140 से अधिक देशों के प्रतिनिधियों ने आर्टिफिशियल इंटेलिजेंस की सुरक्षा और 500 अरब डॉलर के स्वच्छ ऊर्जा नेटवर्क के लिए ऐतिहासिक समझौते पर हस्ताक्षर किए।",
    author: "सिद्धार्थ सेन व ग्लोबल ब्यूरो",
    timestamp: "12 सित 2026 | दोपहर 03:45 IST",
    readTime: "5 मिनट पढ़ें",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveBroadcastStream: "https://www.w3schools.com/html/mov_bbb.mp4",
    keyDevelopments: [
      { time: "03:42 PM", text: "संयुक्त राष्ट्र महासचिव ने तालियों की गड़गड़ाहट के बीच अंतिम समझौते पर हस्ताक्षर किए।" },
      { time: "03:30 PM", text: "टेक उद्योग संघ ने एल्गोरिथम पारदर्शिता नियमों के पूर्ण अनुपालन की प्रतिज्ञा ली।" },
      { time: "03:15 PM", text: "भारत ने $50B के राष्ट्रीय ग्रीन ग्रिड की घोषणा की जो वैश्विक ऊर्जा गलियारे से जुड़ा है।" },
      { time: "02:50 PM", text: "संयुक्त घोषणा जारी: पूरा पाठ जनता की समीक्षा के लिए ऑनलाइन उपलब्ध।" },
      { time: "02:20 PM", text: "यूरोपीय आयोग ने 2027 से लागू होने वाले नियमन ढांचे की घोषणा की।" }
    ]
  }
};

const articles = {
  EN: [
    {
      id: "art-1",
      title: "Next-Gen Quantum Supercomputer Operational in Bengaluru: 10,000x Speedup Claimed",
      summary: "India's premier science institute unleashes a 256-qubit quantum processor capable of tackling molecular simulation and cryptography at unprecedented scale.",
      category: "tech",
      categoryLabel: "TECHNOLOGY",
      author: "Rohan Dasgupta",
      time: "15 mins ago",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      content: `Scientists at the National Centre for Advanced Quantum Computing today unveiled 'PARAM-Quantum', a 256-qubit superconducting computing platform. The breakthrough allows researchers to model complex pharmaceutical compounds in minutes rather than decades.\n\nDr. Ananya Roy, Lead Scientist on the team, noted: "This is not just an incremental step; it represents a fundamental leap in computing capacity for weather forecasting, logistics optimization, and deep tech research across the country."`,
      trending: true,
      views: "128K"
    },
    {
      id: "art-2",
      title: "Reserve Bank Unveils Digital Rupee 2.0 with Offline Contactless Payments",
      summary: "The central bank announces next phase of CBDC, allowing feature phones and offline smartcards to process instant micro-transactions without active internet.",
      category: "business",
      categoryLabel: "BUSINESS & FIN",
      author: "Priya Mukherjee",
      time: "32 mins ago",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      content: `In a landmark retail financial move, the Reserve Bank of India launched Digital Rupee 2.0 featuring full offline peer-to-peer functionality. The technology utilizes secure hardware enclaves to enable instant settlement even in zero-connectivity remote regions.`,
      trending: true,
      views: "94K"
    },
    {
      id: "art-3",
      title: "Metro Expansion Phase IV: 5 New Underground Lines Approved for Metro Cities",
      summary: "Cabinet clears ₹42,000 Crore transit overhaul aiming to connect satellite hubs with high-speed automated trains by late 2028.",
      category: "national",
      categoryLabel: "NATIONAL NEWS",
      author: "Subhash Banerjee",
      time: "1 hour ago",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      content: `The Union Cabinet chaired by the Prime Minister approved Metro Expansion Phase IV, laying down 118 km of driverless metro transit lines across suburban metropolitan centers.`,
      trending: true,
      views: "82K"
    },
    {
      id: "art-4",
      title: "World T20 Finals: Explosive Opening Stand Puts India in Command Against Rivals",
      summary: "A thrilling 110-run opening partnership inside 9 overs sets up a massive target in the high-stakes final showdown at Eden Gardens.",
      category: "sports",
      categoryLabel: "SPORTS HUB",
      author: "Vikramjit Sharma",
      time: "2 hours ago",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      content: `Electrifying atmosphere engulfed Eden Gardens as the openers tore into the bowling attack, smashing 8 sixes and 12 boundaries in an unforgettable display of modern T20 cricket.`,
      trending: true,
      views: "210K"
    },
    {
      id: "art-5",
      title: "Global Cinema Awards: Indian Indie Sci-Fi Epic Wins 5 International Honors",
      summary: "Director Samarjit Mitra's groundbreaking cinematic vision receives best director, visual effects, and original score awards at Venice International Film Festival.",
      category: "entertainment",
      categoryLabel: "ENTERTAINMENT",
      author: "Debjani Bose",
      time: "3 hours ago",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      content: `The indie masterpiece shot entirely in Ladakh with solar-powered production rigs captured global acclaim, earning a 10-minute standing ovation during its world premiere.`,
      trending: false,
      views: "45K"
    },
    {
      id: "art-6",
      title: "Lunar Rover Uncovers Water-Ice Reserves in Deep Polar Craters",
      summary: "High-resolution spectral analysis confirms subterranean frozen ice deposits capable of supporting future permanent human bases on the Moon.",
      category: "tech",
      categoryLabel: "SPACE & SCIENCE",
      author: "Dr. K. Swaminathan",
      time: "4 hours ago",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
      content: `Data transmitted from the lunar surface reveals thick sub-surface ice sheets within permanent shadow regions. This discovery drastically lowers the payload weight required for future long-duration deep space missions.`,
      trending: true,
      views: "155K"
    }
  ],

  BN: [
    {
      id: "art-1",
      title: "বেঙ্গালুরুতে চালু ভারতের প্রথম ২৫৬-কিউবিট কোয়ান্টাম সুপারকম্পিউটার: ১০,০০০ গুণ গতির দাবি",
      summary: "জাতীয় কোয়ান্টাম গবেষণা ইনস্টিটিউট ২৫৬-কিউবিট সুপারকন্ডাক্টিং প্রসেসর উন্মোচন করল যা মলিকুলার সিমুলেশন ও ক্রিপ্টোগ্রাফিতে নতুন যুগের সূচনা করবে।",
      category: "tech",
      categoryLabel: "প্রযুক্তি",
      author: "রোহন দাসগুপ্ত",
      time: "১৫ মিনিট আগে",
      readTime: "৪ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      content: `অ্যাডভান্সড কোয়ান্টাম কম্পিউটিং কেন্দ্রের বিজ্ঞানীরা আজ 'পরম-কোয়ান্টাম' সুপারকম্পিউটিং প্ল্যাটফর্ম প্রকাশ করেছেন। এই যুগান্তকারী আবিষ্কারের ফলে যে ওষুধ তৈরিতে আগে কয়েক দশক লাগত, তা এখন কয়েক মিনিটেই সিমুলেট করা যাবে।\n\nপ্রধান বিজ্ঞানী ডঃ অনন্যা রায় বলেন: "এটি কেবল একটি ছোট পদক্ষেপ নয়; দেশের আবহাওয়া পূর্বাভাস, লজিস্টিকস ও ডিপ-টেক গবেষণায় এটি এক বিশাল বিপ্লব।"`,
      trending: true,
      views: "১২৮K"
    },
    {
      id: "art-2",
      title: "রিজার্ভ ব্যাংকের ডিজিটাল রুপি ২.০ চালু: ইন্টারনেট ছাড়াই অফলাইনে টাকা লেনদেন সম্ভব",
      summary: "ইন্টারনেট কানেকশন ছাড়াই সাধারণ ফিচার ফোন ও স্মার্টকার্ডের মাধ্যমে সরাসরি ই-রুপি পিয়ার-টু-পিয়ার লেনদেনের সুবিধা এনেছে আরবিআই।",
      category: "business",
      categoryLabel: "ব্যবসা-বাণিজ্য",
      author: "প্রিয়া মুখার্জি",
      time: "৩২ মিনিট আগে",
      readTime: "৩ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      content: `খুচরা আর্থিক ক্ষেত্রে এক ঐতিহাসিক পদক্ষেপে রিজার্ভ ব্যাংক অফ ইন্ডিয়া ডিজিটাল রুপি ২.০ চালু করল। সিকিউর হার্ডওয়্যার এনক্লেভ প্রযুক্তির মাধ্যমে দূরবর্তী যেকোনো ইন্টারনেট-বিহীন অঞ্চলেও সাথে সাথে লেনদেন সম্পন্ন হবে।`,
      trending: true,
      views: "৯৪K"
    },
    {
      id: "art-3",
      title: "মেট্রো বিস্তার ৪র্থ পর্ব: মেট্রো শহরগুলিতে ৫টি নতুন ভূগর্ভস্থ রুটের অনুমোদন দিল মন্ত্রিসভা",
      summary: "৪২,০০০ কোটি টাকার বাজেটে স্বয়ংক্রিয় চালকহীন উচ্চগতির ট্রেন সংযোগ তৈরির সিদ্ধান্ত নিল কেন্দ্রীয় মন্ত্রিসভা।",
      category: "national",
      categoryLabel: "জাতীয় খবর",
      author: "সুভাষ ব্যানার্জি",
      time: "১ ঘণ্টা আগে",
      readTime: "৫ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      content: `প্রধানমন্ত্রীর নেতৃত্বে অনুষ্ঠিত কেন্দ্রীয় মন্ত্রিসভার বৈঠকে ১১৮ কিমি দীর্ঘ নতুন চালকহীন মেট্রো ট্রানজিট লাইনের অনুমোদন দেওয়া হয়েছে, যা ২০২৮ সালের মধ্যে সম্পন্ন হবে।`,
      trending: true,
      views: "৮২K"
    },
    {
      id: "art-4",
      title: "বিশ্ব টি-টোয়েন্টি কাপ: ইডেন গার্ডেন্সে বিধ্বংসী ১১০ রানের ওপেনিং জুটিতে ভারতের ঐতিহাসিক আধিপত্য",
      summary: "৯ ওভারের মধ্যে বিধ্বংসী ১১০ রানের ওপেনিং জুটিতে বিশাল রানের লক্ষ্য খাড়া করল ভারতীয় দল।",
      category: "sports",
      categoryLabel: "খেলাধুলা",
      author: "বিক্রমজিৎ শর্মা",
      time: "২ ঘণ্টা আগে",
      readTime: "৪ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      content: `ইডেন গার্ডেন্সে দর্শকঠাসা মাঠে ভারতীয় ওপেনাররা ৮টি ছক্কা এবং ১২টি বাউন্ডারি হাঁকিয়ে আধুনিক টি-টোয়েন্টির এক অবিস্মরণীয় রেকর্ড স্থাপন করলেন।`,
      trending: true,
      views: "২১০K"
    },
    {
      id: "art-5",
      title: "আন্তর্জাতিক চলচ্চিত্র উৎসব: ভেনিসে ৫টি আন্তর্জাতিক পুরস্কার জিতল ভারতীয় ইন্ডিপেন্ডেন্ট সাই-ফাই ছবি",
      summary: "পরিচালক সমরজিৎ মিত্রের উদ্ভাবনী সায়েন্স-ফিকশন ছবি ভেনিস ফিল্ম ফেস্টিভ্যালে সেরা নির্দেশনা ও ভিএফএক্সের পুরস্কার পেল।",
      category: "entertainment",
      categoryLabel: "বিনোদন",
      author: "দেবজানি বোস",
      time: "৩ ঘণ্টা আগে",
      readTime: "৩ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      content: `সম্পূর্ণ সৌরবিদ্যুৎ চালিত ক্যামেরা সেটিংসে লাদাখে শ্যুট করা এই চলচ্চিত্রটি ওয়ার্ল্ড প্রিমিয়ারে ১০ মিনিটের টানা স্ট্যান্ডিং ওভেশন অর্জন করেছে।`,
      trending: false,
      views: "৪৫K"
    },
    {
      id: "art-6",
      title: "মহাকাশ গবেষণা: চাঁদের মেরু অঞ্চলের গভীর খাদে সুবিশাল পানীয় জলের বরফের সন্ধান পেল নতুন রোভার",
      summary: "উচ্চ-রেজোলিউশন বর্ণালী বিশ্লেষণে চন্দ্রপৃষ্ঠের নিচে বরফের স্তরের উপস্থিতি নিশ্চিত হয়েছে যা ভবিষ্যতে স্থায়ী মানব ঘাঁটিকে সহায়তা করবে।",
      category: "tech",
      categoryLabel: "মহাকাশ ও বিজ্ঞান",
      author: "ড. কে. স্বামীনাথন",
      time: "৪ ঘণ্টা আগে",
      readTime: "৬ মিনিট পাঠ",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
      content: `চাঁদের চির-ছায়াবৃত গভীর খাদের তলদেশে কয়েক মিটার পুরু বরফের স্তর চিহ্নিত করা গেছে। এতে আগামী দিনের দীর্ঘমেয়াদী মহাকাশ অভিযানের খরচ বহুগুণ কমে আসবে।`,
      trending: true,
      views: "১৫৫K"
    }
  ],

  HI: [
    {
      id: "art-1",
      title: "बेंगलुरु में भारत का पहला 256-क्यूबिट क्वांटम सुपरकंप्यूटर चालू: 10,000 गुना रफ्तार का दावा",
      summary: "राष्ट्रीय क्वांटम केंद्र ने 256-क्यूबिट सुपरकंडक्टिंग क्वांटम प्रोसेसर लॉन्च किया जो आणविक सिमुलेशन को कुछ ही मिनटों में हल कर सकता है।",
      category: "tech",
      categoryLabel: "तकनीक",
      author: "रोहन दासगुप्ता",
      time: "15 मिनट पहले",
      readTime: "4 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      content: `वैज्ञानिकों ने आज 'परम-क्वांटम' सुपरकंप्यूटिंग प्लेटफॉर्म का अनावरण किया। इस तकनीक से जिन दवाओं के शोध में दशकों का समय लगता था, उनका सिमुलेशन अब मिनटों में संभव होगा।\n\nप्रमुख वैज्ञानिक डॉ. अनन्या रॉय ने कहा: "यह देश के मौसम पूर्वानुमान, लॉजिस्टिक्स और डीप-टेक शोध के क्षेत्र में एक क्रांतिकारी कदम है।"`,
      trending: true,
      views: "128K"
    },
    {
      id: "art-2",
      title: "रिजर्व बैंक ने डिजिटल रुपया 2.0 किया लॉन्च: बिना इंटरनेट के होगा सीधा ऑफलाइन भुगतान",
      summary: "आरबीआई ने फीचर फोन और स्मार्टकार्ड के जरिए ऑफलाइन डिजिटल ई-रुपी भुगतान प्रणाली की शुरुआत की।",
      category: "business",
      categoryLabel: "व्यापार व वित्त",
      author: "प्रिया मुखर्जी",
      time: "32 मिनट पहले",
      readTime: "3 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      content: `भारतीय रिजर्व बैंक ने डिजिटल रुपया 2.0 लॉन्च किया है। यह नई तकनीक शून्य-इंटरनेट कनेक्टिविटी वाले दूरदराज क्षेत्रों में भी तुरंत संपर्क रहित भुगतान की सुविधा देती है।`,
      trending: true,
      views: "94K"
    },
    {
      id: "art-3",
      title: "मेट्रो फेज IV विस्तार: बड़े शहरों में 5 नई भूमिगत लाइनों को केंद्र सरकार की मंजूरी",
      summary: "42,000 करोड़ रुपये के बजट में चालकरहित स्वचालित हाई-स्पीड मेट्रो नेटवर्क बनाने का फैसला।",
      category: "national",
      categoryLabel: "राष्ट्रीय समाचार",
      author: "सुभाष बनर्जी",
      time: "1 घंटा पहले",
      readTime: "5 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      content: `प्रधानमंत्री की अध्यक्षता में केंद्रीय मंत्रिमंडल ने 118 किलोमीटर लंबी नई मेट्रो लाइनों के निर्माण को मंजूरी दी है, जो 2028 तक पूरी होंगी।`,
      trending: true,
      views: "82K"
    },
    {
      id: "art-4",
      title: "टी20 विश्व कप: ईडन गार्डन्स में 110 रनों की तूफानी ओपनिंग साझेदारी से भारत मजबूत",
      summary: "भारतीय ओपनिंग जोड़ी ने महज 9 ओवरों में 110 रन ठोककर फाइनल मुकाबले में विशाल लक्ष्य की नींव रखी।",
      category: "sports",
      categoryLabel: "खेल जगत",
      author: "विक्रमजीत शर्मा",
      time: "2 घंटे पहले",
      readTime: "4 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      content: `ईडन गार्डन्स पर भारतीय सलामी बल्लेबाजों ने 8 गगनचुंबी छक्के और 12 चौके लगाकर टी20 क्रिकेट का नया इतिहास रच दिया।`,
      trending: true,
      views: "210K"
    },
    {
      id: "art-5",
      title: "अंतरराष्ट्रीय फिल्म समारोह: वेनिस में भारतीय इंडी साई-फाई फिल्म ने जीते 5 अंतरराष्ट्रीय पुरस्कार",
      summary: "निदेशक समरजीत मित्रा की अभूतपूर्व वैज्ञानिक फिक्शन फिल्म को वेनिस में सर्वश्रेष्ठ निर्देशन का सम्मान मिला।",
      category: "entertainment",
      categoryLabel: "मनोरंजन",
      author: "देवजानी बोस",
      time: "3 घंटे पहले",
      readTime: "3 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      content: `लद्दाख में सोलर-पावर्ड कैमरों से बनी इस फिल्म को वेनिस में वर्ल्ड प्रीमियर के दौरान 10 मिनट तक तालियों की गड़गड़ाहट मिली।`,
      trending: false,
      views: "45K"
    },
    {
      id: "art-6",
      title: "अंतरिक्ष खोज: चंद्रमा के दक्षिणी ध्रुव पर लूनर रोवर ने खोजा विशाल जल-बर्फ का भंडार",
      summary: "उच्च रिज़ॉल्यूशन विश्लेषण से सतह के नीचे पानी के विशाल बर्फ भंडार की पुष्टि हुई जो भविष्य के मानव बेस के लिए सहायक होगी।",
      category: "tech",
      categoryLabel: "अंतरिक्ष व विज्ञान",
      author: "डॉ. के. स्वामीनाथन",
      time: "4 घंटे पहले",
      readTime: "6 मिनट पढ़ें",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
      content: `चंद्र सतह से भेजे गए डेटा से साबित होता है कि स्थाई रूप से अंधेरे वाले गड्ढों में जल-बर्फ की मोटी परतें मौजूद हैं।`,
      trending: true,
      views: "155K"
    }
  ]
};

const videoReels = {
  EN: [
    { id: "v1", title: "Inside the AI Quantum Lab: Exclusive 3D Tour", duration: "02:45", views: "54K", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "TECH REEL" },
    { id: "v2", title: "High-Speed Bullet Train Cockpit POV at 350 km/h", duration: "01:30", views: "112K", thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "SPEED TEST" }
  ],
  BN: [
    { id: "v1", title: "কোয়ান্টাম এআই ল্যাবের ভেতর থেকে এক্সক্লুসিভ ৩ডি ট্যুর", duration: "০২:৪৫", views: "৫৪K", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "টেক রিল" },
    { id: "v2", title: "৩৫০ কিমি/ঘণ্টা গতিতে ককপিট থেকে বুলেট ট্রেনের সরাসরি দৃশ্য", duration: "০১:৩০", views: "১১২K", thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "স্পিড ট্রায়াল" }
  ],
  HI: [
    { id: "v1", title: "क्वांटम एआई लैब के अंदर से एक्सक्लूसिव 3D टूर", duration: "02:45", views: "54K", thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "टेक रील" },
    { id: "v2", title: "350 किमी/घंटा की रफ्तार से बुलेट ट्रेन का कॉकपिट व्यू", duration: "01:30", views: "112K", thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=600&q=80", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", category: "स्पीड ट्रायल" }
  ]
};

const weatherStocks = {
  stocks: [
    { symbol: "SENSEX", value: "82,450.12", change: "+420.30", positive: true },
    { symbol: "NIFTY 50", value: "25,510.45", change: "+115.80", positive: true },
    { symbol: "GOLD (10g)", value: "₹74,850", change: "-120.00", positive: false }
  ],
  weather: {
    city: "Kolkata / New Delhi",
    temp: "30°C",
    condition: "Partly Cloudy",
    aqi: "88 (Moderate)"
  }
};

module.exports = {
  breakingNews,
  heroCoverage,
  articles,
  videoReels,
  weatherStocks
};
