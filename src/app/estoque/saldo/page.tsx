"use client";

import { useEffect, useState } from "react";

interface ItemSaldo {
  tipo: "produto" | "material";
  id: number;
  nome: string;
  sku: string;
  saldo: number;
}

export default function SaldoPage() {
  const [saldos, setSaldos] = useState<ItemSaldo[]>([]);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    fetch("/api/estoque/saldo").then((r) => r.json()).then((data) => setSaldos(data.saldos));
  }, []);

  const filtered = filter === "todos" ? saldos : saldos.filter((s) => s.tipo === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saldo Atual</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-zinc-800">
          <option value="todos">Todos</option>
          <option value="produto">Produtos</option>
          <option value="material">Materiais</option>
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={`${item.tipo}-${item.id}`} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    item.tipo === "produto" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {item.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{item.sku}</td>
                <td className="px-4 py-3 font-medium">{item.nome}</td>
                <td className={`px-4 py-3 text-right font-semibold ${item.saldo > 0 ? "text-emerald-600" : "text-zinc-500"}`}>
                  {item.saldo}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-400">Nenhum item em estoque</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
