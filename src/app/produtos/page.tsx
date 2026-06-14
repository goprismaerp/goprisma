"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  sku: string;
  nome: string;
  custoTotal: number;
  precoSugerido: number;
  categoria: Categoria;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtro, setFiltro] = useState("");

  function carregar() {
    const url = filtro ? `/api/produtos?categoriaId=${filtro}` : "/api/produtos";
    fetch(url).then((r) => r.json()).then(setProdutos);
  }

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }, []);

  useEffect(() => {
    carregar();
  }, [filtro]);

  async function deletar(id: number) {
    if (!confirm("Confirmar exclusão?")) return;
    await fetch(`/api/produtos/${id}`, { method: "DELETE" });
    carregar();
  }

  async function recalcular(id: number) {
    await fetch("/api/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: id }),
    });
    carregar();
  }

  async function recalcularTodos() {
    if (!confirm("Recalcular precificação de todos os produtos?")) return;
    await fetch("/api/recalcular-todos", { method: "POST" });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <button
            onClick={recalcularTodos}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Recalcular Todos
          </button>
          <Link
            href="/cadastro"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            + Cadastro
          </Link>
          <Link
            href="/produtos/novo"
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Novo Produto
          </Link>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm text-zinc-500">Filtrar por categoria:</label>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium text-right">Custo Total</th>
              <th className="px-4 py-3 font-medium text-right">Preço Sugerido</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-zinc-500">{p.categoria?.nome}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.custoTotal)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.precoSugerido)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => recalcular(p.id)}
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm"
                    title="Recalcular preços"
                  >
                    Recalc
                  </button>
                  <Link
                    href={`/produtos/${p.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deletar(p.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
