import { Elysia } from "elysia";

type Player = {
  firstName: string;
  lastName: string;
  weight: number;
  height: number;
  hairColor: string;
  eyesColor: string;
  hairStyle: string;
  skinColor: string;
  sex: string;
  birthDate: string;
  jobId: number;
  cash: number;
  bank: number;
};

const app = new Elysia()
  .get("/", () => "GTA RP Economy")
  .post("/players/create", ({ body }: { body: Player }) => {
    const { firstName, lastName, weight, height, hairColor, eyesColor, hairStyle, skinColor, sex, birthDate, jobId, cash, bank } = body;

    // Validate the player
    if (!firstName || !lastName || !weight || !height || !hairColor || !eyesColor || !hairStyle || !skinColor || !sex || !birthDate || !jobId || !cash || !bank) {
      return { error: "Invalid player data" };
    }

    // Create a new player id 
    const playerId = crypto.randomUUID();

    // Create player in the database

  })
  .get("/players/get/:id", ({params}: {params: {id: string}}) => {
    const { id } = params;

    // Get player from the database

  })
  .post("/players/update/:id", ({params, body}: {params: {id: string}, body: Player}) => {
    const { id } = params;

  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
