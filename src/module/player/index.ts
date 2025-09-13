import { eq } from "drizzle-orm";
import type { Static } from "elysia";
import { Elysia } from "elysia";
import db from "../../db/db";
import { players } from "../../db/schema";
import { PlayerModel } from "./model";
import { createPlayer, getAllPlayers, getPlayer, updatePlayer } from "./service";

type Player = Static<typeof PlayerModel.Player>

export const player = new Elysia()
  .get("/", () => "GTA RP Economy")
  .get("/players", async () => {
    try {
      const allPlayers = await getAllPlayers();
      return allPlayers;
    } catch (error) {
      return error;
    }
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

      const player = await createPlayer({
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
      });

      return player;
    } catch (error) {
      console.error("Failed to create player", error);
      return error;
    }

  })
  .get("/players/get/:id", async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    // Get player from the database
    try {
      const player = await getPlayer(id);
      return player;
    } catch (error) {
      return error;
    }

  })
  .post("/players/update/:id", async ({ params, body }: { params: { id: string }, body: Player }) => {
    const { id } = params;
    const { firstName, lastName, weight, hairColor, eyesColor, hairStyle, skinColor, sex, birthDate, jobId, cash, bank } = body;

    const parsedBirthDate = new Date(birthDate as unknown as string);
    if (Number.isNaN(parsedBirthDate.valueOf())) {
      return { success: false, message: "Invalid birthDate. Use ISO string (e.g. 1990-05-15) or epoch ms." };
    }

    try {
      const player = await updatePlayer(id, { firstName, lastName, weight, hairColor, eyesColor, hairStyle, skinColor, sex, birthDate: parsedBirthDate, jobId, cash, bank });
      return player
    } catch (error) {
      return error;
    }
  })

