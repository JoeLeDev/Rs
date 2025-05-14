const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupId: Number,
  name: { type: String, required: true },
  description: String,
  meetingDay: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roles: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["pilote","membre"], default: "membre" }
    }
  ]
});

module.exports = mongoose.model("Group", groupSchema);