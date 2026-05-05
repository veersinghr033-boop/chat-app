import e from "express";
import { Login ,SignUp ,logoutUser } from "../controllers/authControllers.js";
import {   getUsersSorted } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import express from "express";

const router = express.Router();

router.post("/signup", SignUp);
router.post("/login", Login);
router.get("/users",verifyToken, getUsersSorted);
router.get("/users/sorted",verifyToken, getUsersSorted);
router.post("/logout",verifyToken, logoutUser);

export default router;