import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const produtos = await prisma.produto.findMany({
    select: { id: true, nome: true, sku: true },
  });

  const materiais = await prisma.material.findMany({
    select: { id: true, nome: true, skuMat: true },
  });

  const saldos = await Promise.all([
    ...produtos.map(async (p) => {
      const ultimo = await prisma.movimentoEstoque.findFirst({
        where: { produtoId: p.id },
        orderBy: { createdAt: "desc" },
        select: { saldoApos: true },
      });
      return { tipo: "produto", id: p.id, nome: p.nome, sku: p.sku, saldo: ultimo?.saldoApos ?? 0 };
    }),
    ...materiais.map(async (m) => {
      const ultimo = await prisma.movimentoEstoque.findFirst({
        where: { materialId: m.id },
        orderBy: { createdAt: "desc" },
        select: { saldoApos: true },
      });
      return { tipo: "material", id: m.id, nome: m.nome, sku: m.skuMat, saldo: ultimo?.saldoApos ?? 0 };
    }),
  ]);

  return NextResponse.json({ saldos: saldos.filter((s) => s.saldo > 0) });
}
