import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tipo } = body;

    const scriptsDir = path.join(process.cwd(), "prisma");
    const basePath = "G:\\Meu Drive\\GoPrisma\\financeiro";

    const files: Record<string, { script: string; arquivo: string }> = {
      produtos: { script: "prisma/migrate-produtos.ts", arquivo: `${basePath}\\PRODUTOS.xlsx` },
      custos: { script: "prisma/migrate-custos.ts", arquivo: `${basePath}\\CUSTOS.xlsx` },
      gestao: { script: "prisma/migrate-gestao.ts", arquivo: `${basePath}\\Gestao_GoPrisma.xlsx` },
      precificacao: { script: "prisma/migrate-precificacao.ts", arquivo: `${basePath}\\PRECIFICACAO.xlsx` },
    };

    const results: string[] = [];

    if (tipo && tipo !== "all") {
      const item = files[tipo as string];
      if (!item) {
        return NextResponse.json({ error: `Tipo inválido: ${tipo}` }, { status: 400 });
      }
      const cmd = `npx tsx "${item.script}" "${item.arquivo}"`;
      execSync(cmd, { stdio: "pipe", cwd: process.cwd(), timeout: 120000 });
      results.push(`${tipo}: importado com sucesso`);
    } else {
      for (const [key, item] of Object.entries(files)) {
        try {
          const cmd = `npx tsx "${item.script}" "${item.arquivo}"`;
          execSync(cmd, { stdio: "pipe", cwd: process.cwd(), timeout: 120000 });
          results.push(`${key}: importado com sucesso`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "erro desconhecido";
          results.push(`${key}: falhou - ${msg}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
