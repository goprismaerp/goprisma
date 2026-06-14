-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_produtos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "categoria_id" INTEGER NOT NULL,
    "sub_categoria" TEXT NOT NULL DEFAULT '',
    "id_impressora" TEXT NOT NULL DEFAULT '',
    "id_filamento" TEXT NOT NULL DEFAULT '',
    "peso_usado" REAL NOT NULL DEFAULT 0,
    "custo_filamento" REAL NOT NULL DEFAULT 0,
    "custo_total_filam" REAL NOT NULL DEFAULT 0,
    "tempo_horas" REAL NOT NULL DEFAULT 0,
    "tempo_minutos" REAL NOT NULL DEFAULT 0,
    "tempo_decimal" REAL NOT NULL DEFAULT 0,
    "capacidade" INTEGER NOT NULL DEFAULT 0,
    "tampa" TEXT NOT NULL DEFAULT '',
    "comprimento" REAL NOT NULL DEFAULT 0,
    "largura" REAL NOT NULL DEFAULT 0,
    "altura" REAL NOT NULL DEFAULT 0,
    "custo_modelo_3d" REAL NOT NULL DEFAULT 0,
    "uni_mesa" INTEGER NOT NULL DEFAULT 1,
    "materiais" TEXT NOT NULL DEFAULT '',
    "qtd_materiais" INTEGER NOT NULL DEFAULT 0,
    "custo_material" REAL NOT NULL DEFAULT 0,
    "protecao" TEXT NOT NULL DEFAULT '',
    "qtd_protecao" INTEGER NOT NULL DEFAULT 0,
    "custo_protecao" REAL NOT NULL DEFAULT 0,
    "embalagem" TEXT NOT NULL DEFAULT '',
    "custo_embalagem" REAL NOT NULL DEFAULT 0,
    "acabamento" TEXT NOT NULL DEFAULT 'padrao',
    "custo_acabamento" REAL NOT NULL DEFAULT 0,
    "mao_obra" REAL NOT NULL DEFAULT 0,
    "custo_total" REAL NOT NULL DEFAULT 0,
    "custo_total_uni" REAL NOT NULL DEFAULT 0,
    "tempo_producao" REAL NOT NULL DEFAULT 0,
    "preco_sugerido" REAL NOT NULL DEFAULT 0,
    "preco_mkplaces" REAL NOT NULL DEFAULT 0,
    "preco_venda_dir" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_produtos" ("acabamento", "categoria_id", "created_at", "custo_acabamento", "custo_embalagem", "custo_material", "custo_protecao", "custo_total", "desconto", "descricao", "embalagem", "id", "materiais", "nome", "preco_mkplaces", "preco_sugerido", "preco_venda_dir", "protecao", "qtd_materiais", "qtd_protecao", "sku", "tempo_producao", "updated_at") SELECT "acabamento", "categoria_id", "created_at", "custo_acabamento", "custo_embalagem", "custo_material", "custo_protecao", "custo_total", "desconto", "descricao", "embalagem", "id", "materiais", "nome", "preco_mkplaces", "preco_sugerido", "preco_venda_dir", "protecao", "qtd_materiais", "qtd_protecao", "sku", "tempo_producao", "updated_at" FROM "produtos";
DROP TABLE "produtos";
ALTER TABLE "new_produtos" RENAME TO "produtos";
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
