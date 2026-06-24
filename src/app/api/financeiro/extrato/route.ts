import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const status = searchParams.get("status");

  function buildDateFilter() {
    if (!de && !ate) return {};
    const f: Record<string, unknown> = {};
    if (de) f.gte = new Date(de);
    if (ate) f.lte = new Date(ate + "T23:59:59");
    return f;
  }
  const dateFilter = buildDateFilter();
  const receitasFilter = status ? { ...dateFilter, status } : { ...dateFilter };

  const [receitas, despesas, aReceber, qtdPedidos] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { valorTotal: true, sinal: true, saldoReceber: true },
      where: receitasFilter,
    }),
    prisma.lancamento.aggregate({
      _sum: { valor: true },
      where: { ...dateFilter },
    }),
    prisma.pedido.aggregate({
      _sum: { saldoReceber: true },
      where: { status: { in: ["pendente", "em produção", "entregue"] } },
    }),
    prisma.pedido.count({ where: receitasFilter }),
  ]);

  return NextResponse.json({
    receitas: receitas._sum.valorTotal || 0,
    quantidade: qtdPedidos,
    sinal: receitas._sum.sinal || 0,
    saldoReceber: aReceber._sum.saldoReceber || 0,
    despesas: Math.abs(despesas._sum.valor || 0),
    saldo: (receitas._sum.valorTotal || 0) - Math.abs(despesas._sum.valor || 0),
  }, { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } });
}
