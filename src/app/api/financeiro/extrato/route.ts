import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  function buildDateFilter() {
    if (!de && !ate) return {};
    const f: Record<string, unknown> = {};
    if (de) f.gte = new Date(de);
    if (ate) f.lte = new Date(ate + "T23:59:59");
    return f;
  }
  const dateFilter = buildDateFilter();

  const [receitas, despesas] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { valorTotal: true, sinal: true, saldoReceber: true },
      where: { ...dateFilter },
    }),
    prisma.lancamento.aggregate({
      _sum: { valor: true },
      where: { ...dateFilter },
    }),
  ]);

  return NextResponse.json({
    receitas: receitas._sum.valorTotal || 0,
    sinal: receitas._sum.sinal || 0,
    saldoReceber: receitas._sum.saldoReceber || 0,
    despesas: Math.abs(despesas._sum.valor || 0),
    saldo: (receitas._sum.valorTotal || 0) - Math.abs(despesas._sum.valor || 0),
  });
}
