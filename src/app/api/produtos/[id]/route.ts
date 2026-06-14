import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recalcularProduto } from "@/lib/pricing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({
    where: { id: Number(id) },
    include: { categoria: true },
  });
  if (!produto) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }
  return NextResponse.json(produto);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const custoAcabamento =
      body.acabamento === "holográfico" ? 0.5 : body.custoAcabamento || 0;
    const custoTotal =
      (body.custoMaterial || 0) +
      (body.custoProtecao || 0) +
      (body.custoEmbalagem || 0) +
      custoAcabamento;

    await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        sku: body.sku,
        nome: body.nome,
        descricao: body.descricao,
        imagem: body.imagem,
        categoriaId: Number(body.categoriaId),
        subCategoria: body.subCategoria,
        idImpressora: body.idImpressora,
        idFilamento: body.idFilamento,
        pesoUsado: body.pesoUsado,
        custoFilamento: body.custoFilamento,
        custoTotalFilam: body.custoTotalFilam,
        tempoHoras: body.tempoHoras,
        tempoMinutos: body.tempoMinutos,
        tempoDecimal: body.tempoDecimal,
        capacidade: body.capacidade,
        tampa: body.tampa,
        comprimento: body.comprimento,
        largura: body.largura,
        altura: body.altura,
        custoModelo3D: body.custoModelo3D,
        uniMesa: body.uniMesa,
        materiais: body.materiais,
        qtdMateriais: body.qtdMateriais,
        custoMaterial: body.custoMaterial,
        protecao: body.protecao,
        qtdProtecao: body.qtdProtecao,
        custoProtecao: body.custoProtecao,
        embalagem: body.embalagem,
        custoEmbalagem: body.custoEmbalagem,
        acabamento: body.acabamento,
        custoAcabamento,
        maoObra: body.maoObra,
        custoTotal,
        custoTotalUni: body.custoTotalUni,
        tempoProducao: body.tempoProducao,
        precoSugerido: body.precoSugerido,
        precoMkplaces: body.precoMkplaces,
        precoVendaDir: body.precoVendaDir,
        desconto: body.desconto,
      },
    });

    await recalcularProduto(Number(id));

    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: { categoria: true },
    });

    return NextResponse.json(produto);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.produto.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Produto removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover produto" }, { status: 400 });
  }
}
