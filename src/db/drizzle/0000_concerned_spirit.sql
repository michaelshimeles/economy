CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"sub_type" varchar(20) NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"apr" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "government_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"savings_apr" integer DEFAULT 2,
	"income_tax_rate" integer DEFAULT 10,
	"sales_tax_rate" integer DEFAULT 8,
	"business_tax_rate" integer DEFAULT 15,
	"investing_lockup_months" integer DEFAULT 12,
	"is_investing_enabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "governments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) DEFAULT 'Los Santos Government',
	"account_id" uuid
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"salary" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"weight" integer NOT NULL,
	"height" integer NOT NULL,
	"hair_color" varchar(255) NOT NULL,
	"eyes_color" varchar(255) NOT NULL,
	"hair_style" varchar(255) NOT NULL,
	"skin_color" varchar(255) NOT NULL,
	"sex" varchar(255) NOT NULL,
	"birth_date" timestamp NOT NULL,
	"job_id" integer NOT NULL,
	"cash" integer DEFAULT 500 NOT NULL,
	"bank" integer DEFAULT 1000 NOT NULL,
	CONSTRAINT "players_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"account_id" uuid,
	"amount" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_owner_id_players_player_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."players"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "governments" ADD CONSTRAINT "governments_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_player_id_players_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("player_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE no action ON UPDATE no action;