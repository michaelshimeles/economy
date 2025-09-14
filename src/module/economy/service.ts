import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { PgTransaction } from "drizzle-orm/pg-core";
import db from "../../db/db";
import { bankAccounts, players, transactions } from "../../db/schema";


type TransactionType = "deposit" | "withdraw" | "transfer";

// Let tx be either a transaction OR the db object
type DBClient = NeonHttpDatabase<Record<string, never>> | PgTransaction<any, any, any>;

export const logTransaction = async (
  tx: DBClient,
  playerId: string,
  accountId: string | null,
  amount: number,
  type: TransactionType,
  metadata?: string
) => {
  await tx.insert(transactions).values({
    playerId,
    accountId,
    amount,
    type,
    metadata,
  });
};
// 💵 Deposit: cash -> bank account
export const deposit = async (
    playerId: string,
    accountId: string,
    amount: number
) => {
    try {
        const [player] = await db
            .select()
            .from(players)
            .where(eq(players.playerId, playerId));

        if (!player) return { success: false, message: "Player not found" };
        if (player.cash < amount)
            return { success: false, message: "Not enough cash" };

        const result = await db.transaction(async (tx) => {
            // 1. Decrease cash
            const [updatedPlayer] = await tx
                .update(players)
                .set({ cash: player.cash - amount })
                .where(eq(players.playerId, playerId))
                .returning();

            // 2. Increase bank account balance
            const [account] = await tx
                .select()
                .from(bankAccounts)
                .where(eq(bankAccounts.id, accountId));
            if (!account) throw new Error("Bank account not found");

            const [updatedBank] = await tx
                .update(bankAccounts)
                .set({ balance: account.balance + amount })
                .where(eq(bankAccounts.id, accountId))
                .returning();

            // 3. Log transaction
            await logTransaction(tx, playerId, accountId, amount, "deposit");

            return { player: updatedPlayer, account: updatedBank };
        });

        return { success: true, ...result, message: "Deposit successful" };
    } catch (error: any) {
        console.error("Deposit failed", error);
        return { success: false, message: error.message || "Deposit failed" };
    }
};

// 💸 Withdraw: bank account -> cash
export const withdraw = async (
    playerId: string,
    accountId: string,
    amount: number
) => {
    try {
        const [player] = await db
            .select()
            .from(players)
            .where(eq(players.playerId, playerId));

        if (!player) return { success: false, message: "Player not found" };

        const result = await db.transaction(async (tx) => {
            // 1. Fetch bank account
            const [account] = await tx
                .select()
                .from(bankAccounts)
                .where(eq(bankAccounts.id, accountId));

            if (!account) throw new Error("Account not found");
            if (account.balance < amount)
                throw new Error("Insufficient account balance");

            // 2. Decrease account balance
            const [updatedBank] = await tx
                .update(bankAccounts)
                .set({ balance: account.balance - amount })
                .where(eq(bankAccounts.id, accountId))
                .returning();

            // 3. Increase player cash
            const [updatedPlayer] = await tx
                .update(players)
                .set({ cash: player.cash + amount })
                .where(eq(players.playerId, playerId))
                .returning();

            // 4. Log transaction
            await logTransaction(tx, playerId, accountId, amount, "withdraw");

            return { player: updatedPlayer, account: updatedBank };
        });

        return { success: true, ...result, message: "Withdrawal successful" };
    } catch (error: any) {
        console.error("Withdraw failed", error);
        return { success: false, message: error.message || "Withdraw failed" };
    }
};

// 🔀 Transfer: between two bank accounts
export const transfer = async (
    fromId: string,
    toId: string,
    amount: number,
    playerId: string // initiator of transfer
) => {
    try {
        const result = await db.transaction(async (tx) => {
            // 1. Fetch accounts
            const [fromAccount] = await tx
                .select()
                .from(bankAccounts)
                .where(eq(bankAccounts.id, fromId));
            const [toAccount] = await tx
                .select()
                .from(bankAccounts)
                .where(eq(bankAccounts.id, toId));

            if (!fromAccount || !toAccount)
                throw new Error("One or both accounts not found");
            if (fromAccount.balance < amount)
                throw new Error("Insufficient funds in source account");

            // 2. Deduct from source
            const [updatedFrom] = await tx
                .update(bankAccounts)
                .set({ balance: fromAccount.balance - amount })
                .where(eq(bankAccounts.id, fromId))
                .returning();

            // 3. Credit destination
            const [updatedTo] = await tx
                .update(bankAccounts)
                .set({ balance: toAccount.balance + amount })
                .where(eq(bankAccounts.id, toId))
                .returning();

            // 4. Log both sides w/ helper
            await logTransaction(
                tx,
                playerId,
                fromId,
                -amount,
                "transfer",
                `to:${toId}`
            );
            await logTransaction(
                tx,
                playerId,
                toId,
                amount,
                "transfer",
                `from:${fromId}`
            );

            return { from: updatedFrom, to: updatedTo };
        });

        return { success: true, ...result, message: "Transfer successful" };
    } catch (error: any) {
        console.error("Transfer failed", error);
        return { success: false, message: error.message || "Transfer failed" };
    }
};