-- Add slug column to products table
ALTER TABLE products ADD COLUMN slug TEXT UNIQUE NOT NULL DEFAULT '';

-- Generate slugs for existing products
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^\w\s-]', '', 'g'),  -- Remove special characters
    '[\s_]+', '-', 'g'                          -- Replace spaces/underscores with hyphens
  ),
  '-+', '-', 'g'                                -- Replace multiple hyphens with single hyphen
));

-- Handle duplicate slugs by appending ID
WITH duplicates AS (
  SELECT slug, COUNT(*) as count
  FROM products
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE products 
SET slug = slug || '-' || id
WHERE slug IN (SELECT slug FROM duplicates);

-- Set slug to NOT NULL if it's not already
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
