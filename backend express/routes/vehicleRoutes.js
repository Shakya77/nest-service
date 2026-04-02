const express = require("express");
const auth = require("../middlewares/auth");
const {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  onVehicleRecord,
  updateAvailability,
  onGetVehicles,
  getVehicleDisableDates,
} = require("../controllers/vehicleController");

const router = express.Router();

router.get("/", auth, listVehicles);
router.get("/available", onGetVehicles);

router.get("/:id", auth, getVehicle);
router.get("/:id/disable-dates", auth, getVehicleDisableDates);
router.post("/", auth, createVehicle);
router.put("/:id", auth, updateVehicle);
router.delete("/:id", auth, deleteVehicle);
router.get("/:id/records", auth, onVehicleRecord);
router.patch("/:id", auth, updateAvailability);

module.exports = router;
