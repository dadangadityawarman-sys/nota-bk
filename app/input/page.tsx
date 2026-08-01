"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../NavBar";

const today = () => new Date().toISOString().slice(0, 10);

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nomorNota: "",
    tanggal: today(),
    customer: "",
    barang: "Pasir",
    volume: "",
    harga: "",
    status: "Belum Lunas",
    keterangan: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/nota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setForm({
        nomorNota: "",
        tanggal: today(),
        customer: "",
        barang: "Pasir",
        volume: "",
        harga: "",
        status: "Belum Lunas",
        keterangan: "",
      });
      setTimeout(() => setSuccess(false), 2500);
    } else {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan, coba lagi.");
    }
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <div className="card">
          <form onSubmit={handleSubmit}>
            {success && (
              <p style={{ background: "var(--green-bg)", color: "var(--green)", padding: 10, borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                ✅ Nota berhasil disimpan!
              </p>
            )}
            {error && <p className="error-text">{error}</p>}

            <label>Nomor Nota</label>
            <input
              required
              type="text"
              placeholder="Contoh: 472"
              value={form.nomorNota}
              onChange={(e) => update("nomorNota", e.target.value)}
            />

            <label>Tanggal</label>
            <input
              required
              type="date"
              value={form.tanggal}
              onChange={(e) => update("tanggal", e.target.value)}
            />

            <label>Nama Customer</label>
            <input
              required
              type="text"
              placeholder="Contoh: Bapak Slamet"
              value={form.customer}
              onChange={(e) => update("customer", e.target.value)}
            />

            <label>Barang</label>
            <select value={form.barang} onChange={(e) => update("barang", e.target.value)}>
              <option>Pasir</option>
              <option>Batu</option>
              <option>Split</option>
              <option>Lainnya</option>
            </select>

            <label>Volume</label>
            <input
              required
              type="text"
              placeholder="Contoh: 3 rit / 5 m³"
              value={form.volume}
              onChange={(e) => update("volume", e.target.value)}
            />

            <label>Harga (Rp)</label>
            <input
              required
              type="number"
              placeholder="Contoh: 750000"
              value={form.harga}
              onChange={(e) => update("harga", e.target.value)}
            />

            <label>Status Pembayaran</label>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option>Belum Lunas</option>
              <option>Lunas</option>
            </select>

            <label>Keterangan (opsional)</label>
            <textarea
              placeholder="Catatan tambahan..."
              value={form.keterangan}
              onChange={(e) => update("keterangan", e.target.value)}
            />

            <button className="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "💾 Simpan Nota"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
