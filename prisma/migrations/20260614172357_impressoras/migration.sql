-- CreateTable
CREATE TABLE "impressoras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "custo_hora" REAL NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "movimentos_estoque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "produto_id" INTEGER,
    "material_id" INTEGER,
    "quantidade" REAL NOT NULL,
    "saldo_apos" REAL NOT NULL,
    "observacao" TEXT NOT NULL DEFAULT '',
    "pedido_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentos_estoque_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentos_estoque_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentos_estoque_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
