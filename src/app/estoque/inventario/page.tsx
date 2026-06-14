"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type TipoItem = "produto" | "material";

interface Produto { id: number; nome: string; sku: string }
interface Material { id: number; nome: string; skuMat: string }
interface Movimento {
  id: number; tipo: string; quantidade: number; saldoApos: number;
  observacao: string; createdAt: string;
  produto: { nome: string } | null;
  material: { nome: string } | null;
}

export default function InventarioPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [tipoItem, setTipoItem] = useState<TipoItem>("produto");
  const [itemId, setItemId] = useState("");
  const [saldoReal, setSaldoReal] = useState("");
  const [observacao, setObservacao] = useState("");
  const [ajustes, setAjustes] = useState<Movimento[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
    fetch("/api/materiais").then((r) => r.json()).then(setMateriais);
    fetch("/api/estoque/movimentos").then((r) => r.json()).then(setAjustes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = { saldoReal: Number(saldoReal), observacao };
    if (tipoItem === "produto") body.produtoId = Number(itemId);
    else body.materialId = Number(itemId);

    const res = await fetch("/api/estoque/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Ajuste registrado: saldo atualizado para ${data.saldoApos}`);
      setSaldoReal("");
      setObservacao("");
      fetch("/api/estoque/movimentos").then((r) => r.json()).then(setAjustes);
    } else {
      setMsg(`Erro: ${data.error}`);
    }
  }

  const ajustesFiltrados = ajustes.filter((m) => m.tipo === "ajuste");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventário</h1>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.startsWith("Erro") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
          {msg}
        </div>
      )}

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
            <label className="block text-sm font-medium mb-1">Saldo Real *</label>
            <input type="number" step="0.01" min="0" value={saldoReal} onChange={(e) => setSaldoReal(e.target.value)} required
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observação</label>
            <input value={observacao} onChange={(e) => setObservacao(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
          Ajustar Estoque
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-3">Histórico de Ajustes</h2>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium text-right">Diferença</th>
                <th className="px-4 py-3 font-medium text-right">Saldo</th>
                <th className="px-4 py-3 font-medium">Obs</th>
              </tr>
            </thead>
            <tbody>
              {ajustesFiltrados.map((m) => (
                <tr key={m.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 text-zinc-500">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{m.produto?.nome || m.material?.nome || "-"}</td>
                  <td className={`px-4 py-3 text-right font-medium ${m.quantidade > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {m.quantidade > 0 ? `+${m.quantidade}` : m.quantidade}
                  </td>
                  <td className="px-4 py-3 text-right">{m.saldoApos}</td>
                  <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">{m.observacao || "-"}</td>
                </tr>
              ))}
              {ajustesFiltrados.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Nenhum ajuste registrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
