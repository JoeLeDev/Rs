const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ c'est ici qu'il doit être, une seule fois
app.use("/uploads", express.static("uploads"));

// Routes
const groupRoutes = require("./routes/groupRoutes");
app.use("/api/groups", groupRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  console.log("➡️ Route GET / appelée");
  res.send("API is running");
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});
