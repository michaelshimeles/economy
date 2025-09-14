import type { Static } from "elysia";
import { Elysia } from "elysia";
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
    try {
      const player = await createPlayer(body);

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

    try {
      const player = await updatePlayer(id, body);
      return player
    } catch (error) {
      return error;
    }
  })

