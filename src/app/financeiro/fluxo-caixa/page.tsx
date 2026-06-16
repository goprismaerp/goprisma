"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Receita {
  id: number;
  cliente: string;
  dataPedido: string;
  valorTotal: number;
  sinal: number;
  saldoReceber: number;
  status: string;
}

interface Despesa {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

interface Extrato {
  receitas: number;
  sinal: number;
  saldoReceber: number;
  despesas: number;
  saldo: number;
}

export default function FluxoCaixaPage() {
  const [extrato, setExtrato] = useState<Extrato | null>(null);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [showNovaDespesa, setShowNovaDespesa] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: "", valor: "", data: "", categoria: "" });

  async function criarDespesa(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/financeiro/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: novaDespesa.descricao,
        valor: Number(novaDespesa.valor),
        data: novaDespesa.data || new Date().toISOString().slice(0, 10),
        categoria: novaDespesa.categoria,
      }),
    });
    if (res.ok) {
      setShowNovaDespesa(false);
      setNovaDespesa({ descricao: "", valor: "", data: "", categoria: "" });
      carregar();
    }
  }

  function carregar() {
    const params = new URLSearchParams();
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    const qs = params.toString();

    fetch(`/api/financeiro/extrato${qs ? `?${qs}` : ""}`).then((r) => r.json()).then(setExtrato);
    fetch(`/api/financeiro/receitas${qs ? `?${qs}` : ""}`).then((r) => r.json()).then(setReceitas);
    fetch(`/api/financeiro/lancamentos${qs ? `?${qs}` : ""}`).then((r) => r.json()).then(setDespesas);
  }

  useEffect(() => { carregar(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>

      <div className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1">De</label>
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)}
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Até</label>
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)}
            className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <button onClick={carregar}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium">
          Filtrar
        </button>
        <button onClick={() => setShowNovaDespesa(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          + Nova Despesa
        </button>
      </div>

      {showNovaDespesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNovaDespesa(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nova Despesa</h3>
            <form onSubmit={criarDespesa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição *</label>
                <input required value={novaDespesa.descricao} onChange={(e) => setNovaDespesa((p) => ({ ...p, descricao: e.target.value }))}
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor *</label>
                  <input required type="number" step="0.01" value={novaDespesa.valor} onChange={(e) => setNovaDespesa((p) => ({ ...p, valor: e.target.value }))}
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input type="date" value={novaDespesa.data} onChange={(e) => setNovaDespesa((p) => ({ ...p, data: e.target.value }))}
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <input value={novaDespesa.categoria} onChange={(e) => setNovaDespesa((p) => ({ ...p, categoria: e.target.value }))} placeholder="ex: material, fixo, frete"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Salvar Despesa
                </button>
                <button type="button" onClick={() => setShowNovaDespesa(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {extrato && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Receitas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(extrato.receitas)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Despesas</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(extrato.despesas)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Saldo</p>
            <p className={`text-xl font-bold ${extrato.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(extrato.saldo)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">A Receber</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(extrato.saldoReceber)}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-green-700 dark:text-green-400">
            Receitas ({receitas.length})
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {receitas.map((r) => (
                <tr key={r.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-2">{r.cliente}</td>
                  <td className="px-4 py-2 text-zinc-500">{formatDate(r.dataPedido)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.valorTotal)}</td>
                </tr>
              ))}
              {receitas.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-400">Nenhuma receita</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-red-700 dark:text-red-400">
            Despesas ({despesas.length})
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-2 font-medium">Descrição</th>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {despesas.map((d) => (
                <tr key={d.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-2">{d.descricao}</td>
                  <td className="px-4 py-2 text-zinc-500">{formatDate(d.data)}</td>
                  <td className="px-4 py-2 text-right font-medium text-red-600">{formatCurrency(Math.abs(d.valor))}</td>
                </tr>
              ))}
              {despesas.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-zinc-400">Nenhuma despesa</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
