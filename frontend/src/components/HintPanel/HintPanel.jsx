import React, { useState } from 'react';
import { getHint } from '../../services/api';
import './HintPanel.scss';

export default function HintPanel({ question, currentSql, lastError, tables }) {
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hintCount, setHintCount] = useState(0);

  async function requestHint() {
    setLoading(true);
    setError(null);

    try {
      const result = await getHint({
        question,
        currentSql: currentSql || '',
        errorMessage: lastError || '',
        tables,
      });

      if (result.success) {
        setHint(result.hint);
        setHintCount((c) => c + 1);
      } else {
        setError(result.error || 'Failed to get hint.');
      }
    } catch (err) {
      setError('Hint service unavailable. Check your API key configuration.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <div className="hint-panel__title-row">
          <span className="hint-panel__icon" aria-hidden="true">⚡</span>
          <span className="hint-panel__title">Ask Cipher</span>
          {hintCount > 0 && (
            <span className="hint-panel__count">{hintCount} hint{hintCount !== 1 ? 's' : ''} used</span>
          )}
        </div>
        <p className="hint-panel__subtitle">
          Get a Socratic hint — Cipher guides without giving away the answer.
        </p>
      </div>

      {/* Hint output */}
      {hint && (
        <div className="hint-panel__hint-box">
          <div className="hint-panel__hint-label">
            <span>CIPHER SAYS</span>
          </div>
          <p className="hint-panel__hint-text">{hint}</p>
        </div>
      )}

      {error && (
        <div className="hint-panel__error" role="alert">
          {error}
        </div>
      )}

      {/* Request button */}
      <button
        className={`btn btn--hint hint-panel__btn ${loading ? 'btn--loading' : ''}`}
        onClick={requestHint}
        disabled={loading || !question}
        aria-label="Request a hint"
      >
        {!loading && (
          <>
            <span aria-hidden="true">⚡</span>
            <span>{hint ? 'Get Another Hint' : 'Get a Hint'}</span>
          </>
        )}
      </button>

      <p className="hint-panel__disclaimer">
        Hints are intentionally vague — trust the process!
      </p>
    </div>
  );
}