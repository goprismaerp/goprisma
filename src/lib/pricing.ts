import { prisma } from "./prisma";

export const CUSTO_HOLOGRÁFICO = 0.5;

export interface CalculoCustos {
  custoMaterial: number;
  custoProtecao: number;
  custoEmbalagem: number;
  custoAcabamento: number;
  custoTotal: number;
  custoTotalUni: number;
}

export async function calcularCustos(params: {
  materiais?: string;
  qtdMateriais?: number;
  custoMaterial?: number;
  protecao?: string;
  qtdProtecao?: number;
  custoProtecao?: number;
  embalagem?: string;
  custoEmbalagem?: number;
  acabamento?: string;
  tempoProducao?: number;
}): Promise<CalculoCustos> {
  const custoMaterial = params.custoMaterial ?? 0;
  const custoProtecao = params.custoProtecao ?? 0;
  const custoEmbalagem = params.custoEmbalagem ?? 0;
  const acabamento = (params.acabamento ?? "").toLowerCase();
  const custoAcabamento = acabamento === "holográfico" || acabamento === "holografico" ? CUSTO_HOLOGRÁFICO : 0;
  const custoTotal = Math.round((custoMaterial + custoProtecao + custoEmbalagem + custoAcabamento) * 100) / 100;

  return { custoMaterial, custoProtecao, custoEmbalagem, custoAcabamento, custoTotal, custoTotalUni: custoTotal };
}

export interface CalculoPrecos {
  precoSugerido: number;
  precoMkplaces: number;
  precoVendaDir: number;
  markupAplicado: number;
}

export async function calcularPrecos(custoTotal: number, categoriaId: number): Promise<CalculoPrecos> {
  const regra = await prisma.regraPrecificacao.findUnique({ where: { categoriaId } });
  const markup = regra?.markup ?? 0.4;

  const precoBase = custoTotal * (1 + markup);
  const precoSugerido = Math.round(precoBase * 100) / 100;
  const precoVendaDir = precoSugerido;

  const cfgMk = await prisma.configPrecificacao.findMany();
  const cfg = Object.fromEntries(cfgMk.map((c) => [c.chave, parseFloat(c.valor) || 0]));
  const taxaMarketplace = cfg.taxa_marketplace ?? 0.15;
  const precoMkplaces = Math.round((precoBase / (1 - taxaMarketplace)) * 100) / 100;

  return { precoSugerido, precoMkplaces, precoVendaDir, markupAplicado: markup };
}

export async function recalcularProduto(produtoId: number) {
  const produto = await prisma.produto.findUnique({
    where: { id: produtoId },
    include: { materiaisVinculados: { include: { material: true } } },
  });

  if (!produto) return null;

  let custoMaterial = produto.custoMaterial;
  if (produto.materiaisVinculados.length > 0) {
    custoMaterial = produto.materiaisVinculados.reduce(
      (sum, pm) => sum + pm.quantidade * pm.material.vlUni,
      0
    );
    custoMaterial = Math.round(custoMaterial * 100) / 100;
  }

  const custos = await calcularCustos({
    materiais: produto.materiais,
    qtdMateriais: produto.qtdMateriais,
    custoMaterial,
    protecao: produto.protecao,
    qtdProtecao: produto.qtdProtecao,
    custoProtecao: produto.custoProtecao,
    embalagem: produto.embalagem,
    custoEmbalagem: produto.custoEmbalagem,
    acabamento: produto.acabamento,
  });

  const precos = await calcularPrecos(custos.custoTotal, produto.categoriaId);

  await prisma.produto.update({
    where: { id: produtoId },
    data: {
      custoMaterial: custos.custoMaterial,
      custoProtecao: custos.custoProtecao,
      custoEmbalagem: custos.custoEmbalagem,
      custoAcabamento: custos.custoAcabamento,
      custoTotal: custos.custoTotal,
      precoSugerido: precos.precoSugerido,
      precoMkplaces: precos.precoMkplaces,
      precoVendaDir: precos.precoVendaDir,
    },
  });

  return { ...custos, ...precos };
}

export async function recalcularTodos() {
  const produtos = await prisma.produto.findMany({ select: { id: true } });
  let count = 0;
  for (const p of produtos) {
    await recalcularProduto(p.id);
    count++;
  }
  return count;
}
