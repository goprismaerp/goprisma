const XLSX = require("xlsx");
const path = require("path");

const xlsxPath = path.resolve("G:/Meu Drive/GoPrisma/financeiro/CUSTOS.xlsx");
const wb = XLSX.readFile(xlsxPath);
const ws = wb.Sheets["Cadastro Filamentos"];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

const filamentos = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r[0]) continue;
  filamentos.push({
    idFilamento: String(r[0] || ""),
    amostra: String(r[1] || ""),
    reposicao: String(r[2] ?? ""),
    material: String(r[3] || ""),
    marca: String(r[4] || ""),
    cor: String(r[5] || ""),
    familia: String(r[6] || ""),
    refBambu: String(r[7] || ""),
    pesoInicial: Number(r[8]) || 0,
    pesoAtual: Number(r[9]) || 0,
    precoRolo: Number(r[10]) || 0,
    custoPorG: Number(r[11]) || 0,
    fornecedor: String(r[12] || ""),
    estoquePct: Number(r[13]) || 0,
    alerta: String(r[14] || ""),
    status: String(r[15] || ""),
    consumidoFinalizado: Number(r[16]) || 0,
    saldoProjetado: Number(r[17]) || 0,
  });
}

async function main() {
  const API = process.argv[2] || "http://localhost:3000";
  const res = await fetch(`${API}/api/filamentos/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows: filamentos }),
  });
  const result = await res.json();
  console.log("Resultado:", result);
}

main().catch(console.error);
