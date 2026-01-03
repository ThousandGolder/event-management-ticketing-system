import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "event-ticketing-backend",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Local backend server running on http://localhost:${PORT}`);
    console.log(`     GET  http://localhost:${PORT}/health`);
});