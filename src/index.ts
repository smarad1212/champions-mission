import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });
import express from "express";
import cors from "cors";
import sprintRouter from "./routes/sprint";
import childrenRouter from "./routes/children";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://champions-mission.vercel.app',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "Champions Mission API" });
});

app.get("/api/config", (_req, res) => {
  const provider = (process.env.AI_PROVIDER || "claude").toLowerCase();
  const model = provider === "gemini" ? "Gemini 2.5 Flash" : "Claude Sonnet 4.5";
  res.json({ provider, model });
});

app.use("/api/sprint", sprintRouter);
app.use("/api/children", childrenRouter);


app.listen(PORT, () => {
  console.log(`Champions Mission API + Web running on port ${PORT}`);
});

export default app;
