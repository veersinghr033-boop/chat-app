import { Server } from "socket.io";

const onlineUsers = new Map();
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

    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      userStatus.set(userId, "online");
      socket.join(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      io.emit("userStatus", {
        userId,
        status: "online",
      });
    });

    socket.on("userAway", (userId) => {
      userStatus.set(userId, "away");
      io.emit("userStatus", {
        userId,
        status: "away",
      });
    });

    socket.on("userOffline", (userId) => {
      onlineUsers.delete(userId);
      userStatus.set(userId, "offline");
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      io.emit("userStatus", {
        userId,
        status: "offline",
      });
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
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          userStatus.set(userId, "offline");
          io.emit("userStatus", {
            userId,
            status: "offline",
          });
          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
