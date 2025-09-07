import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    cash: integer("cash").default(500).notNull(),
    bank: integer("bank").default(1000).notNull(),
    jobId: integer("job_id"),
});

export const jobs = pgTable("jobs", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    salary: integer("salary").notNull(),
});

export const transactions = pgTable("transactions", {
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull(),
    amount: integer("amount").notNull(),
    type: varchar("type", { length: 50 }).notNull(), // deposit, withdraw, transfer, paycheck
    metadata: varchar("metadata", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});