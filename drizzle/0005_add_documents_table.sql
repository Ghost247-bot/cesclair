-- Create documents table for designer document management
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"designer_id" integer NOT NULL,
	"uploaded_by" text,
	"title" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"file_type" text,
	"category" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_designer_id_designers_id_fk" FOREIGN KEY ("designer_id") REFERENCES "designers"("id") ON DELETE cascade,
	CONSTRAINT "documents_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id")
);

