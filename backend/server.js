const express = require("express");
const cors = require("cors");

const contestRoutes = require("./routes/contests");
const { ensureCsvFileExists } = require("./utils/csv");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = new Date().toISOString();
  console.log(`[${startedAt}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/contests", contestRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "ContestFlow API is running" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function bootstrap() {
  await ensureCsvFileExists();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
