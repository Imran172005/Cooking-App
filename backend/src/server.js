import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

// Start cron only in production
if (ENV.NODE_ENV === "production") {
  job.start();
}

// Middleware
app.use(express.json());

// ======================
// HEALTH CHECK
// ======================
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// ======================
// GET FAVORITES BY USER
// ======================
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const favorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// ======================
// ADD FAVORITE
// ======================
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prevent duplicate favorites
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, Number(recipeId))
        )
      );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Recipe already saved" });
    }

    const inserted = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId: Number(recipeId),
        title,
        image,
        cookTime,
        servings,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Failed to save recipe" });
  }
});

// ======================
// REMOVE FAVORITE
// ======================
app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.recipeId, Number(recipeId))
        )
      );

    res.status(200).json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
