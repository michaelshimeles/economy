import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
    id: serial("id").primaryKey(),
    playerId: varchar("player_id", { length: 255 }).notNull(),
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
    id: serial("id").primaryKey(),
    playerId: integer("player_id").notNull(),
    amount: integer("amount").notNull(),
    type: varchar("type", { length: 50 }).notNull(), // deposit, withdraw, transfer, paycheck
    metadata: varchar("metadata", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});