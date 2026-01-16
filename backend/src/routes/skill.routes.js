const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET skill details + prerequisites
router.get("/:skillId", async (req, res) => {
  const { skillId } = req.params;

  try {
    const skillQuery = `
      SELECT
        s.id,
        s.name,
        s.description,
        s.difficulty_level,
        rs.estimated_time_hours
      FROM skills s
      LEFT JOIN roadmap_skills rs
        ON rs.skill_id = s.id
      WHERE s.id = $1
      LIMIT 1;
    `;

    const prereqQuery = `
      SELECT s2.name
      FROM skill_dependencies sd
      JOIN skills s2
        ON sd.depends_on_skill_id = s2.id
      WHERE sd.skill_id = $1
      AND sd.dependency_type = 'required';
    `;

    const skillResult = await pool.query(skillQuery, [skillId]);
    const prereqResult = await pool.query(prereqQuery, [skillId]);

    if (skillResult.rows.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json({
      ...skillResult.rows[0],
      prerequisites: prereqResult.rows.map((r) => r.name),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch skill details" });
  }
});

module.exports = router;
