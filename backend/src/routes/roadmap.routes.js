const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET roadmap with user progress
router.get("/:roadmapId", async (req, res) => {
  const userId = 1; // hardcoded for now
  const roadmapId = req.params.roadmapId;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        s.id AS skill_id,
        s.name,
        COALESCE(uss.status, 'NOT_STARTED') AS user_status,

        CASE
          WHEN uss.status = 'COMPLETED' THEN 'COMPLETED'

          WHEN NOT EXISTS (
            SELECT 1
            FROM skill_dependencies sd
            LEFT JOIN user_skill_status uss2
              ON sd.depends_on_skill_id = uss2.skill_id
              AND uss2.user_id = $1
            WHERE sd.skill_id = s.id
              AND sd.dependency_type = 'required'
              AND (uss2.status IS NULL OR uss2.status != 'COMPLETED')
          )
          THEN 'AVAILABLE'

          ELSE 'LOCKED'
        END AS skill_state

      FROM roadmap_skills rs
      JOIN skills s ON rs.skill_id = s.id
      LEFT JOIN user_skill_status uss
        ON uss.skill_id = s.id
        AND uss.user_id = $1
      WHERE rs.roadmap_id = $2
      ORDER BY rs.sequence_order;
      `,
      [userId, roadmapId]
    );

    res.json(rows);
  } catch (err) {
    console.error("ROADMAP ERROR:", err);
    res.status(500).json({ error: "Failed to load roadmap" });
  }
});

module.exports = router;
