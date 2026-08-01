"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      const next = searchParams.get("next") || "/dashboard";
      router.push(next);
      router.refresh();
    } else {
      setError("Password salah, coba lagi.");
    }
  }

  return (
    <div className="container login-box">
      <h1 style={{ color: "var(--navy)" }}>🔒 Arsip Nota</h1>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
        Buana Karya — masukkan password admin
      </p>
      <form onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button className="submit" disabled={loading}>
          {loading ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container login-box">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
