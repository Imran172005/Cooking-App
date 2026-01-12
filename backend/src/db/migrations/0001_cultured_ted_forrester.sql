ALTER TABLE "favorites" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "favorites" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_recipe_unique" ON "favorites" USING btree ("user_id","recipe_id");