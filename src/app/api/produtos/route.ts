import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalcularProduto } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoriaId = searchParams.get("categoriaId");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (categoriaId) {
    where.categoriaId = Number(categoriaId);
  }

  if (search) {
    where.OR = [
      { nome: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const produtos = await prisma.produto.findMany({
    where,
    include: { categoria: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(produtos);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const custoAcabamento = body.acabamento === "holográfico" ? 0.5 : 0;
    const custoTotal =
      (body.custoMaterial || 0) +
      (body.custoProtecao || 0) +
      (body.custoEmbalagem || 0) +
      custoAcabamento;

    const produto = await prisma.produto.create({
      data: {
        sku: body.sku,
        nome: body.nome,
        descricao: body.descricao || "",
        imagem: body.imagem || "",
        categoriaId: Number(body.categoriaId),
        subCategoria: body.subCategoria || "",
        idImpressora: body.idImpressora || "",
        idFilamento: body.idFilamento || "",
        pesoUsado: body.pesoUsado || 0,
        custoFilamento: body.custoFilamento || 0,
        custoTotalFilam: body.custoTotalFilam || 0,
        tempoHoras: body.tempoHoras || 0,
        tempoMinutos: body.tempoMinutos || 0,
        tempoDecimal: body.tempoDecimal || 0,
        capacidade: body.capacidade || 0,
        tampa: body.tampa || "",
        comprimento: body.comprimento || 0,
        largura: body.largura || 0,
        altura: body.altura || 0,
        custoModelo3D: body.custoModelo3D || 0,
        uniMesa: body.uniMesa || 1,
        materiais: body.materiais || "",
        qtdMateriais: body.qtdMateriais || 0,
        custoMaterial: body.custoMaterial || 0,
        protecao: body.protecao || "",
        qtdProtecao: body.qtdProtecao || 0,
        custoProtecao: body.custoProtecao || 0,
        embalagem: body.embalagem || "",
        custoEmbalagem: body.custoEmbalagem || 0,
        acabamento: body.acabamento || "padrao",
        custoAcabamento,
        maoObra: body.maoObra || 0,
        custoTotal,
        custoTotalUni: body.custoTotalUni || 0,
        tempoProducao: body.tempoProducao || 0,
        precoSugerido: body.precoSugerido || 0,
        precoMkplaces: body.precoMkplaces || 0,
        precoVendaDir: body.precoVendaDir || 0,
        desconto: body.desconto || 0,
      },
    });

    await recalcularProduto(produto.id);

    const produtoCompleto = await prisma.produto.findUnique({
      where: { id: produto.id },
      include: { categoria: true },
    });

    return NextResponse.json(produtoCompleto, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 400 });
  }
}
