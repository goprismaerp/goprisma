import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materiais = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(materiais);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const material = await prisma.material.create({
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
    return NextResponse.json(material, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar material" }, { status: 400 });
  }
}
