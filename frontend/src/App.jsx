import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import AssignmentList from './components/AssignmentList/AssignmentList';
import AssignmentAttempt from './components/AssignmentAttempt/AssignmentAttempt';
import './styles/main.scss';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AssignmentList />} />
        <Route path="/assignment/:id" element={<AssignmentAttempt />} />
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Space Mono, monospace' }}>
              <h2 style={{ color: '#00c8ff', fontSize: '2rem' }}>404</h2>
              <p style={{ color: '#7a93b0', marginTop: '12px' }}>Page not found.</p>
              <a href="/" style={{ color: '#00c8ff', marginTop: '24px', display: 'inline-block' }}>
                ← Return to Assignments
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}