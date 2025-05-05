const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.updateUser = async (req, res) => {
    const userId = req.user.id;
    const { email, password, username } = req.body;
  
    try {
      const updateData = {};
      if (email) updateData.email = email;
      if (username) updateData.username = username;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
  
      res.status(200).json({ user: updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  };
  