import express from "express";
import { connectDB } from "./src/config/db.js";
import AuthRoute from "./src/route/authRoute.js";
import ChatRoute from "./src/route/chatRoute.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = initSocket(server);

app.set("io", io);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api", AuthRoute);
app.use("/api", ChatRoute);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
