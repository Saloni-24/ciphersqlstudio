const { Pool } = require('pg');

// Single shared connection pool for the sandbox database
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'ciphersql_sandbox',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'SALONIDUGGAL',
  max: parseInt(process.env.PG_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

/**
 * Execute a query with optional parameters.
 * Uses statement_timeout to prevent runaway queries.
 */
async function executeQuery(sql, params = []) {
  const client = await pool.connect();
  const timeoutMs = parseInt(process.env.QUERY_TIMEOUT_MS) || 5000;

  try {
    // Enforce per-query timeout at the PostgreSQL level
    await client.query(`SET statement_timeout = ${timeoutMs}`);
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Fetch schema + sample rows for a list of table names.
 * Used by the Sample Data Viewer panel.
 */
async function getTablePreviews(tableNames) {
  const previews = {};

  for (const tableName of tableNames) {
    // Validate table name to prevent injection (only alphanumeric + underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) continue;

    const client = await pool.connect();
    try {
      // Column schema
      const schemaResult = await client.query(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );

      // Sample rows (capped at 10)
      const rowsResult = await client.query(
        `SELECT * FROM "${tableName}" LIMIT 10`
      );

      previews[tableName] = {
        columns: schemaResult.rows,
        rows: rowsResult.rows,
        rowCount: rowsResult.rowCount,
      };
    } catch (err) {
      previews[tableName] = { error: err.message };
    } finally {
      client.release();
    }
  }

  return previews;
}

module.exports = { pool, executeQuery, getTablePreviews };