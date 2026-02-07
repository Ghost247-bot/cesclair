-- Caution/notification banners table - admin-managed banners shown to users and designers
CREATE TABLE "caution_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'warning' NOT NULL,
	"target_role" text DEFAULT 'all' NOT NULL,
	"target_user_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "caution_banners" ADD CONSTRAINT "caution_banners_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "caution_banners" ADD CONSTRAINT "caution_banners_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
