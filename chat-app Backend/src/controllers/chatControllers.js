import Chat from "../models/chatModel.js";
import Message from "../models/message.js";

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user.users.id;
    const { receiverId } = req.params;

    const participants = [senderId, receiverId].sort();

    const chat = await Chat.findOne({ participants });
    

    if (!chat) return res.json([]);
    
    const messages = await Message.find({ chatId: chat._id }).sort({
      timestamp: 1,
    });
    const room = [senderId, receiverId].sort().join("_");

    const io = req.app.get("io");
    io.to(room).emit("chatHistory", messages); 

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const createChat = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const participants = [senderId, receiverId].sort();

    let chat = await Chat.findOne({ participants });

    if (!chat) {
      chat = await Chat.create({ participants });
    }

    const newMsg = await Message.create({
      senderId,
      message,
      chatId: chat._id,
    });

    const formattedMsg = {
      senderId,
      receiverId,
      message: newMsg.message,
      timestamp: newMsg.timestamp,
    };

    const room = [senderId, receiverId].sort().join("_");

    const io = req.app.get("io");
    io.to(room).emit("receiveMessage", formattedMsg);

    res.status(201).json({
      message: "Message sent",
      chatId: chat._id,
      newMsg,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



