const { Assignment } = require('../db/mongodb');
const { getTablePreviews } = require('../db/postgres');

/**
 * GET /api/assignments
 * Returns all active assignments ordered by their display order.
 * Lightweight listing — no table data included.
 */
async function listAssignments(req, res, next) {
  try {
    const assignments = await Assignment
      .find({ isActive: true })
      .select('title description difficulty tags order createdAt')
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assignments/:id
 * Returns full assignment details + live table previews from PostgreSQL.
 */
async function getAssignment(req, res, next) {
  try {
    const assignment = await Assignment
      .findOne({ _id: req.params.id, isActive: true })
      .lean();

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found.' });
    }

    // Fetch schema and sample rows for each relevant table
    const tablePreviews = await getTablePreviews(assignment.tables || []);

    res.json({
      success: true,
      assignment,
      tablePreviews,
    });
  } catch (err) {
    // Mongoose CastError means invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid assignment ID format.' });
    }
    next(err);
  }
}

module.exports = { listAssignments, getAssignment };