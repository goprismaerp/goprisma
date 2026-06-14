import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.saldoReal == null || body.saldoReal < 0) {
      return NextResponse.json({ error: "saldoReal é obrigatório e deve ser >= 0" }, { status: 400 });
    }

    const ultimoMovimento = await prisma.movimentoEstoque.findFirst({
      where: body.produtoId
        ? { produtoId: Number(body.produtoId) }
        : { materialId: Number(body.materialId) },
      orderBy: { createdAt: "desc" },
    });

    const saldoAtual = ultimoMovimento?.saldoApos ?? 0;
    const diferenca = body.saldoReal - saldoAtual;

    if (diferenca === 0) {
      return NextResponse.json({ message: "Saldo já está correto, nenhum ajuste necessário" });
    }

    const movimento = await prisma.movimentoEstoque.create({
      data: {
        tipo: "ajuste",
        produtoId: body.produtoId ? Number(body.produtoId) : null,
        materialId: body.materialId ? Number(body.materialId) : null,
        quantidade: diferenca,
        saldoApos: body.saldoReal,
        observacao: body.observacao || `Ajuste de inventário: ${saldoAtual} → ${body.saldoReal}`,
      },
    });

    return NextResponse.json(movimento, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar ajuste de inventário" }, { status: 400 });
  }
}
