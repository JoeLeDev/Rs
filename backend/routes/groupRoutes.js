const express = require("express");
const router = express.Router();
const { getAllGroups, createGroup, updateGroup, deleteGroup, getGroupById, joinGroup, leaveGroup  } = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");



router.get("/", getAllGroups);
router.post("/", authMiddleware, createGroup); 
router.patch("/:id", authMiddleware, updateGroup);
router.delete("/:id", authMiddleware, deleteGroup);
router.get("/:id", getGroupById);
router.patch("/:id/join", authMiddleware, joinGroup);
router.patch("/:id/leave", authMiddleware, leaveGroup);
module.exports = router;
