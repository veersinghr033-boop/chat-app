import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
const Message = mongoose.model("Message", messageSchema);

export default Message;