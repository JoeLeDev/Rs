// controllers/groupController.js
const Group = require("../models/Group");
const User = require("../models/User");
const defineAbilityFor = require("../abilities/defineAbilityFor");

// 🔁 Obtenir tous les groupes
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("createdBy", "username");
    res.status(200).json(groups);
  } catch (err) {
    console.error("Erreur GET /groups:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ➕ Créer un groupe
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const ability = defineAbilityFor(req.user);

  if (!ability.can("create", "Group")) {
    return res.status(403).json({ message: "Accès interdit." });
  }

  if (!name) return res.status(400).json({ message: "Le nom est requis." });

  try {
    const newGroup = await Group.create({
      name,
      description,
      meetingDay: "Lundi",
      createdBy: req.user.id,
      members: [],
    });
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Erreur création groupe:", err);
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};

// 🛠️ Mettre à jour un groupe
exports.updateGroup = async (req, res) => {
  const groupIdParam = Number(req.params.id);
  const { name, description, meetingDay, roleUpdates } = req.body;

  try {
    const group = await Group.findOne({ groupId: groupIdParam });
    if (!group) return res.status(404).json({ message: "Groupe non trouvé." });

    const ability = defineAbilityFor(req.user, group);
    if (!ability.can("update", "Group")) {
      return res.status(403).json({ message: "Modification non autorisée." });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (meetingDay) group.meetingDay = meetingDay;

    // ✅ Gestion des rôles locaux (admin uniquement)
    if (["admin", "admin_groupe"].includes(req.user.role) && Array.isArray(roleUpdates)) {
      group.roles = group.roles.filter(
        (r) => !roleUpdates.some((u) => u.userId === r.userId.toString())
      );
      roleUpdates.forEach(({ userId, role }) => {
        if (role && role !== "user") {
          group.roles.push({ userId, role });
        }
      });
    }

    await group.save();
    res.status(200).json(group);
  } catch (err) {
    console.error("❌ Erreur updateGroup:", err);
    res.status(500).json({ message: "Erreur lors de la modification." });
  }
};

// 🗑️ Supprimer un groupe
exports.deleteGroup = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ message: "Groupe non trouvé." });

    const ability = defineAbilityFor(req.user);
    if (!ability.can("delete", "Group")) {
      return res.status(403).json({ message: "Suppression non autorisée." });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Groupe supprimé." });
  } catch (err) {
    console.error("Erreur deleteGroup:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔍 Obtenir un groupe par ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findOne({ groupId: req.params.id }).populate("members", "username email _id");
    if (!group) return res.status(404).json({ message: "Groupe introuvable." });
    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur getGroupById:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ➕ Rejoindre un groupe
exports.joinGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ message: "Groupe non trouvé." });

    if (group.members.some((m) => m.toString() === userId.toString())) {
      return res.status(400).json({ message: "Déjà membre du groupe." });
    }

    group.members.push(userId);
    await group.save();
    res.status(200).json({ message: "Rejoint avec succès", group });
  } catch (err) {
    console.error("Erreur joinGroup:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ➖ Quitter un groupe
exports.leaveGroup = async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ groupId });
    if (!group) return res.status(404).json({ message: "Groupe non trouvé." });

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    await group.save();

    res.status(200).json({ message: "Quitté avec succès", group });
  } catch (err) {
    console.error("Erreur leaveGroup:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};