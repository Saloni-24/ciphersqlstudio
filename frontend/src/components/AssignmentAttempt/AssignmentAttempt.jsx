import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAssignment, executeQuery } from '../../services/api';
import { useSessionId } from '../../hooks/useSessionId';
import SQLEditor from '../SQLEditor/SQLEditor';
import ResultsPanel from '../ResultsPanel/ResultsPanel';
import DataViewer from '../DataViewer/DataViewer';
import HintPanel from '../HintPanel/HintPanel';
import './AssignmentAttempt.scss';

const TABS = [
  { id: 'question',  label: 'Question', icon: '?' },
  { id: 'data',      label: 'Data',     icon: '⬡' },
  { id: 'editor',    label: 'Editor',   icon: '/' },
  { id: 'results',   label: 'Results',  icon: '▤' },
];

export default function AssignmentAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = useSessionId();

  const [assignment, setAssignment] = useState(null);
  const [tablePreviews, setTablePreviews] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [sql, setSql] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const [activeTab, setActiveTab] = useState('editor');
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    async function load() {
      setPageLoading(true);
      setPageError(null);
      try {
        const data = await fetchAssignment(id);
        setAssignment(data.assignment);
        setTablePreviews(data.tablePreviews || {});
      } catch (err) {
        if (err.response?.status === 404) {
          setPageError('Assignment not found.');
        } else {
          setPageError('Failed to load assignment. Make sure the backend is running.');
        }
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [id]);

  const handleExecute = useCallback(async () => {
    if (!sql?.trim() || queryLoading) return;

    setQueryLoading(true);
    setActiveTab('results');

    try {
      const result = await executeQuery(sql, id, sessionId);
      setQueryResult(result);
      setLastError(result.success ? null : result.error);
    } catch (err) {
      setQueryResult({
        success: false,
        error: err.message || 'Network error — check that the backend is running.',
      });
    } finally {
      setQueryLoading(false);
    }
  }, [sql, queryLoading, id, sessionId]);

  if (pageLoading) {
    return (
      <div className="attempt-page attempt-page--loading">
        <div className="spinner" />
        <p>Loading assignment…</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="attempt-page attempt-page--error">
        <p className="error-banner">{pageError}</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>
          ← Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="attempt-page">
      {/* Top bar */}
      <div className="attempt-page__topbar">
        <button
          className="btn btn--ghost btn--sm attempt-page__back"
          onClick={() => navigate('/')}
        >
          ← Assignments
        </button>

        <div className="attempt-page__meta">
          <span className={`badge badge--${assignment.difficulty}`}>
            {assignment.difficulty}
          </span>
          <h1 className="attempt-page__title">{assignment.title}</h1>
        </div>

        <button
          className={`btn btn--hint btn--sm`}
          onClick={() => setShowHints(!showHints)}
          aria-label="Toggle hint panel"
        >
          ⚡ {showHints ? 'Hide Hints' : 'Get Hint'}
        </button>
      </div>

      {/* Mobile tabs */}
      <div className="attempt-page__mobile-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`attempt-page__mobile-tab ${activeTab === tab.id ? 'attempt-page__mobile-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="attempt-layout">
        {/* LEFT COLUMN */}
        <aside className={`attempt-layout__left ${activeTab === 'question' || activeTab === 'data' ? 'attempt-layout__left--visible' : ''}`}>

          {/* Question panel */}
          <section
            className={`panel attempt-layout__panel attempt-layout__panel--question ${activeTab === 'question' ? 'attempt-layout__panel--active' : ''}`}
            aria-label="Assignment question"
          >
            <div className="panel__header">
              <span className="panel__title">Mission Brief</span>
            </div>

            {/* Tags row */}
            {assignment.tags && assignment.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px 16px',
                borderBottom: '1px solid #1e2d40'
              }}>
                {assignment.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="panel__body question-body">
              {/* Question text with bold formatting */}
              <p
                className="question-body__text"
                dangerouslySetInnerHTML={{
                  __html: assignment.question
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00c8ff">$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />

              {/* Expected columns */}
              {assignment.expectedColumns && assignment.expectedColumns.length > 0 && (
                <div className="question-body__expected">
                  <p className="question-body__expected-label">Expected columns:</p>
                  <div className="question-body__expected-cols">
                    {assignment.expectedColumns.map((col) => (
                      <code key={col} className="question-body__col">{col}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Data viewer panel */}
          <section
            className={`panel attempt-layout__panel attempt-layout__panel--data ${activeTab === 'data' ? 'attempt-layout__panel--active' : ''}`}
            aria-label="Sample data"
          >
            <div className="panel__header">
              <span className="panel__title">Sample Data</span>
              <span className="panel__hint-text text--secondary">
                {Object.keys(tablePreviews).length} table{Object.keys(tablePreviews).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="panel__body panel__body--flush">
              <DataViewer tablePreviews={tablePreviews} />
            </div>
          </section>

          {/* Hint panel */}
          {showHints && (
            <section
              className="attempt-layout__panel attempt-layout__panel--hints"
              aria-label="Hints"
            >
              <HintPanel
                question={assignment.question}
                currentSql={sql}
                lastError={lastError}
                tables={assignment.tables}
              />
            </section>
          )}
        </aside>

        {/* RIGHT COLUMN */}
        <div className={`attempt-layout__right ${activeTab === 'editor' || activeTab === 'results' ? 'attempt-layout__right--visible' : ''}`}>

          {/* SQL Editor */}
          <section
            className={`attempt-layout__panel attempt-layout__panel--editor ${activeTab === 'editor' ? 'attempt-layout__panel--active' : ''}`}
            aria-label="SQL editor"
          >
            <SQLEditor
              value={sql}
              onChange={setSql}
              onExecute={handleExecute}
              isLoading={queryLoading}
            />
          </section>

          {/* Results */}
          <section
            className={`panel attempt-layout__panel attempt-layout__panel--results ${activeTab === 'results' ? 'attempt-layout__panel--active' : ''}`}
            aria-label="Query results"
          >
            <div className="panel__header">
              <span className="panel__title">Query Results</span>
            </div>
            <div className="panel__body panel__body--flush">
              <ResultsPanel result={queryResult} isLoading={queryLoading} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}