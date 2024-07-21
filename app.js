const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { Pool } = require("pg"); // Import PostgreSQL client

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "users",
  password: process.env.PG_PASSWORD || "admin",
  port: process.env.PG_PORT || 5432,
});

// Test PostgreSQL connection
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL", err.stack);
  } else {
    console.log("PostgreSQL connected...");
  }
});

app.use(express.json());
app.use(cors());

// Make PostgreSQL pool available in the request object
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Route handlers
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../frontend/build")));
  app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "../frontend/build/index.html")));
}

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend is running on port ${port}`);
});
