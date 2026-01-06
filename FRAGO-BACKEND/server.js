import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js"

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// Routes
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("FRAGO Backend Running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL Database");
    connection.release();
  } catch (err) {
    console.error("MySQL Connection Failed:", err.message);
  }
})();

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
