import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const regras = await prisma.regraPrecificacao.findMany({ include: { categoria: true } });
  return NextResponse.json(regras);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, categoriaId, markup, margemSeguranca } = body;

    if (id) {
      const regra = await prisma.regraPrecificacao.update({
        where: { id },
        data: { markup, margemSeguranca: margemSeguranca ?? 0 },
      });
      return NextResponse.json({ success: true, regra });
    }

    const regra = await prisma.regraPrecificacao.upsert({
      where: { categoriaId },
      update: { markup, margemSeguranca: margemSeguranca ?? 0 },
      create: { categoriaId, markup, margemSeguranca: margemSeguranca ?? 0 },
    });

    return NextResponse.json({ success: true, regra });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
