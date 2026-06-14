import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS "Categoria" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "nome" TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "Categoria_nome_key" ON "Categoria"("nome");
CREATE TABLE IF NOT EXISTS "materiais" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "sku_mat" TEXT NOT NULL, "nome" TEXT NOT NULL, "descricao" TEXT NOT NULL DEFAULT '', "tipo" TEXT NOT NULL DEFAULT '', "unidades" INTEGER NOT NULL DEFAULT 1, "valor" REAL NOT NULL DEFAULT 0, "vl_uni" REAL NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "materiais_sku_mat_key" ON "materiais"("sku_mat");
CREATE TABLE IF NOT EXISTS "embalagens" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "sku_pack" TEXT NOT NULL, "tipo" TEXT NOT NULL DEFAULT '', "comprimento" REAL NOT NULL DEFAULT 0, "largura" REAL NOT NULL DEFAULT 0, "altura" REAL NOT NULL DEFAULT 0, "material" TEXT NOT NULL DEFAULT '', "unidades" INTEGER NOT NULL DEFAULT 0, "valor" REAL NOT NULL DEFAULT 0, "vl_uni" REAL NOT NULL DEFAULT 0, "lacre_tipo" TEXT NOT NULL DEFAULT '', "lacre_descricao" TEXT NOT NULL DEFAULT '', "lacre_material" TEXT NOT NULL DEFAULT '', "lacre_unidades" INTEGER NOT NULL DEFAULT 0, "vl_lacre" REAL NOT NULL DEFAULT 0, "uni_lacre" INTEGER NOT NULL DEFAULT 0, "consumo_lacre" REAL NOT NULL DEFAULT 0, "total_lacre" REAL NOT NULL DEFAULT 0, "total_mat" REAL NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "embalagens_sku_pack_key" ON "embalagens"("sku_pack");
CREATE TABLE IF NOT EXISTS "produtos" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "sku" TEXT NOT NULL, "nome" TEXT NOT NULL, "descricao" TEXT NOT NULL DEFAULT '', "imagem" TEXT NOT NULL DEFAULT '', "categoria_id" INTEGER NOT NULL, "sub_categoria" TEXT NOT NULL DEFAULT '', "id_impressora" TEXT NOT NULL DEFAULT '', "id_filamento" TEXT NOT NULL DEFAULT '', "peso_usado" REAL NOT NULL DEFAULT 0, "custo_filamento" REAL NOT NULL DEFAULT 0, "custo_total_filam" REAL NOT NULL DEFAULT 0, "tempo_horas" REAL NOT NULL DEFAULT 0, "tempo_minutos" REAL NOT NULL DEFAULT 0, "tempo_decimal" REAL NOT NULL DEFAULT 0, "capacidade" INTEGER NOT NULL DEFAULT 0, "tampa" TEXT NOT NULL DEFAULT '', "comprimento" REAL NOT NULL DEFAULT 0, "largura" REAL NOT NULL DEFAULT 0, "altura" REAL NOT NULL DEFAULT 0, "custo_modelo_3d" REAL NOT NULL DEFAULT 0, "uni_mesa" INTEGER NOT NULL DEFAULT 1, "materiais" TEXT NOT NULL DEFAULT '', "qtd_materiais" INTEGER NOT NULL DEFAULT 0, "custo_material" REAL NOT NULL DEFAULT 0, "protecao" TEXT NOT NULL DEFAULT '', "qtd_protecao" INTEGER NOT NULL DEFAULT 0, "custo_protecao" REAL NOT NULL DEFAULT 0, "embalagem" TEXT NOT NULL DEFAULT '', "custo_embalagem" REAL NOT NULL DEFAULT 0, "acabamento" TEXT NOT NULL DEFAULT 'padrao', "custo_acabamento" REAL NOT NULL DEFAULT 0, "mao_obra" REAL NOT NULL DEFAULT 0, "custo_total" REAL NOT NULL DEFAULT 0, "custo_total_uni" REAL NOT NULL DEFAULT 0, "tempo_producao" REAL NOT NULL DEFAULT 0, "preco_sugerido" REAL NOT NULL DEFAULT 0, "preco_mkplaces" REAL NOT NULL DEFAULT 0, "preco_venda_dir" REAL NOT NULL DEFAULT 0, "desconto" REAL NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL, FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "produtos_sku_key" ON "produtos"("sku");
CREATE TABLE IF NOT EXISTS "regras_precificacao" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "categoria_id" INTEGER NOT NULL, "markup" REAL NOT NULL DEFAULT 0.4, "margem_seguranca" REAL NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL, FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "regras_precificacao_categoria_id_key" ON "regras_precificacao"("categoria_id");
CREATE TABLE IF NOT EXISTS "config_precificacao" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "chave" TEXT NOT NULL, "valor" TEXT NOT NULL, "descricao" TEXT NOT NULL DEFAULT '');
CREATE UNIQUE INDEX IF NOT EXISTS "config_precificacao_chave_key" ON "config_precificacao"("chave");
CREATE TABLE IF NOT EXISTS "produtos_materiais" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "produto_id" INTEGER NOT NULL, "material_id" INTEGER NOT NULL, "quantidade" REAL NOT NULL DEFAULT 1, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY ("material_id") REFERENCES "materiais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE TABLE IF NOT EXISTS "pedidos" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "cliente" TEXT NOT NULL, "data_pedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "status" TEXT NOT NULL DEFAULT 'pendente', "valor_total" REAL NOT NULL DEFAULT 0, "sinal" REAL NOT NULL DEFAULT 0, "saldo_receber" REAL NOT NULL DEFAULT 0, "observacao" TEXT NOT NULL DEFAULT '', "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS "itens_pedido" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "pedido_id" INTEGER NOT NULL, "produto_id" INTEGER NOT NULL, "quantidade" INTEGER NOT NULL DEFAULT 1, "valor_unitario" REAL NOT NULL DEFAULT 0, FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);
CREATE TABLE IF NOT EXISTS "impressoras" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "nome" TEXT NOT NULL, "modelo" TEXT NOT NULL, "custo_hora" REAL NOT NULL, "ativa" BOOLEAN NOT NULL DEFAULT true, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS "movimentos_estoque" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "tipo" TEXT NOT NULL, "produto_id" INTEGER, "material_id" INTEGER, "quantidade" REAL NOT NULL, "saldo_apos" REAL NOT NULL, "observacao" TEXT NOT NULL DEFAULT '', "pedido_id" INTEGER, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE SET NULL ON UPDATE CASCADE, FOREIGN KEY ("material_id") REFERENCES "materiais" ("id") ON DELETE SET NULL ON UPDATE CASCADE, FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE SET NULL ON UPDATE CASCADE);
CREATE TABLE IF NOT EXISTS "filamentos" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "id_filamento" TEXT NOT NULL, "amostra" TEXT NOT NULL DEFAULT '', "reposicao" TEXT NOT NULL DEFAULT '', "material" TEXT NOT NULL DEFAULT '', "marca" TEXT NOT NULL DEFAULT '', "cor" TEXT NOT NULL DEFAULT '', "familia" TEXT NOT NULL DEFAULT '', "ref_bambu" TEXT NOT NULL DEFAULT '', "peso_inicial" REAL NOT NULL DEFAULT 0, "peso_atual" REAL NOT NULL DEFAULT 0, "preco_rolo" REAL NOT NULL DEFAULT 0, "custo_por_g" REAL NOT NULL DEFAULT 0, "fornecedor" TEXT NOT NULL DEFAULT '', "estoque_pct" REAL NOT NULL DEFAULT 0, "alerta" TEXT NOT NULL DEFAULT '', "status" TEXT NOT NULL DEFAULT '', "consumido_finalizado" REAL NOT NULL DEFAULT 0, "saldo_projetado" REAL NOT NULL DEFAULT 0, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "filamentos_id_filamento_key" ON "filamentos"("id_filamento");
ALTER TABLE "produtos" ADD COLUMN "imagem" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Categoria" ADD COLUMN "abreviatura" TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS "users" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "nome" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'visitante');
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
`;

export async function GET() {
  const results: string[] = [];

  try {
    // 1. Run raw SQL to create all tables
    const statements = MIGRATION_SQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt + ";");
      } catch (e: any) {
        if (e?.message?.includes("already exists")) continue;
        results.push(`ERRO (ignorado): ${e?.message?.slice(0, 100)}`);
      }
    }
    results.push("Tabelas criadas/verificadas");

    // 2. Seed categories
    const catNames = ["deckbox", "contadores", "acessórios", "copa26", "switch", "chaveiros", "pokemon", "outros"];
    const catIds: number[] = [];
    for (const nome of catNames) {
      let cat = await prisma.categoria.findUnique({ where: { nome } });
      if (!cat) {
        cat = await prisma.categoria.create({ data: { nome } });
        results.push(`Categoria "${nome}" criada`);
      }
      catIds.push(cat.id);
    }

    // 3. Seed pricing rules
    const markups = [0.4, 0.4, 0.35, 0.4, 0.35, 0.5, 0.5, 0.4];
    for (let i = 0; i < catNames.length; i++) {
      const existing = await prisma.regraPrecificacao.findUnique({ where: { categoriaId: catIds[i] } });
      if (!existing) {
        await prisma.regraPrecificacao.create({
          data: { categoriaId: catIds[i], markup: markups[i] },
        });
        results.push(`Regra "${catNames[i]}" (${markups[i] * 100}%) criada`);
      }
    }

    // 4. Seed pricing config
    const cfgCount = await prisma.configPrecificacao.count();
    if (cfgCount === 0) {
      await prisma.configPrecificacao.createMany({
        data: [
          { chave: "taxa_marketplace", valor: "15", descricao: "Taxa média cobrada por marketplaces" },
          { chave: "custo_holografico", valor: "0.5", descricao: "Depreciação da placa holográfica por produto" },
          { chave: "markup_padrao", valor: "40", descricao: "Markup padrão sem regra específica" },
        ],
      });
      results.push("Configurações de precificação criadas");
    }

    // 5. Seed default users
    const users = [
      { username: "admin", password: "$2a$10$placeholder", nome: "Administrador", role: "admin" },
      { username: "visitante", password: "$2a$10$placeholder", nome: "Visitante", role: "visitante" },
    ];
    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { username: u.username } });
      if (!existing) {
        const bcrypt = await import("bcryptjs");
        const hash = bcrypt.hashSync(u.username === "admin" ? "admin123" : "visita123", 10);
        await prisma.user.create({ data: { username: u.username, password: hash, nome: u.nome, role: u.role } });
        results.push(`Usuário "${u.username}" criado`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
