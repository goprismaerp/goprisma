-- CreateTable
CREATE TABLE "filamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_filamento" TEXT NOT NULL,
    "amostra" TEXT NOT NULL DEFAULT '',
    "reposicao" TEXT NOT NULL DEFAULT '',
    "material" TEXT NOT NULL DEFAULT '',
    "marca" TEXT NOT NULL DEFAULT '',
    "cor" TEXT NOT NULL DEFAULT '',
    "familia" TEXT NOT NULL DEFAULT '',
    "ref_bambu" TEXT NOT NULL DEFAULT '',
    "peso_inicial" REAL NOT NULL DEFAULT 0,
    "peso_atual" REAL NOT NULL DEFAULT 0,
    "preco_rolo" REAL NOT NULL DEFAULT 0,
    "custo_por_g" REAL NOT NULL DEFAULT 0,
    "fornecedor" TEXT NOT NULL DEFAULT '',
    "estoque_pct" REAL NOT NULL DEFAULT 0,
    "alerta" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "consumido_finalizado" REAL NOT NULL DEFAULT 0,
    "saldo_projetado" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "filamentos_id_filamento_key" ON "filamentos"("id_filamento");
