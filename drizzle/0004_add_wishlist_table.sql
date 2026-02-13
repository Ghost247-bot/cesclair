-- Add wishlist_items table
CREATE TABLE IF NOT EXISTS "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_user_id_fkey') THEN
        ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_items_product_id_fkey') THEN
        ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "wishlist_items_user_id_idx" ON "wishlist_items" ("user_id");
CREATE INDEX IF NOT EXISTS "wishlist_items_product_id_idx" ON "wishlist_items" ("product_id");
CREATE INDEX IF NOT EXISTS "wishlist_items_user_product_idx" ON "wishlist_items" ("user_id", "product_id");
