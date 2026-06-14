import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";

function parseCurrency(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return isFinite(val) ? val : 0;
  const str = String(val).replace(/[R$\s\.]/g, "").replace(",", ".");
  const n = parseFloat(str);
  return isFinite(n) ? n : 0;
}

function parseIntVal(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return isFinite(val) ? Math.round(val) : 0;
  const n = parseInt(String(val).replace(/[^0-9]/g, ""));
  return isFinite(n) ? n : 0;
}

function safeFloat(val: unknown, fallback = 0): number {
  if (val == null || val === "") return fallback;
  if (typeof val === "number") return isFinite(val) ? val : fallback;
  const str = String(val).replace(",", ".").trim();
  const n = parseFloat(str);
  return isFinite(n) ? n : fallback;
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

async function migrateMateriais(ws: XLSX.WorkSheet) {
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 3) return 0;

  const headers = data[1].map((h: unknown) => String(h || "").trim());
  const colSku = findColumn(headers, "Sku mat", "SKU MAT");
  const colNome = findColumn(headers, "material", "MATERIAL");
  const colDesc = findColumn(headers, "descricao", "DESCRICAO");
  const colTipo = findColumn(headers, "tipo", "TIPO");
  const colUnid = findColumn(headers, "unidades", "UNIDADES");
  const colValor = findColumn(headers, "valor", "VALOR");
  const colVlUni = findColumn(headers, "vl/uni", "VL/UNI");

  if (colSku < 0) {
    console.log("    ⚠️  Cabeçalhos de materiais não encontrados");
    return 0;
  }

  let imported = 0;
  for (let r = 2; r < data.length; r++) {
    const row = data[r];
    const skuMat = row[colSku] ? String(row[colSku]).trim() : "";
    if (!skuMat) continue;

    await prisma.material.upsert({
      where: { skuMat },
      update: {
        nome: row[colNome] ? String(row[colNome]).trim() : "",
        descricao: row[colDesc] ? String(row[colDesc]).trim() : "",
        tipo: row[colTipo] ? String(row[colTipo]).trim() : "",
        unidades: parseIntVal(row[colUnid]),
        valor: parseCurrency(row[colValor]),
        vlUni: parseCurrency(row[colVlUni]),
      },
      create: {
        skuMat,
        nome: row[colNome] ? String(row[colNome]).trim() : "",
        descricao: row[colDesc] ? String(row[colDesc]).trim() : "",
        tipo: row[colTipo] ? String(row[colTipo]).trim() : "",
        unidades: parseIntVal(row[colUnid]),
        valor: parseCurrency(row[colValor]),
        vlUni: parseCurrency(row[colVlUni]),
      },
    });
    imported++;
  }
  return imported;
}

async function migrateEmbalagens(ws: XLSX.WorkSheet) {
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 2) return 0;

  const headers = data[0].map((h: unknown) => String(h || "").trim());
  const colSku = findColumn(headers, "Sku pack", "SKU PACK");
  const colTipo = findColumn(headers, "tipo", "TIPO");
  const colComp = findColumn(headers, "L", "COMPRIMENTO");
  const colLarg = findColumn(headers, "P", "LARGURA");
  const colAlt = findColumn(headers, "A", "ALTURA");
  const colMat = findColumn(headers, "material", "MATERIAL");
  const colUnid = findColumn(headers, "unidades", "UNIDADES");
  const colValor = findColumn(headers, "valor", "VALOR");
  const colVlUni = findColumn(headers, "vl/uni", "VL/UNI");

  if (colSku < 0) {
    console.log("    ⚠️  Cabeçalhos de embalagens não encontrados");
    return 0;
  }

  let imported = 0;
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const skuPack = row[colSku] ? String(row[colSku]).trim() : "";
    if (!skuPack) continue;

    await prisma.embalagem.upsert({
      where: { skuPack },
      update: {
        tipo: row[colTipo] ? String(row[colTipo]).trim() : "",
        comprimento: safeFloat(row[colComp]),
        largura: safeFloat(row[colLarg]),
        altura: safeFloat(row[colAlt]),
        material: row[colMat] ? String(row[colMat]).trim() : "",
        unidades: parseIntVal(row[colUnid]),
        valor: parseCurrency(row[colValor]),
        vlUni: parseCurrency(row[colVlUni]),
      },
      create: {
        skuPack,
        tipo: row[colTipo] ? String(row[colTipo]).trim() : "",
        comprimento: safeFloat(row[colComp]),
        largura: safeFloat(row[colLarg]),
        altura: safeFloat(row[colAlt]),
        material: row[colMat] ? String(row[colMat]).trim() : "",
        unidades: parseIntVal(row[colUnid]),
        valor: parseCurrency(row[colValor]),
        vlUni: parseCurrency(row[colVlUni]),
      },
    });
    imported++;
  }
  return imported;
}

async function main() {
  const filePath = process.argv[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\CUSTOS.xlsx";
  console.log("🚀 Iniciando migração de CUSTOS.xlsx...");

  try {
    const wb = XLSX.readFile(filePath, { cellDates: true });

    let totalMat = 0;
    let totalEmb = 0;

    const wsMat = wb.Sheets["materiais"];
    if (wsMat) {
      totalMat = await migrateMateriais(wsMat);
      console.log(`  ✅ ${totalMat} materiais importados`);
    } else {
      console.log("  ⚠️  Sheet 'materiais' não encontrada");
    }

    const wsEmb = wb.Sheets["embalagens"];
    if (wsEmb) {
      totalEmb = await migrateEmbalagens(wsEmb);
      console.log(`  ✅ ${totalEmb} embalagens importadas`);
    } else {
      console.log("  ⚠️  Sheet 'embalagens' não encontrada");
    }

    console.log(`\n✅ Migração concluída! ${totalMat} materiais, ${totalEmb} embalagens.`);
  } catch (err) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
