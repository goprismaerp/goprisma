import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rows: any[] = body.rows || [];
    let criados = 0;
    let atualizados = 0;

    for (const row of rows) {
      if (!row.idFilamento) continue;
      const data = {
        idFilamento: String(row.idFilamento || ""),
        amostra: String(row.amostra || ""),
        reposicao: String(row.reposicao ?? ""),
        material: String(row.material || ""),
        marca: String(row.marca || ""),
        cor: String(row.cor || ""),
        familia: String(row.familia || ""),
        refBambu: String(row.refBambu || ""),
        pesoInicial: Number(row.pesoInicial) || 0,
        pesoAtual: Number(row.pesoAtual) || 0,
        precoRolo: Number(row.precoRolo) || 0,
        custoPorG: Number(row.custoPorG) || 0,
        fornecedor: String(row.fornecedor || ""),
        estoquePct: Number(row.estoquePct) || 0,
        alerta: String(row.alerta || ""),
        status: String(row.status || ""),
        consumidoFinalizado: Number(row.consumidoFinalizado) || 0,
        saldoProjetado: Number(row.saldoProjetado) || 0,
      };

      const existing = await prisma.filamento.findUnique({
        where: { idFilamento: data.idFilamento },
      });

      if (existing) {
        await prisma.filamento.update({
          where: { idFilamento: data.idFilamento },
          data,
        });
        atualizados++;
      } else {
        await prisma.filamento.create({ data });
        criados++;
      }
    }

    return NextResponse.json({ criados, atualizados });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro ao importar" }, { status: 400 });
  }
}
