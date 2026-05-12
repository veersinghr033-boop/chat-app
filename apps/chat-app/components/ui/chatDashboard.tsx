"use client";

import { useState, useEffect, useRef } from "react";
import { persistor } from "@/lib/store/store";
import { message, Button } from "antd";
import { useRouter } from "next/navigation";
import Chat from "./chat";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logout } from "@/lib/store/features/authThunk";
import { fetchUsers } from "@/lib/store/features/usersThunk";
import { io } from "socket.io-client";

interface User {
  _id: string;
  username: string;
  updatedAt?: string | null;
}

export default function ChatDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const socketRef = useRef<any>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userId = useAppSelector((state) => state.auth.user?.userId);
  const currentUser = useAppSelector((state) => state.auth.user?.user);
  const error = useAppSelector((state) => state.user.error || state.auth.error);
  const users = useAppSelector((state) => state.user.users);
  
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchUsers());
    

  }, [userId, dispatch]);
  useEffect(() => {
    if (users.length > 0) {
      setSortedUsers(users)
    }
  }, [users])

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5050");

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("userOnline", userId);
    });

    socket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on("sortedUsers", (users: User[]) => {
      setSortedUsers(users);
    });

    socket.on("disconnect", () => {
      console.log(" Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const filteredUsers = sortedUsers.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleLogout = async () => {
    try {
      const resultAction: any = await dispatch(logout());
      if (logout.fulfilled.match(resultAction)) {
        message.success("Logout successful");
        await persistor.purge();
        router.push("/login");
      } else {
        message.error(resultAction.payload || "Logout failed");
      }
    } catch (error) {
      message.error("An error occurred during logout");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-80 bg-white border-r border-gray-300 shadow-sm flex flex-col">
        <div className="px-6 py-5 border-b border-gray-300">
          <div className="text-base font-semibold">
            {currentUser ? `Welcome, ${currentUser}` : "Chat"}
          </div>
        </div>

        <div className="px-6 py-4 flex justify-between">
          <h2>Users</h2>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-400 px-2 py-1 rounded"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);

            return (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50 ${selectedUser?._id === user._id
                  ? "bg-slate-100"
                  : "bg-white"
                  }`}
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold uppercase">
                  {user.username?.[0] || "U"}
                  <span
                    className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${isOnline ? "bg-green-500" : "bg-red-400"
                      }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="font-medium capitalize">
                    {user.username}
                  </div>

                  <div className="text-sm text-slate-500">
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-300">
          <Button danger block onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <Chat selectedUser={selectedUser} userId={userId} />
    </div>
  );
}