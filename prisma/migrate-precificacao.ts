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
  const n = parseInt(String(val).replace(/[^0-9,]/g, "").replace(",", "."));
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

async function migratePrecos(wb: XLSX.WorkBook) {
  const ws = wb.Sheets["PRECOS PRODUTOS"];
  if (!ws) { console.log("  ⚠️  Sheet 'PRECOS PRODUTOS' não encontrada"); return 0; }

  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 2) return 0;

  const headers = data[0].map((h: unknown) => String(h || "").trim());
  const colSku = findColumn(headers, "SKU");
  const colPrecoSug = findColumn(headers, "Preco Sugerido Venda Direta (R$)", "Preco Sugerido Venda Direta");
  const colDesconto = findColumn(headers, "Desconto Venda Directa (%)", "Desconto Venda Directa");

  if (colSku < 0) { console.log("    ⚠️  Coluna SKU não encontrada em PRECOS PRODUTOS"); return 0; }

  let updated = 0;
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const sku = row[colSku] ? String(row[colSku]).trim() : "";
    if (!sku) continue;

    const existente = await prisma.produto.findUnique({ where: { sku } });
    if (!existente) continue;

    const precoSugerido = parseCurrency(colPrecoSug >= 0 ? row[colPrecoSug] : 0);
    const desconto = colDesconto >= 0 ? parseFloat(String(row[colDesconto] ?? "0").replace(",", ".")) : 0;

    await prisma.produto.update({
      where: { sku },
      data: {
        precoSugerido: Math.round((precoSugerido || existente.precoSugerido) * 100) / 100,
        precoVendaDir: Math.round((precoSugerido || existente.precoVendaDir) * 100) / 100,
        desconto: isFinite(desconto) ? Math.round(desconto * 100) / 100 : existente.desconto,
      },
    });
    updated++;
  }
  return updated;
}

async function migrateMarketplaces(wb: XLSX.WorkBook) {
  const ws = wb.Sheets["marketplaces"];
  if (!ws) { console.log("  ⚠️  Sheet 'marketplaces' não encontrada"); return 0; }

  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 2) return 0;

  const headers = data[0].map((h: unknown) => String(h || "").trim());
  const colSku = findColumn(headers, "SKU");
  const colMediaMk = findColumn(headers, "media marketplace", "MEDIA MARKETPLACE");

  if (colSku < 0) { console.log("    ⚠️  Coluna SKU não encontrada em marketplaces"); return 0; }

  let updated = 0;
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const sku = row[colSku] ? String(row[colSku]).trim() : "";
    if (!sku) continue;

    const existente = await prisma.produto.findUnique({ where: { sku } });
    if (!existente) continue;

    const precoMk = parseCurrency(colMediaMk >= 0 ? row[colMediaMk] : 0);

    await prisma.produto.update({
      where: { sku },
      data: { precoMkplaces: Math.round((precoMk || existente.precoMkplaces) * 100) / 100 },
    });
    updated++;
  }
  return updated;
}

async function main() {
  const filePath = process.argv[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\PRECIFICACAO.xlsx";
  console.log("🚀 Iniciando migração de PRECIFICACAO.xlsx...");

  try {
    const wb = XLSX.readFile(filePath, { cellDates: true });

    const precos = await migratePrecos(wb);
    console.log(`  ✅ ${precos} produtos com preço sugerido atualizados`);

    const mks = await migrateMarketplaces(wb);
    console.log(`  ✅ ${mks} produtos com preço marketplace atualizados`);

    const total = await prisma.produto.count({
      where: { precoSugerido: { gt: 0 } },
    });
    console.log(`\n📊 Total de produtos com preço: ${total} de ${await prisma.produto.count()}`);
  } catch (err) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
