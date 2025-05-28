const User = require("../models/User");

exports.syncUser = async (req, res) => {
  const { firebaseUid, email, username, imageUrl } = req.body;

  try {
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        email,
        username,
        imageUrl: imageUrl || "",
        role: "user", // par défaut
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur syncUser :", error);
    res.status(500).json({ message: "Erreur lors de la synchronisation" });
  }
};


exports.updateUser = async (req, res) => {
  const userId = req.user.uid; // ou req.user.id si tu stockes ça différemment
  const { email, username, imageUrl } = req.body;

  try {
    const updateFields = {};

    if (email) updateFields.email = email;
    if (username) updateFields.username = username;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: userId }, // ← on utilise firebaseUid ici !
      updateFields,
      { new: true }
    ).select("-password");

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("Erreur updateUser :", err);
    res.status(500).json({ message: "Erreur mise à jour profil" });
  }
};

