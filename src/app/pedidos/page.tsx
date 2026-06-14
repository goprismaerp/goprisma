"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Pedido {
  id: number;
  cliente: string;
  status: string;
  valorTotal: number;
  sinal: number;
  saldoReceber: number;
  dataPedido: string;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  function carregar() {
    fetch("/api/pedidos").then((r) => r.json()).then(setPedidos);
  }

  useEffect(() => { carregar(); }, []);

  async function deletar(id: number) {
    if (!confirm("Confirmar exclusão?")) return;
    await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Link
          href="/pedidos/novo"
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Novo Pedido
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Sinal</th>
              <th className="px-4 py-3 font-medium text-right">Saldo</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{p.cliente}</td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(p.dataPedido)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "concluído"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : p.status === "cancelado"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.valorTotal)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.sinal)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.saldoReceber)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => deletar(p.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  Nenhum pedido encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
