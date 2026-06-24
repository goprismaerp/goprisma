import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");
  const status = searchParams.get("status");

  function dateFilter(field: string): Record<string, unknown> {
    if (!de && !ate) return {};
    return { [field]: { ...(de && { gte: new Date(de) }), ...(ate && { lte: new Date(ate + "T23:59:59") }) } };
  }
  const pedFilter = { ...dateFilter("dataPedido"), ...(status && { status }) };
  const despFilter = dateFilter("data");

  const [receitas, despesas, aReceber, qtdPedidos] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { valorTotal: true, sinal: true, saldoReceber: true },
      where: pedFilter,
    }),
    prisma.lancamento.aggregate({
      _sum: { valor: true },
      where: despFilter,
    }),
    prisma.pedido.aggregate({
      _sum: { saldoReceber: true },
      where: { status: { in: ["pendente", "em produção", "entregue"] } },
    }),
    prisma.pedido.count({ where: pedFilter }),
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
