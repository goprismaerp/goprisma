import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dump from "@/data/dump.json";

export async function GET() {
  const results: string[] = [];

  try {
    let catCount = 0;
    for (const c of dump.categorias) {
      const existing = await prisma.categoria.findUnique({ where: { id: c.id } });
      if (!existing) {
        await prisma.categoria.create({ data: { id: c.id, nome: c.nome } });
        catCount++;
      }
    }
    results.push(`${catCount} categorias importadas`);

    let matCount = 0;
    for (const m of dump.materiais) {
      await prisma.material.upsert({
        where: { id: m.id },
        update: { nome: m.nome, skuMat: m.skuMat, descricao: m.descricao, tipo: m.tipo, unidades: m.unidades, valor: m.valor, vlUni: m.vlUni },
        create: { id: m.id, skuMat: m.skuMat, nome: m.nome, descricao: m.descricao, tipo: m.tipo, unidades: m.unidades, valor: m.valor, vlUni: m.vlUni },
      });
      matCount++;
    }
    results.push(`${matCount} materiais importados`);

    let embCount = 0;
    for (const e of dump.embalagens) {
      await prisma.embalagem.upsert({
        where: { id: e.id },
        update: { skuPack: e.skuPack, tipo: e.tipo, comprimento: e.comprimento, largura: e.largura, altura: e.altura, material: e.material, unidades: e.unidades, valor: e.valor, vlUni: e.vlUni },
        create: { id: e.id, skuPack: e.skuPack, tipo: e.tipo, comprimento: e.comprimento, largura: e.largura, altura: e.altura, material: e.material, unidades: e.unidades, valor: e.valor, vlUni: e.vlUni },
      });
      embCount++;
    }
    results.push(`${embCount} embalagens importadas`);

    let prodCount = 0;
    for (const p of dump.produtos) {
      const { id, createdAt, updatedAt, itensPedido, materiaisVinculados, movimentosEstoque, ...data } = p as any;
      await prisma.produto.upsert({
        where: { id: p.id },
        update: data,
        create: { id: p.id, ...data },
      });
      prodCount++;
    }
    results.push(`${prodCount} produtos importados`);

    for (const r of dump.regras) {
      await prisma.regraPrecificacao.upsert({
        where: { id: r.id },
        update: { categoriaId: r.categoriaId, markup: r.markup, margemSeguranca: r.margemSeguranca },
        create: { id: r.id, categoriaId: r.categoriaId, markup: r.markup, margemSeguranca: r.margemSeguranca },
      });
    }
    results.push(`${dump.regras.length} regras importadas`);

    for (const cfg of dump.configs) {
      await prisma.configPrecificacao.upsert({
        where: { id: cfg.id },
        update: { chave: cfg.chave, valor: cfg.valor, descricao: cfg.descricao },
        create: { id: cfg.id, chave: cfg.chave, valor: cfg.valor, descricao: cfg.descricao },
      });
    }
    results.push(`${dump.configs.length} configurações importadas`);

    for (const f of dump.filamentos || []) {
      const { id, createdAt, updatedAt, ...data } = f as any;
      await prisma.filamento.upsert({
        where: { id: f.id },
        update: data,
        create: { id: f.id, ...data },
      });
    }
    results.push(`${(dump.filamentos || []).length} filamentos importados`);

    const { recalcularTodos } = await import("@/lib/pricing");
    const recalcCount = await recalcularTodos();
    results.push(`${recalcCount} produtos recalculados`);

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
