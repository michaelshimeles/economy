import db from "../../db/db";
import { bankAccounts, governmentPolicies, governments, players } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import { logTransaction } from "../economy/service";

// ✅ Get current government economic policy (latest one)
export const getCurrentPolicy = async () => {
    try {
        const [policy] = await db
            .select()
            .from(governmentPolicies)
            .orderBy(desc(governmentPolicies.id)) // latest
            .limit(1);

        if (!policy)
            return { success: false, message: "No government policy found" };

        return { success: true, policy, message: "Current policy fetched" };
    } catch (error: any) {
        console.error("Failed to fetch policy", error);
        return { success: false, message: error.message ?? "Failed to fetch policy" };
    }
};

// ✅ Update government policy (always creates a new row = versioned history)
export const updatePolicy = async (updates: Partial<typeof governmentPolicies.$inferInsert>) => {
    try {
        const [newPolicy] = await db
            .insert(governmentPolicies)
            .values(updates)
            .returning();

        return { success: true, policy: newPolicy, message: "Policy updated" };
    } catch (error: any) {
        console.error("Failed to update policy", error);
        return { success: false, message: error.message ?? "Failed to update policy" };
    }
};


/**
 * Get the government's treasury account
 */
export const getGovernmentAccount = async () => {
    const [gov] = await db.select().from(governments).limit(1);

    if (!gov) return { success: false, message: "Government entity not found" };

    const [account] = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, gov.accountId as string));

    if (!account)
        return { success: false, message: "Government bank account missing" };

    return { success: true, account, message: "Government account fetched" };
};

/**
 * Apply savings interest to all active savings accounts.
 * Uses governmentPolicies.savingsAPR (annual), applied monthly.
 */
export const applySavingsInterest = async () => {
  try {
    // 1. get current economic policy
    const [policy] = await db
      .select()
      .from(governmentPolicies)
      .orderBy(desc(governmentPolicies.id))
      .limit(1);

    if (!policy) return { success: false, message: "No government policy found" };

    const apr = policy.savingsAPR ?? 0;
    if (apr <= 0) {
      return { success: false, message: "No positive APR set for savings" };
    }

    const monthlyRate = apr / 100 / 12;

    // 2. fetch all savings accounts
    const savingsAccounts = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.subType, "savings"));

    // 3. apply interest
    for (const acct of savingsAccounts) {
      if (acct.balance > 0 && acct.isActive) {
        const interest = Math.floor(acct.balance * monthlyRate);

        if (interest > 0) {
          await db.transaction(async (tx) => {
            const [updated] = await tx
              .update(bankAccounts)
              .set({ balance: acct.balance + interest })
              .where(eq(bankAccounts.id, acct.id))
              .returning();

            await logTransaction(
              tx,
              acct.ownerId,
              acct.id,
              interest,
              "deposit",
              "savings_interest"
            );

            return updated;
          });
        }
      }
    }

    return { success: true, message: "Savings interest applied" };
  } catch (error: any) {
    console.error("Interest accrual failed", error);
    return { success: false, message: error.message || "Interest accrual failed" };
  }
};