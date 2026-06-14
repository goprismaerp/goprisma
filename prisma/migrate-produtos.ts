import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";
import path from "path";

function parseCurrency(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const str = String(val).replace(/[R$\s\.]/g, "").replace(",", ".");
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function parseIntVal(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const n = parseInt(String(val).replace(/[^0-9]/g, ""));
  return isNaN(n) ? 0 : n;
}

function findColumn(headers: string[], ...names: string[]): number {
  for (const name of names) {
    const idx = headers.findIndex(
      (h) => h && h.trim().toUpperCase() === name.toUpperCase().trim()
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

const sheetToCategory: Record<string, string> = {
  deckbox: "deckbox",
  contadores: "contadores",
  acessorios: "acessórios",
  copa26: "copa26",
  switch: "switch",
  chaveiros: "chaveiros",
  pokemon: "pokemon",
  outros: "outros",
};

async function migrateProdutos(filePath: string) {
  console.log(`📂 Lendo ${filePath}...`);
  const wb = XLSX.readFile(filePath, { cellDates: true });
  let totalImported = 0;

  for (const [sheetName, nomeCategoria] of Object.entries(sheetToCategory)) {
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      console.log(`  ⚠️  Sheet "${sheetName}" não encontrada`);
      continue;
    }

    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    if (data.length < 2) {
      console.log(`  ⚠️  Sheet "${sheetName}" sem dados`);
      continue;
    }

    const headers = data[0].map((h: unknown) => (h ? String(h).trim() : ""));
    console.log(`  📋 ${sheetName}: ${data.length - 1} linhas`);

    let categoria = await prisma.categoria.findUnique({ where: { nome: nomeCategoria } });
    if (!categoria) {
      categoria = await prisma.categoria.create({ data: { nome: nomeCategoria } });
    }

    const colSku = findColumn(headers, "SKU");
    const colNome = findColumn(headers, "PRODUTO");
    const colIdImpressora = findColumn(headers, "ID IMPRESSORA", "ID_IMPRESSORA");
    const colSubCategoria = findColumn(headers, "SUB CATEGORIA", "SUBCATEGORIA");
    const colIdFilamento = findColumn(headers, "ID FILAMENTO", "ID_FILAMENTO");
    const colPesoUsado = findColumn(headers, "PESO USADO (G)", "PESO USADO", "PESO (G)");
    const colCustoFilamento = findColumn(headers, "CUSTO FILAMENTO (R$/G)", "CUSTO FILAMENTO");
    const colCustoTotalFilam = findColumn(headers, "CUSTO TOTAL FILAMENTO (R$)", "CUSTO TOTAL FILAMENTO");
    const colTempoH = findColumn(headers, "TEMPO (H)", "Tempo (h)");
    const colTempoMin = findColumn(headers, "TEMPO (MIN)", "Tempo (min)");
    const colCapacidade = findColumn(headers, "ML", "CAPACIDADE");
    const colTampa = findColumn(headers, "TAMPA");
    const colComprimento = findColumn(headers, "L (MM)", "COMPRIMENTO L", "L");
    const colLargura = findColumn(headers, "P (MM)", "LARGURA P", "P");
    const colAltura = findColumn(headers, "A (MM)", "ALTURA A", "A");
    const colCustoModelo3D = findColumn(headers, "CUSTO MODELO 3D (R$)", "CUSTO MODELO 3D");
    const colUniMesa = findColumn(headers, "UNI MESA", "UNI_MESA");
    const colMateriais = findColumn(headers, "OUTROS MATERIAIS", "OUTROS MATERIAIS ");
    const colQtdMat = findColumn(headers, "UNI MAT");
    const colCustoMat = findColumn(headers, "CUSTO MATERIAL (R$)", "CUSTO MATERIAL (R$) ");
    const colProtecao = findColumn(headers, "PROTECAO");
    const colQtdProt = findColumn(headers, "UNI PROT");
    const colCustoProt = findColumn(headers, "CUSTO PROTECAO (R$)", "CUSTO PROTECAO (R$) ");
    const colEmbSugestao = findColumn(headers, "EMB SUGESTAO");
    const colEmbalagem = findColumn(headers, "EMBALAGEM");
    const colCustoEmb = findColumn(headers, "CUSTO EMBALAGEM (R$)", "CUSTO EMBALAGEM (R$) ");
    const colAcabamento = findColumn(headers, "ACABAMENTO");
    const colCustoAcab = findColumn(headers, "CUSTO ACABAMENTO (R$)", "CUSTO ACABAMENTO (R$) ");
    const colMaoObra = findColumn(headers, "MAO OBRA (MIN)", "MaO Obra (min)");
    const colCustoTotal = findColumn(headers, "CUSTO TOTAL (R$)", "CUSTO TOTAL (R$) ");
    const colCustoTotalUni = findColumn(headers, "CUSTO TOTAL UNI (R$)", "CUSTO TOTAL UNI");

    let imported = 0;
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const sku = row[colSku] ? String(row[colSku]).trim() : "";
      if (!sku || sku.startsWith("~") || sku.startsWith("_")) continue;

      const nome = row[colNome] ? String(row[colNome]).trim() : "";
      if (!nome) continue;

      const custoTotal = parseCurrency(row[colCustoTotal]);
      const tempoH = parseFloat(String(row[colTempoH] ?? "0").replace(",", "."));
      const tempoMin = parseFloat(String(row[colTempoMin] ?? "0").replace(",", "."));
      const tempoProducao = (isNaN(tempoH) ? 0 : tempoH) + (isNaN(tempoMin) ? 0 : tempoMin) / 60;

      const acabamento = row[colAcabamento] ? String(row[colAcabamento]).trim().toLowerCase() : "";

      const updateData = {
        nome,
        descricao: "",
        categoriaId: categoria.id,
        idImpressora: colIdImpressora >= 0 && row[colIdImpressora] ? String(row[colIdImpressora]).trim() : "",
        subCategoria: colSubCategoria >= 0 && row[colSubCategoria] ? String(row[colSubCategoria]).trim() : "",
        idFilamento: colIdFilamento >= 0 && row[colIdFilamento] ? String(row[colIdFilamento]).trim() : "",
        pesoUsado: colPesoUsado >= 0 ? parseCurrency(row[colPesoUsado]) : 0,
        custoFilamento: colCustoFilamento >= 0 ? parseCurrency(row[colCustoFilamento]) : 0,
        custoTotalFilam: colCustoTotalFilam >= 0 ? parseCurrency(row[colCustoTotalFilam]) : 0,
        tempoHoras: colTempoH >= 0 ? parseFloat(String(row[colTempoH] ?? "0").replace(",", ".")) : 0,
        tempoMinutos: colTempoMin >= 0 ? parseFloat(String(row[colTempoMin] ?? "0").replace(",", ".")) : 0,
        tempoDecimal: tempoProducao,
        capacidade: colCapacidade >= 0 ? parseIntVal(row[colCapacidade]) : 0,
        tampa: colTampa >= 0 && row[colTampa] ? String(row[colTampa]).trim() : "",
        comprimento: colComprimento >= 0 ? parseFloat(String(row[colComprimento] ?? "0").replace(",", ".")) : 0,
        largura: colLargura >= 0 ? parseFloat(String(row[colLargura] ?? "0").replace(",", ".")) : 0,
        altura: colAltura >= 0 ? parseFloat(String(row[colAltura] ?? "0").replace(",", ".")) : 0,
        custoModelo3D: colCustoModelo3D >= 0 ? parseCurrency(row[colCustoModelo3D]) : 0,
        uniMesa: colUniMesa >= 0 ? parseIntVal(row[colUniMesa]) : 1,
        materiais: row[colMateriais] ? String(row[colMateriais]).trim() : "",
        qtdMateriais: parseIntVal(row[colQtdMat]),
        custoMaterial: parseCurrency(row[colCustoMat]),
        protecao: row[colProtecao] ? String(row[colProtecao]).trim() : "",
        qtdProtecao: parseIntVal(row[colQtdProt]),
        custoProtecao: parseCurrency(row[colCustoProt]),
        embalagem: row[colEmbalagem] ? String(row[colEmbalagem]).trim() : row[colEmbSugestao] ? String(row[colEmbSugestao]).trim() : "",
        custoEmbalagem: parseCurrency(row[colCustoEmb]),
        acabamento: acabamento === "holográfico" || acabamento === "holografico" ? "holográfico" : "padrão",
        custoAcabamento: parseCurrency(row[colCustoAcab]),
        maoObra: colMaoObra >= 0 ? parseIntVal(row[colMaoObra]) : 0,
        custoTotal,
        custoTotalUni: colCustoTotalUni >= 0 ? parseCurrency(row[colCustoTotalUni]) : 0,
        tempoProducao,
      };

      const createData = {
        sku,
        ...updateData,
      };

      await prisma.produto.upsert({
        where: { sku },
        update: updateData,
        create: createData as any,
      });
      imported++;
    }
    console.log(`    ✅ ${imported} produtos importados de "${sheetName}"`);
    totalImported += imported;
  }

  return totalImported;
}

async function main() {
  const filePath = process.argv[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\PRODUTOS.xlsx";
  console.log("🚀 Iniciando migração de PRODUTOS.xlsx...");
  try {
    const total = await migrateProdutos(filePath);
    console.log(`\n✅ Migração concluída! ${total} produtos importados.`);
  } catch (err) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
