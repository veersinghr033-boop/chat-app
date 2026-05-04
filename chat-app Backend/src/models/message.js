import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  timestamp: { type: Date, default: Date.now },
});
export default mongoose.model("Message", messageSchema);
