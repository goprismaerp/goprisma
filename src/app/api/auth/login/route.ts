import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hashSenha(senha: string): string {
  const { createHash } = require("crypto");
  return createHash("sha256").update(senha).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Usuário e senha obrigatórios" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }
    if (user.password !== hashSenha(password)) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
    }
    const payload = { id: user.id, username: user.username, role: user.role, nome: user.nome };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64");
    return NextResponse.json({ token, user: payload });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro interno", detail: err?.message || "desconhecido" }, { status: 500 });
  }
}