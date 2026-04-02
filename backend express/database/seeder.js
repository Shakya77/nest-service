const bcrypt = require("bcryptjs");
const pool = require("../db"); // your db connection
const { default: slugify } = require("slugify");

async function seedUsers() {
  try {
    const password = await bcrypt.hash("password", 10);

    var slug = slugify("Admin User", { lower: true, strict: true });
    // Insert users
    const admin = await pool.query(
      `INSERT INTO users (name, email, password, slug, role, "isActive")
       VALUES ($1,$2,$3,$4,$5,$6)`,
      ["Admin User", "admin@gmail.com", password, slug, "admin", true],
    );

    slug = slugify("Staff User", { lower: true, strict: true });
    const staff = await pool.query(
      `INSERT INTO users (name, email, password, slug, role, "isActive")
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      ["Staff User", "staff@gmail.com", password, slug, "staff", true],
    );

    slug = slugify("Client User", { lower: true, strict: true });
    const client = await pool.query(
      `INSERT INTO users (name, email, password, slug, role, "isActive")
       VALUES ($1,$2,$3,$4,$5,$6)`,
      ["Client User", "client@gmail.com", password, slug, "client", true],
    );

    // Insert staff details
    await pool.query(
      `INSERT INTO staff_details ("userId", "hourlyRate", "licenseNumber")
       VALUES ($1,$2,$3)`,
      [staff.rows[0].id, 20.0, "LIC12345"],
    );

    await pool.query(`
        INSERT INTO vehicles (name, "basePricePerKm", "isAvailable", "registrationNo")
        VALUES
            ('Toyota Camry', 20, true, 'REG12345'),
            ('Honda Civic', 20, true, 'REG12346'),
            ('Ford Mustang', 30, true, 'REG12347')
        `);

    console.log("✅ Users seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
}

seedUsers();
