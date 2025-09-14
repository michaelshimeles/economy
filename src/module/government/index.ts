import { Elysia } from "elysia";
import { applySavingsInterest, getCurrentPolicy, updatePolicy } from "./service";
import { governmentPolicies } from "../../db/schema";
import { jwtAuth } from "../../middleware/auth";

export const government = new Elysia({ prefix: "/government" })
    .get("/policy", async () => {
        return getCurrentPolicy();
    })
    // Protected: require admin auth
    .use(jwtAuth("admin"))
    .post("/policy/update", async ({ body }: { body: Partial<typeof governmentPolicies.$inferInsert> }) => {
        return updatePolicy(body); // expects partial policy fields
    })
    .post("/apply-interest", async () => {
        return applySavingsInterest();
    })
