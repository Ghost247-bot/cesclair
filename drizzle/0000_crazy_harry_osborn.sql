CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"designer_id" integer NOT NULL,
	"design_id" integer,
	"title" text NOT NULL,
	"description" text,
	"amount" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"awarded_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"envelope_id" text,
	"envelope_status" text DEFAULT 'pending',
	"signed_at" timestamp,
	"envelope_url" text
);
--> statement-breakpoint
CREATE TABLE "designers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"bio" text,
	"portfolio_url" text,
	"specialties" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "designers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"designer_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"category" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cesworld_members" (
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
--> statement-breakpoint
CREATE TABLE "Cesworld_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"reward_type" text NOT NULL,
	"points_cost" integer NOT NULL,
	"amount_off" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cesworld_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" text NOT NULL,
	"points" integer NOT NULL,
	"description" text NOT NULL,
	"order_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" text NOT NULL,
	"category" text,
	"image_url" text,
	"stock" integer DEFAULT 0,
	"sku" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_designer_id_designers_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_designer_id_designers_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cesworld_members" ADD CONSTRAINT "Cesworld_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cesworld_rewards" ADD CONSTRAINT "Cesworld_rewards_member_id_Cesworld_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."Cesworld_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cesworld_transactions" ADD CONSTRAINT "Cesworld_transactions_member_id_Cesworld_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."Cesworld_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;