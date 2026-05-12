import User from "../models/authModel.js";
import Chat from "../models/chatModel.js";

export const emitSortedUsers = async (io, currentUserId) => {
  const users = await User.find({ _id: { $ne: currentUserId } });

  const chats = await Chat.find({
    participants: currentUserId,
  });

  const result = users.map((user) => {
    const chat = chats.find((c) => c.participants.includes(user._id));

    return {
      _id: user._id,
      username: user.username,
      updatedAt: chat?.updatedAt || null,
    };
  });

  result.sort((a, b) => {
    if (a.updatedAt && b.updatedAt)
      return new Date(b.updatedAt) - new Date(a.updatedAt);

    if (a.updatedAt) return -1;
    if (b.updatedAt) return 1;

    return a.username.localeCompare(b.username);
  });

  io.to(currentUserId.toString()).emit("sortedUsers", result);

  return result;
};
export const getUsersSorted = async (req, res) => {
  try {
    const currentUserId = req.user.users.id;
    const io = req.app.get("io");

    const result = await emitSortedUsers(io, currentUserId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};