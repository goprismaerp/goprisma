import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const embalagens = await prisma.embalagem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(embalagens);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const embalagem = await prisma.embalagem.create({
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
    return NextResponse.json(embalagem, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar embalagem" }, { status: 400 });
  }
}
