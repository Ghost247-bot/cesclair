-- Hairstylists table - portfolio profiles (mirrors designers)
CREATE TABLE "hairstylists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"bio" text,
	"portfolio_url" text,
	"specialties" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"avatar_url" text,
	"banner_url" text,
	"banner_title" text,
	"banner_description" text,
	"banner_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hairstylists_email_unique" UNIQUE("email")
);
--> statement-breakpoint
-- Hairstylist works table - portfolio pieces (mirrors designs)
CREATE TABLE "hairstylist_works" (
	"id" serial PRIMARY KEY NOT NULL,
	"hairstylist_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"category" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hairstylist_works" ADD CONSTRAINT "hairstylist_works_hairstylist_id_hairstylists_id_fk" FOREIGN KEY ("hairstylist_id") REFERENCES "public"."hairstylists"("id") ON DELETE cascade ON UPDATE no action;
