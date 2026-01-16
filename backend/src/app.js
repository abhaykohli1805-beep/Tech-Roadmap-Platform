const express = require("express");
const cors = require("cors");

const roadmapRoutes = require("./routes/roadmap.routes");

const app = express();

app.use(cors()); // 👈 REQUIRED
app.use(express.json());

app.use("/roadmap", roadmapRoutes);

module.exports = app;

