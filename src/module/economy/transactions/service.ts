import { desc, eq } from "drizzle-orm";
import db from "../../../db/db";
import { transactions } from "../../../db/schema";

export const getTransactionsByPlayer = async (
  playerId: string,
  limit = 50 // default pagination
) => {
  try {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.playerId, playerId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return {
      success: true,
      transactions: txs,
      message: txs.length ? "Transactions fetched" : "No transactions found"
    };
  } catch (error) {
    console.error("Failed to get transactions by player", error);
    return {
      success: false,
      message: "Failed to get transactions",
      details: (error as Error).message
    };
  }
};

export const getTransactionsByAccount = async (accountId: string, limit = 50) => {
  try {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    return {
      success: true,
      transactions: txs,
      message: txs.length ? "Transactions fetched" : "No transactions found"
    };
  } catch (error) {
    console.error("Failed to get transactions by account", error);
    return {
      success: false,
      message: "Failed to get transactions",
      details: (error as Error).message
    };
  }
};

// Optional: Admin/audit tool
export const getTransactionById = async (id: string) => {
  try {
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!tx) return { success: false, message: "Transaction not found" };

    return { success: true, transaction: tx, message: "Transaction fetched" };
  } catch (error) {
    console.error("Failed to get transaction by id", error);
    return {
      success: false,
      message: "Failed to get transaction",
      details: (error as Error).message
    };
  }
};