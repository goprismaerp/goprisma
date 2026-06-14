import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];

  const cats = ["deckbox", "contadores", "acessórios", "copa26", "switch", "chaveiros", "pokemon", "outros"];
  for (const nome of cats) {
    const existing = await prisma.categoria.findUnique({ where: { nome } });
    if (!existing) {
      await prisma.categoria.create({ data: { nome } });
      results.push(`Categoria "${nome}" criada`);
    } else {
      results.push(`Categoria "${nome}" já existe`);
    }
  }

  const regras = [
    { categoriaNome: "deckbox", markup: 0.4 },
    { categoriaNome: "contadores", markup: 0.4 },
    { categoriaNome: "acessórios", markup: 0.35 },
    { categoriaNome: "copa26", markup: 0.4 },
    { categoriaNome: "switch", markup: 0.35 },
    { categoriaNome: "chaveiros", markup: 0.5 },
    { categoriaNome: "pokemon", markup: 0.5 },
    { categoriaNome: "outros", markup: 0.4 },
  ];

  for (const r of regras) {
    const cat = await prisma.categoria.findUnique({ where: { nome: r.categoriaNome } });
    if (cat) {
      const existingRegra = await prisma.regraPrecificacao.findUnique({ where: { categoriaId: cat.id } });
      if (!existingRegra) {
        await prisma.regraPrecificacao.create({
          data: { categoriaId: cat.id, markup: r.markup },
        });
        results.push(`Regra "${r.categoriaNome}" (${r.markup * 100}%) criada`);
      }
    }
  }

  const cfgExistentes = await prisma.configPrecificacao.findMany();
  if (cfgExistentes.length === 0) {
    await prisma.configPrecificacao.createMany({
      data: [
        { chave: "taxa_marketplace", valor: "15", descricao: "Taxa média cobrada por marketplaces (ML, Shopee, Amazon)" },
        { chave: "custo_holografico", valor: "0.5", descricao: "Depreciação da placa holográfica por produto" },
        { chave: "markup_padrao", valor: "40", descricao: "Markup usado quando a categoria não tem regra específica" },
      ],
    });
    results.push("Configurações de precificação criadas");
  }

  return NextResponse.json({ success: true, results });
}
