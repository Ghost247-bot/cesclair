CREATE TABLE "designer_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"designer_id" integer NOT NULL,
	"created_by" text,
	"title" text,
	"subtitle" text,
	"body" text,
	"image_url" text,
	"cta_label" text,
	"cta_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "designers" ADD COLUMN "banner_title" text;--> statement-breakpoint
ALTER TABLE "designers" ADD COLUMN "banner_description" text;--> statement-breakpoint
ALTER TABLE "designers" ADD COLUMN "banner_active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "designer_banners" ADD CONSTRAINT "designer_banners_designer_id_designers_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designer_banners" ADD CONSTRAINT "designer_banners_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;