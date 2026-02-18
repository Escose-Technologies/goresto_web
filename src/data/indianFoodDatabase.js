// Indian Food Database — ~380 items covering all major Indian restaurant types
// Used for smart autocomplete suggestions in MenuItemForm

export const INDIAN_FOOD_CATEGORIES = [
  // North Indian
  'North Indian - Gravy',
  'North Indian - Dry',
  'Paneer Specials',
  'Dal & Lentils',
  // Breads
  'Breads',
  // Tandoori / Grill
  'Tandoori',
  'Kebabs & Tikka',
  // South Indian
  'South Indian - Dosa',
  'South Indian - Idli & Vada',
  'South Indian - Rice & Curry',
  'Kerala Specials',
  'Chettinad',
  // Biryani & Rice
  'Biryani',
  'Pulao & Fried Rice',
  // Street Food
  'Chaat & Street Food',
  // Indo-Chinese
  'Indo-Chinese - Starters',
  'Indo-Chinese - Main Course',
  'Indo-Chinese - Soup',
  // Rolls / QSR
  'Rolls & Wraps',
  'Momos',
  'Burgers & Sandwiches',
  // Thali
  'Thali & Combos',
  // Regional
  'Rajasthani',
  'Gujarati',
  'Bengali',
  'Maharashtrian',
  'Goan & Coastal',
  // Sweets & Desserts
  'Indian Sweets - Mithai',
  'Desserts',
  'Ice Cream & Kulfi',
  // Bakery
  'Bakery',
  // Beverages
  'Hot Beverages',
  'Cold Beverages',
  'Juices & Shakes',
  'Lassi & Chaas',
  // Breakfast
  'Indian Breakfast',
  // Accompaniments
  'Raita & Accompaniments',
  'Pickles & Chutneys',
  'Salads',
];

