import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categoria = await prisma.categoria.create({
      data: { nome: body.nome, abreviatura: body.abreviatura || "" },
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const categoria = await prisma.categoria.update({
      where: { id: body.id },
      data: { nome: body.nome, abreviatura: body.abreviatura || "" },
    });
    return NextResponse.json(categoria);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.categoria.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}