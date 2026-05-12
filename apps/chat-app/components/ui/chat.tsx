"use client";

import api from "@/utills/axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { message } from "antd";
import { Virtuoso } from "react-virtuoso";
import { io } from "socket.io-client";

interface ChatProps {
  selectedUser: any;
  userId: string;
}

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

function Chat({ selectedUser, userId }: ChatProps) {
  const [messageText, setMessageText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<any>(null);
  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5050");

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current.off("onlineUsers");
    };
  }, []);

  const loadMessages = async () => {
    if (!selectedUser) return;

    try {
      const res = await api.get(`/chat/${selectedUser._id}`);

      setMessages(res.data);
    } catch {
      message.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || !socketRef.current || !userId) return;

    const newRoom = [userId, selectedUser._id].sort().join("_");

    if (currentRoomRef.current) {
      socketRef.current.emit("leaveRoom", currentRoomRef.current);
    }

    socketRef.current.emit("joinRoom", {
      user1: userId,
      user2: selectedUser._id,
    });
    currentRoomRef.current = newRoom;

    const handler = (msg: Message) => {
      if (!selectedUser) return;

      const currentRoom = [userId, selectedUser._id].sort().join("_");
      const msgRoom = [msg.senderId, msg.receiverId].sort().join("_");

      if (currentRoom === msgRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socketRef.current.on("receiveMessage", handler);

    return () => {
      socketRef.current.off("receiveMessage", handler);
    };
  }, [selectedUser, userId]);

  const handleMessageSend = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!messageText.trim() || !selectedUser) return;

      const response = await api.post("/chat", {
        senderId: userId,
        receiverId: selectedUser._id,
        message: messageText.trim(),
      });
      if (response.status === 201) {
        setMessageText("");
        message.success(response.data.message);
      }
    } catch (error) {
      message.error("Failed to send message");
    }
  };
  // console.log(onlineUsers , selectedUser)

  return (
    <main className="flex-1 flex flex-col">
      <header className="flex items-center border-b border-gray-300 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold uppercase relative">
            {selectedUser?.username?.[0] || "U"}
            <span
              className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${
                onlineUsers.includes(selectedUser?._id)
                  ? "bg-green-500"
                  : "bg-red-400"
              }`}
            ></span>
          </div>
          <div className="text-base font-semibold capitalize">
            {selectedUser ? selectedUser.username : "Open a chat"}
          </div>
        </div>
      </header>

      <section className="flex-1 overflow-hidden bg-slate-50">
        {selectedUser ? (
          <div className="h-full flex flex-col ">
            <Virtuoso
              style={{ height: "100%" }}
              data={messages}
              followOutput="smooth"
              itemContent={(index, item: Message) => {
                const isMine = item.senderId === userId;

                return (
                  <div
                    className={`flex flex-col gap-1 mx-4 py- 1.5 ${isMine ? "self-end items-end" : "self-start items-start"}`}
                  >
                    <div
                      className={`inline-block max-w-[70%] rounded-2xl px-5 py-2 ${
                        isMine
                          ? "bg-blue-500 text-white shadow"
                          : "bg-white text-black shadow"
                      }`}
                    >
                      {item.message}
                    </div>

                    <div className="text-xs text-gray-400 mb-2.5 px-1">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              }}
            />

            <form
              className="border-t border-gray-300 bg-white px-6 py-4"
              onSubmit={handleMessageSend}
            >
              <div className="flex gap-3">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 rounded-full border border-slate-300 px-5 py-3 focus:border-blue-500 focus:outline-none"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!messageText.trim()}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Select a user to start chatting.
          </div>
        )}
      </section>
    </main>
  );
}

export default Chat;
