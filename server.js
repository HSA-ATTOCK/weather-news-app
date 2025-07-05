const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from React's build folder
app.use(express.static(path.join(__dirname, "build")));

// API routes
app.get("/api/config", (req, res) => {
  res.json({
    gnewsKey: process.env.REACT_APP_GNEWS_KEY || "not-set",
    weatherKey: process.env.REACT_APP_WEATHER_KEY || "not-set",
  });
});

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Export for Vercel
module.exports = app;

// Start server only if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}
