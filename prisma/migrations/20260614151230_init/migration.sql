-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku_mat" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT '',
    "unidades" INTEGER NOT NULL DEFAULT 1,
    "valor" REAL NOT NULL DEFAULT 0,
    "vl_uni" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "embalagens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku_pack" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT '',
    "comprimento" REAL NOT NULL DEFAULT 0,
    "largura" REAL NOT NULL DEFAULT 0,
    "altura" REAL NOT NULL DEFAULT 0,
    "material" TEXT NOT NULL DEFAULT '',
    "unidades" INTEGER NOT NULL DEFAULT 0,
    "valor" REAL NOT NULL DEFAULT 0,
    "vl_uni" REAL NOT NULL DEFAULT 0,
    "lacre_tipo" TEXT NOT NULL DEFAULT '',
    "lacre_descricao" TEXT NOT NULL DEFAULT '',
    "lacre_material" TEXT NOT NULL DEFAULT '',
    "lacre_unidades" INTEGER NOT NULL DEFAULT 0,
    "vl_lacre" REAL NOT NULL DEFAULT 0,
    "uni_lacre" INTEGER NOT NULL DEFAULT 0,
    "consumo_lacre" REAL NOT NULL DEFAULT 0,
    "total_lacre" REAL NOT NULL DEFAULT 0,
    "total_mat" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "categoria_id" INTEGER NOT NULL,
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
    "custo_total" REAL NOT NULL DEFAULT 0,
    "tempo_producao" REAL NOT NULL DEFAULT 0,
    "preco_sugerido" REAL NOT NULL DEFAULT 0,
    "preco_mkplaces" REAL NOT NULL DEFAULT 0,
    "preco_venda_dir" REAL NOT NULL DEFAULT 0,
    "desconto" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cliente" TEXT NOT NULL,
    "data_pedido" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "valor_total" REAL NOT NULL DEFAULT 0,
    "sinal" REAL NOT NULL DEFAULT 0,
    "saldo_receber" REAL NOT NULL DEFAULT 0,
    "observacao" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedido_id" INTEGER NOT NULL,
    "produto_id" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valor_unitario" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_sku_mat_key" ON "materiais"("sku_mat");

-- CreateIndex
CREATE UNIQUE INDEX "embalagens_sku_pack_key" ON "embalagens"("sku_pack");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");
