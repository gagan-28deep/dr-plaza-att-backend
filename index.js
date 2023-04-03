const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");

const requestIp = require("request-ip");
const geoip = require("geoip-lite");

app.use(requestIp.mw());

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
// Auth Routes
const authRouter = require("./routes/authRoutes.js");

// Auth Router
app.use("/api/auth", authRouter);

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
});

const upload = multer({ storage: storage });

// Upload Route
app.post("/upload", upload.array("file"), (req, res, next) => {
  console.log("File uploaded successfully");
  res.json({
    message: "File uploaded successfully",
  });
  next();
});

// Default Route
app.get("/", (req, res) => {
  res.json({
    message: "Backend API",
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log("Server is running on port " + PORT);
});
