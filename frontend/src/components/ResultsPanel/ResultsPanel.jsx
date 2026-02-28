import React from 'react';
import './ResultsPanel.scss';

export default function ResultsPanel({ result, isLoading }) {
  // ── Loading state
  if (isLoading) {
    return (
      <div className="results-panel results-panel--loading">
        <div className="spinner" />
        <p>Executing query…</p>
      </div>
    );
  }

  // ── Empty state
  if (!result) {
    return (
      <div className="results-panel results-panel--empty">
        <div className="results-panel__empty-icon" aria-hidden="true">⬡</div>
        <p className="results-panel__empty-text">
          Write a SQL query and press <strong>Run Query</strong> to see results.
        </p>
      </div>
    );
  }

  // ── Error state
  if (!result.success) {
    return (
      <div className="results-panel results-panel--error">
        <div className="results-panel__error-header">
          <span className="results-panel__error-badge">ERROR</span>
        </div>
        <pre className="results-panel__error-message">{result.error}</pre>
      </div>
    );
  }

  // ── Empty result set
  if (!result.rows || result.rows.length === 0) {
    return (
      <div className="results-panel results-panel--no-rows">
        <span className="results-panel__check" aria-label="Query succeeded">✓</span>
        <p>Query executed successfully — no rows returned.</p>
      </div>
    );
  }

  const columns = result.fields
    ? result.fields.map((f) => f.name)
    : Object.keys(result.rows[0]);

  return (
    <div className="results-panel results-panel--success">
      {/* Meta bar */}
      <div className="results-panel__meta">
        <span className="results-panel__meta-item results-panel__meta-item--success">
          ✓ {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} returned
        </span>
        {result.truncated && (
          <span className="results-panel__meta-item results-panel__meta-item--warn">
            ⚠ Showing first {result.truncatedAt} rows
          </span>
        )}
      </div>

      {/* Table */}
      <div className="results-panel__table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="results-table__th">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i} className="results-table__row">
                {columns.map((col) => (
                  <td key={col} className="results-table__td">
                    {row[col] === null ? (
                      <span className="results-table__null">NULL</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}