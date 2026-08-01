"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
  const pathname = usePathname();
  return (
    <>
      <div className="topbar">
        <h1>🧾 Arsip Nota — Buana Karya</h1>
        <p>Dsn. Gelap, Podosoko, Sawangan, Magelang</p>
      </div>
      <div className="nav-links">
        <Link href="/input" className={pathname === "/input" ? "active" : ""}>
          ➕ Input Nota
        </Link>
        <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>
          📊 Dashboard
        </Link>
      </div>
    </>
  );
}
