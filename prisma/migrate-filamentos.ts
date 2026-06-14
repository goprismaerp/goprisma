import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";

function parseFloatVal(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return isFinite(val) ? val : 0;
  const str = String(val).replace(",", ".").trim();
  const n = parseFloat(str);
  return isFinite(n) ? n : 0;
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

async function main() {
  const filePath = process.argv[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\CUSTOS.xlsx";
  console.log("🚀 Importando filamentos...");

  const wb = XLSX.readFile(filePath, { cellDates: true });
  const ws = wb.Sheets["Cadastro Filamentos"];
  if (!ws) {
    console.error("❌ Sheet 'Cadastro Filamentos' não encontrada");
    process.exit(1);
  }

  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 2) {
    console.log("⚠️  Sheet sem dados");
    return;
  }

  const headers = data[0].map((h: unknown) => String(h || "").trim());
  const colId = findColumn(headers, "ID Filamento");
  const colAmostra = findColumn(headers, "amostra");
  const colReposicao = findColumn(headers, "Reposição", "Reposicao");
  const colMaterial = findColumn(headers, "Material");
  const colMarca = findColumn(headers, "Marca");
  const colCor = findColumn(headers, "Cor");
  const colFamilia = findColumn(headers, "Familia", "Família", "Familia");
  const colRefBambu = findColumn(headers, "ref Bambu");
  const colPesoInicial = findColumn(headers, "Peso Inicial (g)");
  const colPesoAtual = findColumn(headers, "Peso Atual (g)");
  const colPrecoRolo = findColumn(headers, "Preço do Rolo (R$)", "Preco do Rolo");
  const colCustoPorG = findColumn(headers, "Custo por g (R$)", "Custo por g");
  const colFornecedor = findColumn(headers, "Fornecedor");
  const colEstoquePct = findColumn(headers, "Estoque %", "Estoque");
  const colAlerta = findColumn(headers, "Alerta");
  const colStatus = findColumn(headers, "Status");
  const colConsumido = findColumn(headers, "Consumido Finalizado (g)");
  const colSaldoProj = findColumn(headers, "Saldo Projetado (g)");

  if (colId < 0) {
    console.error("❌ Coluna 'ID Filamento' não encontrada");
    process.exit(1);
  }

  let imported = 0;
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const idFilamento = row[colId] ? String(row[colId]).trim() : "";
    if (!idFilamento) continue;

    await prisma.filamento.upsert({
      where: { idFilamento },
      update: {
        amostra: colAmostra >= 0 && row[colAmostra] ? String(row[colAmostra]).trim() : "",
        reposicao: colReposicao >= 0 && row[colReposicao] ? String(row[colReposicao]).trim() : "",
        material: colMaterial >= 0 && row[colMaterial] ? String(row[colMaterial]).trim() : "",
        marca: colMarca >= 0 && row[colMarca] ? String(row[colMarca]).trim() : "",
        cor: colCor >= 0 && row[colCor] ? String(row[colCor]).trim() : "",
        familia: colFamilia >= 0 && row[colFamilia] ? String(row[colFamilia]).trim() : "",
        refBambu: colRefBambu >= 0 && row[colRefBambu] ? String(row[colRefBambu]).trim() : "",
        pesoInicial: parseFloatVal(row[colPesoInicial]),
        pesoAtual: parseFloatVal(row[colPesoAtual]),
        precoRolo: parseFloatVal(row[colPrecoRolo]),
        custoPorG: parseFloatVal(row[colCustoPorG]),
        fornecedor: colFornecedor >= 0 && row[colFornecedor] ? String(row[colFornecedor]).trim() : "",
        estoquePct: parseFloatVal(row[colEstoquePct]),
        alerta: colAlerta >= 0 && row[colAlerta] ? String(row[colAlerta]).trim() : "",
        status: colStatus >= 0 && row[colStatus] ? String(row[colStatus]).trim() : "",
        consumidoFinalizado: parseFloatVal(row[colConsumido]),
        saldoProjetado: parseFloatVal(row[colSaldoProj]),
      },
      create: {
        idFilamento,
        amostra: colAmostra >= 0 && row[colAmostra] ? String(row[colAmostra]).trim() : "",
        reposicao: colReposicao >= 0 && row[colReposicao] ? String(row[colReposicao]).trim() : "",
        material: colMaterial >= 0 && row[colMaterial] ? String(row[colMaterial]).trim() : "",
        marca: colMarca >= 0 && row[colMarca] ? String(row[colMarca]).trim() : "",
        cor: colCor >= 0 && row[colCor] ? String(row[colCor]).trim() : "",
        familia: colFamilia >= 0 && row[colFamilia] ? String(row[colFamilia]).trim() : "",
        refBambu: colRefBambu >= 0 && row[colRefBambu] ? String(row[colRefBambu]).trim() : "",
        pesoInicial: parseFloatVal(row[colPesoInicial]),
        pesoAtual: parseFloatVal(row[colPesoAtual]),
        precoRolo: parseFloatVal(row[colPrecoRolo]),
        custoPorG: parseFloatVal(row[colCustoPorG]),
        fornecedor: colFornecedor >= 0 && row[colFornecedor] ? String(row[colFornecedor]).trim() : "",
        estoquePct: parseFloatVal(row[colEstoquePct]),
        alerta: colAlerta >= 0 && row[colAlerta] ? String(row[colAlerta]).trim() : "",
        status: colStatus >= 0 && row[colStatus] ? String(row[colStatus]).trim() : "",
        consumidoFinalizado: parseFloatVal(row[colConsumido]),
        saldoProjetado: parseFloatVal(row[colSaldoProj]),
      },
    });
    imported++;
  }

  console.log(`✅ ${imported} filamentos importados`);
  await prisma.$disconnect();
}

main();
