import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalProdutos = await prisma.produto.count();
  const totalPedidos = await prisma.pedido.count();
  const totalMateriais = await prisma.material.count();

  const pedidos = await prisma.pedido.findMany({ select: { valorTotal: true, status: true } });
  const receitaTotal = pedidos.reduce((sum, p) => sum + p.valorTotal, 0);

  const pedidosPorStatus = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const produtos = await prisma.produto.findMany({
    select: { sku: true, nome: true, custoTotal: true, precoSugerido: true },
    orderBy: { custoTotal: "desc" },
    take: 20,
  });
  const custoTotal = produtos.reduce((sum, p) => sum + p.custoTotal, 0);

  const comPreco = produtos.filter((p) => p.custoTotal > 0 && p.precoSugerido > 0);
  const margemMedia =
    comPreco.length > 0
      ? comPreco.reduce((sum, p) => sum + ((p.precoSugerido - p.custoTotal) / p.custoTotal) * 100, 0) / comPreco.length
      : 0;

  return NextResponse.json({
    totalProdutos,
    totalPedidos,
    totalMateriais,
    receitaTotal,
    custoTotal,
    margemMedia,
    pedidosPorStatus: Object.entries(pedidosPorStatus).map(([status, count]) => ({ status, count })),
    produtosMaisCaros: produtos,
  });
}
