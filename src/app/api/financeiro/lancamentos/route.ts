import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const where: Record<string, unknown> = {};
  if (de || ate) {
    where.data = {};
    if (de) (where.data as Record<string, unknown>).gte = new Date(de);
    if (ate) (where.data as Record<string, unknown>).lte = new Date(ate + "T23:59:59");
  }

  const lancamentos = await prisma.lancamento.findMany({
    where,
    orderBy: { data: "desc" },
  });

  return NextResponse.json(lancamentos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lancamento = await prisma.lancamento.create({
      data: {
        descricao: body.descricao,
        valor: Math.abs(body.valor) * -1,
        data: new Date(body.data || new Date()),
        categoria: body.categoria || "",
        pedidoId: body.pedidoId || null,
      },
    });
    return NextResponse.json(lancamento, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar lançamento" }, { status: 400 });
  }
}
