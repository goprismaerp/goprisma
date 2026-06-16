import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lancamento.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Lançamento removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover lançamento" }, { status: 400 });
  }
}
