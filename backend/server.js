const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

/* ✅ BODY PARSERS */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* USER ROUTES */
app.use("/api/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;

/* DB + SERVER */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.log(err));
