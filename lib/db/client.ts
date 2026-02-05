import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as catalogSchema from './schemas/catalog';
import * as commerceSchema from './schemas/commerce';
import * as authSchema from './schemas/auth';

const schema = { ...catalogSchema, ...commerceSchema, ...authSchema };

export const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });
