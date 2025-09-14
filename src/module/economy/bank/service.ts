import { eq } from "drizzle-orm";
import db from "../../../db/db";
import { bankAccounts, governmentPolicies, players } from "../../../db/schema";

type AccountType = "personal" | "business";
type AccountSubType = "chequing" | "savings" | "investing";

export const createBankAccount = async (ownerId: string, type: AccountType = "personal") => {
    try {
        if (ownerId == null) {
            return { success: false, message: "Owner ID is required" };
        }

        // Ensure player exists for personal accounts
        if (type === "personal") {
            const [owner] = await db
                .select()
                .from(players)
                .where(eq(players.playerId, ownerId));

            if (!owner) return { success: false, message: "Owner not found" };
        }

        // fetch govt economic policy (the levers)
        const [policy] = await db.select().from(governmentPolicies).limit(1);

        if (!policy) return { success: false, message: "Government policy is missing" };

        const accountsToCreate: { subType: AccountSubType; apr: number; isActive: boolean }[] = [
            { subType: "chequing", apr: 0, isActive: true },
            { subType: "savings", apr: policy.savingsAPR ?? 0, isActive: true },
            { subType: "investing", apr: 0, isActive: policy.isInvestingEnabled ?? false },
        ];

        const createdAccounts = [];

        for (const def of accountsToCreate) {
            const [account] = await db
                .insert(bankAccounts)
                .values({
                    ownerId,
                    type,
                    subType: def.subType,
                    balance: 0,
                    apr: def.apr,
                    isActive: def.isActive,
                })
                .returning();
            createdAccounts.push(account);
        }

        return {
            success: true,
            accounts: createdAccounts,
            message: `${type} accounts created for ${ownerId}`,
        };



    } catch (error) {
        console.error("Failed to create bank account", error);
        return { success: false, message: "Failed to create bank account", details: (error as Error).message };
    }
}

/**
 * Get all accounts for a given owner
 */
export const getAccountsByOwner = async (ownerId: string) => {
    try {
        const accounts = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.ownerId, ownerId));

        return { success: true, accounts, message: "Accounts fetched" };
    } catch (error) {
        console.error("Failed to fetch accounts", error);
        return {
            success: false,
            message: "Failed to fetch accounts",
            details: (error as Error).message
        };
    }
};

/**
 * Get single account by id
 */
export const getAccountById = async (accountId: string) => {
    try {
        const [account] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, accountId));

        if (!account) return { success: false, message: "Account not found" };
        return { success: true, account, message: "Account fetched" };
    } catch (error) {
        console.error("Failed to fetch account", error);
        return {
            success: false,
            message: "Failed to fetch account",
            details: (error as Error).message
        };
    }
};

export const updateBalance = async (accountId: string, delta: number) => {
    try {
        const updatedAccount = await db.transaction(async (tx) => {
            const [account] = await tx
                .select()
                .from(bankAccounts)
                .where(eq(bankAccounts.id, accountId));

            if (!account) throw new Error("Account not found");
            if (account.balance + delta < 0) throw new Error("Insufficient funds");

            const [updated] = await tx
                .update(bankAccounts)
                .set({ balance: account.balance + delta })
                .where(eq(bankAccounts.id, accountId))
                .returning();

            return updated;
        });

        return { success: true, account: updatedAccount, message: "Balance updated" };
    } catch (error: any) {
        console.error("Failed to update balance", error);
        return {
            success: false,
            message: "Failed to update balance",
            details: (error as Error).message
        };
    }
};
