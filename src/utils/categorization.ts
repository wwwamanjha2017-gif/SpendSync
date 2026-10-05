import type { CategoryInfo } from '@/types';

const CATEGORIES: Record<string, { keywords: string[]; color: string }> = {
  'Food & Dining': {
    color: '#F97316',
    keywords: [
      'zomato', 'swiggy', 'dominos', 'pizza', 'restaurant', 'food', 'cafe',
      'mcdonalds', 'kfc', 'burger', 'biryani', 'eats', 'grubhub', 'doordash',
      'uber eats', 'starbucks', 'barista', 'chaayos', 'eatfit',
    ],
  },
  Shopping: {
    color: '#EC4899',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'snapdeal',
      'shopify', 'ebay', 'etsy', 'walmart', 'target', 'bigbasket', 'grofers',
      'blinkit', 'zepto', 'instamart', 'reliance', 'lifestyle', 'pantaloons',
    ],
  },
  Transport: {
    color: '#3B82F6',
    keywords: [
      'uber', 'ola', 'rapido', 'blusmart', 'metro', 'fuel', 'petrol', 'diesel',
      'irctc', 'redbus', 'makemytrip', 'goibibo', 'yatra', 'easemytrip',
      'train', 'flight', 'airline', 'indigo', 'spicejet', 'airtel', 'bp', 'hp', 'iocl',
    ],
  },
  Entertainment: {
    color: '#8B5CF6',
    keywords: [
      'netflix', 'prime', 'hotstar', 'disney', 'spotify', 'youtube', 'sonyliv',
      'zee5', 'voot', 'jiocinema', 'theater', 'cinema', 'movie', 'bookmyshow',
      'pvr', 'inox', 'gaana', 'wynk', 'jiosaavn', 'apple music',
    ],
  },
  'Utilities & Bills': {
    color: '#F59E0B',
    keywords: [
      'electricity', 'water', 'gas', 'broadband', 'wifi', 'airtel', 'jio', 'vi',
      'vodafone', 'idea', 'bsnl', 'mtnl', 'dth', 'tatasky', 'dishtv',
      'sun direct', 'insurance', 'lic', 'act fibernet', 'excitel', 'tata power',
    ],
  },
  'Health & Wellness': {
    color: '#EF4444',
    keywords: [
      'pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'apollo', 'medplus',
      '1mg', 'pharmeasy', 'netmeds', 'fitness', 'gym', 'cult', 'curefit',
      'covid', 'test', 'lab', 'diagnostic',
    ],
  },
  Education: {
    color: '#10B981',
    keywords: [
      'course', 'udemy', 'coursera', 'byjus', 'unacademy', 'vedantu', 'toppr',
      'whitehat', 'skillshare', 'linkedin learning', 'pluralsight', 'testbook',
      'gradeup', 'udacity', 'codecademy', 'duolingo',
    ],
  },
  'Financial Services': {
    color: '#6366F1',
    keywords: [
      'emi', 'loan', 'mutual fund', 'sip', 'stock', 'zerodha', 'groww',
      'upstox', 'paytm money', 'etmoney', 'smallcase', 'nps', 'pf', 'rd', 'fd',
      'invest', 'trading', 'brokerage',
    ],
  },
  Transfers: {
    color: '#6B7280',
    keywords: [
      'upi transfer', 'imps', 'neft', 'rtgs', 'paytm', 'phonepe', 'gpay',
      'bharatpe', 'cred', 'slice', 'lazypay', 'simpl', 'sent to', 'received from',
    ],
  },
};

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORIES).map(([name, info]) => [name, info.color])
);

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

const OTHER_CATEGORY: CategoryInfo = { name: 'Other', color: '#9CA3AF' };

export function categorizeTransaction(
  merchantName: string,
  smsBody: string
): CategoryInfo {
  const text = `${merchantName} ${smsBody}`.toLowerCase();

  for (const [categoryName, info] of Object.entries(CATEGORIES)) {
    for (const keyword of info.keywords) {
      if (text.includes(keyword)) {
        return { name: categoryName, color: info.color };
      }
    }
  }

  return OTHER_CATEGORY;
}

export function getAllCategories(): CategoryInfo[] {
  return [
    ...Object.entries(CATEGORIES).map(([name, info]) => ({
      name,
      color: info.color,
    })),
    OTHER_CATEGORY,
  ];
}
