import React, { useState } from 'react';
import './DataViewer.scss';

//  Single table preview 
function TablePreview({ tableName, preview }) {
  const [expanded, setExpanded] = useState(true);

  if (preview.error) {
    return (
      <div className="table-preview table-preview--error">
        <div className="table-preview__header">
          <span className="table-preview__name">{tableName}</span>
          <span className="table-preview__error-tag">unavailable</span>
        </div>
        <p className="table-preview__error-msg">{preview.error}</p>
      </div>
    );
  }

  const columns = preview.columns || [];
  const rows = preview.rows || [];

  return (
    <div className={`table-preview ${expanded ? 'table-preview--expanded' : ''}`}>
      {/* Header */}
      <button
        className="table-preview__header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="table-preview__name">
          <span className="table-preview__icon" aria-hidden="true">⬡</span>
          {tableName}
        </span>
        <span className="table-preview__meta">
          {columns.length} col{columns.length !== 1 ? 's' : ''}
          {' · '}
          {preview.rowCount || rows.length} rows (sample)
        </span>
        <span className={`table-preview__chevron ${expanded ? 'table-preview__chevron--up' : ''}`}>
          ▾
        </span>
      </button>

      {/* Schema */}
      {expanded && (
        <div className="table-preview__body">
          {/* Column list */}
          <div className="table-preview__schema">
            {columns.map((col) => (
              <div key={col.column_name} className="table-preview__col">
                <span className="table-preview__col-name">{col.column_name}</span>
                <span className="table-preview__col-type">{col.data_type}</span>
                {col.is_nullable === 'NO' && (
                  <span className="table-preview__col-flag">NOT NULL</span>
                )}
              </div>
            ))}
          </div>

          {/* Sample rows */}
          {rows.length > 0 && (
            <div className="table-preview__rows-wrap">
              <table className="table-preview__table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.column_name}>{col.column_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td key={col.column_name}>
                          {row[col.column_name] === null ? (
                            <span className="table-preview__null">NULL</span>
                          ) : (
                            String(row[col.column_name])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

//  Main DataViewer 
export default function DataViewer({ tablePreviews }) {
  if (!tablePreviews || Object.keys(tablePreviews).length === 0) {
    return (
      <div className="data-viewer data-viewer--empty">
        <p>No table data available.</p>
      </div>
    );
  }

  return (
    <div className="data-viewer">
      {Object.entries(tablePreviews).map(([tableName, preview]) => (
        <TablePreview key={tableName} tableName={tableName} preview={preview} />
      ))}
    </div>
  );
}