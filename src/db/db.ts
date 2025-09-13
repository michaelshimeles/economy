import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL as string);
const db = drizzle(sql);

export default db;