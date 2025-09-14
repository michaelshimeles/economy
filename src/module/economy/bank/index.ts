// src/modules/bank/index.ts
import { Elysia } from "elysia";
import { getAccountsByOwner, getAccountById } from "./service";
import { deposit, withdraw, transfer } from "../service";

export const bankRoutes = new Elysia({ prefix: "/bank" })
    // Get all accounts for a player
    .get("/accounts/:playerId", async ({ params }) => {
        return getAccountsByOwner(params.playerId);
    })

    // Get single account by ID
    .get("/account/:accountId", async ({ params }) => {
        return getAccountById(params.accountId);
    })

    // Deposit: cash -> bank account
    .post("/deposit", async ({ body }) => {
        const { playerId, accountId, amount } = body as {
            playerId: string;
            accountId: string;
            amount: number;
        };
        return deposit(playerId, accountId, amount);
    })

    // Withdraw: bank -> cash
    .post("/withdraw", async ({ body }) => {
        const { playerId, accountId, amount } = body as {
            playerId: string;
            accountId: string;
            amount: number;
        };
        return withdraw(playerId, accountId, amount);
    })

    // Transfer: bank -> bank
    .post("/transfer", async ({ body }) => {
        const { fromId, toId, amount, playerId } = body as {
            fromId: string;
            toId: string;
            amount: number;
            playerId: string;
        };
        return transfer(fromId, toId, amount, playerId);
    });