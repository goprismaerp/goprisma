import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(id) },
    include: { itens: { include: { produto: true } } },
  });
  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(pedido);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const saldoReceber = (body.valorTotal || 0) - (body.sinal || 0);

    await prisma.itensPedido.deleteMany({ where: { pedidoId: Number(id) } });

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: {
        cliente: body.cliente,
        status: body.status,
        valorTotal: body.valorTotal,
        sinal: body.sinal,
        saldoReceber,
        observacao: body.observacao,
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

    return NextResponse.json(pedido);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pedido.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Pedido removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover pedido" }, { status: 400 });
  }
}
