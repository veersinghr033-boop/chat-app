import User from "../models/authModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const SignUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!email || !password || !username ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });
     const users = {
       id: newUser._id,
       username: newUser.username,
       email: newUser.email,
     };
    const token = jwt.sign({ users }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Account created successfully",
      user: newUser,
      token,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
    const users ={
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
    }
    const token = jwt.sign({ users }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Server error" });
  }
};
