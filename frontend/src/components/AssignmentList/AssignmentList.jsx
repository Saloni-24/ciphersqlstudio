import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAssignments } from '../../services/api';
import './AssignmentList.scss';

// ── Skeleton loader for assignment cards ─────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="assignment-card assignment-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--sm" style={{ width: '40%' }} />
      <div className="skeleton skeleton--title" style={{ marginTop: '12px' }} />
      <div className="skeleton skeleton--sm" style={{ marginTop: '8px', width: '80%' }} />
      <div className="skeleton skeleton--sm" style={{ marginTop: '4px', width: '60%' }} />
    </div>
  );
}

// ── Single assignment card ─────────────────────────────────────────────────────
function AssignmentCard({ assignment, index }) {
  return (
    <Link
      to={`/assignment/${assignment._id}`}
      className="assignment-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="assignment-card__header">
        <span className={`badge badge--${assignment.difficulty}`}>
          {assignment.difficulty}
        </span>
        <span className="assignment-card__order">#{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Title */}
      <h2 className="assignment-card__title">{assignment.title}</h2>

      {/* Description */}
      <p className="assignment-card__desc">{assignment.description}</p>

      {/* Tags */}
      {assignment.tags && assignment.tags.length > 0 && (
        <div className="assignment-card__tags">
          {assignment.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="assignment-card__cta">
        <span>Start challenge</span>
        <span className="assignment-card__arrow" aria-hidden="true">→</span>
      </div>
    </Link>
  );
}

// ── Main listing page ──────────────────────────────────────────────────────────
export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAssignments();
        setAssignments(data);
      } catch (err) {
        setError('Failed to load assignments. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filtered = filter === 'all'
    ? assignments
    : assignments.filter((a) => a.difficulty === filter);

  return (
    <div className="assignment-list-page">
      {/* Hero section */}
      <header className="assignment-list-page__hero">
        <div className="assignment-list-page__hero-inner">
          <div className="assignment-list-page__label">TRAINING GROUND</div>
          <h1 className="assignment-list-page__heading">
            Crack the{' '}
            <span className="assignment-list-page__heading-accent">Cipher</span>
          </h1>
          <p className="assignment-list-page__subheading">
            Master SQL through real challenges. Write queries, execute instantly, unlock hints.
          </p>
        </div>

        {/* Background grid decoration */}
        <div className="assignment-list-page__grid-bg" aria-hidden="true" />
      </header>

      {/* Filter tabs */}
      <div className="assignment-list-page__filters">
        <div className="assignment-list-page__filters-inner">
          {difficulties.map((d) => (
            <button
              key={d}
              className={`filter-tab ${filter === d ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(d)}
            >
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
              {d !== 'all' && (
                <span className="filter-tab__count">
                  {assignments.filter((a) => a.difficulty === d).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <main className="assignment-list-page__content">
        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom: '24px' }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="assignment-list-page__grid">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="assignment-list-page__empty">
            <p>No assignments found for this filter.</p>
          </div>
        ) : (
          <div className="assignment-list-page__grid">
            {filtered.map((a, i) => (
              <AssignmentCard key={a._id} assignment={a} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}