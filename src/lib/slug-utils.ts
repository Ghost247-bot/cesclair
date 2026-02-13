// Utility functions for generating and working with URL-friendly slugs

/**
 * Convert a string to a URL-friendly slug
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Create a unique slug by appending a number if the slug already exists
 */
export function createUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Generate slugs for all products and ensure uniqueness
 */
export function generateProductSlugs(products: Array<{ name: string; id: number }>): Array<{ id: number; slug: string }> {
  const slugs: string[] = [];
  const results: Array<{ id: number; slug: string }> = [];
  
  for (const product of products) {
    const baseSlug = createSlug(product.name);
    const uniqueSlug = createUniqueSlug(baseSlug, slugs);
    
    slugs.push(uniqueSlug);
    results.push({ id: product.id, slug: uniqueSlug });
  }
  
  return results;
}

/**
 * Extract product ID from a slug (for backward compatibility)
 * This handles both pure slugs and slug-id patterns
 */
export function extractProductIdFromSlug(slug: string): number | null {
  // Try to extract ID from the end of the slug (e.g., "product-name-123")
  const match = slug.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // If no ID found, return null - we'll need to look up by slug
  return null;
}
