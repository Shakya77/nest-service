const bcrypt = require("bcryptjs");
const pool = require("../db");
const { default: slugify } = require("slugify");

async function listByRole(req, res) {
  const { role } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, "isActive", "rewardPoints" FROM users WHERE role = $1 ORDER BY id DESC',
      [role],
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("List users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listAll(req, res) {
  const { role, page = 1, limit = 10 } = req.query;

  try {
    let query = `SELECT id, name, email, role, "isActive", "rewardPoints" FROM users WHERE role != 'admin' `;

    const values = [];

    // if role send then if no role send then
    if (role) {
      query += ` AND role = $1`;
      values.push(role);
    }

    const offset = (page - 1) * limit;

    values.push(limit, offset);
    query += ` ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const result = await pool.query(query, values);

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role != 'admin' ${role ? "AND role = $1" : ""}`,
      role ? [role] : [],
    );

    const total = totalResult.rows[0].count;

    res.json({
      data: result.rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("List all users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listStaff(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id,
        u.name,
        u.email,
        u."isActive" AS "isActive",
        sd."hourlyRate" AS "hourlyRate",
        SUM(sh."totalHours") AS "totalHours",
        SUM(sh."totalHours") * sd."hourlyRate" AS "totalIncome"
      FROM users u
      LEFT JOIN staff_details sd ON sd."userId" = u.id
      LEFT JOIN staff_hours sh ON sh."staffId" = u.id
      WHERE u.role = 'staff'
      GROUP BY u.id, sd."hourlyRate"
      ORDER BY u.id DESC`,
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List staff profiles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getById(req, res) {
  const { role, id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, "isActive", "rewardPoints" FROM users WHERE id = $1 AND role = $2',
      [id, role],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role == "staff") {
      const staffDetails = await pool.query(
        `SELECT "hourlyRate", "licenseNumber" FROM staff_details WHERE "userId" = $1`,
        [id],
      );

      return res.json({ ...result.rows[0], ...staffDetails.rows[0] });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createUser(req, res) {
  const { role } = req.params;
  const { name, email, password, isActive, hourlyRate, licenseNumber } =
    req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, password are required" });
  }

  const client = await pool.connect();

  try {
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await client.query("BEGIN");
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, "isActive") VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, "isActive"`,
      [name, email, hashed, role, isActive !== undefined ? isActive : true],
    );

    const user = userResult.rows[0];

    if (role === "staff") {
      await client.query(
        `INSERT INTO staff_details ("userId", "hourlyRate", "licenseNumber") VALUES ($1, $2, $3)`,
        [user.id, hourlyRate || 0, licenseNumber || null],
      );
    }

    await client.query("COMMIT");
    return res.status(201).json(user);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create user error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

async function updateUser(req, res) {
  const { role, id } = req.params;
  const { name, email, password, hourlyRate, licenseNumber } = req.body;

  try {
    // --- Update users table ---
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await pool.query(
      `UPDATE users SET 
        name = $1, 
        email = $2, 
        password = $3, 
       WHERE id = $5 AND role = $6`,
      [name, email, hashedPassword, id, role],
    );

    // --- Update staff_details if role is staff ---
    if (role === "staff") {
      await pool.query(
        `UPDATE staff_details SET 
          "hourlyRate" = $1, 
          "licenseNumber" = $2
         WHERE "userId" = $3`,
        [hourlyRate, licenseNumber, id],
      );
    }

    const result = await pool.query(
      `SELECT id, name, email, role, "isActive", "rewardPoints"
       FROM users WHERE id = $1 AND role = $2`,
      [id, role],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteUser(req, res) {
  const { role, id } = req.params;

  try {
    if (role == "staff") {
      await pool.query(`DELETE FROM staff_details WHERE "userId" = $1`, [id]);
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id",
      [id, role],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMe(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, "isActive", "rewardPoints" FROM users WHERE id = $1',
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET "isActive" = $1 WHERE id = $2 RETURNING id, name, email, role, "isActive", "rewardPoints"`,
      [isActive, id],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update user status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createStaff(req, res) {
  const { name, email, password, hourlyRate, licenseNumber } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, password are required" });
  }

  const client = await pool.connect();

  try {
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const slug = slugify(name, { lower: true, strict: true });

    const result = await client.query(
      `INSERT INTO users (name, email, password, role, slug) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, slug, "isActive"`,
      [name, email, hashed, "staff", slug],
    );

    const user = result.rows[0].id;

    await client.query(
      `INSERT INTO staff_details ("userId", "hourlyRate", "licenseNumber") VALUES ($1, $2, $3)`,
      [user, hourlyRate, licenseNumber],
    );

    return res.status(201).json(result);
  } catch (err) {
    console.error("Create user error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

module.exports = {
  listAll,
  listByRole,
  getById,
  getMe,
  listStaff,
  createUser,
  updateUser,
  createStaff,
  deleteUser,
  updateStatus,
};
