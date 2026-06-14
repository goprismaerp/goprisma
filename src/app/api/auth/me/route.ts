import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  try {
    const data = JSON.parse(Buffer.from(auth, "base64").toString());
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}