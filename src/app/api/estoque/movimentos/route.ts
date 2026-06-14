import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const produtoId = searchParams.get("produtoId");
  const materialId = searchParams.get("materialId");

  const where: Record<string, unknown> = {};
  if (produtoId) where.produtoId = Number(produtoId);
  if (materialId) where.materialId = Number(materialId);

  const movimentos = await prisma.movimentoEstoque.findMany({
    where,
    include: {
      produto: { select: { id: true, nome: true, sku: true } },
      material: { select: { id: true, nome: true, skuMat: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(movimentos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!["entrada", "saida", "ajuste"].includes(body.tipo)) {
      return NextResponse.json({ error: "Tipo inválido. Use: entrada, saida ou ajuste" }, { status: 400 });
    }

    const quantidade = body.tipo === "saida" ? -Math.abs(body.quantidade) : Math.abs(body.quantidade);

    const ultimoMovimento = await prisma.movimentoEstoque.findFirst({
      where: body.produtoId
        ? { produtoId: Number(body.produtoId) }
        : { materialId: Number(body.materialId) },
      orderBy: { createdAt: "desc" },
    });

    const saldoAnterior = ultimoMovimento?.saldoApos ?? 0;
    const saldoApos = saldoAnterior + quantidade;

    if (saldoApos < 0) {
      return NextResponse.json({ error: "Saldo insuficiente para essa saída" }, { status: 400 });
    }

    const movimento = await prisma.movimentoEstoque.create({
      data: {
        tipo: body.tipo,
        produtoId: body.produtoId ? Number(body.produtoId) : null,
        materialId: body.materialId ? Number(body.materialId) : null,
        quantidade,
        saldoApos,
        observacao: body.observacao || "",
        pedidoId: body.pedidoId ? Number(body.pedidoId) : null,
      },
      include: {
        produto: { select: { id: true, nome: true, sku: true } },
        material: { select: { id: true, nome: true, skuMat: true } },
      },
    });

    return NextResponse.json(movimento, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao registrar movimento" }, { status: 400 });
  }
}
