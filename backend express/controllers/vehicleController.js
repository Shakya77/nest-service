const pool = require("../db");

async function listVehicles(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, "basePricePerKm", "isAvailable", "registrationNo" FROM vehicles ORDER BY id DESC',
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("List vehicles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getVehicle(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, "basePricePerKm", "isAvailable", "registrationNo" FROM vehicles WHERE id = $1',
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get vehicle error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createVehicle(req, res) {
  const { name, basePricePerKm, isAvailable, registrationNo } = req.body;
  if (!name || basePricePerKm === undefined || registrationNo === undefined) {
    return res
      .status(400)
      .json({ message: "name, basePricePerKm, registrationNo are required" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO vehicles (name, "basePricePerKm", "isAvailable", "registrationNo") VALUES ($1, $2, $3, $4) RETURNING id, name, "basePricePerKm", "isAvailable", "registrationNo"',
      [
        name,
        basePricePerKm,
        isAvailable !== undefined ? isAvailable : true,
        registrationNo,
      ],
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create vehicle error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateVehicle(req, res) {
  const { id } = req.params;
  const { name, basePricePerKm, isAvailable, registrationNo } = req.body;

  if (!name && !basePricePerKm && !isAvailable && !registrationNo) {
    return res.status(400).json({ message: "No fields to update" });
  }

  try {
    const result = await pool.query(
      `
      UPDATE vehicles
      SET
        name = COALESCE($1, name),
        "basePricePerKm" = COALESCE($2, "basePricePerKm"),
        "isAvailable" = COALESCE($3, "isAvailable"),
        "registrationNo" = COALESCE($4, "registrationNo")
      WHERE id = $5
      RETURNING id, name, "basePricePerKm", "isAvailable", "registrationNo"
      `,
      [name, basePricePerKm, isAvailable, registrationNo, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update vehicle error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteVehicle(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM vehicles WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    return res.json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function onVehicleRecord(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT q.id, q."clientId", u.name AS "clientName", q."vehicleId", q."estimatedPrice", q."requestedKm", q."bookingDate", q."pickupLocation", q.status
      FROM quotes q
      JOIN users u ON q."clientId" = u.id
      WHERE q."vehicleId" = $1
      ORDER BY q.id DESC
      LIMIT 10
    `,
      [id],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("onVehicleRecord error:", err);
  }
}

async function updateAvailability(req, res) {
  const { id } = req.params;
  const { isAvailable } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE vehicles
      SET "isAvailable" = $1
      WHERE id = $2
      RETURNING id, name, "basePricePerKm", "isAvailable", "registrationNo"
      `,
      [isAvailable, id],
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("updateAvailability error:", err);
  }
}

async function onGetVehicles(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, "basePricePerKm", "isAvailable", "registrationNo" FROM vehicles WHERE "isAvailable" = true ORDER BY id DESC',
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Get vehicles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getVehicleDisableDates(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (DATE(q."bookingDate")) DATE(q."bookingDate") AS "bookingDate"
        FROM quotes q
        WHERE q."vehicleId" = $1
          AND q.status = 'approved'
          AND q."bookingDate" >= CURRENT_DATE
        ORDER BY DATE(q."bookingDate") ASC`,
      [id],
    );

    const dates = result.rows.map((row) => row.bookingDate);
    return res.json(dates);
  } catch (err) {
    console.error("Get vehicle disable dates error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  onVehicleRecord,
  updateAvailability,
  onGetVehicles,
  getVehicleDisableDates,
};
