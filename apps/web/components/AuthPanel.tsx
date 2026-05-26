"use client";

import { useState } from "react";
import { login, register } from "../lib/auth";

export function AuthPanel() {
  const [email, setEmail] = useState("demo@marketstrategy.local");
  const [password, setPassword] = useState("ChangeMe12345!");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(mode: "login" | "register") {
    setError(null);
    try {
      const r = mode === "login" ? await login(email, password) : await register(email, password);
      setResult(r);
      if (typeof window !== "undefined") {
        localStorage.setItem("marketStrategyAccessToken", r.tokens?.accessToken ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Production Auth</h3>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={() => submit("login")}>Login</button>
        <button onClick={() => submit("register")}>Register</button>
      </div>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}
      {result?.user && <p className="small">Signed in as {result.user.email}</p>}
    </div>
  );
}
