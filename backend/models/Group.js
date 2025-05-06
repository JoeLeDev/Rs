const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

groupSchema.plugin(AutoIncrement, { inc_field: 'groupId' });

module.exports = mongoose.model("Group", groupSchema);
