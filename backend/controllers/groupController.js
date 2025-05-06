const Group = require("../models/Group");

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("createdBy", "username");
    res.status(200).json(groups);
  } catch (err) {
    console.error("Erreur GET /groups :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
