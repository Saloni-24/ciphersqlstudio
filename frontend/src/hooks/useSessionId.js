import { useState, useEffect } from 'react';

/** Generate a simple session ID stored in sessionStorage for attempt tracking. */
export function useSessionId() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = sessionStorage.getItem('ciphersql_session');
    if (!id) {
      // Simple unique ID — no auth needed for basic version
      id = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('ciphersql_session', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}