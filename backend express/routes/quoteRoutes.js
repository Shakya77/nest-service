const express = require("express");
const auth = require("../middlewares/auth");
const {
  listQuotesAdmin,
  listQuotesClient,
  getQuote,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
} = require("../controllers/quoteController");

const router = express.Router();

router.get("/admin", auth, listQuotesAdmin);
router.get("/client", auth, listQuotesClient);
router.get("/:id", auth, getQuote);
router.post("/", auth, createQuote);
router.put("/:id", auth, updateQuote);
router.put("/:id/status", auth, updateQuoteStatus);
router.delete("/:id", auth, deleteQuote);

module.exports = router;
