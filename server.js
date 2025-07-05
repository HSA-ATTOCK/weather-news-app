const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from React's build folder
app.use(express.static(path.join(__dirname, "build")));

// Optional: secure API config route (ensure this line is safe and correct)
app.get("/api/config", (req, res) => {
  res.json({
    gnewsKey: process.env.REACT_APP_GNEWS_KEY || "not-set",
    weatherKey: process.env.REACT_APP_WEATHER_KEY || "not-set",
  });
});

// All remaining routes return the React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
