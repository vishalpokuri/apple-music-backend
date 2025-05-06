import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
//Routes
import songRoutes from "./routes/songRoutes.js";

export const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

//align the endpoints with the routes
app.use("/api/song", songRoutes);
app.get("/api", (req, res) => {
  res.json({
    status: 200,
    message: "System operational",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
