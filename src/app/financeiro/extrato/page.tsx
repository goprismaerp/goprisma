"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Item {
  id: string;
  data: string;
  descricao: string;
  tipo: "receita" | "despesa";
  valor: number;
  cliente?: string;
  status?: string;
  categoria?: string;
}

export default function ExtratoPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  function carregar() {
    const params = new URLSearchParams();
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    const qs = params.toString();

    Promise.all([
      fetch(`/api/financeiro/receitas${qs ? `?${qs}` : ""}`).then((r) => r.json()),
      fetch(`/api/financeiro/lancamentos${qs ? `?${qs}` : ""}`).then((r) => r.json()),
    ]).then(([receitas, despesas]) => {
      const r: Item[] = receitas.map((p: { id: number; cliente: string; dataPedido: string; valorTotal: number; status: string }) => ({
        id: `rec-${p.id}`,
        data: p.dataPedido,
        descricao: `Venda - ${p.cliente}`,
        tipo: "receita" as const,
        valor: p.valorTotal,
        cliente: p.cliente,
        status: p.status,
      }));
      const d: Item[] = despesas.map((l: { id: number; descricao: string; data: string; valor: number; categoria: string }) => ({
        id: `desp-${l.id}`,
        data: l.data,
        descricao: l.descricao,
        tipo: "despesa" as const,
        valor: Math.abs(l.valor),
        categoria: l.categoria,
      }));
      setItens([...r, ...d].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
    });
  }

  useEffect(() => { carregar(); }, []);

  const total = itens.reduce((acc, i) => acc + (i.tipo === "receita" ? i.valor : -i.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Extrato</h1>
        <p className={`text-lg font-bold ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(total)}
        </p>
      </div>

      <div className="flex gap-4 items-end">
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
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{formatDate(item.data)}</td>
                <td className="px-4 py-3 font-medium">{item.descricao}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.tipo === "receita"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {item.tipo === "receita" ? "Receita" : "Despesa"}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  item.tipo === "receita" ? "text-green-600" : "text-red-600"
                }`}>
                  {item.tipo === "receita" ? "+" : "-"}{formatCurrency(item.valor)}
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                  Nenhuma movimentação encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
