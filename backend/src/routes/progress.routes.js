const express = require("express");
const router = express.Router();
const pool = require("../db");

// Update skill progress
router.post("/", async (req, res) => {
  const { userId, skillId, status } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO user_skill_status (user_id, skill_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, skill_id)
      DO UPDATE SET status = $3;
      `,
      [userId, skillId, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

module.exports = router;
