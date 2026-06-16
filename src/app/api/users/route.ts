import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const { createHash } = require("crypto");
function hash(s: string) { return createHash("sha256").update(s).digest("hex"); }

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, nome: true, role: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.username || !body.password) {
      return NextResponse.json({ error: "Usuário e senha obrigatórios" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hash(body.password),
        nome: body.nome || body.username,
        role: body.role || "visitante",
      },
      select: { id: true, username: true, nome: true, role: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: err?.message || "Erro ao criar usuário" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data: any = { nome: body.nome, role: body.role };
    if (body.password) {
      data.password = hash(body.password);
    }
    const user = await prisma.user.update({
      where: { id: body.id },
      data,
      select: { id: true, username: true, nome: true, role: true },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro ao atualizar" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro ao excluir" }, { status: 400 });
  }
}