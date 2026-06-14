import { NextResponse } from "next/server";
import { recalcularTodos } from "@/lib/pricing";

export async function POST() {
  try {
    const count = await recalcularTodos();
    return NextResponse.json({ success: true, produtosRecalculados: count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
