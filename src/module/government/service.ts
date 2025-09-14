import db from "../../db/db";
import { bankAccounts, governmentPolicies, governments, players } from "../../db/schema";
import { desc, eq } from "drizzle-orm";

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
 * Ensure gov account exists (bootstrap at server start)
 */
export const ensureGovernmentAccount         = async () => {
    let [gov] = await db.select().from(governments).limit(1);

    if (!gov) {
        // create a business chequing account for govt treasury
        // First create a special government "player" entity
        const [govPlayer] = await db
            .insert(players)
            .values({
                playerId: "00000000-0000-0000-0000-000000000001", // Fixed UUID for government
                firstName: "Government",
                lastName: "Entity",
                weight: 0,
                height: 0,
                hairColor: "N/A",
                eyesColor: "N/A", 
                hairStyle: "N/A",
                skinColor: "N/A",
                sex: "N/A",
                birthDate: new Date(),
                jobId: 0,
                cash: 0,
                bank: 0,
            })
            .returning();

        const [account] = await db
            .insert(bankAccounts)
            .values({
                ownerId: govPlayer.playerId,
                type: "business",
                subType: "chequing",
                balance: 1000000, // Start with 1M treasury
                isActive: true,
            })
            .returning();

        [gov] = await db
            .insert(governments)
            .values({ name: "Los Santos Government", accountId: account.id })
            .returning();
    }

    return gov;
};