// src/modules/transactions/index.ts
import { Elysia } from "elysia";
import {
    getTransactionsByPlayer,
    getTransactionsByAccount,
    getTransactionById,
} from "./service";

export const transactionRoutes = new Elysia({ prefix: "/transactions" })
    // Get all transactions for a player
    .get("/player/:playerId", async ({ params, query }) => {
        // optional ?limit=50
        const limit = query.limit ? parseInt(query.limit as string, 10) : 50;
        return getTransactionsByPlayer(params.playerId, limit);
    })

    // Get all transactions for an account
    .get("/account/:accountId", async ({ params, query }) => {
        const limit = query.limit ? parseInt(query.limit as string, 10) : 50;
        return getTransactionsByAccount(params.accountId, limit);
    })

    // Get single transaction by id
    .get("/:id", async ({ params }) => {
        return getTransactionById(params.id);
    });