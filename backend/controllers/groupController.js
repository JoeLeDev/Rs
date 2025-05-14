// controllers/groupController.js
const Group = require("../models/Group");
const User = require("../models/User");
const { defineAbilityFor } = require("../abilities/defineAbilityFor");
const mongoose = require("mongoose");

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
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    group.name = req.body.name || group.name;
    group.description = req.body.description || group.description;

    await group.save();

    res.status(200).json(group);
  } catch (err) {
    console.error("Erreur updateGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🗑️ Supprimer un groupe
exports.deleteGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    await Group.deleteOne({ _id: group._id }); // ✅ safe & simple

    res.status(200).json({ message: "Groupe supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔍 Obtenir un groupe par ID
exports.getGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const isMongoId = /^[a-f\d]{24}$/i.test(id); // détecte si c'est un ObjectId

    const group = isMongoId
      ? await Group.findById(id).populate("members", "username email").populate("createdBy", "username")
      : await Group.findOne({ groupId: Number(id) }).populate("members", "username").populate("createdBy", "username");

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    res.status(200).json(group);
  } catch (err) {
    console.error(" Erreur GET /groups/:id :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ➕ Rejoindre un groupe
exports.joinGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    const isAlreadyMember = group.members.some(
      (member) => member.toString() === req.user.id.toString()
    );

    if (!isAlreadyMember) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({ message: "Inscription réussie" });
  } catch (err) {
    console.error("Erreur joinGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// ➖ Quitter un groupe
exports.leaveGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);

    const group = isMongoId
      ? await Group.findById(id)
      : await Group.findOne({ groupId: Number(id) });

    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    group.members = group.members.filter(member => {
      const memberId = typeof member === "object" ? member._id.toString() : member.toString();
      return memberId !== req.user.id.toString();
    });

    await group.save();

    res.status(200).json({ message: "Tu as quitté le groupe" });
  } catch (err) {
    console.error("Erreur leaveGroup:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//  Changer le rôle d'un membre
exports.updateGroupRole = async (req, res) => {
  const { id } = req.params;
  const { memberId, role } = req.body;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    // ✅ Supprimer tous les anciens rôles "pilote"
    group.roles = group.roles.filter((r) => r.role !== "pilote");

    // ✅ Si un nouveau pilote est défini, on vérifie qu’il est membre et on l’ajoute
    if (memberId) {
      const isMember = group.members.some((m) => m.toString() === memberId);
      if (!isMember) {
        return res.status(400).json({ message: "Le membre n'appartient pas à ce groupe" });
      }

      group.roles.push({ userId: memberId, role: role });
    }

    await group.save();
    res.status(200).json({ message: "Rôle mis à jour" });

  } catch (err) {
    console.error("Erreur PATCH /groups/:id/roles :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
