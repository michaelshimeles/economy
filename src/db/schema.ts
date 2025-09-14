import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { uuid, json } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
    id: uuid("id").defaultRandom().primaryKey(),
    playerId: uuid("player_id").defaultRandom().notNull().unique(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    weight: integer("weight").notNull(),
    height: integer("height").notNull(),
    hairColor: varchar("hair_color", { length: 255 }).notNull(),
    eyesColor: varchar("eyes_color", { length: 255 }).notNull(),
    hairStyle: varchar("hair_style", { length: 255 }).notNull(),
    skinColor: varchar("skin_color", { length: 255 }).notNull(),
    sex: varchar("sex", { length: 255 }).notNull(),
    birthDate: timestamp("birth_date").notNull(),
    jobId: integer("job_id").notNull(),
    cash: integer("cash").default(500).notNull(),
    bank: integer("bank").default(1000).notNull(),
});

export const jobs = pgTable("jobs", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    salary: integer("salary").notNull(),
});

export const transactions = pgTable("transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    playerId: uuid("player_id").notNull().references(() => players.playerId),
    accountId: uuid("account_id").references(() => bankAccounts.id),
    amount: integer("amount").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow()
});


// 💡 Note:
// Sub-type handling could be enforced with enums if you want stronger guarantees.
// e.g. "chequing", "savings", "investing"
export const bankAccounts = pgTable("bank_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    // Who owns the account (can be player or later a business entity)
    ownerId: uuid("owner_id")
        .notNull()
        .references(() => players.playerId),
    // High-level classification
    type: varchar("type", { length: 20 }).notNull(),
    // "personal" or "business"
    // Sub-type of the account
    subType: varchar("sub_type", { length: 20 }).notNull(),
    // "chequing" | "savings" | "investing"
    balance: integer("balance").default(0).notNull(),
    // If it's "savings", apply APR yield automatically. If investing (future), maybe hold locked assets.
    apr: integer("apr").default(0).notNull(), // e.g., 2 means 2% yearly APR
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const governments = pgTable("governments", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).default("Los Santos Government"),
    accountId: uuid("account_id").references(() => bankAccounts.id),
});


export const governmentPolicies = pgTable("government_policies", {
    id: serial("id").primaryKey(),

    // Economic levers
    savingsAPR: integer("savings_apr").default(2), // percent
    incomeTaxRate: integer("income_tax_rate").default(10), // percent
    salesTaxRate: integer("sales_tax_rate").default(8), // percent
    businessTaxRate: integer("business_tax_rate").default(15), // percent

    investingLockupMonths: integer("investing_lockup_months").default(12), // how long money is locked
    isInvestingEnabled: boolean("is_investing_enabled").default(false),
});