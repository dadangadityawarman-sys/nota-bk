import { prisma } from "@/lib/prisma";
import NavBar from "../NavBar";
import { MonthlyChart, StatusPie } from "./Chart";
import NotaList from "./NotaList";

export const dynamic = "force-dynamic";

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

type NotaRow = {
  id: number;
  nomorNota: string;
  tanggal: Date;
  customer: string;
  barang: string;
  volume: string;
  harga: number;
  status: string;
  keterangan: string | null;
};

export default async function DashboardPage() {
  const notas: NotaRow[] = await prisma.nota.findMany({ orderBy: { tanggal: "desc" } });

  const totalNota = notas.length;
  const totalPenjualan = notas.reduce((s: number, n: NotaRow) => s + n.harga, 0);
  const lunas = notas.filter((n: NotaRow) => n.status === "Lunas").length;
  const belumLunas = notas.filter((n: NotaRow) => n.status === "Belum Lunas").length;
  const piutang = notas
    .filter((n: NotaRow) => n.status === "Belum Lunas")
    .reduce((s: number, n: NotaRow) => s + n.harga, 0);

  const now = new Date();
  const bulanIni = notas
    .filter((n: NotaRow) => {
      const d = new Date(n.tanggal);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s: number, n: NotaRow) => s + n.harga, 0);

  const bulanNama = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyData = bulanNama.map((bulan: string, i: number) => {
    const total = notas
      .filter((n: NotaRow) => new Date(n.tanggal).getMonth() === i && new Date(n.tanggal).getFullYear() === now.getFullYear())
      .reduce((s: number, n: NotaRow) => s + n.harga, 0);
    return { bulan, total };
  });

  return (
    <>
      <NavBar />
      <div className="container">
        <div className="kpi-grid">
          <div className="kpi">
            <div className="label">🧾 Total Nota</div>
            <div className="value">{totalNota}</div>
          </div>
          <div className="kpi">
            <div className="label">💰 Total Penjualan</div>
            <div className="value">{rupiah(totalPenjualan)}</div>
          </div>
          <div className="kpi">
            <div className="label">✅ Nota Lunas</div>
            <div className="value green">{lunas}</div>
          </div>
          <div className="kpi">
            <div className="label">⏳ Belum Lunas</div>
            <div className="value red">{belumLunas}</div>
          </div>
          <div className="kpi">
            <div className="label">📌 Piutang Berjalan</div>
            <div className="value red">{rupiah(piutang)}</div>
          </div>
          <div className="kpi">
            <div className="label">🗓️ Penjualan Bulan Ini</div>
            <div className="value">{rupiah(bulanIni)}</div>
          </div>
        </div>

        <div className="section-title">Tren Penjualan per Bulan</div>
        <div className="card">
          <MonthlyChart data={monthlyData} />
        </div>

        <div className="section-title">Status Pembayaran</div>
        <div className="card">
          <StatusPie lunas={lunas} belum={belumLunas} />
        </div>

        <div className="section-title">Daftar Nota (tap badge status untuk ubah)</div>
        <NotaList notas={notas as any} />
      </div>
    </>
  );
}
