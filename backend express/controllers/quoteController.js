const pool = require("../db");

const STATUS_VALUES = new Set(["pending", "approved", "rejected"]);

function ensureStatus(status) {
  if (!status) return "pending";
  return STATUS_VALUES.has(status) ? status : null;
}

async function listQuotesAdmin(req, res) {
  try {
    const result = await pool.query(
      `SELECT q.id,
        q."clientId" AS "clientId",
        u.name AS "clientName",
        u.email AS "clientEmail",
        q."vehicleId" AS "vehicleId",
        v.name AS "vehicleName",
        q."requestedKm" AS "requestedKm",
        q."estimatedPrice" AS "estimatedPrice",
        q."bookingDate" AS "bookingDate",
        q."pickupLocation" AS "pickupLocation",
        q.status AS status
      FROM quotes q
      JOIN users u ON q."clientId" = u.id
      JOIN vehicles v ON q."vehicleId" = v.id
      ORDER BY q.id DESC`,
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List admin quotes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function listQuotesClient(req, res) {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT q.id,
        q."clientId" AS "clientId",
        u.name AS "clientName",
        u.email AS "clientEmail",
        q."vehicleId" AS "vehicleId",
        v.name AS "vehicleName",
        q."requestedKm" AS "requestedKm",
        q."estimatedPrice" AS "estimatedPrice",
        q."bookingDate" AS "bookingDate",
        q."pickupLocation" AS "pickupLocation",
        q.status AS status
      FROM quotes q
      JOIN users u ON q."clientId" = u.id
      JOIN vehicles v ON q."vehicleId" = v.id
      WHERE q."clientId" = $1
      ORDER BY q.id DESC`,
      [userId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("List client quotes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getQuote(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT q.id,
        q."clientId" AS "clientId",
        u.name AS "clientName",
        u.email AS "clientEmail",
        q."vehicleId" AS "vehicleId",
        v.name AS "vehicleName",
        q."requestedKm" AS "requestedKm",
        q."estimatedPrice" AS "estimatedPrice",
        q."bookingDate" AS "bookingDate",
        q."pickupLocation" AS "pickupLocation",
        q."status" AS "status"
      FROM quotes q
      JOIN users u ON q."clientId" = u.id
      JOIN vehicles v ON q."vehicleId" = v.id
      WHERE q.id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Quote not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get quote error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function createQuote(req, res) {
  const userId = req.user?.id;
  const { vehicleId, requestedKm, bookingDate, pickupLocation } = req.body;

  if (
    !vehicleId ||
    requestedKm === undefined ||
    bookingDate === undefined ||
    pickupLocation === undefined
  ) {
    return res.status(400).json({
      message: "Values are required",
    });
  }

  try {
    const vehicleResult = await pool.query(
      'SELECT "basePricePerKm" FROM vehicles WHERE id = $1',
      [vehicleId],
    );

    if (vehicleResult.rowCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const basePricePerKm = Number(vehicleResult.rows[0].basePricePerKm);
    const estimatedPrice = Number(requestedKm) * basePricePerKm;
    const status = ensureStatus(req.body.status) || "pending";

    const result = await pool.query(
      'INSERT INTO quotes ("clientId", "vehicleId", "requestedKm", "estimatedPrice", "bookingDate", "pickupLocation", status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, "clientId", "vehicleId" , "requestedKm", "estimatedPrice", "bookingDate" , "pickupLocation" , status',
      [
        userId,
        vehicleId,
        requestedKm,
        estimatedPrice,
        bookingDate,
        pickupLocation,
        status,
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create quote error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateQuote(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;
  const { vehicleId, requestedKm, bookingDate, pickupLocation } = req.body;

  try {
    let estimatedPrice = undefined;
    if (vehicleId !== undefined || requestedKm !== undefined) {
      if (vehicleId === undefined || requestedKm === undefined) {
        return res
          .status(400)
          .json({ message: "vehicleId and requestedKm are required together" });
      }

      const vehicleResult = await pool.query(
        'SELECT "basePricePerKm" FROM vehicles WHERE id = $1',
        [vehicleId],
      );
      if (vehicleResult.rowCount === 0) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const basePricePerKm = Number(vehicleResult.rows[0].basePricePerKm);
      estimatedPrice = requestedKm * basePricePerKm;
    }

    const result = await pool.query(
      `UPDATE quotes
       SET "vehicleId" = COALESCE($1, "vehicleId"),
           "requestedKm" = COALESCE($2, "requestedKm"),
           "estimatedPrice" = COALESCE($3, "estimatedPrice"),
           "bookingDate" = COALESCE($4, "bookingDate"),
           "pickupLocation" = COALESCE($5, "pickupLocation")
       WHERE id = $6 AND "clientId" = $7
       RETURNING id, "clientId" AS "clientId", "vehicleId", "requestedKm", "estimatedPrice", "bookingDate" AS "bookingDate", "pickupLocation", status`,
      [
        vehicleId,
        requestedKm,
        estimatedPrice,
        bookingDate,
        pickupLocation,
        id,
        userId,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Quote not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update quote error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updateQuoteStatus(req, res) {
  const { id } = req.params;
  const { status, staffId } = req.body;

  const normalizedStatus = ensureStatus(status);
  if (!normalizedStatus) {
    return res.status(400).json({ message: "Invalid status" });
  }

  if (normalizedStatus === "approved" && !staffId) {
    return res.status(400).json({ message: "staffId is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const quoteResult = await client.query(
      'SELECT id, "vehicleId" , "requestedKm", "bookingDate", "estimatedPrice", status FROM quotes WHERE id = $1',
      [id],
    );

    if (quoteResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Quote not found" });
    }

    const quote = quoteResult.rows[0];

    if (normalizedStatus === "approved") {
      const existingRental = await client.query(
        `SELECT id FROM rentals WHERE "quoteId" = $1`,
        [id],
      );

      if (existingRental.rowCount === 0) {
        await client.query(
          `INSERT INTO rentals ("quoteId", "vehicleId", "staffId", "scheduledDate", "totalPrice", "plannedKm", "extraKm", "totalCost", "status") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id,
            quote.vehicleId,
            staffId,
            quote.bookingDate,
            quote.estimatedPrice,
            quote.requestedKm,
            0,
            quote.estimatedPrice,
            "assigned",
          ],
        );
      }
    }

    const result = await client.query(
      'UPDATE quotes SET status = $1 WHERE id = $2 RETURNING id, "clientId", "vehicleId", "requestedKm", "estimatedPrice", "bookingDate", "pickupLocation", status',
      [normalizedStatus, id],
    );

    await client.query("COMMIT");

    return res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update quote status error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}

async function deleteQuote(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM quotes WHERE id = $1 RETURNING id`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Quote not found" });
    }

    return res.json({ message: "Quote deleted" });
  } catch (err) {
    console.error("Delete quote error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listQuotesAdmin,
  listQuotesClient,
  getQuote,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
};
