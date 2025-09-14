import { eq, desc, and } from "drizzle-orm";
import db from "../../db/db";
import { jobs, players, governmentPolicies, bankAccounts, governments } from "../../db/schema";
import { logTransaction } from "../economy/service";

export const createJob = async (name: string, salary: number) => {
    try {
        const [job] = await db.insert(jobs).values({ name, salary }).returning();
        return { success: true, job, message: "Job created" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

// Assign job to a player
export const assignJob = async (playerId: string, jobId: number) => {
    try {
        const [updatedPlayer] = await db
            .update(players)
            .set({ jobId })
            .where(eq(players.playerId, playerId))
            .returning();

        return { success: true, player: updatedPlayer, message: "Job assigned" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};


export const paySalary = async (playerId: string) => {
    try {
        const [player] = await db.select().from(players).where(eq(players.playerId, playerId));
        if (!player) return { success: false, message: "Player not found" };

        const [job] = await db.select().from(jobs).where(eq(jobs.id, player.jobId));
        if (!job) return { success: false, message: "Job not found" };

        const [policy] = await db
            .select()
            .from(governmentPolicies)
            .orderBy(desc(governmentPolicies.id)) // latest policy
            .limit(1);

        if (!policy) return { success: false, message: "Government policy not found" };

        const incomeTaxRate = policy.incomeTaxRate ?? 0;
        const taxAmount = Math.floor((job.salary * incomeTaxRate) / 100);
        const netSalary = job.salary - taxAmount;

        const [gov] = await db.select().from(governments).limit(1);
        if (!gov) return { success: false, message: "No government treasury found" };

        const [playerAccount] = await db
            .select()
            .from(bankAccounts)
            .where(and(eq(bankAccounts.ownerId, playerId), eq(bankAccounts.subType, "chequing")))
            .limit(1);

        if (!playerAccount) return { success: false, message: "Player chequing account not found" };

        const [govAccount] = await db
            .select()
            .from(bankAccounts)
            .where(eq(bankAccounts.id, gov.accountId as string))
            .limit(1);

        if (!govAccount) return { success: false, message: "Government account not found" };

        // Transfer funds atomically
        const result = await db.transaction(async (tx) => {
            // Deposit net salary to player
            const [updatedPlayerAccount] = await tx
                .update(bankAccounts)
                .set({ balance: playerAccount.balance + netSalary })
                .where(eq(bankAccounts.id, playerAccount.id))
                .returning();

            await logTransaction(tx, playerId, playerAccount.id, netSalary, "deposit", "paycheck");

            // Deposit tax to government treasury
            const [updatedGovAccount] = await tx
                .update(bankAccounts)
                .set({ balance: govAccount.balance + taxAmount })
                .where(eq(bankAccounts.id, govAccount.id))
                .returning();

            await logTransaction(tx, "government", govAccount.id, taxAmount, "deposit", "income_tax");

            return { playerAccount: updatedPlayerAccount, govAccount: updatedGovAccount };
        });

        return {
            success: true,
            ...result,
            message: `Salary paid: $${job.salary} (Net: $${netSalary}, Tax: $${taxAmount})`,
        };
    } catch (error: any) {
        console.error("Failed to pay salary", error);
        return { success: false, message: error.message || "Failed to pay salary" };
    }
};