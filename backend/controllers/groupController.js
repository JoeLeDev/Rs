const Group = require("../models/Group");

// Obtenir tous les groupes
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("createdBy", "username");
    res.status(200).json(groups);
  } catch (err) {
    console.error("Erreur GET /groups :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un groupe
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!["admin", "admin_groupe"].includes(userRole)) {
    return res
      .status(403)
      .json({ message: "Accès interdit : rôle insuffisant." });
  }

  if (!name) {
    return res.status(400).json({ message: "Le nom du groupe est requis." });
  }

  try {
    const newGroup = await Group.create({
      name,
      description,
      meetingDay: "Lundi", // Valeur par défaut
      createdBy: userId,
      members: [],
    });

    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Erreur création groupe :", err);
    res.status(500).json({ message: "Erreur lors de la création du groupe." });
  }
};

// Mettre à jour un groupe
exports.updateGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { name, description, meetingDay } = req.body;

  try {
    const groupId = Number(req.params.id);
    console.log(
      "🔎 req.params.id =",
      req.params.id,
      "type:",
      typeof req.params.id
    );
    console.log("🔎 groupId (Number) =", Number(req.params.id));

    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé." });
    }
    const isOwner = group.createdBy.toString() === userId;
    if (!isOwner && !["admin", "admin_groupe"].includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier ce groupe." });
    }

    if (!isOwner && !["admin", "admin_groupe"].includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Non autorisé à modifier ce groupe." });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (meetingDay) group.meetingDay = meetingDay;

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur updateGroup :", err);
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la modification." });
  }
};

// Supprimer un groupe
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
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer ce groupe." });
    }

    await group.deleteOne();

    res.status(200).json({ message: "Groupe supprimé avec succès." });
  } catch (err) {
    console.error("Erreur deleteGroup :", err);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

// Obtenir un groupe par ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id }).populate(
      "members",
      "username email _id"
    );

    if (!group) return res.status(404).json({ message: "Groupe introuvable." });

    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur getGroupById :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// Rejoindre un groupe
exports.joinGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await Group.findOne({ groupId });
  if (!group) return res.status(404).json({ message: "Groupe non trouvé" });

  const isAlreadyMember = group.members
  .map((m) => m.toString())
  .includes(userId.toString());

  if (isAlreadyMember) {
    return res.status(400).json({ message: "Tu es déjà membre du groupe." });
  }

  group.members.push(userId);
  await group.save();

  res.status(200).json({ message: "Rejoint avec succès", group });
};

// Quitter un groupe
exports.leaveGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await Group.findOne({ groupId });
  if (!group) return res.status(404).json({ message: "Groupe non trouvé" });

  group.members = group.members.filter(
    (m) => m.toString() !== userId.toString()
  );
  const isMember = group.members.some((member) => {
    const id = typeof member === "object" ? member._id : member;

    return id !== userId;
  });

  await group.save();

  res.status(200).json({ message: "Quitté avec succès", group });
};
