const express = require("express");
const {
  listLeaves,
  createLeave,
  getLeave,
  updateLeave,
  deleteLeave,
  changeLeaveStatus,
} = require("../controllers/leaveController");
const router = express.Router();

router.get("/", listLeaves);
router.post("/", createLeave);
router.get("/:id", getLeave);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);
router.patch("/status/:id", changeLeaveStatus);

module.exports = router;
