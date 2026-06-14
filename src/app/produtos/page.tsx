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
  descricao: string;
  custoTotal: number;
  precoSugerido: number;
  pesoUsado: number;
  tempoDecimal: number;
  categoria: Categoria;
}

type ModoView = "grid" | "lista" | "compacto";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtroCat, setFiltroCat] = useState("");
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState<ModoView>("lista");

  function carregar() {
    const url = filtroCat ? `/api/produtos?categoriaId=${filtroCat}` : "/api/produtos";
    fetch(url).then((r) => r.json()).then(setProdutos);
  }

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }, []);

  useEffect(() => {
    carregar();
  }, [filtroCat]);

  const filtrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.sku.toLowerCase().includes(busca.toLowerCase())
  );

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

  const viewOptions: { value: ModoView; label: string; icon: string }[] = [
    { value: "grid", label: "Grid", icon: "⊞" },
    { value: "lista", label: "Lista", icon: "☰" },
    { value: "compacto", label: "Compacto", icon: "≡" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <div className="flex gap-2">
          <button onClick={recalcularTodos}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Recalcular Todos
          </button>
          <Link href="/cadastro"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            + Cadastro
          </Link>
          <Link href="/produtos/novo"
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Novo Produto
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Mostrar por:</span>
          {viewOptions.map((opt) => (
            <button key={opt.value} onClick={() => setModo(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                modo === opt.value
                  ? "bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <input value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="w-64 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm" />

        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900">
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-zinc-400">{filtrados.length} produto(s)</p>

      {modo === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
              <div className="text-xs text-zinc-400 font-mono mb-1">{p.sku}</div>
              <h3 className="font-semibold text-sm leading-snug mb-2">{p.nome}</h3>
              <div className="text-xs text-zinc-400 mb-1">{p.categoria?.nome}</div>
              {p.pesoUsado > 0 && <div className="text-xs text-zinc-400">{p.pesoUsado}g</div>}
              {p.tempoDecimal > 0 && <div className="text-xs text-zinc-400">{p.tempoDecimal.toFixed(1)}h</div>}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-400">{formatCurrency(p.custoTotal)}</span>
                <span className="text-sm font-bold">{formatCurrency(p.precoSugerido)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/produtos/${p.id}`} className="text-xs text-blue-600 hover:underline">Editar</Link>
                <button onClick={() => deletar(p.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-400">Nenhum produto encontrado</div>
          )}
        </div>
      ) : modo === "compacto" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="px-3 py-2 font-medium text-xs">SKU</th>
                <th className="px-3 py-2 font-medium text-xs">Nome</th>
                <th className="px-3 py-2 font-medium text-xs">Cat</th>
                <th className="px-3 py-2 font-medium text-xs text-right">Custo</th>
                <th className="px-3 py-2 font-medium text-xs text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-1.5 text-xs text-zinc-500 font-mono">{p.sku}</td>
                  <td className="px-3 py-1.5 text-xs">{p.nome}</td>
                  <td className="px-3 py-1.5 text-xs text-zinc-400">{p.categoria?.nome?.slice(0, 6)}</td>
                  <td className="px-3 py-1.5 text-xs text-right">{formatCurrency(p.custoTotal)}</td>
                  <td className="px-3 py-1.5 text-xs text-right font-medium">{formatCurrency(p.precoSugerido)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-zinc-400 text-xs">Nenhum produto</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
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
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 text-zinc-500">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.categoria?.nome}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.custoTotal)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.precoSugerido)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => recalcular(p.id)}
                      className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm" title="Recalcular">
                      Recalc
                    </button>
                    <Link href={`/produtos/${p.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Editar</Link>
                    <button onClick={() => deletar(p.id)}
                      className="text-red-600 dark:text-red-400 hover:underline text-sm">Excluir</button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Nenhum produto encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
