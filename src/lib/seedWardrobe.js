import { base44 } from '@/api/base44Client';

function daysAgo(n) {
  if (n === null) return null;
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const today = daysAgo(0);
const yesterday = daysAgo(1);

export const SEED_ITEMS = [
  // TOPS
  {
    name: 'White Crop Tee',
    category: 'Tops',
    color: 'White',
    brand: 'Zara',
    tags: ['casual', 'everyday', 'basic'],
    style_tags: ['minimal', 'casual'],
    emoji: '👕',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 8,
    last_worn_date: daysAgo(3),
    date_added: daysAgo(90),
  },
  {
    name: 'Striped Breton Top',
    category: 'Tops',
    color: 'White',
    brand: 'Mango',
    tags: ['classic', 'nautical', 'chic'],
    style_tags: ['classic', 'chic'],
    emoji: '👕',
    season: ['Spring', 'Summer'],
    times_worn: 3,
    last_worn_date: daysAgo(14),
    date_added: daysAgo(120),
  },
  {
    name: 'Black Satin Blouse',
    category: 'Tops',
    color: 'Black',
    brand: '& Other Stories',
    tags: ['elegant', 'evening', 'silky'],
    style_tags: ['elegant', 'chic'],
    emoji: '👚',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 2,
    last_worn_date: daysAgo(30),
    date_added: daysAgo(150),
  },
  {
    name: 'Terracotta Knit Sweater',
    category: 'Tops',
    color: 'Brown',
    brand: 'Zara',
    tags: ['cosy', 'autumn', 'trendy'],
    style_tags: ['cosy', 'casual', 'y2k'],
    emoji: '🧶',
    season: ['Autumn', 'Winter'],
    times_worn: 5,
    last_worn_date: daysAgo(7),
    date_added: daysAgo(60),
  },
  {
    name: 'White Linen Shirt',
    category: 'Tops',
    color: 'White',
    brand: 'Massimo Dutti',
    tags: ['classic', 'smart casual', 'clean'],
    style_tags: ['minimal', 'classic'],
    emoji: '👔',
    season: ['Spring', 'Summer'],
    times_worn: 1,
    last_worn_date: daysAgo(21),
    date_added: daysAgo(45),
  },

  // BOTTOMS
  {
    name: 'High-Waist Straight Jeans',
    category: 'Bottoms',
    color: 'Blue',
    brand: "Levi's",
    tags: ['denim', 'casual', 'everyday'],
    style_tags: ['casual', 'minimal'],
    emoji: '👖',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 12,
    last_worn_date: yesterday,
    date_added: daysAgo(200),
  },
  {
    name: 'Black Mini Skirt',
    category: 'Bottoms',
    color: 'Black',
    brand: 'Zara',
    tags: ['going out', 'chic', 'fun'],
    style_tags: ['chic', 'streetwear'],
    emoji: '🩱',
    season: ['Spring', 'Summer'],
    times_worn: 4,
    last_worn_date: daysAgo(10),
    date_added: daysAgo(100),
  },
  {
    name: 'Beige Wide-Leg Trousers',
    category: 'Bottoms',
    color: 'Beige',
    brand: 'Mango',
    tags: ['elegant', 'office', 'smart'],
    style_tags: ['elegant', 'minimal'],
    emoji: '👖',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 2,
    last_worn_date: daysAgo(21),
    date_added: daysAgo(80),
  },
  {
    name: 'Floral Midi Skirt',
    category: 'Bottoms',
    color: 'Multi',
    brand: 'H&M',
    tags: ['boho', 'feminine', 'summer'],
    style_tags: ['boho', 'romantic'],
    emoji: '🌸',
    season: ['Spring', 'Summer'],
    times_worn: 0,
    last_worn_date: null,
    date_added: daysAgo(30),
  },

  // DRESSES
  {
    name: 'Black Bodycon Dress',
    category: 'Dresses',
    color: 'Black',
    brand: 'Zara',
    tags: ['club', 'evening', 'sexy'],
    style_tags: ['chic', 'elegant'],
    emoji: '👗',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 3,
    last_worn_date: daysAgo(21),
    date_added: daysAgo(130),
  },
  {
    name: 'Floral Wrap Dress',
    category: 'Dresses',
    color: 'Multi',
    brand: '& Other Stories',
    tags: ['feminine', 'romantic', 'day'],
    style_tags: ['romantic', 'boho'],
    emoji: '👗',
    season: ['Spring', 'Summer'],
    times_worn: 1,
    last_worn_date: daysAgo(60),
    date_added: daysAgo(180),
  },
  {
    name: 'Camel Knit Midi Dress',
    category: 'Dresses',
    color: 'Beige',
    brand: 'Massimo Dutti',
    tags: ['elegant', 'chic', 'dinner'],
    style_tags: ['elegant', 'chic'],
    emoji: '👗',
    season: ['Autumn', 'Winter'],
    times_worn: 2,
    last_worn_date: daysAgo(42),
    date_added: daysAgo(100),
  },

  // SHOES
  {
    name: 'White Air Force 1',
    category: 'Shoes',
    color: 'White',
    brand: 'Nike',
    tags: ['sneakers', 'casual', 'everyday'],
    style_tags: ['streetwear', 'casual'],
    emoji: '👟',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 15,
    last_worn_date: today,
    date_added: daysAgo(365),
  },
  {
    name: 'Strappy Black Heels',
    category: 'Shoes',
    color: 'Black',
    brand: 'Zara',
    tags: ['evening', 'elegant', 'going out'],
    style_tags: ['elegant', 'chic'],
    emoji: '👠',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 4,
    last_worn_date: daysAgo(21),
    date_added: daysAgo(200),
  },
  {
    name: 'Tan Leather Loafers',
    category: 'Shoes',
    color: 'Brown',
    brand: 'Mango',
    tags: ['smart casual', 'classic', 'comfy'],
    style_tags: ['classic', 'minimal'],
    emoji: '🥿',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 6,
    last_worn_date: daysAgo(5),
    date_added: daysAgo(120),
  },
  {
    name: 'White Chunky Sandals',
    category: 'Shoes',
    color: 'White',
    brand: 'H&M',
    tags: ['summer', 'casual', 'beach'],
    style_tags: ['casual', 'boho'],
    emoji: '👡',
    season: ['Summer'],
    times_worn: 0,
    last_worn_date: null,
    date_added: daysAgo(40),
  },

  // BAGS
  {
    name: 'Mini Black Crossbody',
    category: 'Bags',
    color: 'Black',
    brand: 'Zara',
    tags: ['going out', 'evening', 'compact'],
    style_tags: ['chic', 'minimal'],
    emoji: '👜',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 7,
    last_worn_date: daysAgo(4),
    date_added: daysAgo(150),
  },
  {
    name: 'Beige Tote Bag',
    category: 'Bags',
    color: 'Beige',
    brand: 'Mango',
    tags: ['everyday', 'uni', 'casual'],
    style_tags: ['casual', 'minimal'],
    emoji: '👝',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 10,
    last_worn_date: daysAgo(2),
    date_added: daysAgo(200),
  },
  {
    name: 'Brown Leather Shoulder Bag',
    category: 'Bags',
    color: 'Brown',
    brand: 'Coach',
    tags: ['classic', 'elegant', 'chic'],
    style_tags: ['classic', 'chic'],
    emoji: '👜',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 3,
    last_worn_date: daysAgo(14),
    date_added: daysAgo(300),
  },

  // JEWELLERY & ACCESSORIES
  {
    name: 'Gold Hoop Earrings',
    category: 'Jewellery',
    color: 'Multi',
    brand: 'Mango',
    tags: ['everyday', 'classic', 'gold'],
    style_tags: ['chic', 'classic'],
    emoji: '💛',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 20,
    last_worn_date: today,
    date_added: daysAgo(400),
  },
  {
    name: 'Tortoise Shell Sunglasses',
    category: 'Accessories',
    color: 'Brown',
    brand: 'Zara',
    tags: ['summer', 'chic', 'retro'],
    style_tags: ['chic', 'retro'],
    emoji: '🕶️',
    season: ['Spring', 'Summer'],
    times_worn: 8,
    last_worn_date: daysAgo(7),
    date_added: daysAgo(180),
  },
  {
    name: 'Silk Hair Scarf',
    category: 'Accessories',
    color: 'Multi',
    brand: 'H&M',
    tags: ['boho', 'feminine', 'vintage'],
    style_tags: ['boho', 'vintage'],
    emoji: '🧣',
    season: ['Spring', 'Summer', 'Autumn', 'Winter'],
    times_worn: 2,
    last_worn_date: daysAgo(30),
    date_added: daysAgo(90),
  },
];

export async function seedWardrobe(toastFn) {
  // Delete existing items (best-effort, don't block seeding if it fails)
  try {
    const existing = await base44.entities.WardrobeItem.list();
    // Delete in small batches to avoid timeout
    for (let i = 0; i < existing.length; i += 5) {
      await Promise.all(existing.slice(i, i + 5).map((item) => base44.entities.WardrobeItem.delete(item.id)));
    }
  } catch {
    // continue even if delete fails
  }

  // Insert all seed items
  await base44.entities.WardrobeItem.bulkCreate(SEED_ITEMS);

  toastFn?.({ description: '22 items loaded! ✨' });
}

export async function seedWardrobeIfEmpty(toastFn) {
  const existing = await base44.entities.WardrobeItem.list();
  if (existing.length >= 5) return; // enough items already — skip
  await seedWardrobe(toastFn);
}