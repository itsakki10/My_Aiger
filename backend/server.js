import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import aiRoutes from "./routes/aiRoute.js"; // <-- NEW IMPORT

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use("/api/user", userRouter);

// Existing Task Routes
app.use("/api/tasks", taskRouter);

// AI Task Parsing Route <-- NEW ROUTE SETUP
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
