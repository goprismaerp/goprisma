import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const material = await prisma.material.findUnique({
    where: { id: Number(id) },
  });
  if (!material) {
    return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
  }
  return NextResponse.json(material);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const material = await prisma.material.update({
      where: { id: Number(id) },
      data: {
        skuMat: body.skuMat,
        nome: body.nome,
        descricao: body.descricao || "",
        tipo: body.tipo || "",
        unidades: body.unidades || 1,
        valor: body.valor || 0,
        vlUni: body.vlUni || 0,
      },
    });
    return NextResponse.json(material);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar material" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.material.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Material removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover material" }, { status: 400 });
  }
}
