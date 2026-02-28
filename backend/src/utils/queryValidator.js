const FORBIDDEN_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER',
  'CREATE', 'REPLACE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE',
  'CALL', 'DO', 'COPY', 'VACUUM', 'REINDEX', 'CLUSTER',
  'COMMENT', 'SECURITY', 'LOCK', 'UNLISTEN', 'NOTIFY', 'LISTEN',
  'SET', 'RESET', 'SHOW',
];

const MAX_QUERY_LENGTH = 2000;

function normalise(sql) {
  return sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function validateQuery(sql) {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, reason: 'Query must be a non-empty string.' };
  }
  if (sql.trim().length === 0) {
    return { valid: false, reason: 'Query cannot be empty.' };
  }
  if (sql.length > MAX_QUERY_LENGTH) {
    return { valid: false, reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters.` };
  }
  const normalised = normalise(sql);
  if (!normalised.startsWith('SELECT') && !normalised.startsWith('WITH')) {
    return { valid: false, reason: 'Only SELECT queries are allowed.' };
  }
  for (const keyword of FORBIDDEN_KEYWORDS) {
    const pattern = new RegExp(`(?<![A-Z0-9_])${keyword}(?![A-Z0-9_])`);
    if (pattern.test(normalised)) {
      return { valid: false, reason: `Forbidden keyword detected: "${keyword}".` };
    }
  }
  const withoutTrailing = sql.trimEnd().replace(/;$/, '');
  if (withoutTrailing.includes(';')) {
    return { valid: false, reason: 'Multiple statements are not allowed.' };
  }
  return { valid: true };
}

module.exports = { validateQuery };