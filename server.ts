import express from "express";
import notesRoutes from "./server/routes/notes.js";
import settingsRoutes from "./server/routes/settings.js";
import tasksRoutes from "./server/routes/tasks.js";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

// API Routes
app.use("/api/notes", notesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/tasks", tasksRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
