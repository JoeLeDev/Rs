const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { updateUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
// Route protégée pour la mise à jour de l'utilisateur
router.patch("/update", authMiddleware, updateUser);


router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome", user: req.user });
});

module.exports = router;
