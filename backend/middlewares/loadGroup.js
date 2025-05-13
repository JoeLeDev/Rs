// Permet de checker les roles locaux et globaux (pilote dans un groupe par exemple)
const Group = require("../models/Group");

const loadGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: "Groupe introuvable." });
    }
    req.group = group;
    next();
  } catch (err) {
    console.error("Erreur middleware loadGroup:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = loadGroup;
