import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import db from "../../db/db";
import { players } from "../../db/schema";
import { PlayerModel } from "./model";

type Player = typeof PlayerModel.Player

export const player = new Elysia()
  .get("/", () => "GTA RP Economy")
  .get("/players", async () => {
    const allPlayers = await db.select().from(players);
    return { success: true, players: allPlayers, message: "Players fetched successfully" };
  })
  .post("/players/create", async ({ body }: { body: Player }) => {
    const { firstName, lastName, weight, height, hairColor, eyesColor, hairStyle, skinColor, sex, birthDate, jobId, cash, bank } = body;

    // Validate the player
    if (!firstName || !lastName || !weight || !height || !hairColor || !eyesColor || !hairStyle || !skinColor || !sex || !birthDate || !jobId || !cash || !bank) {
      return { error: "Invalid player data" };
    }

    // Create a new player id 
    const playerId = crypto.randomUUID();

    // Create player in the database
    try {
      const parsedBirthDate = new Date(birthDate as unknown as string);
      if (Number.isNaN(parsedBirthDate.valueOf())) {
        return { success: false, message: "Invalid birthDate. Use ISO string (e.g. 1990-05-15) or epoch ms." };
      }
      const player = await db.insert(players).values({
        playerId,
        firstName,
        lastName,
        weight,
        height,
        hairColor,
        eyesColor,
        hairStyle,
        skinColor,
        sex,
        birthDate: parsedBirthDate,
        cash,
        bank,
        jobId,
      }).returning();

      return {
        success: true,
        player: player[0],
        message: "Player created successfully"
      };
    } catch (error) {
      console.error("Failed to create player", error);
      return { success: false, message: "Failed to create player", error: error };
    }

  })
  .get("/players/get/:id", async ({ params }: { params: { id: string } }) => {
    const { id } = params;

    // Get player from the database
    try {
      const player = await db.select()
        .from(players).where(eq(players.id, parseInt(id)));

      return { success: true, player: player[0], message: "Player fetched successfully" };
    } catch (error) {
      return { success: false, message: "Failed to get player", error: error };
    }

  })
  .post("/players/update/:id", async ({ params, body }: { params: { id: string }, body: Player }) => {
    const { id } = params;
    const { firstName, lastName, weight, hairColor, eyesColor, hairStyle } = body;

    try {
      const player = await db.update(players).set({ firstName, lastName, weight, hairColor, eyesColor, hairStyle }).where(eq(players.id, parseInt(id)));
      return { success: true, player, message: "Player updated successfully" };
    } catch (error) {
      return { success: false, message: "Failed to update player", error: error };
    }

  })

