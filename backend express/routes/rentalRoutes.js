const express = require("express");
const auth = require("../middlewares/auth");
const {
  listRentals,
  listStaffRentals,
  listClientRentals,
  listAdminStats,
  startRental,
  endRental,
  addExtraKm,
} = require("../controllers/rentalController");

const router = express.Router();

router.get("/", auth, listRentals);
router.get("/stats", auth, listAdminStats);
router.get("/staff", auth, listStaffRentals);
router.get("/client", auth, listClientRentals);
router.post("/:id/start", auth, startRental);
router.post("/:id/end", auth, endRental);
router.post("/:id/extra", auth, addExtraKm);

module.exports = router;
