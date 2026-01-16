const express = require("express");
const router = express.Router();
const pool = require("../db");

// TEMP: assume user_id = 1
router.get("/:roadmapId", async (req, res) => {
  const { roadmapId } = req.params;
  const userId = 1;

  try {
    const query = `
      SELECT
          rs.step_order,
          s.id AS skill_id,
          s.name,
          CASE
              WHEN uss.status = 'COMPLETED' THEN 'COMPLETED'
              WHEN uss.status IN ('VERIFIED', 'DECLARED_KNOWN') THEN 'AVAILABLE'
              WHEN NOT EXISTS (
                  SELECT 1
                  FROM skill_dependencies sd
                  LEFT JOIN user_skill_status uss2
                    ON sd.depends_on_skill_id = uss2.skill_id
                    AND uss2.user_id = $2
                  WHERE sd.skill_id = s.id
                  AND sd.dependency_type = 'required'
                  AND (
                      uss2.status IS NULL
                      OR uss2.status = 'NOT_STARTED'
                  )
              ) THEN 'AVAILABLE'
              ELSE 'LOCKED'
          END AS skill_state
      FROM roadmap_skills rs
      JOIN skills s ON rs.skill_id = s.id
      LEFT JOIN user_skill_status uss
        ON uss.skill_id = s.id
        AND uss.user_id = $2
      WHERE rs.roadmap_id = $1
      ORDER BY rs.step_order;
    `;

    const { rows } = await pool.query(query, [roadmapId, userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

module.exports = router;
