import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret_key = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  // console.log(token)
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token." });
    }
    req.user = decoded;
    next();
  });
};
