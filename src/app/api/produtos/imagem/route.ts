import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const produtoId = Number(formData.get("produtoId"));
    const file = formData.get("imagem") as File | null;

    if (!produtoId) {
      return NextResponse.json({ error: "produtoId é obrigatório" }, { status: 400 });
    }
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Arquivo de imagem obrigatório" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    await prisma.produto.update({
      where: { id: produtoId },
      data: { imagem: base64 },
    });

    return NextResponse.json({ success: true, imagem: base64 });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar imagem" }, { status: 400 });
  }
}
