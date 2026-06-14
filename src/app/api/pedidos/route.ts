import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pedidos = await prisma.pedido.findMany({
    include: { itens: { include: { produto: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pedidos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saldoReceber = (body.valorTotal || 0) - (body.sinal || 0);

    const pedido = await prisma.pedido.create({
      data: {
        cliente: body.cliente,
        status: body.status || "pendente",
        valorTotal: body.valorTotal || 0,
        sinal: body.sinal || 0,
        saldoReceber,
        observacao: body.observacao || "",
        itens: body.itens
          ? {
              create: body.itens.map(
                (item: { produtoId: number; quantidade: number; valorUnitario: number }) => ({
                  produtoId: item.produtoId,
                  quantidade: item.quantidade || 1,
                  valorUnitario: item.valorUnitario || 0,
                })
              ),
            }
          : undefined,
      },
      include: { itens: { include: { produto: true } } },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 400 });
  }
}
