import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.37:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

//  Assignments 

/** Fetch all active assignments (listing page) */
export async function fetchAssignments() {
  const res = await api.get('/assignments');
  return res.data.assignments;
}

/** Fetch a single assignment with table previews */
export async function fetchAssignment(id) {
  const res = await api.get(`/assignments/${id}`);
  return res.data; // { assignment, tablePreviews }
}

//  Query execution 

/**
 * Execute a SQL query against the sandbox PostgreSQL.
 * @param {string} sql
 * @param {string} assignmentId
 * @param {string} sessionId
 */
export async function executeQuery(sql, assignmentId, sessionId) {
  const res = await api.post('/query/execute', { sql, assignmentId, sessionId });
  return res.data; // { success, rows, fields, rowCount, error?, truncated }
}

//  LLM Hint

/**
 * Request a hint from the LLM.
 * @param {object} params
 * @param {string} params.question - The assignment question text
 * @param {string} [params.currentSql] - Student's current SQL attempt
 * @param {string} [params.errorMessage] - Last error message if any
 * @param {string[]} [params.tables] - Relevant table names
 */
export async function getHint({ question, currentSql, errorMessage, tables }) {
  const res = await api.post('/hint', { question, currentSql, errorMessage, tables });
  return res.data; // { success, hint }
}