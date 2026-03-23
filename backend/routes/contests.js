const express = require("express");
const {
  getContests,
  createContest,
  updateContest,
  deleteContest
} = require("../controllers/contestController");

const router = express.Router();

router.get("/", getContests);
router.post("/", createContest);
router.put("/:id", updateContest);
router.delete("/:id", deleteContest);

module.exports = router;
