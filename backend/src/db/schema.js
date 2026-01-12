import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const favoritesTable = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),

    userId: text("user_id").notNull(),
    recipeId: integer("recipe_id").notNull(),

    title: text("title").notNull(),
    image: text("image"),
    cookTime: text("cook_time"),
    servings: text("servings"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueFavorite: uniqueIndex("favorites_user_recipe_unique").on(
      table.userId,
      table.recipeId
    ),
  })
);
