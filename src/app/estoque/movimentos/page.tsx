"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type TipoItem = "produto" | "material";

interface Produto { id: number; nome: string; sku: string }
interface Material { id: number; nome: string; skuMat: string }
interface Movimento {
  id: number; tipo: string; quantidade: number; saldoApos: number;
  observacao: string; createdAt: string;
  produto: { id: number; nome: string; sku: string } | null;
  material: { id: number; nome: string; skuMat: string } | null;
}

export default function MovimentosPage() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [tipoItem, setTipoItem] = useState<TipoItem>("produto");
  const [itemId, setItemId] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [observacao, setObservacao] = useState("");
  const [filterId, setFilterId] = useState("");

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
    fetch("/api/materiais").then((r) => r.json()).then(setMateriais);
    carregarMovimentos();
  }, []);

  async function carregarMovimentos(produtoId?: string) {
    const url = produtoId ? `/api/estoque/movimentos?produtoId=${produtoId}` : "/api/estoque/movimentos";
    const res = await fetch(url);
    if (res.ok) setMovimentos(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = { tipo, quantidade: Number(quantidade), observacao };
    if (tipoItem === "produto") body.produtoId = Number(itemId);
    else body.materialId = Number(itemId);

    const res = await fetch("/api/estoque/movimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setQuantidade("");
      setObservacao("");
      carregarMovimentos();
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movimentos de Estoque</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Item</label>
            <select value={tipoItem} onChange={(e) => { setTipoItem(e.target.value as TipoItem); setItemId(""); }}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="produto">Produto</option>
              <option value="material">Material</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{tipoItem === "produto" ? "Produto" : "Material"} *</label>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} required
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="">Selecione...</option>
              {(tipoItem === "produto" ? produtos : materiais).map((item) => (
                <option key={item.id} value={item.id}>
                  {"sku" in item ? (item as Produto).sku : (item as Material).skuMat} - {item.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantidade *</label>
            <input type="number" step="0.01" min="0.01" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observação</label>
          <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
          Registrar
        </button>
      </form>

      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Histórico</h2>
        <select value={filterId} onChange={(e) => { setFilterId(e.target.value); carregarMovimentos(e.target.value); }}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-zinc-800">
          <option value="">Todos</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.sku} - {p.nome}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Qtd</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
              <th className="px-4 py-3 font-medium">Obs</th>
            </tr>
          </thead>
          <tbody>
            {movimentos.map((m) => (
              <tr key={m.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{formatDate(m.createdAt)}</td>
                <td className="px-4 py-3 font-medium">{m.produto?.nome || m.material?.nome || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    m.tipo === "entrada" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    m.tipo === "saida" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {m.tipo}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-medium ${m.quantidade > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
                </td>
                <td className="px-4 py-3 text-right">{m.saldoApos}</td>
                <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">{m.observacao || "-"}</td>
              </tr>
            ))}
            {movimentos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400">Nenhum movimento registrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
