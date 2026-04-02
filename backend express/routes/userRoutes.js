const express = require("express");
const auth = require("../middlewares/auth");
const {
  listAll,
  listByRole,
  getById,
  getMe,
  listStaff,
  createUser,
  updateUser,
  deleteUser,
  updateStatus,
  createStaff,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", auth, getMe);

router.get("/staff", auth, listStaff);
router.post("/staff", auth, createStaff);

router.get("/", auth, listAll);
router.get("/:role", auth, listByRole);
router.get("/:role/:id", auth, getById);
router.post("/:role", auth, createUser);
router.put("/:role/:id", auth, updateUser);
router.delete("/:role/:id", auth, deleteUser);
router.patch("/:role/:id", auth, updateStatus);

module.exports = router;
