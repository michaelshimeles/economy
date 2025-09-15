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
// 💵 Deposit: cash -> bank account (only for personal accounts)
export const deposit = async (
    playerId: string,
    accountId: string,
    amount: number
) => {
    try {
        // 1. Validate bank account and check if it's personal
        const [account] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, accountId));
        if (!account) return { success: false, message: "Bank account not found" };
        
        if (account.type === "business") {
            return { success: false, message: "Cannot deposit cash to business accounts. Use transfer instead." };
        }

        // 2. Validate player and cash (only for personal accounts)
        const [player] = await db
            .select()
            .from(players)
            .where(eq(players.playerId, playerId));

        if (!player) return { success: false, message: "Player not found" };
        if (player.cash < amount)
            return { success: false, message: "Not enough cash" };

        // 3. Update player cash (decrease)
        const [updatedPlayer] = await db
            .update(players)
            .set({ cash: player.cash - amount })
            .where(eq(players.playerId, playerId))
            .returning();

        // 4. Update bank account balance (increase)
        const [updatedBank] = await db
            .update(bankAccounts)
            .set({ balance: account.balance + amount })
            .where(eq(bankAccounts.id, accountId))
            .returning();

        // 5. Update player's total bank balance (only for personal accounts)
        const playerAccounts = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.ownerId, playerId));
        
        const totalBankBalance = playerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        const [finalPlayer] = await db
            .update(players)
            .set({ bank: totalBankBalance })
            .where(eq(players.playerId, playerId))
            .returning();

        // 6. Log transaction
        await logTransaction(db, playerId, accountId, amount, "deposit");

        return { 
            success: true, 
            player: finalPlayer, 
            account: updatedBank, 
            message: "Deposit successful" 
        };
    } catch (error: any) {
        console.error("Deposit failed", error);
        return { success: false, message: error.message || "Deposit failed" };
    }
};

// 💸 Withdraw: bank account -> cash (only for personal accounts)
export const withdraw = async (
    playerId: string,
    accountId: string,
    amount: number
) => {
    try {
        // 1. Validate bank account and check if it's personal
        const [account] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, accountId));

        if (!account) return { success: false, message: "Account not found" };
        if (account.balance < amount)
            return { success: false, message: "Insufficient account balance" };
            
        if (account.type === "business") {
            return { success: false, message: "Cannot withdraw cash from business accounts. Use transfer instead." };
        }

        // 2. Validate player (only for personal accounts)
        const [player] = await db
            .select()
            .from(players)
            .where(eq(players.playerId, playerId));

        if (!player) return { success: false, message: "Player not found" };

        // 3. Update account balance (decrease)
        const [updatedBank] = await db
            .update(bankAccounts)
            .set({ balance: account.balance - amount })
            .where(eq(bankAccounts.id, accountId))
            .returning();

        // 4. Update player cash (increase) - only for personal accounts
        const [updatedPlayer] = await db
            .update(players)
            .set({ cash: player.cash + amount })
            .where(eq(players.playerId, playerId))
            .returning();

        // 5. Update player's total bank balance (only for personal accounts)
        const playerAccounts = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.ownerId, playerId));
        
        const totalBankBalance = playerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        const [finalPlayer] = await db
            .update(players)
            .set({ bank: totalBankBalance })
            .where(eq(players.playerId, playerId))
            .returning();

        // 6. Log transaction
        await logTransaction(db, playerId, accountId, amount, "withdraw");

        return { 
            success: true, 
            player: finalPlayer, 
            account: updatedBank, 
            message: "Withdrawal successful" 
        };
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
        // 1. Validate both accounts
        const [fromAccount] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, fromId));
        const [toAccount] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, toId));

        if (!fromAccount || !toAccount)
            return { success: false, message: "One or both accounts not found" };
        if (fromAccount.balance < amount)
            return { success: false, message: "Insufficient funds in source account" };

        // 2. Update source account (decrease)
        const [updatedFrom] = await db
            .update(bankAccounts)
            .set({ balance: fromAccount.balance - amount })
            .where(eq(bankAccounts.id, fromId))
            .returning();

        // 3. Update destination account (increase)
        const [updatedTo] = await db
            .update(bankAccounts)
            .set({ balance: toAccount.balance + amount })
            .where(eq(bankAccounts.id, toId))
            .returning();

        // 4. Update both players' total bank balances
        // Update sender's balance
        const fromPlayerAccounts = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.ownerId, fromAccount.ownerId));
        
        const fromTotalBalance = fromPlayerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        await db
            .update(players)
            .set({ bank: fromTotalBalance })
            .where(eq(players.playerId, fromAccount.ownerId));

        // Update receiver's balance
        const toPlayerAccounts = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.ownerId, toAccount.ownerId));
        
        const toTotalBalance = toPlayerAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        await db
            .update(players)
            .set({ bank: toTotalBalance })
            .where(eq(players.playerId, toAccount.ownerId));

        // 5. Log both sides of the transfer
        await logTransaction(
            db,
            playerId,
            fromId,
            -amount,
            "transfer",
            `to:${toId}`
        );
        await logTransaction(
            db,
            playerId,
            toId,
            amount,
            "transfer",
            `from:${fromId}`
        );

        return { 
            success: true, 
            from: updatedFrom, 
            to: updatedTo, 
            message: "Transfer successful" 
        };
    } catch (error: any) {
        console.error("Transfer failed", error);
        return { success: false, message: error.message || "Transfer failed" };
    }
};