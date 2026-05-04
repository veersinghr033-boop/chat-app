"use client";

import { message } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { login } from "@/lib/store/features/authThunk";

function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();
    const dispatch = useAppDispatch();
    const handleLogin = async (e: any) => {
        e.preventDefault();

        try {
            const resultAction: any = await dispatch(login({ email, password }));
            if (login.fulfilled.match(resultAction)) {
                message.success("Login successful");
                router.push("/");
            } else {
                message.error(resultAction.payload || "Login failed");
            }

        } catch (error: any) {
            message.error(error);
        }
    };
    return (
        <div className=" w-100 border rounded-lg mx-auto my-10  p-3 ">
            <h1 className="text-2xl font-bold text-center mt-10">Login Page</h1>
            <p className="text-center mt-5">
                Please enter your credentials to log in.
            </p>

            <div>
                <form
                    className=" flex flex-col  mt-5 gap-3 "
                    onSubmit={handleLogin}
                >
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="email"
                        value={email}
                        className="p-2 border rounded w-full "
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        value={password}
                        className="p-2 border rounded w-full"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="items-center flex justify-center space-x-5">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Login
                        </button>
                        <Link href={"/signup"} className="text-blue-500">
                            Signup
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
