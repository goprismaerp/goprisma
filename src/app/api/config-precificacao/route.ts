import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configs = await prisma.configPrecificacao.findMany({ orderBy: { chave: "asc" } });
  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chave, valor, descricao } = body;

    const cfg = await prisma.configPrecificacao.upsert({
      where: { chave },
      update: { valor, descricao: descricao ?? "" },
      create: { chave, valor, descricao: descricao ?? "" },
    });

    return NextResponse.json({ success: true, config: cfg });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
