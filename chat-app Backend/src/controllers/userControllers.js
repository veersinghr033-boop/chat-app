import User from "../models/authModel.js";

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  }
    catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};