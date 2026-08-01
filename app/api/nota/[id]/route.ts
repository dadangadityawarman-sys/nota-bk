import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const nota = await prisma.nota.update({
    where: { id: parseInt(params.id, 10) },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.keterangan !== undefined ? { keterangan: body.keterangan } : {}),
    },
  });
  return NextResponse.json(nota);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.nota.delete({ where: { id: parseInt(params.id, 10) } });
  return NextResponse.json({ ok: true });
}
