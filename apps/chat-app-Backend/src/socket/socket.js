import { Server } from "socket.io";

const onlineUsers = new Map();
const socketToUser = new Map();
const userStatus = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const setUserOffline = (userId) => {
      if (!userId) return;
      userStatus.set(userId, "offline");
      onlineUsers.delete(userId);
      socketToUser.delete(socket.id);
      io.emit("userStatus", { userId, status: "offline" });
    };

    socket.on("userOnline", (userId) => {
      userStatus.set(userId, "online");
      onlineUsers.set(userId, socket.id);
      socketToUser.set(socket.id, userId);
      socket.join(userId);
      io.emit("userStatus", { userId, status: "online" });
    });

    socket.on("userAway", (userId) => {
      userStatus.set(userId, "away");
      io.emit("userStatus", { userId, status: "away" });
    });

    socket.on("userOffline", (userId) => {
      setUserOffline(userId);
    });

    socket.on("joinRoom", ({ user1, user2 }) => {
      const room = [user1, user2].sort().join("_");
      socket.join(room);
    });
    socket.on("leaveRoom", ({ user1, user2 }) => {
      const room = [user1, user2].sort().join("_");
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        setUserOffline(userId);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
