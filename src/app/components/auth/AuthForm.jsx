"use client";

import Login from "./Login";
import Signup from "./Signup";

export default function AuthForm({ mode }) {
  return <>{mode === "login" ? <Login /> : <Signup />}</>;
}
