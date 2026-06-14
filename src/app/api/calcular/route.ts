import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularPrecos, recalcularProduto } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { produtoId, categoriaId, custoTotal } = body;

    if (produtoId) {
      const result = await recalcularProduto(produtoId);
      return NextResponse.json({ success: true, ...result });
    }

    if (categoriaId != null && custoTotal != null) {
      const precos = await calcularPrecos(custoTotal, categoriaId);
      return NextResponse.json({ success: true, ...precos });
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
