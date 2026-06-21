import { Pool } from '@neondatabase/serverless';

// Create Neon Pool clients (pg-compatible)
const myNeutronPool = new Pool({ connectionString: process.env.MYNEUTRON_DATABASE_URL });
const apiPool = new Pool({ connectionString: process.env.API_DATABASE_URL });

// Helper to query myNeutron database
export async function queryMyNeutron<T>(query: string, params?: any[]): Promise<T[]> {
  const result = await myNeutronPool.query(query, params);
  return result.rows as T[];
}

// Helper to query API database
export async function queryApi<T>(query: string, params?: any[]): Promise<T[]> {
  const result = await apiPool.query(query, params);
  return result.rows as T[];
}
