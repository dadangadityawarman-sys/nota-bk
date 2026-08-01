"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Nota = {
  id: number;
  nomorNota: string;
  tanggal: string;
  customer: string;
  barang: string;
  volume: string;
  harga: number;
  status: string;
  keterangan: string | null;
};

export default function NotaList({ notas }: { notas: Nota[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return notas;
    return notas.filter(
      (n) => n.nomorNota.toLowerCase().includes(q) || n.customer.toLowerCase().includes(q)
    );
  }, [query, notas]);

  async function toggleStatus(id: number, current: string) {
    const next = current === "Lunas" ? "Belum Lunas" : "Lunas";
    await fetch(`/api/nota/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div className="card">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Cari nomor nota atau nama customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">Belum ada nota yang cocok.</div>
      ) : (
        filtered.map((n) => (
          <div className="nota-item" key={n.id}>
            <div className="row1">
              <span className="no">No. {n.nomorNota}</span>
              <span
                className={`badge ${n.status === "Lunas" ? "lunas" : "belum"}`}
                onClick={() => toggleStatus(n.id, n.status)}
                style={{ cursor: "pointer" }}
                title="Tap untuk ubah status"
              >
                {n.status}
              </span>
            </div>
            <div className="meta">
              {new Date(n.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {n.customer} · {n.barang} ({n.volume})
            </div>
            <div className="harga">Rp {n.harga.toLocaleString("id-ID")}</div>
            {n.keterangan && <div className="meta" style={{ fontStyle: "italic" }}>{n.keterangan}</div>}
          </div>
        ))
      )}
    </div>
  );
}
