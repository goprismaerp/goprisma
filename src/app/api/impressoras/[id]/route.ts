import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const impressora = await prisma.impressora.findUnique({
    where: { id: Number(id) },
  });
  if (!impressora) {
    return NextResponse.json({ error: "Impressora não encontrada" }, { status: 404 });
  }
  return NextResponse.json(impressora);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const impressora = await prisma.impressora.update({
      where: { id: Number(id) },
      data: {
        nome: body.nome,
        modelo: body.modelo,
        custoHora: Number(body.custoHora) || 0,
        ativa: body.ativa !== false,
      },
    });
    return NextResponse.json(impressora);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar impressora" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.impressora.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Impressora removida" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover impressora" }, { status: 400 });
  }
}
