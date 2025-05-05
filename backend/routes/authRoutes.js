const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { updateUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require("../middlewares/uploadMiddleware");
const User = require("../models/User");
const multer = require("multer");

router.post('/register', register);
router.post('/login', login);
// Route protégée pour la mise à jour de l'utilisateur
router.patch("/update", authMiddleware, updateUser);


router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome", user: req.user });
});

router.patch(
  "/upload-profile",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    console.log("📸 Fichier :", req.file);
    console.log("🔐 Utilisateur :", req.user);

    try {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { imageUrl: req.file.path },
        { new: true }
      ).select("-password");

      console.log("✅ Utilisateur mis à jour :", user);

      res.status(200).json({ user });
    } catch (err) {
      console.error("❌ Erreur mise à jour :", err);
      res.status(500).json({ message: "Erreur upload" });
    }
  }
);
module.exports = router;
