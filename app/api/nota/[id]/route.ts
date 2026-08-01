import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const dataToUpdate: any = {};

  if (body.nomorNota !== undefined) dataToUpdate.nomorNota = body.nomorNota;
  if (body.tanggal !== undefined) dataToUpdate.tanggal = new Date(body.tanggal);
  if (body.customer !== undefined) dataToUpdate.customer = body.customer;
  if (body.barang !== undefined) dataToUpdate.barang = body.barang;
  if (body.volume !== undefined) dataToUpdate.volume = body.volume;
  if (body.harga !== undefined) dataToUpdate.harga = Number(body.harga);
  if (body.status !== undefined) dataToUpdate.status = body.status;
  if (body.keterangan !== undefined) dataToUpdate.keterangan = body.keterangan;

  const nota = await prisma.nota.update({
    where: { id: parseInt(params.id, 10) },
    data: dataToUpdate,
  });
  return NextResponse.json(nota);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.nota.delete({ where: { id: parseInt(params.id, 10) } });
  return NextResponse.json({ ok: true });
}
