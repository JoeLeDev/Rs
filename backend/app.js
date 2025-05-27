const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

// -----------------------------
// 🔗 Middlewares
// -----------------------------
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------------
// 🔗 Routes
// -----------------------------
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', uploadRoutes); // 

// Route de test
app.get('/', (req, res) => {
  console.log('➡️ Route GET / appelée');
  res.send('✅ API is running');
});

// -----------------------------
// 🔗 DB & Serveur
// -----------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connecté'))
  .catch((err) => console.error('❌ Erreur connexion MongoDB :', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
