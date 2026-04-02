const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const limiter = require("./middlewares/rate-limiter");
const logger = require("./middlewares/logger");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

app.use(cors());
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + file.originalname;
    return cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/leaves", leaveRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/quotes", quoteRoutes);
app.use("/rentals", rentalRoutes);
app.use("/uploads", upload.single("file"), (req, res) => {});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});