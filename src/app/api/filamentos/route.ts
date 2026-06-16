import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const filamentos = await prisma.filamento.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(filamentos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filamento = await prisma.filamento.create({
      data: body,
    });
    return NextResponse.json(filamento, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar filamento" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const filamento = await prisma.filamento.update({
      where: { id },
      data,
    });
    return NextResponse.json(filamento);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.filamento.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 400 });
  }
}
