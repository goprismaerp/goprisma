"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Produto {
  id: number;
  sku: string;
  nome: string;
  precoSugerido: number;
}

interface Pedido {
  id: number;
  cliente: string;
  status: string;
  valorTotal: number;
  dataPedido: string;
}

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [materiaisCount, setMateriaisCount] = useState(0);

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
    fetch("/api/pedidos").then((r) => r.json()).then(setPedidos);
    fetch("/api/materiais").then((r) => r.json()).then((data) => setMateriaisCount(data.length));
  }, []);

  const cards = [
    { label: "Total de Produtos", value: produtos.length },
    { label: "Total de Pedidos", value: pedidos.length },
    { label: "Total de Materiais", value: materiaisCount },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos Produtos</h2>
            <Link href="/produtos" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ver todos
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Nome</th>
                <th className="pb-2 font-medium text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {produtos.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 text-zinc-500">{p.sku}</td>
                  <td className="py-2">{p.nome}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(p.precoSugerido)}</td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-zinc-400">
                    Nenhum produto cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Últimos Pedidos</h2>
            <Link href="/pedidos" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ver todos
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2">{p.cliente}</td>
                  <td className="py-2">
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
                  <td className="py-2 text-right font-medium">{formatCurrency(p.valorTotal)}</td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-zinc-400">
                    Nenhum pedido cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
