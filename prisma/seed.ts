import { prisma } from "../src/lib/prisma";

async function main() {
  const categorias = [
    "deckbox", "contadores", "acessórios", "copa26",
    "switch", "chaveiros", "pokemon", "outros",
  ];

  for (const nome of categorias) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    console.log(`  ✅ Categoria: ${nome}`);
  }

  const materiais = [
    { skuMat: "PLA-PRETO", nome: "PLA Preto", tipo: "filamento", unidades: 1, valor: 89.9, vlUni: 89.9 },
    { skuMat: "PLA-BRANCO", nome: "PLA Branco", tipo: "filamento", unidades: 1, valor: 89.9, vlUni: 89.9 },
    { skuMat: "RESINA-PADRAO", nome: "Resina Padrão", tipo: "resina", unidades: 1, valor: 149.9, vlUni: 149.9 },
  ];

  for (const m of materiais) {
    await prisma.material.upsert({
      where: { skuMat: m.skuMat },
      update: {},
      create: m,
    });
  }
  console.log(`  ✅ ${materiais.length} materiais`);

  const embalagens = [
    { skuPack: "EMB-PQ", tipo: "papel", comprimento: 10, largura: 7, altura: 3, material: "papel kraft", unidades: 1, valor: 1.5, vlUni: 1.5 },
    { skuPack: "EMB-GD", tipo: "papel", comprimento: 15, largura: 10, altura: 5, material: "papel kraft", unidades: 1, valor: 2.5, vlUni: 2.5 },
  ];

  for (const e of embalagens) {
    await prisma.embalagem.upsert({
      where: { skuPack: e.skuPack },
      update: {},
      create: e,
    });
  }
  console.log(`  ✅ ${embalagens.length} embalagens`);

  const produtos = [
    {
      sku: "DB-001", nome: "Deckbox Padrão", descricao: "Deckbox para 100 cartas",
      categoriaId: 1, materiais: "PLA Preto", qtdMateriais: 1, custoMaterial: 15.0,
      acabamento: "padrão", custoAcabamento: 0, custoTotal: 15.0,
      tempoProducao: 2.5, precoSugerido: 45.0,
    },
    {
      sku: "CH-001", nome: "Chaveiro Pikachu", descricao: "Chaveiro do Pikachu em PLA",
      categoriaId: 6, materiais: "PLA Amarelo, PLA Preto", qtdMateriais: 2, custoMaterial: 3.5,
      acabamento: "holográfico", custoAcabamento: 0.5, custoTotal: 4.0,
      tempoProducao: 1.0, precoSugerido: 15.0,
    },
  ];

  for (const p of produtos) {
    await prisma.produto.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log(`  ✅ ${produtos.length} produtos`);

  console.log("\nSeed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
