const express = require("express");
const cors = require("cors");

const roadmapRoutes = require("./routes/roadmap.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tech Roadmap API is running");
});

app.use("/roadmap", roadmapRoutes);

module.exports = app;
