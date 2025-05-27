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
