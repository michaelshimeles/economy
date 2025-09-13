import db from "../../db/db";
import { players } from "../../db/schema";
import { eq } from "drizzle-orm";

type NewPlayer = typeof players.$inferInsert
type UpdatePlayer = Partial<typeof players.$inferInsert>

export const getAllPlayers = async () => {
    try {
        const allPlayers = await db.select().from(players);
        return { success: true, allPlayers, message: "All players fetched successfully" };
    } catch (error) {
        console.error("Failed to get all players", error);
        return { success: false, message: "Failed to get all players", error: error };
    }
}

export const createPlayer = async (player: NewPlayer) => {
    try {

        const newPlayer = await db.insert(players).values(player).returning();
        return { success: true, newPlayer, message: "Player created successfully" };
    } catch (error) {
        console.error("Failed to create player", error);
        return { success: false, message: "Failed to create player", error: error };
    }
}

export const getPlayer = async (playerId: string) => {
    try {
        const player = await db.select().from(players).where(eq(players.playerId, playerId));
        return { success: true, player, message: "Player fetched successfully" };
    } catch (error) {
        console.error("Failed to get player", error);
        return { success: false, message: "Failed to get player", error: error };
    }
}

export const updatePlayer = async (playerId: string, player: UpdatePlayer) => {
    try {
        const updateNew = await db.update(players).set(player).where(eq(players.playerId, playerId));
        return { success: true, updateNew, message: "Player updated successfully" };
    } catch (error) {
        console.error("Failed to update player", error);
        return { success: false, message: "Failed to update player", error: error };
    }
}
