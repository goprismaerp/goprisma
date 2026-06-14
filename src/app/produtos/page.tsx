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
  imagem: string;
  custoTotal: number;
  precoSugerido: number;
  pesoUsado: number;
  tempoDecimal: number;
  categoria: Categoria;
  createdAt: string;
}

type ModoView = "grid" | "lista" | "compacto";

const COLUNAS = [
  { key: "sku", label: "SKU" },
  { key: "nome", label: "Nome" },
  { key: "cat", label: "Cat" },
  { key: "custo", label: "Custo" },
  { key: "preco", label: "Preço" },
] as const;

type ColunaKey = (typeof COLUNAS)[number]["key"];

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtroCat, setFiltroCat] = useState("");
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState<ModoView>("lista");
  const [colunasVisiveis, setColunasVisiveis] = useState<ColunaKey[]>(["sku", "nome", "cat", "custo", "preco"]);
  const [ordem, setOrdem] = useState<string>("novos");

  function cmp(a: Produto, b: Produto) {
    switch (ordem) {
      case "az": return a.nome.localeCompare(b.nome);
      case "za": return b.nome.localeCompare(a.nome);
      case "maior-custo": return b.custoTotal - a.custoTotal;
      case "menor-custo": return a.custoTotal - b.custoTotal;
      case "maior-preco": return b.precoSugerido - a.precoSugerido;
      case "menor-preco": return a.precoSugerido - b.precoSugerido;
      case "antigos": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }

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

  const filtrados = produtos
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.sku.toLowerCase().includes(busca.toLowerCase())
    )
    .sort(cmp);

  const opcoesOrdem = [
    { value: "novos", label: "Mais novos" },
    { value: "antigos", label: "Mais antigos" },
    { value: "az", label: "A-Z" },
    { value: "za", label: "Z-A" },
    { value: "menor-custo", label: "Menor custo" },
    { value: "maior-custo", label: "Maior custo" },
    { value: "menor-preco", label: "Menor preço" },
    { value: "maior-preco", label: "Maior preço" },
  ];

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

      <div className="flex items-center gap-2 text-sm flex-wrap">
        {modo !== "grid" && (
          <>
            <span className="text-xs text-zinc-400">Colunas:</span>
            {COLUNAS.map((col) => (
              <button key={col.key} onClick={() =>
                setColunasVisiveis((prev) =>
                  prev.includes(col.key)
                    ? prev.filter((k) => k !== col.key)
                    : [...prev, col.key]
                )
              }
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  colunasVisiveis.includes(col.key)
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}>
                {col.label}
              </button>
            ))}
            <span className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1" />
          </>
        )}
        <span className="text-xs text-zinc-400">Ordenar:</span>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded px-2 py-0.5 text-xs bg-white dark:bg-zinc-800">
          {opcoesOrdem.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-zinc-400">{filtrados.length} produto(s)</p>

      {modo === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
              {p.imagem ? (
                <img src={p.imagem} alt={p.nome} className="w-full h-36 object-cover rounded-lg mb-3 bg-zinc-100 dark:bg-zinc-800" />
              ) : (
                <div className="w-full h-36 rounded-lg mb-3 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  Sem imagem
                </div>
              )}
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
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                {colunasVisiveis.includes("sku") && <th className={`font-medium ${modo === "compacto" ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>SKU</th>}
                {colunasVisiveis.includes("nome") && <th className={`font-medium ${modo === "compacto" ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>Nome</th>}
                {colunasVisiveis.includes("cat") && <th className={`font-medium ${modo === "compacto" ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>Categoria</th>}
                {colunasVisiveis.includes("custo") && <th className={`font-medium text-right ${modo === "compacto" ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>Custo</th>}
                {colunasVisiveis.includes("preco") && <th className={`font-medium text-right ${modo === "compacto" ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>Preço</th>}
                {modo === "lista" && <th className="px-4 py-3 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  {colunasVisiveis.includes("sku") && <td className={`${modo === "compacto" ? "px-3 py-1.5 text-xs" : "px-4 py-3"} text-zinc-500 font-mono`}>{p.sku}</td>}
                  {colunasVisiveis.includes("nome") && <td className={`${modo === "compacto" ? "px-3 py-1.5 text-xs" : "px-4 py-3"} ${modo === "lista" ? "font-medium" : ""}`}>{p.nome}</td>}
                  {colunasVisiveis.includes("cat") && <td className={`${modo === "compacto" ? "px-3 py-1.5 text-xs" : "px-4 py-3"} text-zinc-500`}>{p.categoria?.nome?.slice(0, modo === "compacto" ? 6 : undefined)}</td>}
                  {colunasVisiveis.includes("custo") && <td className={`${modo === "compacto" ? "px-3 py-1.5 text-xs" : "px-4 py-3"} text-right`}>{formatCurrency(p.custoTotal)}</td>}
                  {colunasVisiveis.includes("preco") && <td className={`${modo === "compacto" ? "px-3 py-1.5 text-xs" : "px-4 py-3"} text-right font-medium`}>{formatCurrency(p.precoSugerido)}</td>}
                  {modo === "lista" && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => recalcular(p.id)}
                        className="text-zinc-500 hover:text-zinc-800 text-sm" title="Recalcular">Recalc</button>
                      <Link href={`/produtos/${p.id}`}
                        className="text-blue-600 hover:underline text-sm">Editar</Link>
                      <button onClick={() => deletar(p.id)}
                        className="text-red-600 hover:underline text-sm">Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-zinc-400 text-xs">Nenhum produto</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
