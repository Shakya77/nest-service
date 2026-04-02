const pool = require("../db");

async function listRentals(req, res) {
  const role = req.user?.role;

  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const result = await pool.query(
      `SELECT r.id,
        r."quoteId" ,
        r."vehicleId",
        v.name AS "vehicleName",
        r."staffId",
        s.name AS "staffName",
        s.email AS "staffEmail",
        q."clientId",
        c.name AS "clientName",
        c.email AS "clientEmail",
        r."scheduledDate",
        r."plannedKm" ,
        r."extraKm" ,
        r."totalPrice" ,
        r."totalCost" ,
        r.status
      FROM rentals r
      JOIN quotes q ON r."quoteId" = q.id
      JOIN vehicles v ON r."vehicleId" = v.id
      JOIN users s ON r."staffId" = s.id
      JOIN users c ON q."clientId" = c.id
      ORDER BY r.id DESC`,
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List rentals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listStaffRentals(req, res) {
  const role = req.user?.role;
  const staffId = req.user?.id;

  if (role !== "staff") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const result = await pool.query(
      `SELECT r.id,
        r."quoteId",
        r."vehicleId",
        v.name AS "vehicleName",
        q."clientId",
        c.name AS "clientName",
        c.email AS "clientEmail",
        r."scheduledDate" ,
        r."plannedKm" ,
        r."extraKm",
        r."totalPrice",
        r."totalCost",
        r."status"
      FROM rentals r
      JOIN quotes q ON r."quoteId" = q.id
      JOIN vehicles v ON r."vehicleId" = v.id
      JOIN users c ON q."clientId" = c.id
      WHERE r."staffId" = $1
      ORDER BY r."id" DESC`,
      [staffId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List staff rentals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listClientRentals(req, res) {
  const clientId = req.user?.id;

  try {
    const result = await pool.query(
      `SELECT r.id,
        r."quoteId" ,
        r."vehicleId",
        v.name AS "vehicleName",
        r."scheduledDate",
        r."plannedKm" ,
        r."extraKm" , 
        r."totalPrice",
        r."totalCost",
        r."status" ,
        p.amount AS "paidAmount",
        p."rewardPointsUsed",
        p."rewardPointsEarned",
        p."paymentMethod" ,
        p."paidAt" 
      FROM rentals r
      JOIN quotes q ON r."quoteId" = q.id
      JOIN vehicles v ON r."vehicleId" = v.id
      LEFT JOIN payments p ON p."rentalId" = r.id
      WHERE q."clientId" = $1
      ORDER BY r.id DESC`,
      [clientId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List client rentals error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listAdminStats(req, res) {
  try {
    const vehicleResult = await pool.query(
      `SELECT v.id,
        v.name,
        COUNT(r.id) AS "totalBookings"
      FROM vehicles v
      JOIN rentals r ON r."vehicleId" = v.id
      GROUP BY v.id
      ORDER BY COUNT(r.id) DESC
      LIMIT 1`,
    );

    const staffResult = await pool.query(
      `SELECT u.id,
        u.name,
        u.email,
        COALESCE(SUM(sh."totalHours"), 0) AS "totalHours"
      FROM users u
      LEFT JOIN staff_hours sh ON sh."staffId" = u.id
      WHERE u.role = 'staff'
      GROUP BY u.id
      ORDER BY COALESCE(SUM(sh."totalHours"), 0) DESC
      LIMIT 1`,
    );

    const todaysIncomeResult = await pool.query(
      `SELECT SUM(amount) AS "totalIncome" FROM payments WHERE DATE("paidAt") = CURRENT_DATE`,
    );

    return res.json({
      mostBookedVehicle: vehicleResult.rows[0] || null,
      mostWorkingStaff: staffResult.rows[0] || null,
      todaysIncome: todaysIncomeResult.rows[0] || null,
    });
  } catch (err) {
    console.error("List admin stats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function startRental(req, res) {
  const staffId = req.user?.id;
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rentalResult = await client.query(
      'SELECT id, "staffId", status FROM rentals WHERE id = $1',
      [id],
    );

    if (rentalResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Rental not found" });
    }

    await client.query(
      'INSERT INTO staff_hours ("rentalId", "staffId", "startTime") VALUES ($1, $2, NOW())',
      [id, staffId],
    );

    await client.query("UPDATE rentals SET status = $1 WHERE id = $2", [
      "in_progress",
      id,
    ]);

    await client.query("COMMIT");
    return res.json({ message: "Rental started" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Start rental error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

async function endRental(req, res) {
  const staffId = req.user.id;
  const { id } = req.params;
  const { rewardPointsUsed = 0, paymentMethod = "cash" } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rentalResult = await client.query(
      `SELECT id, "staffId", status, "totalPrice", "quoteId" FROM rentals WHERE id = $1`,
      [id],
    );

    if (rentalResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Rental not found" });
    }

    const rental = rentalResult.rows[0];

    if (Number(rental.staffid ?? rental.staffId) !== Number(staffId)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Forbidden" });
    }

    if (rental.status !== "in_progress") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Rental not in progress" });
    }

    const quoteResult = await client.query(
      'SELECT "clientId" FROM quotes WHERE id = $1',
      [rental.quoteId],
    );

    if (quoteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Client not found" });
    }

    const clientId =
      quoteResult.rows[0].clientid ?? quoteResult.rows[0].clientId;

    const hoursResult = await client.query(
      'SELECT id, "startTime" FROM staff_hours WHERE "rentalId" = $1 AND "staffId" = $2 ORDER BY id DESC LIMIT 1',
      [id, staffId],
    );

    const startTime =
      hoursResult.rows[0].starttime ?? hoursResult.rows[0].startTime;

    const totalHoursResult = await client.query(
      `SELECT EXTRACT(EPOCH FROM (NOW() - $1)) / 3600 AS hours`,
      [startTime],
    );

    const totalHours = Number(totalHoursResult.rows[0].hours || 0).toFixed(2);

    await client.query(
      `UPDATE staff_hours SET "endTime" = NOW(), "totalHours" = $1 WHERE id = $2`,
      [totalHours, hoursResult.rows[0].id],
    );

    await client.query(`UPDATE rentals SET status = $1 WHERE id = $2`, [
      "completed",
      id,
    ]);

    const billingAmount = Number(rental.totalPrice);

    const pointsUsed = Number(rewardPointsUsed);
    if (pointsUsed < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid reward points" });
    }

    const pointsResult = await client.query(
      'SELECT "rewardPoints" FROM users WHERE id = $1',
      [clientId],
    );

    const currentPoints = Number(
      pointsResult.rows[0]?.rewardPoints ??
        pointsResult.rows[0]?.rewardpoints ??
        0,
    );
    if (pointsUsed > currentPoints) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient reward points" });
    }

    if (pointsUsed > billingAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Points exceed total cost" });
    }

    const rewardPointsEarned = Math.floor(billingAmount / 100);
    const finalAmount = billingAmount - pointsUsed;

    await client.query(
      'INSERT INTO payments ("rentalId", "clientId", "amount", "rewardPointsUsed", "rewardPointsEarned", "paymentMethod", "paidAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [
        id,
        clientId,
        finalAmount,
        pointsUsed,
        rewardPointsEarned,
        paymentMethod,
      ],
    );

    await client.query('UPDATE users SET "rewardPoints" = $1 WHERE id = $2', [
      currentPoints - pointsUsed + rewardPointsEarned,
      clientId,
    ]);

    await client.query("COMMIT");
    return res.json({ message: "Rental completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("End rental error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

async function addExtraKm(req, res) {
  const staffId = req.user?.id;
  const { id } = req.params;
  const { addedKm } = req.body;

  if (!addedKm || Number(addedKm) <= 0) {
    return res.status(400).json({ message: "addedKm must be > 0" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rentalResult = await client.query(
      `SELECT id, "staffId", "vehicleId", "extraKm", "totalPrice", "totalCost" FROM rentals r WHERE id = $1`,
      [id],
    );

    if (rentalResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Rental not found" });
    }

    const rental = rentalResult.rows[0];

    if (Number(rental.staffid ?? rental.staffId) !== Number(staffId)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Forbidden" });
    }

    const vehicleResult = await client.query(
      'SELECT "basePricePerKm" FROM vehicles WHERE id = $1',
      [rental.vehicleid ?? rental.vehicleId],
    );

    if (vehicleResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const basePricePerKm = Number(vehicleResult.rows[0].basePricePerKm || 0);
    const newExtraKm =
      (Number(rental.extrakm ?? rental.extraKm) || 0) + Number(addedKm);
    const totalPrice = Number(rental.totalprice ?? rental.totalPrice) || 0;
    const totalCost = totalPrice + newExtraKm * basePricePerKm;

    await client.query(
      'INSERT INTO rental_distance_logs ("rentalId", "addedKm", "addAt") VALUES ($1, $2, NOW())',
      [id, addedKm],
    );

    await client.query(
      'UPDATE rentals SET "extraKm" = $1, "totalCost" = $2 WHERE id = $3',
      [newExtraKm, totalCost, id],
    );

    await client.query("COMMIT");
    return res.json({ message: "Extra km added", totalCost });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Add extra km error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

module.exports = {
  listRentals,
  listStaffRentals,
  listClientRentals,
  listAdminStats,
  startRental,
  endRental,
  addExtraKm,
};
