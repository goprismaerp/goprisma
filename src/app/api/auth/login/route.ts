import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }
    const token = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString("base64");
    return NextResponse.json({ token, user: { id: user.id, username: user.username, nome: user.nome, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}