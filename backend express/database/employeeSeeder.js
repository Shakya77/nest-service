const bcrypt = require("bcryptjs");
const pool = require("../db");
const { default: slugify } = require("slugify");

async function seedEmployees() {
  try {
    const password = await bcrypt.hash("password", 10);

    for (let i = 1; i <= 10; i++) {
      const name = `Employee ${i}`;
      const email = `employee${i}@gmail.com`;
      const slug = slugify(name, { lower: true, strict: true });

      // Insert user (staff role)
      const userRes = await pool.query(
        `INSERT INTO users (name, email, password, slug, role, "isActive")
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [name, email, password, slug, "staff", true],
      );

      const userId = userRes.rows[0].id;

      // Insert staff details
      await pool.query(
        `INSERT INTO staff_details ("userId", "hourlyRate", "licenseNumber")
         VALUES ($1,$2,$3)`,
        [
          userId,
          15 + i, // different hourly rate for each
          `LIC${1000 + i}`, // unique license
        ],
      );
    }

    console.log("✅ 10 Employees seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
}

seedEmployees();
