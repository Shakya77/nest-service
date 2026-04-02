const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { default: slugify } = require("slugify");

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "name, email, password, role are required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const slug = slugify(name, { lower: true, strict: true });

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, slug, "isActive") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, slug, "isActive"`,
      [name, email, hashed, role, slug, true],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
    );

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, password, role,slug, "isActive" FROM users WHERE email = $1`,
      [email],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user["isActive"] === false) {
      return res.status(403).json({ message: "User is inactive" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        slug: user.slug,
      },
      process.env.JWT_SECRET,
    );

    delete user.password;
    return res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  register,
  login,
};
