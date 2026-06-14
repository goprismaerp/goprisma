import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const impressoras = await prisma.impressora.findMany({
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(impressoras);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const impressora = await prisma.impressora.create({
      data: {
        nome: body.nome,
        modelo: body.modelo,
        custoHora: Number(body.custoHora) || 0,
        ativa: body.ativa !== false,
      },
    });
    return NextResponse.json(impressora, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar impressora" }, { status: 400 });
  }
}
