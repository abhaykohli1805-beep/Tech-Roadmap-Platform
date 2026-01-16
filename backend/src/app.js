const express = require("express");
const cors = require("cors");

const roadmapRoutes = require("./routes/roadmap.routes");
const skillRoutes = require("./routes/skill.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/roadmap", roadmapRoutes);
app.use("/skill", skillRoutes);

module.exports = app;
