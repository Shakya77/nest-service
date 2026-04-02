const pool = require("../db");

async function createLeave(req, res) {
  const { fromDate, toDate, staffId } = req.body;
  const applicationPath = req.file ? req.file.path : null;

  if (!fromDate || !toDate || !staffId) {
    return res.status(400).json({
      message: "enter all required fields",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leaves ("fromDate", "toDate", application, "staffId") VALUES ($1, $2, $3, $4) RETURNING *`,
      [fromDate, toDate, applicationPath, staffId],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error creating leave request",
    });
  }
}

async function listLeaves(req, res) {
  try {
    const result = await pool.query(
      `SELECT *, u.name , u.email FROM leaves JOIN users u ON leaves."staffId" = u.id ORDER BY leaves.id DESC`,
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching leave requests",
    });
  }
}

async function getLeave(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM leaves JOIN users ON leaves."staffId" = users.id WHERE leaves.id = $1`,
      [id],
    );

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching leave request",
    });
  }
}

async function updateLeave(req, res) {
  const { id } = req.params;
  const { fromDate, toDate, application, status, staffId } = req.body;

  try {
    const result = await pool.query(
      `UPDATE leaves SET "fromDate" = $1, "toDate" = $2, application = $3, "status" = $4, "staffId" = $5 WHERE id = $6 RETURNING *`,
      [fromDate, toDate, application, status, staffId, id],
    );

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({
      message: "Error updating leave request",
    });
  }
}

async function deleteLeave(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM leaves WHERE id = $1`, [id]);

    return res.status(200).json(result.rows);
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting leave request",
    });
  }
}

async function changeLeaveStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE leaves SET "status" = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({
      message: "Error updating leave request status",
    });
  }
}

module.exports = {
  createLeave,
  listLeaves,
  getLeave,
  updateLeave,
  deleteLeave,
  changeLeaveStatus,
};
