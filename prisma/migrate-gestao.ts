import { prisma } from "../src/lib/prisma";
import * as XLSX from "xlsx";

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

function parseDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    const d = new Date((val - 25569) * 86400 * 1000);
    if (!isNaN(d.getTime())) return d;
  }
  const parts = String(val).split("/");
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date();
}

async function migratePedidos(ws: XLSX.WorkSheet) {
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
  if (data.length < 2) return 0;

  const headers = data[0].map((h: unknown) => String(h || "").trim());
  const colData = findColumn(headers, "Data");
  const colCliente = findColumn(headers, "Cliente");
  const colSku = findColumn(headers, "SKU");
  const colProduto = findColumn(headers, "Produto", "PRODUTO");
  const colQtd = findColumn(headers, "Qtd");
  const colValorTotal = findColumn(headers, "Valor Total", "VALOR TOTAL");
  const colValorLiq = findColumn(headers, "Valor Liquido", "VALOR LIQUIDO");
  const colSinal = findColumn(headers, "SINAL");
  const colStatus = findColumn(headers, "status", "STATUS");
  const colCanal = findColumn(headers, "canal", "CANAL");

  if (colCliente < 0) {
    console.log("    ⚠️  Cabeçalhos de Pedidos não encontrados");
    return 0;
  }

  let imported = 0;

  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const cliente = row[colCliente] ? String(row[colCliente]).trim() : "";
    if (!cliente) continue;

    const dataPedido = parseDate(row[colData]);
    const valorTotal = parseCurrency(row[colValorTotal] || row[colValorLiq]);
    const sinal = parseCurrency(row[colSinal]);
    const rawStatus = row[colStatus] ? String(row[colStatus]).trim().toLowerCase() : "pendente";
    const status = ["pendente", "produzindo", "enviado", "entregue", "cancelado"].includes(rawStatus) ? rawStatus : "pendente";
    const produto = row[colProduto] ? String(row[colProduto]).trim() : "";
    const observacao = `Importado de Gestao_GoPrisma${produto ? ` | Produto: ${produto}` : ""}`;

    await prisma.pedido.create({
      data: {
        cliente,
        dataPedido,
        status,
        valorTotal,
        sinal,
        saldoReceber: valorTotal - sinal,
        observacao,
      },
    });

    imported++;
  }

  return imported;
}

async function main() {
  const filePath = process.argv[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\Gestao_GoPrisma.xlsx";
  console.log("🚀 Iniciando migração de Gestao_GoPrisma.xlsx...");

  try {
    const wb = XLSX.readFile(filePath, { cellDates: true });

    const wsPedidos = wb.Sheets["Pedidos"];
    let totalPedidos = 0;
    if (wsPedidos) {
      totalPedidos = await migratePedidos(wsPedidos);
      console.log(`  ✅ ${totalPedidos} pedidos importados`);
    }

    console.log(`\n✅ Migração concluída! ${totalPedidos} pedidos.`);
  } catch (err) {
    console.error("❌ Erro na migração:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
