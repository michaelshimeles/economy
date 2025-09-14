import { Elysia } from "elysia";
import { getCurrentPolicy, updatePolicy } from "./service";
import { governmentPolicies } from "../../db/schema";

export const government = new Elysia({ prefix: "/government" })
  .get("/policy", async () => {
    return getCurrentPolicy();
  })
  .post("/policy/update", async ({ body }: { body: Partial<typeof governmentPolicies.$inferInsert> }) => {
    return updatePolicy(body); // expects partial policy fields
  })