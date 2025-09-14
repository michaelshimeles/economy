import db from "../../db/db";
import { players } from "../../db/schema";
import { eq } from "drizzle-orm";
import { createBankAccount } from "../economy/bank/service";

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
    const { firstName, lastName, weight, height, hairColor, eyesColor, hairStyle, skinColor, sex, birthDate, jobId, cash, bank } = player;

    // Validate the player
    if (
        firstName == null ||
        lastName == null ||
        weight == null ||
        height == null ||
        hairColor == null ||
        eyesColor == null ||
        hairStyle == null ||
        skinColor == null ||
        sex == null ||
        birthDate == null ||
        jobId == null ||
        cash == null ||
        bank == null
    ) {
        return { success: false, message: "Invalid player data (missing fields)" };
    }
    // Create a new player id 
    const playerId = crypto.randomUUID();

    // Create player in the database
    const parsedBirthDate = new Date(birthDate as unknown as string);
    if (Number.isNaN(parsedBirthDate.valueOf())) {
        return { success: false, message: "Invalid birthDate. Use ISO string (e.g. 1990-05-15) or epoch ms." };
    }
    try {

        const [newPlayer] = await db.insert(players).values({ ...player, birthDate: parsedBirthDate, playerId }).returning();

        // Automatically create default personal bank accounts
        await createBankAccount(newPlayer.playerId, "personal");

        return { success: true, newPlayer, message: "Player created successfully" };
    } catch (error) {
        console.error("Failed to create player", error);
        return { success: false, message: "Failed to create player", error: error };
    }

}

export const getPlayer = async (playerId: string) => {
    try {
        const [player] = await db.select().from(players).where(eq(players.playerId, playerId));
        return { success: true, player, message: "Player fetched successfully" };
    } catch (error) {
        console.error("Failed to get player", error);
        return { success: false, message: "Failed to get player", error: error };
    }
}

export const updatePlayer = async (playerId: string, player: UpdatePlayer) => {

    if (player.birthDate) {
        const parsedBirthDate = new Date(player.birthDate as unknown as string);
        if (Number.isNaN(parsedBirthDate.valueOf())) {
            return { success: false, message: "Invalid birthDate format" };
        }
        player.birthDate = parsedBirthDate;
    }
    try {
        const [updatePlayer] = await db.update(players).set(player).where(eq(players.playerId, playerId)).returning();
        return { success: true, updatePlayer, message: "Player updated successfully" };
    } catch (error) {
        console.error("Failed to update player", error);
        return { success: false, message: "Failed to update player", error: error };
    }
}
