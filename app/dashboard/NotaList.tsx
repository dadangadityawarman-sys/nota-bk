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
  const [sharingNota, setSharingNota] = useState<Nota | null>(null);
  const [activeTab, setActiveTab] = useState<"wa" | "card">("wa");
  const [copied, setCopied] = useState(false);
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

  function generateWaText(n: Nota) {
    const dateFormatted = new Date(n.tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const statusEmoji = n.status === "Lunas" ? "✅ *LUNAS*" : "⏳ *BELUM LUNAS*";
    const ketText = n.keterangan ? `\n📝 *Ket:* ${n.keterangan}` : "";

    return `🧾 *NOTA PENJUALAN - BUANA KARYA*
----------------------------------------
📌 *No. Nota:* #${n.nomorNota}
📅 *Tanggal:* ${dateFormatted}
👤 *Customer:* ${n.customer}

📦 *Barang:* ${n.barang}
📐 *Volume:* ${n.volume}
💰 *Total:* Rp ${n.harga.toLocaleString("id-ID")}
📌 *Status:* ${statusEmoji}${ketText}
----------------------------------------
Terima kasih atas kerja samanya! 🙏
_Buana Karya - Pasir, Batu & Material_`;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  className="btn-action btn-primary"
                  onClick={() => { setSharingNota(n); setActiveTab("wa"); }}
                  title="Bagikan via WA / Kartu Gambar"
                >
                  📲 Bagikan / Nota
                </button>
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

      {/* Modal Bagikan WA & Kartu Nota Gambar */}
      {sharingNota && (
        <div className="modal-backdrop" onClick={() => setSharingNota(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <h3>📲 Bagikan Nota #{sharingNota.nomorNota}</h3>
              <button className="btn-close" onClick={() => setSharingNota(null)}>✕</button>
            </div>

            {/* Navigasi Tab (WA vs Gambar) */}
            <div className="nav-links" style={{ marginBottom: "16px", padding: "4px" }}>
              <a
                href="#"
                className={activeTab === "wa" ? "active" : ""}
                onClick={(e) => { e.preventDefault(); setActiveTab("wa"); }}
              >
                💬 Format Chat WA
              </a>
              <a
                href="#"
                className={activeTab === "card" ? "active" : ""}
                onClick={(e) => { e.preventDefault(); setActiveTab("card"); }}
              >
                🖼️ Kartu Nota (Screenshot)
              </a>
            </div>

            {/* TAB 1: FORMAT CHAT WA */}
            {activeTab === "wa" && (
              <div>
                <div className="wa-preview-box">
                  <div className="wa-message-bubble">
                    {generateWaText(sharingNota)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => copyToClipboard(generateWaText(sharingNota))}
                    style={{ flex: 1 }}
                  >
                    {copied ? "✅ Tersalin!" : "📋 Salin Teks WA"}
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateWaText(sharingNota))}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none", flex: 1.2 }}
                  >
                    <button type="button" className="btn-wa">
                      💬 Kirim ke WhatsApp
                    </button>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: KARTU NOTA VISUAL GAMBAR */}
            {activeTab === "card" && (
              <div>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 10px 0", textAlign: "center" }}>
                  💡 <em>Tampilan kartu di bawah dirancang rapi. Tinggal <strong>Screenshot (Tangkap Layar)</strong> dari HP/Laptop untuk dijadikan gambar!</em>
                </p>

                <div className="nota-image-card">
                  <div className="nota-image-header">
                    <div>
                      <h4 className="brand-title">BUANA KARYA</h4>
                      <span className="brand-subtitle">Pasir, Batu & Material Bangunan</span>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "12px", fontWeight: "bold", color: "var(--navy)" }}>
                      NOTA PENJUALAN<br />
                      <span style={{ fontSize: "14px" }}>#{sharingNota.nomorNota}</span>
                    </div>
                  </div>

                  <div className="nota-image-body">
                    <div className="nota-image-row">
                      <span className="label">📅 Tanggal</span>
                      <span className="val">
                        {new Date(sharingNota.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="nota-image-row">
                      <span className="label">👤 Customer</span>
                      <span className="val">{sharingNota.customer}</span>
                    </div>
                    <div className="nota-image-row">
                      <span className="label">📦 Barang</span>
                      <span className="val">{sharingNota.barang}</span>
                    </div>
                    <div className="nota-image-row">
                      <span className="label">📐 Volume</span>
                      <span className="val">{sharingNota.volume}</span>
                    </div>
                    {sharingNota.keterangan && (
                      <div className="nota-image-row">
                        <span className="label">📝 Keterangan</span>
                        <span className="val">{sharingNota.keterangan}</span>
                      </div>
                    )}

                    <div className="nota-image-total">
                      <span>TOTAL BAYAR</span>
                      <span>Rp {sharingNota.harga.toLocaleString("id-ID")}</span>
                    </div>

                    <div className={`nota-image-stamp-badge ${sharingNota.status === "Lunas" ? "lunas" : "belum"}`}>
                      {sharingNota.status === "Lunas" ? "✅ STATUS: LUNAS" : "⏳ STATUS: BELUM LUNAS"}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setSharingNota(null)}>
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
