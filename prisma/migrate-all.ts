import { execSync } from "child_process";

async function runScript(scriptName: string, filePath?: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`▶️  Executando ${scriptName}...`);
  console.log(`${"=".repeat(50)}\n`);
  try {
    const cmd = `npx tsx prisma/${scriptName}${filePath ? ` "${filePath}"` : ""}`;
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
    console.log(`\n✅ ${scriptName} concluído com sucesso!\n`);
  } catch (err) {
    console.error(`\n❌ ${scriptName} falhou. Verifique os erros acima.\n`);
    throw err;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const produtosPath = args[0] || "G:\\Meu Drive\\GoPrisma\\financeiro\\PRODUTOS.xlsx";
  const custosPath = args[1] || "G:\\Meu Drive\\GoPrisma\\financeiro\\CUSTOS.xlsx";
  const gestaoPath = args[2] || "G:\\Meu Drive\\GoPrisma\\financeiro\\Gestao_GoPrisma.xlsx";

  console.log("🚀 INICIANDO MIGRAÇÃO COMPLETA DO GoPrisma ERP\n");

  const precificacaoPath = args[3] || "G:\\Meu Drive\\GoPrisma\\financeiro\\PRECIFICACAO.xlsx";

  try {
    await runScript("migrate-produtos.ts", produtosPath);
    await runScript("migrate-custos.ts", custosPath);
    await runScript("migrate-gestao.ts", gestaoPath);
    await runScript("migrate-precificacao.ts", precificacaoPath);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 MIGRAÇÃO COMPLETA FINALIZADA COM SUCESSO!");
    console.log("=".repeat(50));
  } catch {
    console.error("\n❌ Migração interrompida devido a erros.");
    process.exit(1);
  }
}

main();
