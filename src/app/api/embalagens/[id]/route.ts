import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const embalagem = await prisma.embalagem.findUnique({
    where: { id: Number(id) },
  });
  if (!embalagem) {
    return NextResponse.json({ error: "Embalagem não encontrada" }, { status: 404 });
  }
  return NextResponse.json(embalagem);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const embalagem = await prisma.embalagem.update({
      where: { id: Number(id) },
      data: {
        skuPack: body.skuPack,
        tipo: body.tipo || "",
        comprimento: body.comprimento || 0,
        largura: body.largura || 0,
        altura: body.altura || 0,
        material: body.material || "",
        unidades: body.unidades || 0,
        valor: body.valor || 0,
        vlUni: body.vlUni || 0,
        lacreTipo: body.lacreTipo || "",
        lacreDescricao: body.lacreDescricao || "",
        lacreMaterial: body.lacreMaterial || "",
        lacreUnidades: body.lacreUnidades || 0,
        vlLacre: body.vlLacre || 0,
        uniLacre: body.uniLacre || 0,
        consumoLacre: body.consumoLacre || 0,
        totalLacre: body.totalLacre || 0,
        totalMat: body.totalMat || 0,
      },
    });
    return NextResponse.json(embalagem);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar embalagem" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.embalagem.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Embalagem removida" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover embalagem" }, { status: 400 });
  }
}
