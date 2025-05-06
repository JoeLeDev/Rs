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


exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!["admin", "admin_groupe"].includes(userRole)) {
    return res.status(403).json({ message: "Accès interdit : rôle insuffisant." });
  }

  if (!name) {
    return res.status(400).json({ message: "Le nom du groupe est requis." });
  }

  try {
    const newGroup = await Group.create({
      name,
      description,
      createdBy: userId,
      members: [userId],
    });

    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Erreur création groupe :", err);
    res.status(500).json({ message: "Erreur lors de la création du groupe." });
  }
};

exports.updateGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { name, description } = req.body;

  try {
    const group = await Group.findOne({ groupId: req.params.id });
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }
    const isOwner = group.createdBy.toString() === userId;
    if (!isOwner && !["admin", "admin_groupe"].includes(userRole)) {
      return res.status(403).json({ message: "Non autorisé à modifier ce groupe." });
    }

    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }

     isOwner = group.createdBy.toString() === userId;

    if (!isOwner && !["admin", "admin_groupe"].includes(userRole)) {
      return res.status(403).json({ message: "Non autorisé à modifier ce groupe." });
    }

    if (name) group.name = name;
    if (description) group.description = description;

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur updateGroup :", err);
    res.status(500).json({ message: "Erreur serveur lors de la modification." });
  }
};


exports.deleteGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const group = await Group.findOne({ groupId: groupId });

    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }

    const isOwner = group.createdBy.toString() === userId;

    if (!isOwner && !["admin", "admin_groupe"].includes(userRole)) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce groupe." });
    }

    await group.deleteOne();

    res.status(200).json({ message: "Groupe supprimé avec succès." });
  } catch (err) {
    console.error("Erreur deleteGroup :", err);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
