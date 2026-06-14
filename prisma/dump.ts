import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categorias = await prisma.categoria.findMany();
  const produtos = await prisma.produto.findMany();
  const materiais = await prisma.material.findMany();
  const embalagens = await prisma.embalagem.findMany();
  const pedidos = await prisma.pedido.findMany({ include: { itens: true } });
  const regras = await prisma.regraPrecificacao.findMany();
  const configs = await prisma.configPrecificacao.findMany();
  const filamentos = await prisma.filamento.findMany();

  const dump = { categorias, produtos, materiais, embalagens, pedidos, regras, configs, filamentos };
  fs.writeFileSync("prisma/dump.json", JSON.stringify(dump, null, 2));
  console.log(`Exportados: ${categorias.length} categorias, ${produtos.length} produtos, ${materiais.length} materiais`);
}

main().then(() => prisma.$disconnect());
