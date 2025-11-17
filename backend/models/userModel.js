import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["member", "team_lead", "admin"],
    default: "member",
    required: true,
  },
});

const userModel = mongoose.models.user || mongoose.model("User", userSchema);
export default userModel;
