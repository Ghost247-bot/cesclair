import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines product category based on title and description
 * Analyzes keywords to categorize products into appropriate categories
 */
export function determineProductCategory(title?: string, description?: string): string | undefined {
  if (!title && !description) {
    return undefined;
  }

  // Combine title and description for analysis
  const searchText = `${title || ''} ${description || ''}`.toLowerCase().trim();
  
  if (!searchText) {
    return undefined;
  }

  // Category keyword mappings (order matters - more specific first)
  // Categories are checked in order, so more specific ones should come first
  const categoryKeywords: Record<string, string[]> = {
    // Special collections (check first)
    'cashmere': ['cashmere'],
    'matching-sets': ['matching set', 'coordinated set', 'two-piece', 'two piece', 'matching', 'coordinated'],
    
    // Clothing categories
    'sweaters': ['sweater', 'cardigan', 'pullover', 'turtleneck', 'crewneck', 'v-neck', 'v neck', 'mock neck', 'mock-neck', 'hoodie', 'hoody'],
    'outerwear': ['jacket', 'coat', 'parka', 'puffer', 'bomber', 'blazer', 'trench', 'raincoat', 'windbreaker', 'outerwear', 'vest', 'gilet'],
    'denim': ['jean', 'denim', 'jegging', 'jeggings'],
    'pants': ['pant', 'trouser', 'chino', 'khaki', 'legging', 'jogger', 'cargo', 'wide-leg', 'wide leg', 'straight-leg', 'straight leg', 'skinny', 'culottes', 'palazzo'],
    'dresses': ['dress', 'gown', 'maxi', 'midi', 'mini', 'sundress', 'shift', 'wrap dress', 'a-line', 'bodycon'],
    'tees-tops': ['tee', 't-shirt', 'tshirt', 't shirt', 'shirt', 'blouse', 'tank', 'camisole', 'top', 'long-sleeve', 'long sleeve', 'short-sleeve', 'short sleeve', 'sleeveless', 'henley', 'polo', 'button-down', 'button down'],
    'activewear': ['activewear', 'athletic', 'sport', 'workout', 'gym', 'yoga', 'running', 'athleisure', 'sports bra', 'leggings', 'athletic wear'],
    
    // Footwear
    'shoes': ['shoe', 'sneaker', 'boot', 'sandal', 'loafer', 'oxford', 'heel', 'flat', 'mule', 'slipper', 'sneakers', 'boots', 'sandals', 'flats', 'heels', 'pump', 'ankle boot', 'knee boot'],
    
    // Accessories
    'bags': ['bag', 'tote', 'backpack', 'purse', 'handbag', 'clutch', 'crossbody', 'satchel', 'briefcase', 'messenger', 'duffel', 'weekender'],
    'accessories': ['scarf', 'hat', 'cap', 'beanie', 'belt', 'wallet', 'watch', 'jewelry', 'jewellery', 'necklace', 'bracelet', 'earring', 'earrings', 'ring', 'sunglasses', 'gloves', 'mittens'],
    'basics': ['sock', 'socks', 'underwear', 'bra', 'bras', 'brief', 'briefs', 'boxer', 'boxers', 'undershirt', 'undershirts', 'underwear', 'lingerie'],
  };

  // Special handling for skirts (can be part of dresses category or separate)
  // Check for skirts after dresses to avoid conflicts
  if (/\bskirt\b/i.test(searchText)) {
    // If it's clearly a dress, don't categorize as skirt
    if (!/\bdress\b/i.test(searchText)) {
      return 'dresses'; // Skirts are grouped with dresses in the navigation
    }
  }

  // Check each category in order (more specific categories first)
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      // Use word boundaries to avoid partial matches (e.g., "pants" not matching "underpants")
      // Escape special regex characters in keyword
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(searchText)) {
        return category;
      }
    }
  }

  // If no specific category found, return undefined
  return undefined;
}

/**
 * Normalizes image paths for Next.js Image component
 * - Converts relative paths starting with /uploads/ to use /api/uploads/
 * - Handles external URLs
 * - Handles absolute paths from public folder
 * - Returns placeholder if image is missing
 */
export function normalizeImagePath(imagePath: string | null | undefined, placeholder: string = '/placeholder-image.jpg'): string {
  // If no image path, return placeholder
  if (!imagePath) {
    return placeholder;
  }

  // If it's already an external URL (http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /uploads/, convert to /api/uploads/ for API route handling
  if (imagePath.startsWith('/uploads/')) {
    return `/api${imagePath}`;
  }

  // If it's an absolute path starting with /, return as-is (e.g., /icon.png)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it's a relative path, make it absolute
  return `/${imagePath}`;
}
