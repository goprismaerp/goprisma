import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashSenha(senha: string): string {
  return crypto.createHash("sha256").update(senha).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== hashSenha(password)) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }
    const token = Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role, nome: user.nome })).toString("base64");
    return NextResponse.json({ token, user: { id: user.id, username: user.username, nome: user.nome, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}