export const INDIAN_FOOD_DATABASE = [
  // ─── NORTH INDIAN - GRAVY (~25) ────────────────────────
  { name: 'Butter Chicken', aliases: ['Murgh Makhani'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Tender chicken in rich, creamy tomato-based gravy with butter and spices', labels: ['popular'] },
  { name: 'Chicken Tikka Masala', aliases: [], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Grilled chicken chunks in spiced creamy tomato sauce', labels: ['popular'] },
  { name: 'Kadai Chicken', aliases: ['Karahi Chicken'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Chicken cooked with bell peppers and freshly ground spices in a kadai', labels: [] },
  { name: 'Chicken Korma', aliases: ['Murgh Korma'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Chicken in mild, creamy cashew and yogurt-based gravy', labels: [] },
  { name: 'Chicken Do Pyaza', aliases: [], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Chicken cooked with generous amounts of onion in rich gravy', labels: [] },
  { name: 'Mutton Rogan Josh', aliases: ['Lamb Rogan Josh'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Slow-cooked mutton in aromatic Kashmiri red chili gravy', labels: ['popular'] },
  { name: 'Mutton Curry', aliases: ['Gosht Curry'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Classic home-style mutton curry with traditional spices', labels: [] },
  { name: 'Lamb Keema', aliases: ['Keema Masala'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Minced lamb cooked with onions, tomatoes and aromatic spices', labels: [] },
  { name: 'Fish Curry', aliases: ['Machli Ka Salan'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish'], description: 'Fish pieces simmered in tangy and spicy tomato-onion gravy', labels: [] },
  { name: 'Egg Curry', aliases: ['Anda Curry'], category: 'North Indian - Gravy', dietary: 'egg', spiceLevel: 2, allergens: ['eggs'], description: 'Boiled eggs in spiced onion-tomato gravy', labels: [] },
  { name: 'Prawn Masala', aliases: ['Jhinga Masala'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['shellfish'], description: 'Prawns cooked in rich masala gravy with coastal spices', labels: [] },
  { name: 'Chicken Saag', aliases: ['Murgh Palak'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 1, allergens: ['dairy'], description: 'Chicken cooked with spinach puree and mild spices', labels: [] },
  { name: 'Paneer Butter Masala', aliases: ['Paneer Makhani'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Soft paneer cubes in rich, creamy tomato-based butter gravy', labels: ['popular'] },
  { name: 'Palak Paneer', aliases: ['Saag Paneer'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Cottage cheese cubes in smooth, spiced spinach gravy', labels: ['popular'] },
  { name: 'Shahi Paneer', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Paneer in rich, creamy cashew and cream-based royal gravy', labels: [] },
  { name: 'Kadai Paneer', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Paneer with bell peppers in spiced kadai-style gravy', labels: [] },
  { name: 'Matar Paneer', aliases: ['Paneer Peas Curry'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Cottage cheese and green peas in mild tomato-onion gravy', labels: [] },
  { name: 'Malai Kofta', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Deep-fried paneer-potato dumplings in rich creamy gravy', labels: [] },
  { name: 'Dum Aloo', aliases: ['Kashmiri Dum Aloo'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Baby potatoes slow-cooked in spiced yogurt-based gravy', labels: [] },
  { name: 'Chole', aliases: ['Chana Masala', 'Chickpea Curry'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Spiced chickpea curry with tangy tomato-onion gravy', labels: ['popular'] },
  { name: 'Rajma', aliases: ['Rajma Masala', 'Kidney Bean Curry'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Red kidney beans in thick, spiced tomato-onion gravy', labels: ['popular'] },
  { name: 'Aloo Gobi', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Potato and cauliflower cooked with turmeric and cumin', labels: [] },
  { name: 'Navratan Korma', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Mixed vegetables and fruits in mild, creamy cashew gravy', labels: [] },
  { name: 'Mixed Veg Curry', aliases: ['Sabzi'], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Seasonal vegetables cooked in mildly spiced gravy', labels: [] },
  { name: 'Mushroom Masala', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Button mushrooms in rich onion-tomato masala gravy', labels: [] },
  { name: 'Methi Malai Murg', aliases: ['Fenugreek Chicken'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 1, allergens: ['dairy'], description: 'Chicken in creamy fenugreek and cashew gravy', labels: [] },
  { name: 'Bhindi Do Pyaza', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Okra cooked with double onions in mildly spiced gravy', labels: [] },
  { name: 'Paneer Tikka Masala', aliases: [], category: 'North Indian - Gravy', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Grilled paneer cubes in spiced tomato-cream masala', labels: [] },
  { name: 'Chicken Nihari', aliases: ['Nihari'], category: 'North Indian - Gravy', dietary: 'non-veg', spiceLevel: 2, allergens: ['gluten'], description: 'Slow-cooked meat stew with aromatic spices, Mughlai style', labels: [] },

  // ─── NORTH INDIAN - DRY (~15) ──────────────────────────
  { name: 'Aloo Jeera', aliases: ['Jeera Aloo'], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Potatoes tempered with cumin seeds and mild spices', labels: [] },
  { name: 'Bhindi Masala', aliases: ['Okra Fry'], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy okra stir-fried with onions and spices', labels: [] },
  { name: 'Baingan Bharta', aliases: ['Roasted Eggplant'], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Smoky roasted eggplant mashed with onions, tomatoes and spices', labels: [] },
  { name: 'Aloo Matar', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Potatoes and green peas in dry spiced preparation', labels: [] },
  { name: 'Gobhi Manchurian Dry', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 2, allergens: ['soy'], description: 'Crispy cauliflower tossed in spicy Manchurian sauce', labels: [] },
  { name: 'Jeera Rice', aliases: ['Cumin Rice'], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fragrant basmati rice tempered with cumin seeds', labels: [] },
  { name: 'Tawa Vegetables', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Mixed vegetables cooked on flat iron griddle with spices', labels: [] },
  { name: 'Dry Chicken', aliases: ['Chicken Sukka'], category: 'North Indian - Dry', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Spicy dry chicken preparation with roasted spices', labels: [] },
  { name: 'Chicken Fry', aliases: ['Tawa Chicken'], category: 'North Indian - Dry', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Pan-fried chicken pieces with onions and spices', labels: [] },
  { name: 'Egg Bhurji', aliases: ['Scrambled Eggs Indian'], category: 'North Indian - Dry', dietary: 'egg', spiceLevel: 1, allergens: ['eggs'], description: 'Indian-style spiced scrambled eggs with onions and green chili', labels: [] },
  { name: 'Gobi 65', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Deep-fried spicy cauliflower bites with curry leaves', labels: [] },
  { name: 'Baby Corn Pepper Fry', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Baby corn tossed with black pepper and spices', labels: [] },
  { name: 'Mushroom Pepper Fry', aliases: [], category: 'North Indian - Dry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Mushrooms stir-fried with black pepper and onions', labels: [] },

  // ─── PANEER SPECIALS (~15) ─────────────────────────────
  { name: 'Paneer Tikka', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Marinated paneer cubes grilled in tandoor with bell peppers', labels: ['popular'] },
  { name: 'Paneer Bhurji', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Crumbled paneer cooked with onions, tomatoes and spices', labels: [] },
  { name: 'Paneer Do Pyaza', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Paneer cubes with double onions in spiced gravy', labels: [] },
  { name: 'Paneer Lababdar', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Paneer in smooth, rich tomato-cream gravy with cashews', labels: [] },
  { name: 'Paneer Kolhapuri', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 3, allergens: ['dairy'], description: 'Paneer in fiery Kolhapuri-style coconut-based masala', labels: ['spicy'] },
  { name: 'Chilli Paneer', aliases: ['Chili Paneer'], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy', 'soy'], description: 'Crispy paneer tossed with peppers in Indo-Chinese chilli sauce', labels: ['popular'] },
  { name: 'Paneer 65', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Deep-fried spicy paneer bites with curry leaves and chili', labels: [] },
  { name: 'Achari Paneer', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Paneer in tangy pickle-spiced gravy', labels: [] },
  { name: 'Paneer Pasanda', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Stuffed paneer slices in rich, mild cashew-cream gravy', labels: [] },
  { name: 'Paneer Khurchan', aliases: [], category: 'Paneer Specials', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Shredded paneer cooked with tomatoes and spices on tawa', labels: [] },

  // ─── DAL & LENTILS (~10) ───────────────────────────────
  { name: 'Dal Tadka', aliases: ['Tadka Dal'], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Yellow lentils tempered with cumin, garlic and ghee', labels: ['popular'] },
  { name: 'Dal Makhani', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Slow-cooked black lentils in rich, creamy butter gravy', labels: ['popular'] },
  { name: 'Dal Fry', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Mixed lentils fried with onions, tomatoes and spices', labels: [] },
  { name: 'Chana Dal', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Split chickpea lentils cooked with cumin and mild spices', labels: [] },
  { name: 'Moong Dal', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Light yellow moong lentil soup with mild tempering', labels: [] },
  { name: 'Sambar', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'South Indian lentil stew with vegetables and tamarind', labels: ['popular'] },
  { name: 'Rasam', aliases: [], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Tangy South Indian pepper-tamarind soup', labels: [] },
  { name: 'Dal Palak', aliases: ['Spinach Dal'], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Lentils cooked with spinach and mild spices', labels: [] },
  { name: 'Panchmel Dal', aliases: ['Panchratna Dal'], category: 'Dal & Lentils', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Five mixed lentils cooked Rajasthani style with ghee', labels: [] },

  // ─── BREADS (~20) ──────────────────────────────────────
  { name: 'Butter Naan', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Soft leavened bread baked in tandoor with butter', labels: ['popular'] },
  { name: 'Garlic Naan', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Naan topped with garlic and butter from the tandoor', labels: ['popular'] },
  { name: 'Plain Naan', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Classic tandoor-baked leavened flatbread', labels: [] },
  { name: 'Cheese Naan', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Naan stuffed with melted cheese', labels: [] },
  { name: 'Peshawari Naan', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten', 'nuts'], description: 'Sweet naan stuffed with dried fruits and nuts', labels: [] },
  { name: 'Tandoori Roti', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Whole wheat flatbread baked in tandoor', labels: [] },
  { name: 'Roomali Roti', aliases: ['Rumali Roti'], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Thin, soft handkerchief-style bread', labels: [] },
  { name: 'Paratha', aliases: ['Plain Paratha'], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Layered whole wheat flatbread cooked with ghee', labels: [] },
  { name: 'Aloo Paratha', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Whole wheat bread stuffed with spiced potato filling', labels: ['popular'] },
  { name: 'Gobi Paratha', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Paratha stuffed with spiced cauliflower filling', labels: [] },
  { name: 'Paneer Paratha', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Paratha stuffed with spiced cottage cheese filling', labels: [] },
  { name: 'Methi Paratha', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Paratha made with fresh fenugreek leaves', labels: [] },
  { name: 'Lachha Paratha', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Multi-layered, flaky flatbread cooked with butter', labels: [] },
  { name: 'Missi Roti', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Gram flour flatbread with spices and herbs', labels: [] },
  { name: 'Kulcha', aliases: ['Amritsari Kulcha'], category: 'Breads', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Soft leavened bread stuffed with spiced filling', labels: [] },
  { name: 'Puri', aliases: ['Poori'], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Deep-fried puffed whole wheat bread', labels: [] },
  { name: 'Bhatura', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Deep-fried leavened bread, served with chole', labels: [] },
  { name: 'Chapati', aliases: ['Roti'], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Thin whole wheat unleavened flatbread', labels: [] },
  { name: 'Basket Roti', aliases: [], category: 'Breads', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Assorted bread basket with naan, roti and paratha', labels: [] },

  // ─── TANDOORI (~12) ────────────────────────────────────
  { name: 'Tandoori Chicken', aliases: ['Full Tandoori', 'Half Tandoori'], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Whole chicken marinated in yogurt and spices, roasted in tandoor', labels: ['popular'] },
  { name: 'Chicken Tikka', aliases: [], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Boneless chicken pieces marinated and grilled in tandoor', labels: ['popular'] },
  { name: 'Malai Chicken Tikka', aliases: ['Cream Chicken Tikka'], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 0, allergens: ['dairy'], description: 'Chicken tikka in mild cream and cheese marinade', labels: [] },
  { name: 'Fish Tikka', aliases: ['Tandoori Fish'], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish', 'dairy'], description: 'Fish fillets marinated in spices and grilled in tandoor', labels: [] },
  { name: 'Tandoori Prawns', aliases: [], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 2, allergens: ['shellfish', 'dairy'], description: 'Jumbo prawns marinated in tandoori spices and grilled', labels: [] },
  { name: 'Tandoori Mushroom', aliases: [], category: 'Tandoori', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Mushrooms marinated in tandoori masala and grilled', labels: [] },
  { name: 'Tandoori Paneer Tikka', aliases: [], category: 'Tandoori', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Paneer and vegetables marinated and grilled in tandoor', labels: [] },
  { name: 'Tandoori Platter', aliases: ['Mixed Grill'], category: 'Tandoori', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Assortment of tandoori chicken, seekh kebab and tikka', labels: [] },
  { name: 'Tandoori Soya Chaap', aliases: [], category: 'Tandoori', dietary: 'veg', spiceLevel: 2, allergens: ['soy', 'dairy'], description: 'Soya chaap marinated in tandoori spices and grilled', labels: [] },

  // ─── KEBABS & TIKKA (~12) ──────────────────────────────
  { name: 'Seekh Kebab', aliases: ['Mutton Seekh'], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Minced meat skewered and grilled in tandoor with spices', labels: ['popular'] },
  { name: 'Chicken Seekh Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Minced chicken skewered with herbs and grilled', labels: [] },
  { name: 'Galouti Kebab', aliases: ['Galawati Kebab'], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 1, allergens: [], description: 'Melt-in-mouth Lucknowi minced meat patties with royal spices', labels: [] },
  { name: 'Shammi Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 1, allergens: [], description: 'Minced meat and chana dal patties with aromatic spices', labels: [] },
  { name: 'Reshmi Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 1, allergens: ['dairy'], description: 'Soft, creamy chicken kebabs with mild marinade', labels: [] },
  { name: 'Chicken 65', aliases: [], category: 'Kebabs & Tikka', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Spicy deep-fried chicken bites with curry leaves', labels: ['popular'] },
  { name: 'Hara Bhara Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Green vegetable patties made with spinach, peas and potato', labels: ['popular'] },
  { name: 'Dahi Ke Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Soft hung curd and paneer kebabs with mild seasoning', labels: [] },
  { name: 'Veg Seekh Kebab', aliases: [], category: 'Kebabs & Tikka', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Vegetable and paneer mince shaped on skewers and grilled', labels: [] },
  { name: 'Soya Chaap Tikka', aliases: [], category: 'Kebabs & Tikka', dietary: 'veg', spiceLevel: 2, allergens: ['soy', 'dairy'], description: 'Marinated soya chaap pieces grilled with spices', labels: [] },

  // ─── SOUTH INDIAN - DOSA (~12) ─────────────────────────
  { name: 'Masala Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy rice-lentil crepe filled with spiced potato filling', labels: ['popular'] },
  { name: 'Plain Dosa', aliases: ['Sada Dosa'], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Thin, crispy rice and lentil crepe', labels: [] },
  { name: 'Mysore Masala Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Dosa with red chutney spread and potato masala filling', labels: [] },
  { name: 'Rava Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Crispy semolina crepe with onions and cashews', labels: [] },
  { name: 'Onion Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Dosa topped with finely chopped onions', labels: [] },
  { name: 'Paper Dosa', aliases: ['Paper Roast'], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Extra thin and crispy oversized dosa', labels: [] },
  { name: 'Ghee Roast Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Crispy dosa roasted with generous ghee', labels: [] },
  { name: 'Set Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Soft, spongy small dosas served in a set of three', labels: [] },
  { name: 'Cheese Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Dosa filled with melted cheese', labels: [] },
  { name: 'Paneer Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Dosa stuffed with spiced crumbled paneer', labels: [] },
  { name: 'Egg Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'egg', spiceLevel: 1, allergens: ['eggs'], description: 'Dosa topped with a thin layer of egg', labels: [] },
  { name: 'Chicken Dosa', aliases: [], category: 'South Indian - Dosa', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Dosa filled with spiced chicken keema', labels: [] },

  // ─── SOUTH INDIAN - IDLI & VADA (~10) ──────────────────
  { name: 'Idli', aliases: ['Plain Idli'], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Steamed rice and lentil cakes served with chutney and sambar', labels: ['popular'] },
  { name: 'Medu Vada', aliases: ['Vada'], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy deep-fried lentil fritters served with chutney and sambar', labels: ['popular'] },
  { name: 'Idli Vada Combo', aliases: [], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Combination plate of idli and medu vada with sambar and chutney', labels: [] },
  { name: 'Rava Idli', aliases: [], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Semolina idli with cashews and mustard seeds', labels: [] },
  { name: 'Mini Idli', aliases: ['Button Idli'], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Bite-sized idlis tossed in spiced tempering', labels: [] },
  { name: 'Dahi Vada', aliases: ['Dahi Bhalla'], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Soft lentil fritters soaked in sweetened yogurt with chutneys', labels: [] },
  { name: 'Sambar Vada', aliases: [], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Medu vada dipped in hot sambar', labels: [] },
  { name: 'Uttapam', aliases: ['Onion Uttapam'], category: 'South Indian - Idli & Vada', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Thick rice pancake topped with onions and vegetables', labels: [] },

  // ─── SOUTH INDIAN - RICE & CURRY (~10) ─────────────────
  { name: 'Lemon Rice', aliases: ['Chitranna'], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 1, allergens: ['nuts'], description: 'Tangy rice tempered with mustard seeds, curry leaves and turmeric', labels: [] },
  { name: 'Curd Rice', aliases: ['Thayir Sadam'], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Comforting yogurt rice tempered with mustard and curry leaves', labels: [] },
  { name: 'Tamarind Rice', aliases: ['Puliyodarai'], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 2, allergens: ['nuts'], description: 'Rice mixed with tangy tamarind paste and spiced seasoning', labels: [] },
  { name: 'Bisi Bele Bath', aliases: [], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 2, allergens: ['nuts'], description: 'Karnataka-style spiced rice with lentils and vegetables', labels: [] },
  { name: 'Tomato Rice', aliases: [], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Rice cooked with tomato paste and mild spices', labels: [] },
  { name: 'Coconut Rice', aliases: [], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Rice tossed with grated coconut and mild tempering', labels: [] },
  { name: 'Avial', aliases: [], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 1, allergens: ['nuts'], description: 'Mixed vegetables in coconut and yogurt-based curry', labels: [] },
  { name: 'Kootu Curry', aliases: [], category: 'South Indian - Rice & Curry', dietary: 'veg', spiceLevel: 1, allergens: ['nuts'], description: 'Vegetables and lentils in coconut gravy', labels: [] },

  // ─── KERALA SPECIALS (~8) ──────────────────────────────
  { name: 'Kerala Fish Curry', aliases: ['Meen Curry'], category: 'Kerala Specials', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish'], description: 'Fish in tangy coconut and kokum-based Kerala curry', labels: ['popular'] },
  { name: 'Kerala Chicken Curry', aliases: ['Nadan Chicken'], category: 'Kerala Specials', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Chicken in spiced coconut-based Kerala curry', labels: [] },
  { name: 'Appam', aliases: [], category: 'Kerala Specials', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Lacy, bowl-shaped rice pancake with soft center', labels: [] },
  { name: 'Puttu', aliases: [], category: 'Kerala Specials', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Steamed rice flour and coconut cylinders', labels: [] },
  { name: 'Kerala Parotta', aliases: ['Malabar Parotta'], category: 'Kerala Specials', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Flaky, layered flatbread from Kerala', labels: ['popular'] },
  { name: 'Egg Roast', aliases: ['Kerala Egg Roast'], category: 'Kerala Specials', dietary: 'egg', spiceLevel: 2, allergens: ['eggs'], description: 'Boiled eggs in spicy Kerala-style onion-tomato masala', labels: [] },
  { name: 'Prawn Moilee', aliases: ['Meen Moilee'], category: 'Kerala Specials', dietary: 'non-veg', spiceLevel: 1, allergens: ['shellfish'], description: 'Prawns in mild, creamy coconut milk curry', labels: [] },
  { name: 'Kadala Curry', aliases: [], category: 'Kerala Specials', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Black chickpea curry in roasted coconut gravy', labels: [] },

  // ─── CHETTINAD (~5) ────────────────────────────────────
  { name: 'Chettinad Chicken', aliases: [], category: 'Chettinad', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Fiery chicken curry with freshly ground Chettinad spices', labels: ['popular', 'spicy'] },
  { name: 'Chettinad Fish Fry', aliases: [], category: 'Chettinad', dietary: 'non-veg', spiceLevel: 3, allergens: ['fish'], description: 'Fish marinated in Chettinad masala and pan-fried', labels: ['spicy'] },
  { name: 'Chettinad Egg Curry', aliases: [], category: 'Chettinad', dietary: 'egg', spiceLevel: 3, allergens: ['eggs'], description: 'Eggs in aromatic Chettinad pepper and spice gravy', labels: ['spicy'] },
  { name: 'Chettinad Mushroom', aliases: [], category: 'Chettinad', dietary: 'veg', spiceLevel: 3, allergens: [], description: 'Mushrooms in fiery Chettinad-style dry masala', labels: ['spicy'] },
  { name: 'Chettinad Paneer', aliases: [], category: 'Chettinad', dietary: 'veg', spiceLevel: 3, allergens: ['dairy'], description: 'Paneer in bold Chettinad pepper-coconut masala', labels: ['spicy'] },

  // ─── BIRYANI (~15) ─────────────────────────────────────
  { name: 'Chicken Biryani', aliases: ['Murgh Biryani'], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Fragrant basmati rice layered with spiced chicken and saffron', labels: ['popular'] },
  { name: 'Mutton Biryani', aliases: ['Gosht Biryani'], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Aromatic rice layered with slow-cooked mutton and spices', labels: ['popular'] },
  { name: 'Hyderabadi Biryani', aliases: ['Hyderabadi Dum Biryani'], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Traditional dum-cooked Hyderabadi-style layered biryani', labels: ['popular'] },
  { name: 'Lucknowi Biryani', aliases: ['Awadhi Biryani'], category: 'Biryani', dietary: 'non-veg', spiceLevel: 1, allergens: ['dairy', 'nuts'], description: 'Mild, fragrant Lucknowi-style biryani with whole spices', labels: [] },
  { name: 'Egg Biryani', aliases: ['Anda Biryani'], category: 'Biryani', dietary: 'egg', spiceLevel: 2, allergens: ['eggs', 'dairy'], description: 'Spiced basmati rice with boiled eggs and aromatic masala', labels: [] },
  { name: 'Prawn Biryani', aliases: ['Jhinga Biryani'], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['shellfish', 'dairy'], description: 'Fragrant biryani layered with spiced prawns', labels: [] },
  { name: 'Fish Biryani', aliases: [], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish', 'dairy'], description: 'Aromatic rice cooked with fish and biryani spices', labels: [] },
  { name: 'Veg Biryani', aliases: ['Vegetable Biryani'], category: 'Biryani', dietary: 'veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Fragrant basmati rice with mixed vegetables, saffron and spices', labels: ['popular'] },
  { name: 'Paneer Biryani', aliases: [], category: 'Biryani', dietary: 'veg', spiceLevel: 2, allergens: ['dairy', 'nuts'], description: 'Layered biryani with marinated paneer and aromatic spices', labels: [] },
  { name: 'Mushroom Biryani', aliases: [], category: 'Biryani', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Biryani with mushrooms and fragrant whole spices', labels: [] },
  { name: 'Keema Biryani', aliases: [], category: 'Biryani', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy'], description: 'Biryani made with spiced minced meat', labels: [] },

  // ─── PULAO & FRIED RICE (~8) ───────────────────────────
  { name: 'Veg Pulao', aliases: ['Vegetable Pulao'], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Mildly spiced basmati rice cooked with mixed vegetables', labels: [] },
  { name: 'Peas Pulao', aliases: ['Matar Pulao'], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Basmati rice cooked with green peas and whole spices', labels: [] },
  { name: 'Kashmiri Pulao', aliases: [], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 0, allergens: ['nuts', 'dairy'], description: 'Sweet and mild rice with dry fruits, saffron and nuts', labels: [] },
  { name: 'Chicken Fried Rice', aliases: [], category: 'Pulao & Fried Rice', dietary: 'non-veg', spiceLevel: 1, allergens: ['soy'], description: 'Indo-Chinese style fried rice with chicken and vegetables', labels: [] },
  { name: 'Egg Fried Rice', aliases: [], category: 'Pulao & Fried Rice', dietary: 'egg', spiceLevel: 1, allergens: ['eggs', 'soy'], description: 'Fried rice tossed with scrambled eggs and vegetables', labels: [] },
  { name: 'Veg Fried Rice', aliases: [], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 1, allergens: ['soy'], description: 'Indo-Chinese style fried rice with mixed vegetables', labels: [] },
  { name: 'Schezwan Fried Rice', aliases: ['Szechuan Fried Rice'], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 3, allergens: ['soy'], description: 'Spicy fried rice with Schezwan sauce and vegetables', labels: [] },
  { name: 'Steamed Rice', aliases: ['Plain Rice'], category: 'Pulao & Fried Rice', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Plain steamed basmati rice', labels: [] },

  // ─── CHAAT & STREET FOOD (~20) ─────────────────────────
  { name: 'Pani Puri', aliases: ['Golgappa', 'Puchka'], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 2, allergens: ['gluten'], description: 'Crispy puffed shells filled with spiced water, potato and chickpeas', labels: ['popular'] },
  { name: 'Sev Puri', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Flat puris topped with potato, chutneys and crispy sev', labels: [] },
  { name: 'Bhel Puri', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Puffed rice mixed with chutneys, onions and crispy sev', labels: ['popular'] },
  { name: 'Dahi Puri', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Crispy puris filled with curd, chutneys and sev', labels: [] },
  { name: 'Ragda Pattice', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Potato patties topped with spiced white pea curry', labels: [] },
  { name: 'Aloo Tikki', aliases: ['Aloo Tikki Chaat'], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy potato patties with chutneys and yogurt', labels: ['popular'] },
  { name: 'Papdi Chaat', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Crispy flour wafers topped with yogurt, chutneys and spices', labels: [] },
  { name: 'Samosa', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Crispy triangular pastry filled with spiced potato and peas', labels: ['popular'] },
  { name: 'Chicken Samosa', aliases: [], category: 'Chaat & Street Food', dietary: 'non-veg', spiceLevel: 2, allergens: ['gluten'], description: 'Samosa filled with spiced minced chicken', labels: [] },
  { name: 'Kachori', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Deep-fried flaky pastry filled with spiced moong dal', labels: [] },
  { name: 'Pav Bhaji', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 2, allergens: ['gluten', 'dairy'], description: 'Spiced mashed vegetable curry served with buttered buns', labels: ['popular'] },
  { name: 'Vada Pav', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 2, allergens: ['gluten'], description: 'Spiced potato fritter in a bun with garlic chutney', labels: ['popular'] },
  { name: 'Dabeli', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'nuts'], description: 'Sweet and spicy potato filling in a bun with pomegranate', labels: [] },
  { name: 'Chole Bhature', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 2, allergens: ['gluten'], description: 'Spiced chickpea curry with deep-fried leavened bread', labels: ['popular'] },
  { name: 'Aloo Chaat', aliases: [], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy fried potato cubes with tangy spices and chutneys', labels: [] },
  { name: 'Spring Roll', aliases: ['Veg Spring Roll'], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Crispy rolls stuffed with mixed vegetable filling', labels: [] },
  { name: 'Pakora', aliases: ['Pakoda', 'Bhajiya'], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Assorted vegetable fritters in spiced gram flour batter', labels: [] },
  { name: 'Onion Bhaji', aliases: ['Pyaz Pakora'], category: 'Chaat & Street Food', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Crispy onion fritters in seasoned gram flour batter', labels: [] },

  // ─── INDO-CHINESE - STARTERS (~12) ────────────────────
  { name: 'Veg Manchurian', aliases: ['Manchurian Balls'], category: 'Indo-Chinese - Starters', dietary: 'veg', spiceLevel: 2, allergens: ['soy', 'gluten'], description: 'Deep-fried vegetable balls in spicy Manchurian sauce', labels: ['popular'] },
  { name: 'Chicken Manchurian', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'non-veg', spiceLevel: 2, allergens: ['soy', 'gluten'], description: 'Chicken pieces tossed in Indo-Chinese Manchurian sauce', labels: [] },
  { name: 'Chilli Chicken', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'non-veg', spiceLevel: 2, allergens: ['soy'], description: 'Crispy chicken tossed with peppers in chilli sauce', labels: ['popular'] },
  { name: 'Dragon Chicken', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'non-veg', spiceLevel: 3, allergens: ['soy'], description: 'Spicy crispy chicken in fiery dragon sauce', labels: [] },
  { name: 'Honey Chilli Potato', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'veg', spiceLevel: 1, allergens: ['soy'], description: 'Crispy potato fingers glazed in sweet and spicy honey sauce', labels: ['popular'] },
  { name: 'Crispy Corn', aliases: ['Salt and Pepper Corn'], category: 'Indo-Chinese - Starters', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy fried corn kernels with salt and pepper seasoning', labels: [] },
  { name: 'Chilli Mushroom', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'veg', spiceLevel: 2, allergens: ['soy'], description: 'Mushrooms tossed in spicy Indo-Chinese chilli sauce', labels: [] },
  { name: 'Chilli Fish', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish', 'soy'], description: 'Fish pieces tossed in spicy chilli sauce', labels: [] },
  { name: 'Prawn Salt and Pepper', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'non-veg', spiceLevel: 1, allergens: ['shellfish'], description: 'Crispy prawns with salt, pepper and green chili', labels: [] },
  { name: 'Baby Corn Manchurian', aliases: [], category: 'Indo-Chinese - Starters', dietary: 'veg', spiceLevel: 2, allergens: ['soy'], description: 'Crispy baby corn in tangy Manchurian sauce', labels: [] },

  // ─── INDO-CHINESE - MAIN COURSE (~8) ──────────────────
  { name: 'Veg Hakka Noodles', aliases: ['Veg Noodles'], category: 'Indo-Chinese - Main Course', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'soy'], description: 'Stir-fried noodles with vegetables in Indo-Chinese style', labels: ['popular'] },
  { name: 'Chicken Hakka Noodles', aliases: ['Chicken Noodles'], category: 'Indo-Chinese - Main Course', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten', 'soy'], description: 'Stir-fried noodles with chicken and vegetables', labels: [] },
  { name: 'Egg Noodles', aliases: [], category: 'Indo-Chinese - Main Course', dietary: 'egg', spiceLevel: 1, allergens: ['gluten', 'soy', 'eggs'], description: 'Stir-fried noodles with egg and vegetables', labels: [] },
  { name: 'Schezwan Noodles', aliases: ['Szechuan Noodles'], category: 'Indo-Chinese - Main Course', dietary: 'veg', spiceLevel: 3, allergens: ['gluten', 'soy'], description: 'Spicy noodles tossed in fiery Schezwan sauce', labels: [] },
  { name: 'Chow Mein', aliases: [], category: 'Indo-Chinese - Main Course', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'soy'], description: 'Crispy stir-fried noodles with vegetables', labels: [] },
  { name: 'Manchow Soup with Noodles', aliases: [], category: 'Indo-Chinese - Main Course', dietary: 'veg', spiceLevel: 2, allergens: ['gluten', 'soy'], description: 'Thick spicy soup with crispy noodles', labels: [] },

  // ─── INDO-CHINESE - SOUP (~6) ─────────────────────────
  { name: 'Hot and Sour Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'veg', spiceLevel: 2, allergens: ['soy'], description: 'Tangy and spicy Indo-Chinese soup with vegetables', labels: ['popular'] },
  { name: 'Manchow Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'veg', spiceLevel: 2, allergens: ['soy', 'gluten'], description: 'Thick Indo-Chinese soup topped with crispy noodles', labels: [] },
  { name: 'Sweet Corn Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Creamy sweet corn soup with mild seasoning', labels: [] },
  { name: 'Tomato Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Classic tangy tomato soup with herbs', labels: [] },
  { name: 'Chicken Hot and Sour Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'non-veg', spiceLevel: 2, allergens: ['soy'], description: 'Spicy and tangy soup with shredded chicken', labels: [] },
  { name: 'Chicken Sweet Corn Soup', aliases: [], category: 'Indo-Chinese - Soup', dietary: 'non-veg', spiceLevel: 0, allergens: [], description: 'Creamy sweet corn soup with chicken shreds', labels: [] },

  // ─── ROLLS & WRAPS (~8) ───────────────────────────────
  { name: 'Chicken Kathi Roll', aliases: ['Chicken Frankie'], category: 'Rolls & Wraps', dietary: 'non-veg', spiceLevel: 2, allergens: ['gluten'], description: 'Paratha wrap filled with spiced chicken tikka and onions', labels: ['popular'] },
  { name: 'Egg Roll', aliases: ['Egg Kathi Roll'], category: 'Rolls & Wraps', dietary: 'egg', spiceLevel: 1, allergens: ['gluten', 'eggs'], description: 'Egg paratha wrap with onions and chutney', labels: [] },
  { name: 'Paneer Kathi Roll', aliases: ['Paneer Roll'], category: 'Rolls & Wraps', dietary: 'veg', spiceLevel: 2, allergens: ['gluten', 'dairy'], description: 'Paratha wrap with spiced paneer tikka filling', labels: [] },
  { name: 'Mutton Kathi Roll', aliases: [], category: 'Rolls & Wraps', dietary: 'non-veg', spiceLevel: 2, allergens: ['gluten'], description: 'Paratha roll filled with spiced mutton seekh', labels: [] },
  { name: 'Veg Frankie', aliases: ['Veg Roll'], category: 'Rolls & Wraps', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Wrap filled with spiced mixed vegetables', labels: [] },
  { name: 'Chicken Shawarma', aliases: [], category: 'Rolls & Wraps', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Middle Eastern-style chicken wrap with garlic sauce', labels: ['popular'] },
  { name: 'Paneer Shawarma', aliases: [], category: 'Rolls & Wraps', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Paneer wrap with garlic sauce and pickled vegetables', labels: [] },

  // ─── MOMOS (~8) ────────────────────────────────────────
  { name: 'Veg Momos', aliases: ['Steamed Veg Momos'], category: 'Momos', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Steamed dumplings with mixed vegetable filling', labels: ['popular'] },
  { name: 'Chicken Momos', aliases: ['Steamed Chicken Momos'], category: 'Momos', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten'], description: 'Steamed dumplings with spiced chicken filling', labels: ['popular'] },
  { name: 'Paneer Momos', aliases: [], category: 'Momos', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Steamed dumplings with paneer and vegetable filling', labels: [] },
  { name: 'Fried Momos', aliases: ['Crispy Momos'], category: 'Momos', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Deep-fried crispy dumplings with spicy dipping sauce', labels: [] },
  { name: 'Tandoori Momos', aliases: [], category: 'Momos', dietary: 'veg', spiceLevel: 2, allergens: ['gluten', 'dairy'], description: 'Pan-fried momos in tandoori masala coating', labels: [] },
  { name: 'Kurkure Momos', aliases: ['Crispy Fried Momos'], category: 'Momos', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Extra crispy coated momos with spicy chutney', labels: [] },
  { name: 'Jhol Momos', aliases: [], category: 'Momos', dietary: 'veg', spiceLevel: 2, allergens: ['gluten'], description: 'Momos in spicy sesame-tomato soup broth', labels: [] },

  // ─── BURGERS & SANDWICHES (~6) ─────────────────────────
  { name: 'Chicken Momos Fried', aliases: ['Fried Chicken Momos'], category: 'Momos', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten'], description: 'Deep-fried chicken dumplings with spicy dipping sauce', labels: [] },

  // ─── BURGERS & SANDWICHES (~6) ─────────────────────────
  { name: 'Veg Burger', aliases: [], category: 'Burgers & Sandwiches', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Vegetable patty burger with lettuce and sauces', labels: [] },
  { name: 'Chicken Burger', aliases: [], category: 'Burgers & Sandwiches', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten'], description: 'Crispy chicken patty burger with mayo and lettuce', labels: [] },
  { name: 'Paneer Tikka Sandwich', aliases: [], category: 'Burgers & Sandwiches', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Grilled sandwich with spiced paneer tikka filling', labels: [] },
  { name: 'Veg Club Sandwich', aliases: [], category: 'Burgers & Sandwiches', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Triple-decker sandwich with vegetables and cheese', labels: [] },
  { name: 'Chicken Club Sandwich', aliases: [], category: 'Burgers & Sandwiches', dietary: 'non-veg', spiceLevel: 0, allergens: ['gluten'], description: 'Triple-decker sandwich with grilled chicken and veggies', labels: [] },

  // ─── THALI & COMBOS (~8) ──────────────────────────────
  { name: 'Veg Thali', aliases: [], category: 'Thali & Combos', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'gluten'], description: 'Complete vegetarian meal with dal, sabzi, roti, rice and accompaniments', labels: ['popular'] },
  { name: 'Non-Veg Thali', aliases: [], category: 'Thali & Combos', dietary: 'non-veg', spiceLevel: 2, allergens: ['dairy', 'gluten'], description: 'Complete meal with chicken curry, dal, roti, rice and sides', labels: ['popular'] },
  { name: 'Rajasthani Thali', aliases: [], category: 'Thali & Combos', dietary: 'veg', spiceLevel: 2, allergens: ['dairy', 'gluten'], description: 'Traditional Rajasthani meal with dal baati, gatte, churma and more', labels: [] },
  { name: 'Gujarati Thali', aliases: [], category: 'Thali & Combos', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Sweet and savory Gujarati meal with multiple courses', labels: [] },
  { name: 'South Indian Thali', aliases: ['Meals'], category: 'Thali & Combos', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'South Indian meal with rice, sambar, rasam, curd and sides', labels: [] },
  { name: 'Mini Meals', aliases: ['Lunch Combo'], category: 'Thali & Combos', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Compact meal with roti, dal, sabzi and rice', labels: [] },

  // ─── RAJASTHANI (~5) ───────────────────────────────────
  { name: 'Dal Baati Churma', aliases: [], category: 'Rajasthani', dietary: 'veg', spiceLevel: 1, allergens: ['dairy', 'gluten'], description: 'Baked wheat balls with dal and sweet churma', labels: ['popular'] },
  { name: 'Gatte Ki Sabzi', aliases: [], category: 'Rajasthani', dietary: 'veg', spiceLevel: 2, allergens: ['dairy'], description: 'Gram flour dumplings in spiced yogurt gravy', labels: [] },
  { name: 'Ker Sangri', aliases: [], category: 'Rajasthani', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Desert beans and berries cooked with Rajasthani spices', labels: [] },
  { name: 'Laal Maas', aliases: ['Rajasthani Red Meat Curry'], category: 'Rajasthani', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Fiery Rajasthani mutton curry with red chilies', labels: ['spicy'] },
  { name: 'Pyaaz Kachori', aliases: [], category: 'Rajasthani', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Flaky deep-fried pastry filled with spiced onion', labels: [] },

  // ─── GUJARATI (~5) ────────────────────────────────────
  { name: 'Dhokla', aliases: ['Khaman Dhokla'], category: 'Gujarati', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Steamed savory gram flour cake with mustard tempering', labels: ['popular'] },
  { name: 'Khandvi', aliases: [], category: 'Gujarati', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Thin gram flour rolls with coconut and mustard tempering', labels: [] },
  { name: 'Thepla', aliases: [], category: 'Gujarati', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Gujarati spiced flatbread with fenugreek leaves', labels: [] },
  { name: 'Undhiyu', aliases: [], category: 'Gujarati', dietary: 'veg', spiceLevel: 1, allergens: ['nuts'], description: 'Mixed vegetable casserole with fenugreek dumplings', labels: [] },
  { name: 'Handvo', aliases: [], category: 'Gujarati', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Savory mixed lentil and rice cake with vegetables', labels: [] },

  // ─── BENGALI (~5) ──────────────────────────────────────
  { name: 'Fish Fry', aliases: ['Bengali Fish Fry', 'Machher Fry'], category: 'Bengali', dietary: 'non-veg', spiceLevel: 1, allergens: ['fish'], description: 'Crispy battered and fried fish cutlets', labels: ['popular'] },
  { name: 'Kosha Mangsho', aliases: [], category: 'Bengali', dietary: 'non-veg', spiceLevel: 2, allergens: [], description: 'Slow-cooked Bengali-style dry mutton curry', labels: [] },
  { name: 'Shorshe Ilish', aliases: ['Hilsa in Mustard'], category: 'Bengali', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish'], description: 'Hilsa fish in pungent mustard paste gravy', labels: [] },
  { name: 'Aloo Posto', aliases: [], category: 'Bengali', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Potatoes cooked with poppy seed paste', labels: [] },
  { name: 'Luchi', aliases: [], category: 'Bengali', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Deep-fried puffed Bengali flatbread made with refined flour', labels: [] },

  // ─── MAHARASHTRIAN (~5) ────────────────────────────────
  { name: 'Misal Pav', aliases: [], category: 'Maharashtrian', dietary: 'veg', spiceLevel: 3, allergens: ['gluten'], description: 'Spicy sprouted moth bean curry topped with farsan, served with pav', labels: ['popular', 'spicy'] },
  { name: 'Sabudana Khichdi', aliases: [], category: 'Maharashtrian', dietary: 'veg', spiceLevel: 1, allergens: ['nuts'], description: 'Tapioca pearls cooked with peanuts and potatoes', labels: [] },
  { name: 'Thalipeeth', aliases: [], category: 'Maharashtrian', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Multi-grain spiced flatbread from Maharashtra', labels: [] },
  { name: 'Puran Poli', aliases: [], category: 'Maharashtrian', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Sweet flatbread stuffed with chana dal and jaggery', labels: [] },
  { name: 'Zunka Bhakar', aliases: [], category: 'Maharashtrian', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Spiced gram flour crumble with millet flatbread', labels: [] },

  // ─── GOAN & COASTAL (~5) ──────────────────────────────
  { name: 'Goan Fish Curry', aliases: ['Fish Curry Rice'], category: 'Goan & Coastal', dietary: 'non-veg', spiceLevel: 2, allergens: ['fish'], description: 'Tangy coconut-based fish curry with kokum', labels: ['popular'] },
  { name: 'Goan Prawn Curry', aliases: [], category: 'Goan & Coastal', dietary: 'non-veg', spiceLevel: 2, allergens: ['shellfish'], description: 'Prawns in spiced coconut curry with Goan spices', labels: [] },
  { name: 'Chicken Xacuti', aliases: ['Xacuti'], category: 'Goan & Coastal', dietary: 'non-veg', spiceLevel: 2, allergens: ['nuts'], description: 'Goan chicken curry with roasted spice and coconut paste', labels: [] },
  { name: 'Vindaloo', aliases: ['Pork Vindaloo', 'Chicken Vindaloo'], category: 'Goan & Coastal', dietary: 'non-veg', spiceLevel: 3, allergens: [], description: 'Fiery Goan curry with vinegar and hot spices', labels: ['spicy'] },
  { name: 'Sol Kadhi', aliases: [], category: 'Goan & Coastal', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Refreshing coconut milk and kokum drink', labels: [] },

  // ─── INDIAN SWEETS - MITHAI (~18) ─────────────────────
  { name: 'Gulab Jamun', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Deep-fried milk dumplings soaked in rose-flavored sugar syrup', labels: ['popular'] },
  { name: 'Rasgulla', aliases: ['Rosogolla'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Soft spongy cottage cheese balls in light sugar syrup', labels: ['popular'] },
  { name: 'Rasmalai', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Flattened cottage cheese dumplings in sweetened saffron milk', labels: ['popular'] },
  { name: 'Jalebi', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Crispy spiral-shaped deep-fried batter soaked in sugar syrup', labels: ['popular'] },
  { name: 'Kaju Katli', aliases: ['Kaju Barfi'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Diamond-shaped cashew fudge', labels: ['popular'] },
  { name: 'Barfi', aliases: ['Milk Barfi'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Dense milk-based fudge squares', labels: [] },
  { name: 'Ladoo', aliases: ['Besan Ladoo', 'Motichoor Ladoo'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Round sweet balls made from gram flour, ghee and sugar', labels: ['popular'] },
  { name: 'Peda', aliases: ['Mathura Peda'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Soft, crumbly milk-based sweet with cardamom', labels: [] },
  { name: 'Sandesh', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Bengali cottage cheese sweet with delicate flavoring', labels: [] },
  { name: 'Mysore Pak', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Rich, crumbly sweet made from gram flour, ghee and sugar', labels: [] },
  { name: 'Halwa', aliases: ['Gajar Halwa', 'Moong Dal Halwa'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Rich, warm sweet pudding made with ghee and nuts', labels: ['popular'] },
  { name: 'Ghevar', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Disc-shaped sweet from Rajasthan drenched in syrup', labels: [] },
  { name: 'Rasgulla', aliases: ['Cham Cham'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Oval-shaped sweet cottage cheese dumpling with cream filling', labels: [] },
  { name: 'Petha', aliases: ['Agra Petha'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Translucent soft candy made from ash gourd', labels: [] },
  { name: 'Kalakand', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Moist, grainy milk cake with cardamom and nuts', labels: [] },
  { name: 'Imarti', aliases: ['Jangiri'], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Flower-shaped deep-fried urad dal batter in sugar syrup', labels: [] },
  { name: 'Malpua', aliases: [], category: 'Indian Sweets - Mithai', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Sweet pancakes soaked in sugar syrup, served with rabri', labels: [] },

  // ─── DESSERTS (~10) ────────────────────────────────────
  { name: 'Kheer', aliases: ['Rice Kheer', 'Chawal Ki Kheer'], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Creamy rice pudding with cardamom, saffron and nuts', labels: ['popular'] },
  { name: 'Phirni', aliases: [], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Ground rice pudding set in earthen pots with nuts', labels: [] },
  { name: 'Shahi Tukda', aliases: ['Shahi Toast'], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten', 'nuts'], description: 'Fried bread slices soaked in sweetened milk with rabri', labels: [] },
  { name: 'Rabri', aliases: ['Rabdi'], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Thickened sweetened milk with layers of cream', labels: [] },
  { name: 'Gajar Ka Halwa', aliases: ['Carrot Halwa'], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Grated carrot slow-cooked in milk with ghee and nuts', labels: ['popular'] },
  { name: 'Moong Dal Halwa', aliases: [], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Rich slow-cooked moong lentil dessert with ghee', labels: [] },
  { name: 'Gulab Jamun with Ice Cream', aliases: [], category: 'Desserts', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'gluten'], description: 'Warm gulab jamun served with vanilla ice cream', labels: [] },
  { name: 'Brownie with Ice Cream', aliases: [], category: 'Desserts', dietary: 'egg', spiceLevel: 0, allergens: ['dairy', 'gluten', 'eggs'], description: 'Warm chocolate brownie with a scoop of ice cream', labels: [] },

  // ─── ICE CREAM & KULFI (~8) ───────────────────────────
  { name: 'Kulfi', aliases: ['Malai Kulfi'], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Dense traditional Indian frozen dairy dessert', labels: ['popular'] },
  { name: 'Pista Kulfi', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Pistachio-flavored kulfi with crushed nuts', labels: [] },
  { name: 'Mango Kulfi', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Kulfi with fresh mango puree', labels: [] },
  { name: 'Falooda', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy', 'nuts'], description: 'Layered cold dessert with vermicelli, basil seeds, ice cream and rose syrup', labels: ['popular'] },
  { name: 'Vanilla Ice Cream', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Classic vanilla ice cream', labels: [] },
  { name: 'Mango Ice Cream', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Creamy ice cream with alphonso mango flavor', labels: [] },
  { name: 'Chocolate Ice Cream', aliases: [], category: 'Ice Cream & Kulfi', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Rich chocolate ice cream', labels: [] },

  // ─── BAKERY (~10) ──────────────────────────────────────
  { name: 'Veg Puff', aliases: ['Vegetable Puff'], category: 'Bakery', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Flaky puff pastry filled with spiced vegetable filling', labels: ['popular'] },
  { name: 'Chicken Puff', aliases: [], category: 'Bakery', dietary: 'non-veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Puff pastry filled with spiced chicken filling', labels: [] },
  { name: 'Egg Puff', aliases: [], category: 'Bakery', dietary: 'egg', spiceLevel: 1, allergens: ['gluten', 'dairy', 'eggs'], description: 'Puff pastry wrapped around a boiled egg with masala', labels: [] },
  { name: 'Bun Maska', aliases: [], category: 'Bakery', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Soft bun slathered with butter, Irani cafe style', labels: [] },
  { name: 'Dilkush', aliases: [], category: 'Bakery', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy', 'nuts'], description: 'Sweet bread filled with tutti-frutti and dry fruits', labels: [] },
  { name: 'Nankhatai', aliases: [], category: 'Bakery', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Traditional Indian shortbread cookies with cardamom', labels: [] },
  { name: 'Rusk', aliases: ['Toast Rusk'], category: 'Bakery', dietary: 'veg', spiceLevel: 0, allergens: ['gluten'], description: 'Twice-baked crispy bread slices for dipping in tea', labels: [] },
  { name: 'Cream Roll', aliases: [], category: 'Bakery', dietary: 'veg', spiceLevel: 0, allergens: ['gluten', 'dairy'], description: 'Flaky pastry horn filled with sweet vanilla cream', labels: [] },

  // ─── HOT BEVERAGES (~6) ───────────────────────────────
  { name: 'Masala Chai', aliases: ['Masala Tea'], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Spiced Indian tea with ginger, cardamom and milk', labels: ['popular'] },
  { name: 'Filter Coffee', aliases: ['South Indian Coffee'], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Strong South Indian filter coffee with frothy milk', labels: ['popular'] },
  { name: 'Green Tea', aliases: [], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Light and refreshing green tea', labels: [] },
  { name: 'Kashmiri Kahwa', aliases: [], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Kashmiri green tea with saffron, almonds and spices', labels: [] },
  { name: 'Adrak Chai', aliases: ['Ginger Tea'], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Ginger-infused Indian tea', labels: [] },
  { name: 'Black Coffee', aliases: [], category: 'Hot Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Simple brewed black coffee', labels: [] },

  // ─── COLD BEVERAGES (~6) ──────────────────────────────
  { name: 'Cold Coffee', aliases: ['Iced Coffee'], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Chilled blended coffee with milk and ice cream', labels: ['popular'] },
  { name: 'Iced Tea', aliases: ['Lemon Iced Tea'], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Chilled tea with lemon and honey', labels: [] },
  { name: 'Nimbu Pani', aliases: ['Lemonade', 'Shikanji'], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh Indian-style lemonade with cumin and black salt', labels: ['popular'] },
  { name: 'Jaljeera', aliases: [], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Spiced cumin water drink, tangy and refreshing', labels: [] },
  { name: 'Aam Panna', aliases: [], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Raw mango cooler with cumin and mint', labels: [] },
  { name: 'Kokum Sharbat', aliases: [], category: 'Cold Beverages', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Sweet and tangy kokum fruit drink', labels: [] },

  // ─── JUICES & SHAKES (~8) ─────────────────────────────
  { name: 'Mango Shake', aliases: ['Aam Shake'], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Thick mango milkshake with fresh mango puree', labels: ['popular'] },
  { name: 'Banana Shake', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Creamy banana milkshake', labels: [] },
  { name: 'Strawberry Shake', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Sweet strawberry milkshake', labels: [] },
  { name: 'Chocolate Shake', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Rich chocolate milkshake', labels: [] },
  { name: 'Fresh Orange Juice', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Freshly squeezed orange juice', labels: [] },
  { name: 'Watermelon Juice', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh watermelon juice with a hint of mint', labels: [] },
  { name: 'Mixed Fruit Juice', aliases: [], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Blend of seasonal fresh fruits', labels: [] },
  { name: 'Sugarcane Juice', aliases: ['Ganne Ka Ras'], category: 'Juices & Shakes', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh pressed sugarcane juice with lemon and ginger', labels: [] },

  // ─── LASSI & CHAAS (~8) ───────────────────────────────
  { name: 'Sweet Lassi', aliases: ['Meethi Lassi'], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Creamy sweet yogurt drink', labels: ['popular'] },
  { name: 'Mango Lassi', aliases: [], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Yogurt drink blended with fresh mango puree', labels: ['popular'] },
  { name: 'Salt Lassi', aliases: ['Namkeen Lassi'], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Savory salted yogurt drink with roasted cumin', labels: [] },
  { name: 'Rose Lassi', aliases: [], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Yogurt drink flavored with rose water and rose petals', labels: [] },
  { name: 'Chaas', aliases: ['Buttermilk', 'Mattha'], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Thin spiced buttermilk with cumin and mint', labels: [] },
  { name: 'Masala Chaas', aliases: [], category: 'Lassi & Chaas', dietary: 'veg', spiceLevel: 1, allergens: ['dairy'], description: 'Spiced buttermilk with cumin, coriander and green chili', labels: [] },

  // ─── INDIAN BREAKFAST (~12) ───────────────────────────
  { name: 'Poha', aliases: ['Kanda Poha'], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Flattened rice with onions, peanuts and mild spices', labels: ['popular'] },
  { name: 'Upma', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Savory semolina porridge with vegetables and tempering', labels: [] },
  { name: 'Idli Sambar', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Steamed rice cakes served with sambar and coconut chutney', labels: ['popular'] },
  { name: 'Pongal', aliases: ['Ven Pongal'], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Rice and moong dal porridge with pepper and ghee', labels: [] },
  { name: 'Misal', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 3, allergens: ['gluten'], description: 'Spicy sprouted moth bean curry with farsan topping', labels: [] },
  { name: 'Kachori with Sabzi', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Deep-fried pastry served with spiced potato curry', labels: [] },
  { name: 'Chole Kulche', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 2, allergens: ['gluten', 'dairy'], description: 'Spiced chickpeas served with soft kulcha bread', labels: [] },
  { name: 'Bread Omelette', aliases: [], category: 'Indian Breakfast', dietary: 'egg', spiceLevel: 1, allergens: ['gluten', 'eggs'], description: 'Masala omelette served between toasted bread slices', labels: [] },
  { name: 'Paratha with Curd', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: ['gluten', 'dairy'], description: 'Stuffed paratha served with fresh yogurt and pickle', labels: [] },
  { name: 'Puri Bhaji', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Deep-fried puffed bread with spiced potato curry', labels: [] },
  { name: 'Pesarattu', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Andhra-style green moong dal dosa', labels: [] },
  { name: 'Aloo Tikki Burger', aliases: [], category: 'Indian Breakfast', dietary: 'veg', spiceLevel: 1, allergens: ['gluten'], description: 'Potato patty burger with mint chutney', labels: [] },

  // ─── RAITA & ACCOMPANIMENTS (~8) ──────────────────────
  { name: 'Boondi Raita', aliases: [], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Yogurt with crispy gram flour pearls and cumin', labels: [] },
  { name: 'Mixed Raita', aliases: ['Veg Raita'], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Yogurt with cucumber, tomato, onion and spices', labels: [] },
  { name: 'Papad', aliases: ['Papadum'], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Crispy thin lentil wafers, roasted or fried', labels: [] },
  { name: 'Masala Papad', aliases: [], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Crispy papad topped with chopped onions, tomato and chaat masala', labels: [] },
  { name: 'Plain Curd', aliases: ['Dahi'], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 0, allergens: ['dairy'], description: 'Fresh plain yogurt', labels: [] },
  { name: 'Green Salad', aliases: [], category: 'Raita & Accompaniments', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh sliced onion, cucumber, tomato and lemon', labels: [] },

  // ─── PICKLES & CHUTNEYS (~5) ──────────────────────────
  { name: 'Mint Chutney', aliases: ['Pudina Chutney'], category: 'Pickles & Chutneys', dietary: 'veg', spiceLevel: 1, allergens: [], description: 'Fresh mint and coriander chutney with green chili', labels: [] },
  { name: 'Tamarind Chutney', aliases: ['Imli Chutney'], category: 'Pickles & Chutneys', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Sweet and tangy tamarind date chutney', labels: [] },
  { name: 'Coconut Chutney', aliases: [], category: 'Pickles & Chutneys', dietary: 'veg', spiceLevel: 0, allergens: ['nuts'], description: 'Fresh coconut chutney with tempering, served with South Indian dishes', labels: [] },
  { name: 'Mango Pickle', aliases: ['Aam Ka Achaar'], category: 'Pickles & Chutneys', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Spiced raw mango pickle in mustard oil', labels: [] },
  { name: 'Mixed Pickle', aliases: ['Achaar'], category: 'Pickles & Chutneys', dietary: 'veg', spiceLevel: 2, allergens: [], description: 'Assorted vegetable pickle with Indian spices', labels: [] },

  // ─── SALADS (~4) ──────────────────────────────────────
  { name: 'Kachumber Salad', aliases: [], category: 'Salads', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh diced cucumber, tomato and onion salad with lemon', labels: [] },
  { name: 'Onion Rings', aliases: ['Laccha Onion'], category: 'Salads', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Fresh onion rings with lemon and chaat masala', labels: [] },
  { name: 'Sprout Salad', aliases: ['Moong Sprout Salad'], category: 'Salads', dietary: 'veg', spiceLevel: 0, allergens: [], description: 'Nutritious sprouted moong beans with onions and lemon', labels: [] },
];

/**
 * Search Indian food database with relevance scoring and food type filtering.
 * @param {string} query - Search text (min 2 chars)
 * @param {string} foodType - Restaurant food type: 'pure_veg' | 'egg' | 'non_veg' | 'both'
 * @param {number} limit - Max results to return (default 8)
 * @returns {Array} Matching food items sorted by relevance
 */
export function searchIndianFoods(query, foodType = 'both', limit = 8) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();

  // Step 1: Filter by restaurant food type
  let pool = INDIAN_FOOD_DATABASE;
  if (foodType === 'pure_veg') {
    pool = pool.filter(item => item.dietary === 'veg');
  } else if (foodType === 'egg') {
    pool = pool.filter(item => item.dietary === 'veg' || item.dietary === 'egg');
  }
  // 'non_veg' and 'both' see everything

  // Step 2: Score by relevance
  const scored = [];
  for (const item of pool) {
    let score = 0;
    const nameLower = item.name.toLowerCase();

    // Tier 1 (100): Name starts with query
    if (nameLower.startsWith(q)) {
      score = 100;
    }
    // Tier 2 (80): Word boundary match on name
    else if (nameLower.split(/\s+/).some(word => word.startsWith(q))) {
      score = 80;
    }
    // Tier 3 (60): Name contains query
    else if (nameLower.includes(q)) {
      score = 60;
    }
    // Tier 4 (50): Alias starts with query
    else if (item.aliases.some(a => a.toLowerCase().startsWith(q))) {
      score = 50;
    }
    // Tier 5 (30): Alias contains query
    else if (item.aliases.some(a => a.toLowerCase().includes(q))) {
      score = 30;
    }

    if (score > 0) {
      // Boost popular items slightly
      if (item.labels.includes('popular')) score += 5;
      scored.push({ ...item, _score: score });
    }
  }

  // Sort by score desc, then alphabetically
  scored.sort((a, b) => b._score - a._score || a.name.localeCompare(b.name));

  // Return top results without internal score
  return scored.slice(0, limit).map(({ _score, ...item }) => item);
}
