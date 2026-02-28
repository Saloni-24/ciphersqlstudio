require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { connectMongo } = require('./db/mongodb');
const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/query');
const hintRoutes = require('./routes/hints');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware 
app.use(helmet());
app.use(cors());

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter limiter for LLM hint endpoint (costs money per call)
const hintLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Hint rate limit reached. Please wait before requesting another hint.' },
});

// Body parsing 
app.use(express.json({ limit: '10kb' }));

//  Routes 
app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/hint', hintLimiter, hintRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//  Error handling 
app.use(errorHandler);

// Start 
async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(` CipherSQLStudio API running on port ${PORT}`);
  });
}

start().catch(console.error);