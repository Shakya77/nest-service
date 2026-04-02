const pool = require("../db");

async function createTables() {
  try {
    // Drop tables in dependency order (child first)
    await pool.query(`DROP TABLE IF EXISTS rental_staff_hours;`);
    await pool.query(`DROP TABLE IF EXISTS staff_hours;`);
    await pool.query(`DROP TABLE IF EXISTS payments;`);
    await pool.query(`DROP TABLE IF EXISTS rental_distance_logs;`);
    await pool.query(`DROP TABLE IF EXISTS rentals;`);
    await pool.query(`DROP TABLE IF EXISTS rental_quotes;`);
    await pool.query(`DROP TABLE IF EXISTS quotes;`);
    await pool.query(`DROP TABLE IF EXISTS staff_details;`);
    await pool.query(`DROP TABLE IF EXISTS vehicles;`);
    await pool.query(`DROP TABLE IF EXISTS leaves;`);
    await pool.query(`DROP TABLE IF EXISTS users;`);

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120),
        email VARCHAR(150) UNIQUE,
        slug VARCHAR(150) UNIQUE,
        password TEXT,
        role VARCHAR(20),
        "isActive" BOOLEAN DEFAULT TRUE,
        "rewardPoints" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE vehicles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120),
        "basePricePerKm" NUMERIC(12,2),
        "isAvailable" BOOLEAN,
        "registrationNo" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE quotes (
        id SERIAL PRIMARY KEY,
        "clientId" INTEGER REFERENCES users(id),
        "vehicleId" INTEGER REFERENCES vehicles(id),
        "bookingDate" TIMESTAMP,
        "requestedKm" INTEGER,
        "pickupLocation" VARCHAR(120),
        "estimatedPrice" NUMERIC(12,2),
        status VARCHAR(20),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE rentals (
        id SERIAL PRIMARY KEY,
        "quoteId" INTEGER REFERENCES quotes(id),
        "vehicleId" INTEGER REFERENCES vehicles(id),
        "staffId" INTEGER REFERENCES users(id),
        "scheduledDate" TIMESTAMP,
        "totalPrice" NUMERIC(12,2),
        "plannedKm" INTEGER,
        "extraKm" INTEGER,
        "totalCost" NUMERIC(12,2),
        status VARCHAR(30),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        "rentalId" INTEGER REFERENCES rentals(id),
        "clientId" INTEGER REFERENCES users(id),
        amount NUMERIC(12,2),
        "rewardPointsUsed" INTEGER,
        "rewardPointsEarned" INTEGER,
        "paymentMethod" VARCHAR(30),
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE rental_distance_logs (
        id SERIAL PRIMARY KEY,
        "rentalId" INTEGER REFERENCES rentals(id),
        "addedKm" INTEGER,
        "addAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE staff_details (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id),
        "hourlyRate" NUMERIC(12,2),
        "licenseNumber" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE staff_hours (
        id SERIAL PRIMARY KEY,
        "rentalId" INTEGER REFERENCES rentals(id),
        "staffId" INTEGER REFERENCES users(id),
        "startTime" TIMESTAMP,
        "endTime" TIMESTAMP,
        "totalHours" NUMERIC(5,2),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE rental_staff_hours (
        id SERIAL PRIMARY KEY,
        "rentalId" INTEGER REFERENCES rentals(id),
        "staffId" INTEGER REFERENCES users(id),
        "hoursWorked" NUMERIC(5,2),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE leaves (
        id SERIAL PRIMARY KEY,
        "staffId" INTEGER REFERENCES users(id),
        "fromDate" DATE,
        "toDate" DATE,
        subject VARCHAR(150),
        application VARCHAR(20),
        "status" VARCHAR(20) DEFAULT 'pending',
        "isActive" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("All tables dropped and recreated successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

createTables();
