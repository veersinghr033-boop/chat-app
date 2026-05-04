"use client";
import { useState } from "react";
import { message } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utills/axios";
import { useAppDispatch } from "@/lib/store/hooks";
import { signup } from "@/lib/store/features/authThunk";


function Signup() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  const handleSignup = async (e: any) => {
    e.preventDefault();

    if (!username || !password || !email ) {
      message.error("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      message.error("Invalid email format");
      return;
    }

    try {
      const resultAction: any = await dispatch(
        signup({ username, password, email })
      );
      if (signup.fulfilled.match(resultAction)) {
        message.success("Signup successful");
        router.push("/login");
      } else {
        message.error(resultAction.payload || "Signup failed");
      }
    } catch (error: any) {
      message.error(error);
    }

  };
  return (
    <div className=" w-100 border rounded-lg mx-auto my-10  p-3 ">
      <h1 className="text-2xl font-bold text-center mt-10">Signup Page</h1>
      <form className="flex flex-col  mt-5 gap-3" onSubmit={handleSignup}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          placeholder="Username"
          value={username}
          className="p-2 border rounded w-full "
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          className="p-2 border rounded w-full "
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          className="p-2 border rounded w-full "
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          placeholder="Phone"
          value={phone}
          className="p-2 border rounded w-full "
          onChange={(e) => setPhone(e.target.value)}
        /> */}
        <div className="items-center flex justify-center space-x-5">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Signup
          </button>
          <Link href={"/login"} className="text-blue-500">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;
