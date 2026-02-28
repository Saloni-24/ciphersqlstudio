const mongoose = require('mongoose');

// ── Connection ─────────────────────────────────────────────────────────────────
async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set — skipping MongoDB connection.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// ── Assignment Schema ──────────────────────────────────────────────────────────
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    // Full problem statement shown to the student
    question: { type: String, required: true },

    // Difficulty badge
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // Topic tags e.g. ['SELECT', 'JOIN', 'aggregation']
    tags: [{ type: String }],

    // Names of PostgreSQL tables pre-loaded for this assignment
    tables: [{ type: String }],

    // Optional: expected column names for result validation hints
    expectedColumns: [{ type: String }],

    // Whether the assignment is visible to students
    isActive: { type: Boolean, default: true },

    // Display order on listing page
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

// ── Attempt Schema (optional feature) ─────────────────────────────────────────
const attemptSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    // sessionId or userId (for optional auth feature)
    sessionId: { type: String, required: true },
    sql: { type: String, required: true },
    success: { type: Boolean, default: false },
    errorMessage: { type: String },
    rowCount: { type: Number },
  },
  { timestamps: true }
);

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = { connectMongo, Assignment, Attempt };