// Demo/seed product data for JK Shop.
// Images are placeholder graphics (placehold.co) labeled with the product
// name — see chat explanation. Replace with real photo URLs for production.

const categoryColors = {
  Electronics: '1a1a2e/d4af37',
  Clothing: '2c2c54/f5f5f0',
  'Home & Kitchen': '0f3460/e8c547',
  Books: '3d3d3d/ffffff',
  Sports: '16213e/00b894',
  Beauty: '4a2545/e8b4bc',
  Toys: '2d4059/ea5455',
  Other: '222831/eeeeee',
};

const img = (category, label) => {
  const colors = categoryColors[category] || '333333/ffffff';
  const text = encodeURIComponent(label);
  return {
    url: `https://placehold.co/600x600/${colors}?text=${text}&font=roboto`,
    alt: label,
  };
};

const productsData = [
  // ---------------- Electronics ----------------
  {
    name: 'Bluetooth Portable Speaker',
    description: 'Compact wireless speaker with rich bass, 12-hour battery life, and IPX5 splash resistance. Great for outdoor use and travel.',
    price: 2499, discountPrice: 1999, category: 'Electronics', brand: 'SoundWave',
    stock: 40, isFeatured: true, isActive: true,
    images: [img('Electronics', 'Bluetooth Speaker')],
  },
  {
    name: 'Smart Fitness Band',
    description: 'Tracks steps, heart rate, sleep, and SpO2. Water-resistant with a 7-day battery and smartphone notifications.',
    price: 1799, discountPrice: 1499, category: 'Electronics', brand: 'FitTrack',
    stock: 55, isFeatured: true, isActive: true,
    images: [img('Electronics', 'Fitness Band')],
  },
  {
    name: 'Noise Cancelling Earbuds',
    description: 'True wireless earbuds with active noise cancellation, touch controls, and a compact charging case.',
    price: 3499, discountPrice: 2899, category: 'Electronics', brand: 'SoundWave',
    stock: 35, isFeatured: false, isActive: true,
    images: [img('Electronics', 'ANC Earbuds')],
  },
  {
    name: '65W USB-C Fast Charger',
    description: 'GaN-based compact charger supporting laptops, tablets, and phones with intelligent power delivery.',
    price: 1299, discountPrice: 0, category: 'Electronics', brand: 'PowerUp',
    stock: 70, isFeatured: false, isActive: true,
    images: [img('Electronics', 'USB-C Charger')],
  },
  {
    name: 'Full HD Webcam',
    description: '1080p webcam with autofocus and a built-in noise-reducing microphone, ideal for calls and streaming.',
    price: 2199, discountPrice: 1799, category: 'Electronics', brand: 'ViewClear',
    stock: 25, isFeatured: false, isActive: true,
    images: [img('Electronics', 'Full HD Webcam')],
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches and a durable aluminum frame.',
    price: 3999, discountPrice: 3299, category: 'Electronics', brand: 'KeyForge',
    stock: 30, isFeatured: true, isActive: true,
    images: [img('Electronics', 'Gaming Keyboard')],
  },
  {
    name: 'Wireless Optical Mouse',
    description: 'Ergonomic wireless mouse with adjustable DPI and a 18-month battery life on two AA batteries.',
    price: 899, discountPrice: 699, category: 'Electronics', brand: 'KeyForge',
    stock: 60, isFeatured: false, isActive: true,
    images: [img('Electronics', 'Wireless Mouse')],
  },

  // ---------------- Clothing ----------------
  {
    name: "Men's Cotton Crew Neck T-Shirt",
    description: '100% combed cotton t-shirt with a regular fit, available in classic solid colors. Breathable and pre-shrunk.',
    price: 599, discountPrice: 449, category: 'Clothing', brand: 'UrbanThread',
    stock: 100, isFeatured: false, isActive: true,
    images: [img('Clothing', "Men's T-Shirt")],
  },
  {
    name: "Women's Slim Fit Jeans",
    description: 'Stretchable denim jeans with a flattering slim fit and mid-rise waist, built for all-day comfort.',
    price: 1799, discountPrice: 1399, category: 'Clothing', brand: 'DenimCo',
    stock: 65, isFeatured: true, isActive: true,
    images: [img('Clothing', "Women's Jeans")],
  },
  {
    name: "Men's Casual Formal Shirt",
    description: 'Wrinkle-resistant cotton-blend shirt suitable for office wear or casual outings, available in multiple colors.',
    price: 1299, discountPrice: 999, category: 'Clothing', brand: 'UrbanThread',
    stock: 70, isFeatured: false, isActive: true,
    images: [img('Clothing', 'Formal Shirt')],
  },
  {
    name: "Women's Summer Floral Dress",
    description: 'Lightweight floral print dress with a flowy silhouette, perfect for warm-weather occasions.',
    price: 1599, discountPrice: 1199, category: 'Clothing', brand: 'BloomWear',
    stock: 45, isFeatured: true, isActive: true,
    images: [img('Clothing', 'Floral Dress')],
  },
  {
    name: 'Unisex Hooded Sweatshirt',
    description: 'Fleece-lined hoodie with a kangaroo pocket and adjustable drawstring hood, great for layering.',
    price: 1499, discountPrice: 1199, category: 'Clothing', brand: 'UrbanThread',
    stock: 80, isFeatured: false, isActive: true,
    images: [img('Clothing', 'Hooded Sweatshirt')],
  },
  {
    name: "Men's Running Track Pants",
    description: 'Lightweight, breathable joggers with zippered pockets and an elastic waistband for workouts or lounging.',
    price: 999, discountPrice: 799, category: 'Clothing', brand: 'ActiveFit',
    stock: 55, isFeatured: false, isActive: true,
    images: [img('Clothing', 'Track Pants')],
  },
  {
    name: "Women's Denim Jacket",
    description: 'Classic cropped denim jacket with button closures, a versatile layering piece for any season.',
    price: 2199, discountPrice: 1799, category: 'Clothing', brand: 'DenimCo',
    stock: 30, isFeatured: false, isActive: true,
    images: [img('Clothing', 'Denim Jacket')],
  },

  // ---------------- Home & Kitchen ----------------
  {
    name: 'Stainless Steel Insulated Water Bottle',
    description: 'Double-wall vacuum insulated bottle keeps drinks cold for 24 hours or hot for 12 hours. 1 litre capacity.',
    price: 899, discountPrice: 699, category: 'Home & Kitchen', brand: 'HomeEssence',
    stock: 90, isFeatured: true, isActive: true,
    images: [img('Home & Kitchen', 'Water Bottle')],
  },
  {
    name: 'Non-Stick Frying Pan Set',
    description: 'Set of 2 non-stick frying pans with heat-resistant handles, suitable for gas and induction cooktops.',
    price: 1899, discountPrice: 1499, category: 'Home & Kitchen', brand: 'CookWell',
    stock: 40, isFeatured: false, isActive: true,
    images: [img('Home & Kitchen', 'Frying Pan Set')],
  },
  {
    name: 'Electric Kettle 1.5L',
    description: 'Fast-boiling electric kettle with auto shut-off and boil-dry protection, made from food-grade stainless steel.',
    price: 1299, discountPrice: 999, category: 'Home & Kitchen', brand: 'CookWell',
    stock: 50, isFeatured: false, isActive: true,
    images: [img('Home & Kitchen', 'Electric Kettle')],
  },
  {
    name: 'Cotton Bed Sheet Set (Queen)',
    description: 'Soft, breathable 100% cotton bedsheet set with 2 pillow covers, machine washable.',
    price: 1699, discountPrice: 1299, category: 'Home & Kitchen', brand: 'HomeEssence',
    stock: 45, isFeatured: false, isActive: true,
    images: [img('Home & Kitchen', 'Bed Sheet Set')],
  },
  {
    name: 'Ceramic Coffee Mug Set of 4',
    description: 'Elegant ceramic mugs, microwave and dishwasher safe, ideal for daily use or gifting.',
    price: 799, discountPrice: 599, category: 'Home & Kitchen', brand: 'HomeEssence',
    stock: 60, isFeatured: false, isActive: true,
    images: [img('Home & Kitchen', 'Coffee Mug Set')],
  },
  {
    name: 'Wooden Cutting Board',
    description: 'Durable acacia wood cutting board with a juice groove and easy-grip handle.',
    price: 699, discountPrice: 0, category: 'Home & Kitchen', brand: 'CookWell',
    stock: 65, isFeatured: false, isActive: true,
    images: [img('Home & Kitchen', 'Cutting Board')],
  },
  {
    name: 'Air-Tight Kitchen Storage Containers Set',
    description: 'Set of 6 BPA-free airtight containers for storing grains, pulses, and snacks fresh for longer.',
    price: 1099, discountPrice: 849, category: 'Home & Kitchen', brand: 'HomeEssence',
    stock: 55, isFeatured: true, isActive: true,
    images: [img('Home & Kitchen', 'Storage Containers')],
  },

  // ---------------- Books ----------------
  {
    name: 'The Art of Clean Code (Programming Guide)',
    description: 'A practical guide to writing readable, maintainable code with real-world examples and refactoring tips.',
    price: 599, discountPrice: 449, category: 'Books', brand: 'TechPress',
    stock: 40, isFeatured: false, isActive: true,
    images: [img('Books', 'Clean Code Book')],
  },
  {
    name: 'Modern Indian History Handbook',
    description: 'A concise reference covering key events, movements, and figures in modern Indian history.',
    price: 449, discountPrice: 349, category: 'Books', brand: 'HeritagePublishers',
    stock: 50, isFeatured: false, isActive: true,
    images: [img('Books', 'History Handbook')],
  },
  {
    name: 'Personal Finance for Beginners',
    description: 'An accessible introduction to budgeting, saving, and investing basics for first-time earners.',
    price: 399, discountPrice: 299, category: 'Books', brand: 'WealthWise',
    stock: 60, isFeatured: true, isActive: true,
    images: [img('Books', 'Finance Book')],
  },
  {
    name: 'Mystery Thriller Novel: The Silent Witness',
    description: 'A gripping page-turner following a detective unraveling a decades-old disappearance.',
    price: 349, discountPrice: 0, category: 'Books', brand: 'InkHouse',
    stock: 45, isFeatured: false, isActive: true,
    images: [img('Books', 'Thriller Novel')],
  },
  {
    name: "Children's Illustrated Story Collection",
    description: 'A colorful collection of short bedtime stories with illustrations, suitable for ages 4-8.',
    price: 499, discountPrice: 399, category: 'Books', brand: 'LittleReaders',
    stock: 55, isFeatured: false, isActive: true,
    images: [img('Books', "Children's Story Book")],
  },
  {
    name: 'Mindfulness and Meditation Guide',
    description: 'A beginner-friendly guide to meditation techniques for stress relief and better focus.',
    price: 449, discountPrice: 349, category: 'Books', brand: 'CalmMind',
    stock: 35, isFeatured: false, isActive: true,
    images: [img('Books', 'Meditation Guide')],
  },

  // ---------------- Sports ----------------
  {
    name: 'Yoga Mat with Carry Strap',
    description: 'Extra-thick non-slip yoga mat made from eco-friendly TPE material, includes a carry strap.',
    price: 899, discountPrice: 699, category: 'Sports', brand: 'FlexFit',
    stock: 70, isFeatured: true, isActive: true,
    images: [img('Sports', 'Yoga Mat')],
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Pair of adjustable dumbbells (2-10kg each) for strength training at home.',
    price: 2999, discountPrice: 2499, category: 'Sports', brand: 'IronCore',
    stock: 25, isFeatured: false, isActive: true,
    images: [img('Sports', 'Dumbbell Set')],
  },
  {
    name: 'Football Size 5',
    description: 'Match-quality size 5 football with a durable synthetic leather cover for all-weather play.',
    price: 799, discountPrice: 649, category: 'Sports', brand: 'GoalPro',
    stock: 50, isFeatured: false, isActive: true,
    images: [img('Sports', 'Football')],
  },
  {
    name: 'Badminton Racket Set with Shuttlecocks',
    description: 'Pair of aluminum badminton rackets with 3 nylon shuttlecocks and a carry pouch.',
    price: 1199, discountPrice: 899, category: 'Sports', brand: 'GoalPro',
    stock: 40, isFeatured: false, isActive: true,
    images: [img('Sports', 'Badminton Set')],
  },
  {
    name: 'Skipping Rope with Counter',
    description: 'Adjustable-length skipping rope with a built-in digital counter for tracking workouts.',
    price: 399, discountPrice: 299, category: 'Sports', brand: 'FlexFit',
    stock: 90, isFeatured: false, isActive: true,
    images: [img('Sports', 'Skipping Rope')],
  },
  {
    name: 'Cricket Bat (Kashmir Willow)',
    description: 'Full-size Kashmir willow cricket bat, lightweight with a comfortable grip for club-level play.',
    price: 1499, discountPrice: 1199, category: 'Sports', brand: 'GoalPro',
    stock: 30, isFeatured: true, isActive: true,
    images: [img('Sports', 'Cricket Bat')],
  },

  // ---------------- Beauty ----------------
  {
    name: 'Herbal Face Wash for Glowing Skin',
    description: 'Gentle, soap-free face wash with neem and turmeric extracts, suitable for daily use.',
    price: 249, discountPrice: 199, category: 'Beauty', brand: 'PureGlow',
    stock: 100, isFeatured: false, isActive: true,
    images: [img('Beauty', 'Herbal Face Wash')],
  },
  {
    name: 'Matte Finish Lipstick Set',
    description: 'Set of 4 long-lasting matte lipsticks in versatile shades, enriched with vitamin E.',
    price: 899, discountPrice: 699, category: 'Beauty', brand: 'ColorPop',
    stock: 60, isFeatured: true, isActive: true,
    images: [img('Beauty', 'Lipstick Set')],
  },
  {
    name: 'Aloe Vera Moisturizing Body Lotion',
    description: 'Lightweight, non-greasy body lotion with 98% pure aloe vera for 24-hour hydration.',
    price: 349, discountPrice: 279, category: 'Beauty', brand: 'PureGlow',
    stock: 85, isFeatured: false, isActive: true,
    images: [img('Beauty', 'Body Lotion')],
  },
  {
    name: 'Professional Hair Dryer',
    description: '1800W hair dryer with multiple heat settings and a cool-shot button for salon-style finishing.',
    price: 1599, discountPrice: 1299, category: 'Beauty', brand: 'StyleTech',
    stock: 35, isFeatured: false, isActive: true,
    images: [img('Beauty', 'Hair Dryer')],
  },
  {
    name: 'Sunscreen SPF 50 Sunblock',
    description: 'Broad-spectrum SPF 50 sunscreen, lightweight and non-sticky, suitable for all skin types.',
    price: 449, discountPrice: 349, category: 'Beauty', brand: 'PureGlow',
    stock: 75, isFeatured: false, isActive: true,
    images: [img('Beauty', 'Sunscreen SPF50')],
  },
  {
    name: 'Charcoal Face Mask Pack',
    description: 'Deep-cleansing activated charcoal face mask that removes impurities and excess oil.',
    price: 399, discountPrice: 299, category: 'Beauty', brand: 'ColorPop',
    stock: 55, isFeatured: false, isActive: true,
    images: [img('Beauty', 'Charcoal Face Mask')],
  },

  // ---------------- Toys ----------------
  {
    name: 'Building Blocks Construction Set',
    description: '250-piece interlocking building block set that encourages creativity and motor skills, ages 3+.',
    price: 1299, discountPrice: 999, category: 'Toys', brand: 'PlayBuild',
    stock: 45, isFeatured: true, isActive: true,
    images: [img('Toys', 'Building Blocks')],
  },
  {
    name: 'Remote Control Racing Car',
    description: 'High-speed RC car with rechargeable battery and full-function remote, built for indoor and outdoor play.',
    price: 1799, discountPrice: 1499, category: 'Toys', brand: 'SpeedRacer',
    stock: 35, isFeatured: false, isActive: true,
    images: [img('Toys', 'RC Racing Car')],
  },
  {
    name: 'Educational Puzzle Set for Kids',
    description: 'Set of 5 wooden jigsaw puzzles with animal and alphabet themes, designed for early learning.',
    price: 599, discountPrice: 449, category: 'Toys', brand: 'PlayBuild',
    stock: 60, isFeatured: false, isActive: true,
    images: [img('Toys', 'Puzzle Set')],
  },
  {
    name: 'Plush Teddy Bear',
    description: 'Super-soft 24-inch teddy bear made with hypoallergenic filling, a comforting gift for all ages.',
    price: 699, discountPrice: 549, category: 'Toys', brand: 'CuddleCo',
    stock: 50, isFeatured: false, isActive: true,
    images: [img('Toys', 'Plush Teddy Bear')],
  },
  {
    name: "Kids' Art and Craft Kit",
    description: 'All-in-one craft kit with crayons, sketch pads, stickers, and clay for creative play.',
    price: 899, discountPrice: 699, category: 'Toys', brand: 'PlayBuild',
    stock: 40, isFeatured: false, isActive: true,
    images: [img('Toys', 'Art and Craft Kit')],
  },
  {
    name: 'Wooden Alphabet Learning Blocks',
    description: 'Set of 26 wooden blocks with letters and pictures to help toddlers learn the alphabet through play.',
    price: 549, discountPrice: 0, category: 'Toys', brand: 'PlayBuild',
    stock: 55, isFeatured: false, isActive: true,
    images: [img('Toys', 'Alphabet Blocks')],
  },

  // ---------------- Other ----------------
  {
    name: 'Reusable Grocery Shopping Bags Set',
    description: 'Set of 5 foldable, washable grocery bags with reinforced handles, eco-friendly alternative to plastic.',
    price: 349, discountPrice: 249, category: 'Other', brand: 'EcoCarry',
    stock: 80, isFeatured: false, isActive: true,
    images: [img('Other', 'Grocery Bags Set')],
  },
  {
    name: 'Car Dashboard Phone Mount',
    description: 'Adjustable 360-degree phone mount with a strong suction base, compatible with most smartphones.',
    price: 399, discountPrice: 299, category: 'Other', brand: 'DriveEasy',
    stock: 90, isFeatured: false, isActive: true,
    images: [img('Other', 'Phone Mount')],
  },
  {
    name: 'LED Desk Lamp with USB Charging',
    description: 'Adjustable LED desk lamp with 3 brightness levels and a built-in USB charging port.',
    price: 999, discountPrice: 799, category: 'Other', brand: 'BrightHome',
    stock: 50, isFeatured: true, isActive: true,
    images: [img('Other', 'LED Desk Lamp')],
  },
  {
    name: 'Travel Backpack 40L',
    description: 'Durable, water-resistant travel backpack with multiple compartments and a padded laptop sleeve.',
    price: 2199, discountPrice: 1799, category: 'Other', brand: 'WanderPack',
    stock: 40, isFeatured: false, isActive: true,
    images: [img('Other', 'Travel Backpack')],
  },
  {
    name: 'Multi-Purpose Tool Kit',
    description: '45-piece household tool kit with a carrying case, includes screwdrivers, pliers, and a hammer.',
    price: 1299, discountPrice: 999, category: 'Other', brand: 'FixRight',
    stock: 35, isFeatured: false, isActive: true,
    images: [img('Other', 'Tool Kit')],
  },
];

module.exports = productsData;