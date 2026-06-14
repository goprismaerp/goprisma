-- CreateTable
CREATE TABLE "regras_precificacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria_id" INTEGER NOT NULL,
    "markup" REAL NOT NULL DEFAULT 0.4,
    "margem_seguranca" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "regras_precificacao_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "produtos_materiais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produto_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "quantidade" REAL NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "produtos_materiais_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "produtos_materiais_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_precificacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT ''
);

-- CreateIndex
CREATE UNIQUE INDEX "regras_precificacao_categoria_id_key" ON "regras_precificacao"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "config_precificacao_chave_key" ON "config_precificacao"("chave");
