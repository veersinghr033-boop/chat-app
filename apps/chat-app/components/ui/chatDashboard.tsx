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
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
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
      setSortedUsers(users);
    }
  }, [users]);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5050");

    socketRef.current = socket;


    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("userOnline", userId);

    });

    socket.on("sortedUsers", (users: User[]) => {
      console.log(users)
      setSortedUsers(users);
    });

    socket.on("userStatus", ({ userId, status }) => {
      setUserStatuses((prev: any) => ({
        ...prev,
        [userId]: status,
      }));
    });
    console.log(sortedUsers)
    socket.on("disconnect", () => {
      console.log(" Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!socketRef.current || !userId) return;

    let timeout: NodeJS.Timeout;

    // let awayTimeout: NodeJS.Timeout;
    // let offlineTimeout: NodeJS.Timeout;

    const setAway = () => {
      socketRef.current.emit("userAway", userId);
    };
    const setOffline = () => {
      socketRef.current.emit("userOffline", userId);
    };
    const resetTimer = () => {
      clearTimeout(timeout);
      socketRef.current.emit("userOnline", userId);
      timeout = setTimeout(setAway, 3 * 60 * 1000);
      timeout = setTimeout(setOffline, 20 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    const handleHidden = () => {
      if (document.hidden) {
        socketRef.current.emit("userAway", userId);
      } else {
        socketRef.current.emit("userOnline", userId);
      }
    };

    document.addEventListener("visibilitychange", handleHidden);

    const handleUnload = () => {
      if (!socketRef.current) return;
      socketRef.current.emit("userOffline", userId);
      socketRef.current.disconnect();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    resetTimer();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [userId]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const filteredUsers = sortedUsers.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
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
        socketRef.current.emit("userOffline", userId);
        socketRef.current.disconnect();
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
            const status = userStatuses[user._id] || "offline";

            return (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`w-full text-left px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50 ${selectedUser?._id === user._id ? "bg-slate-100" : "bg-white"
                  }`}
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-semibold uppercase">
                  {user.username?.[0] || "U"}

                  <span
                    className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${status === "online"
                      ? "bg-green-500"
                      : status === "away"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                      }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="font-medium capitalize">{user.username}</div>

                  <div className="text-sm text-slate-500 capitalize">
                    {status}
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
