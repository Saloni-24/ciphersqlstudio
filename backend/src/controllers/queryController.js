const { executeQuery } = require('../db/postgres');
const { validateQuery } = require('../utils/queryValidator');
const { Attempt } = require('../db/mongodb');

const MAX_ROWS = parseInt(process.env.MAX_RESULT_ROWS) || 500;

/**
 * POST /api/query/execute
 * Body: { sql, assignmentId, sessionId? }
 *
 * 1. Validate + sanitise the SQL
 * 2. Execute against the PostgreSQL sandbox
 * 3. Return rows / error
 * 4. Optionally persist the attempt
 */
async function executeQuery_handler(req, res, next) {
  const { sql, assignmentId, sessionId } = req.body;

  // ── Validate input ──────────────────────────────────────────────────────────
  if (!sql) {
    return res.status(400).json({ success: false, error: 'sql field is required.' });
  }

  const validation = validateQuery(sql);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.reason });
  }

  // ── Execute ─────────────────────────────────────────────────────────────────
  let pgResult;
  let executionError = null;

  try {
    pgResult = await executeQuery(sql);
  } catch (err) {
    executionError = err;
  }

  // ── Persist attempt (best-effort, non-blocking) ─────────────────────────────
  if (assignmentId && sessionId) {
    Attempt.create({
      assignmentId,
      sessionId,
      sql,
      success: !executionError,
      errorMessage: executionError ? executionError.message : undefined,
      rowCount: pgResult ? pgResult.rowCount : 0,
    }).catch(() => {}); // fire-and-forget
  }

  // ── Respond ─────────────────────────────────────────────────────────────────
  if (executionError) {
    // Surface a clean error message to the student — useful for learning
    const message = executionError.message || 'Query execution failed.';

    // Strip internal details like "at character 12"
    const clean = message
      .replace(/\s+at character \d+/g, '')
      .replace(/ERROR:\s+/i, '')
      .trim();

    return res.status(200).json({
      success: false,
      error: clean,
    });
  }

  const rows = pgResult.rows.slice(0, MAX_ROWS);
  const truncated = pgResult.rows.length > MAX_ROWS;

  res.json({
    success: true,
    rows,
    rowCount: pgResult.rowCount,
    fields: pgResult.fields.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
    truncated,
    truncatedAt: truncated ? MAX_ROWS : null,
  });
}

module.exports = { executeQuery: executeQuery_handler };