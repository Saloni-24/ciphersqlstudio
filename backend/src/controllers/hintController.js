/**
 * hintController.js
 *
 * Calls an LLM API to provide a HINT (never a solution) for a SQL problem.
 *
 * Prompt engineering goals:
 *  - Steer the LLM to ask a Socratic guiding question
 *  - Explicitly forbid it from giving the final query
 *  - Use the student's current attempt to give targeted guidance
 */

const SYSTEM_PROMPT = `You are a SQL tutor named Cipher. Your role is to guide students
toward solving SQL problems by themselves — you NEVER write or reveal SQL query solutions.

Rules you must strictly follow:
1. NEVER write a complete SQL query, even partially.
2. NEVER reveal the exact column names, table names, or syntax the student needs.
3. DO ask 1-2 Socratic guiding questions that nudge the student toward the right SQL concept.
4. DO mention the relevant SQL concept or clause name (e.g., GROUP BY, HAVING, JOIN) if the student is clearly on the wrong track.
5. If the student's attempt has a specific error, point out the category of mistake (e.g., "your WHERE clause runs before aggregation — think about which clause filters groups") without fixing it for them.
6. Keep hints concise: 2-4 sentences maximum.
7. Be encouraging and calm in tone.`;

/**
 * Build the user-turn prompt from the request context.
 */
function buildUserPrompt({ question, currentSql, errorMessage, tables }) {
  const tableInfo = tables && tables.length > 0
    ? `Relevant tables: ${tables.join(', ')}`
    : '';

  const attemptInfo = currentSql
    ? `Student's current attempt:\n\`\`\`sql\n${currentSql}\n\`\`\``
    : 'The student has not written any query yet.';

  const errorInfo = errorMessage
    ? `The query produced this error: "${errorMessage}"`
    : '';

  return `Assignment question:
${question}

${tableInfo}

${attemptInfo}
${errorInfo}

Please provide a short, Socratic hint to guide the student — do NOT write any SQL.`;
}

/**
 * Call the configured LLM provider.
 */
async function callLLM(systemPrompt, userPrompt) {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  if (provider === 'gemini') {
    return callGemini(systemPrompt, userPrompt);
  } else if (provider === 'openai') {
    return callOpenAI(systemPrompt, userPrompt);
  }

  throw new Error(`Unknown LLM provider: ${provider}`);
}

async function callGemini(systemPrompt, userPrompt) {
 const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY not set in environment');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.4,  // Low temperature for consistent, focused hints
      maxOutputTokens: 256,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!hint) throw new Error('Gemini returned an empty response.');
  return hint.trim();
}

async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 256,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const hint = data?.choices?.[0]?.message?.content;

  if (!hint) throw new Error('OpenAI returned an empty response.');
  return hint.trim();
}

/**
 * POST /api/hint
 * Body: { question, currentSql?, errorMessage?, tables? }
 */
async function getHint(req, res, next) {
  const { question, currentSql, errorMessage, tables } = req.body;

  if (!question) {
    return res.status(400).json({ success: false, error: 'question field is required.' });
  }

  try {
    const userPrompt = buildUserPrompt({ question, currentSql, errorMessage, tables });
    const hint = await callLLM(SYSTEM_PROMPT, userPrompt);

    res.json({ success: true, hint });
  } catch (err) {
    // Don't crash the server on LLM failures — surface a friendly error
    console.error('LLM hint error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Hint service is temporarily unavailable. Check your API key configuration.',
    });
  }
}

module.exports = { getHint };