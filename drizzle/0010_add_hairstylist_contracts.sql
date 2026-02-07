-- Add hairstylist_id to contracts table for admin-assigned contracts
ALTER TABLE "contracts" ADD COLUMN "hairstylist_id" integer REFERENCES "hairstylists"("id") ON DELETE CASCADE;
--> statement-breakpoint
-- Make designer_id nullable (contract can be for designer OR hairstylist)
ALTER TABLE "contracts" ALTER COLUMN "designer_id" DROP NOT NULL;
