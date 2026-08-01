import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const notas = await prisma.nota.findMany({
    orderBy: { tanggal: "desc" },
  });
  return NextResponse.json(notas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = ["nomorNota", "tanggal", "customer", "barang", "volume", "harga", "status"];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return NextResponse.json({ error: `${field} wajib diisi` }, { status: 400 });
    }
  }

  const nota = await prisma.nota.create({
    data: {
      nomorNota: String(body.nomorNota),
      tanggal: new Date(body.tanggal),
      customer: String(body.customer),
      barang: String(body.barang),
      volume: String(body.volume),
      harga: parseInt(body.harga, 10),
      status: String(body.status),
      keterangan: body.keterangan || null,
      fotoUrl: body.fotoUrl || null,
    },
  });

  return NextResponse.json(nota, { status: 201 });
}
