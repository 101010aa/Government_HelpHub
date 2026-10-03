import express from "express";
import cors from "cors";
import helmet from "helmet";
import api from "./routes/api.js";
import { notFound, errors } from "./middleware/errors.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    message: "Government Help Hub API ready",
    data: { status: "ok" },
  }),
);
app.use("/api", api);
app.use(notFound);
app.use(errors);
export default app;
