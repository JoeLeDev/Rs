const express = require("express");
const router = express.Router();
const { getAllGroups, createGroup, updateGroup } = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");


router.get("/", getAllGroups);
router.post("/", authMiddleware, createGroup); 
router.patch("/:id", authMiddleware, updateGroup);

module.exports = router;
