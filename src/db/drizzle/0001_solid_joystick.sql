ALTER TABLE "players" ALTER COLUMN "job_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "player_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "first_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "last_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "weight" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "height" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "hair_color" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "eyes_color" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "hair_style" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "skin_color" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "sex" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "birth_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "players" DROP COLUMN "name";