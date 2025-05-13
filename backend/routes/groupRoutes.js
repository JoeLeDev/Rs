const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const auth = require("../middlewares/authMiddleware");
const checkAbility = require("../middlewares/groupMiddleware");
const loadGroup = require("../middlewares/loadGroup"); // 👈 nouveau

// Routes
router.get("/", auth, groupController.getAllGroups);
router.post("/", auth, checkAbility("create", "Group"), groupController.createGroup);
router.get('/:id', auth, groupController.getGroupById);
router.patch('/:id/join', auth, loadGroup, groupController.joinGroup);
router.patch('/:id/leave', auth, loadGroup, groupController.leaveGroup);

// Pour update et delete, on charge d'abord le groupe
router.patch("/:id", auth, loadGroup, checkAbility("update", "Group"), groupController.updateGroup);
router.delete("/:id", auth, loadGroup, checkAbility("delete", "Group"), groupController.deleteGroup);

module.exports = router;