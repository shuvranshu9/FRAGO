import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";
import http from "http";
import { initSocket } from "./src/socket/socket.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import perfumeRoutes from "./src/modules/perfume/perfume.routes.js";
import categoryRoutes from "./src/modules/category/category.routes.js";
import bookmarkRoutes from "./src/modules/bookmark/bookmark.routes.js";
import cartRoutes from "./src/modules/cart/cart.routes.js";
import recommendRoutes from "./src/modules/recommend/recommend.routes.js";
import orderRoutes from "./src/modules/order/order.routes.js";
import paymentRoutes from "./src/modules/payment/payment.routes.js";
import reviewRoutes from "./src/modules/review/review.routes.js";
import chatRoutes from "./src/modules/chat/chat.routes.js";
import messageRoutes from "./src/modules/messgae/message.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

const allowedOrigins = ["http://localhost:5173"];

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
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/perfume", perfumeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

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

// Init socket.io
initSocket(server);

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
