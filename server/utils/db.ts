import { Pool } from 'pg'

let pool: Pool | null = null

function getPool() {
  if (pool) return pool
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  pool = new Pool({
    connectionString: url,
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  })
  return pool
}

export async function query(text: string, params?: any[]) {
  const p = getPool()
  const client = await p.connect()
  try { return await client.query(text, params) }
  finally { client.release() }
}
