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
  const [editingNota, setEditingNota] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return notas;
    return notas.filter(
      (n) => n.nomorNota.toLowerCase().includes(q) || n.customer.toLowerCase().includes(q) || n.barang.toLowerCase().includes(q)
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

  async function handleDelete(id: number, noNota: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus Nota No. ${noNota}?`)) return;
    setLoading(true);
    await fetch(`/api/nota/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNota) return;
    setLoading(true);
    await fetch(`/api/nota/${editingNota.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomorNota: editingNota.nomorNota,
        tanggal: editingNota.tanggal,
        customer: editingNota.customer,
        barang: editingNota.barang,
        volume: editingNota.volume,
        harga: editingNota.harga,
        status: editingNota.status,
        keterangan: editingNota.keterangan,
      }),
    });
    setLoading(false);
    setEditingNota(null);
    router.refresh();
  }

  function formatDateForInput(dateStr: string) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  }

  return (
    <div className="card">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Cari nomor nota, customer, atau barang..."
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
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span
                  className={`badge ${n.status === "Lunas" ? "lunas" : "belum"}`}
                  onClick={() => toggleStatus(n.id, n.status)}
                  style={{ cursor: "pointer" }}
                  title="Tap untuk cepat ubah status"
                >
                  {n.status}
                </span>
              </div>
            </div>

            <div className="meta">
              📅 {new Date(n.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · 👤 {n.customer} · 📦 {n.barang} ({n.volume})
            </div>

            <div className="harga" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Rp {n.harga.toLocaleString("id-ID")}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  className="btn-action"
                  onClick={() => setEditingNota({ ...n, tanggal: formatDateForInput(n.tanggal) })}
                  title="Edit data nota"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-action btn-danger"
                  onClick={() => handleDelete(n.id, n.nomorNota)}
                  title="Hapus nota"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>

            {n.keterangan && <div className="meta" style={{ fontStyle: "italic", marginTop: "4px" }}>📝 {n.keterangan}</div>}
          </div>
        ))
      )}

      {/* Modal Edit Nota */}
      {editingNota && (
        <div className="modal-backdrop" onClick={() => setEditingNota(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Nota #{editingNota.nomorNota}</h3>
              <button className="btn-close" onClick={() => setEditingNota(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <label>Tanggal Nota</label>
              <input
                type="date"
                required
                value={editingNota.tanggal}
                onChange={(e) => setEditingNota({ ...editingNota, tanggal: e.target.value })}
              />

              <label>Nomor Nota</label>
              <input
                type="text"
                required
                value={editingNota.nomorNota}
                onChange={(e) => setEditingNota({ ...editingNota, nomorNota: e.target.value })}
              />

              <label>Nama Customer</label>
              <input
                type="text"
                required
                value={editingNota.customer}
                onChange={(e) => setEditingNota({ ...editingNota, customer: e.target.value })}
              />

              <label>Nama Barang / Pasir</label>
              <input
                type="text"
                required
                value={editingNota.barang}
                onChange={(e) => setEditingNota({ ...editingNota, barang: e.target.value })}
              />

              <label>Volume / Ukuran</label>
              <input
                type="text"
                required
                value={editingNota.volume}
                onChange={(e) => setEditingNota({ ...editingNota, volume: e.target.value })}
              />

              <label>Total Harga (Rp)</label>
              <input
                type="number"
                required
                value={editingNota.harga}
                onChange={(e) => setEditingNota({ ...editingNota, harga: Number(e.target.value) })}
              />

              <label>Status Pembayaran</label>
              <select
                value={editingNota.status}
                onChange={(e) => setEditingNota({ ...editingNota, status: e.target.value })}
              >
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>

              <label>Keterangan Tambahan</label>
              <textarea
                value={editingNota.keterangan || ""}
                onChange={(e) => setEditingNota({ ...editingNota, keterangan: e.target.value })}
              />

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditingNota(null)}>
                  Batal
                </button>
                <button type="submit" className="submit" style={{ flex: 1 }} disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
