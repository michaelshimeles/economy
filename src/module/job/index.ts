import { Elysia } from "elysia";
import { createJob, assignJob, paySalary } from "./service";

export const jobs = new Elysia({ prefix: "/jobs" })
    .post("/create", async ({ body }: { body: { name: string, salary: number } }) => createJob(body.name, body.salary))
    .post("/assign", async ({ body }: { body: { playerId: string, jobId: number } }) => assignJob(body.playerId, body.jobId))
    .post("/pay", async ({ body }: { body: { playerId: string } }) => paySalary(body.playerId));