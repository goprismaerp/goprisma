import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const de = searchParams.get("de");
  const ate = searchParams.get("ate");

  const where: Record<string, unknown> = {};
  if (de || ate) {
    where.dataPedido = {};
    if (de) (where.dataPedido as Record<string, unknown>).gte = new Date(de);
    if (ate) (where.dataPedido as Record<string, unknown>).lte = new Date(ate + "T23:59:59");
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    select: {
      id: true,
      cliente: true,
      dataPedido: true,
      valorTotal: true,
      sinal: true,
      saldoReceber: true,
      status: true,
    },
    orderBy: { dataPedido: "desc" },
  });

  return NextResponse.json(pedidos);
}
