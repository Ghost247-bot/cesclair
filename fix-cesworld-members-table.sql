-- Fix: Create Cesworld_members table if it doesn't exist
-- Run this SQL directly in your database console (Neon, pgAdmin, psql, etc.)

-- Create Cesworld_members table
CREATE TABLE IF NOT EXISTS "Cesworld_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "tier" text DEFAULT 'member' NOT NULL,
  "points" integer DEFAULT 0 NOT NULL,
  "annual_spending" text DEFAULT '0.00' NOT NULL,
  "birthday_month" integer,
  "birthday_day" integer,
  "joined_at" timestamp DEFAULT now() NOT NULL,
  "last_tier_update" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint if user table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'Cesworld_members_user_id_user_id_fk'
    ) THEN
      ALTER TABLE "Cesworld_members" 
      ADD CONSTRAINT "Cesworld_members_user_id_user_id_fk" 
      FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") 
      ON DELETE no action ON UPDATE no action;
    END IF;
  END IF;
END $$;

