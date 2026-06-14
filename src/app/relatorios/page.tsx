"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  totalProdutos: number;
  totalPedidos: number;
  totalMateriais: number;
  receitaTotal: number;
  custoTotal: number;
  margemMedia: number;
  pedidosPorStatus: { status: string; count: number }[];
  produtosMaisCaros: { sku: string; nome: string; custoTotal: number; precoSugerido: number }[];
}

export default function RelatoriosPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/relatorios");
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Erro ao carregar relatórios");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500">Carregando relatórios...</div>;
  if (!data) return <div className="p-8 text-red-500">Erro ao carregar dados.</div>;

  const formatCurrency = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Relatórios Financeiros</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Receita Total</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(data.receitaTotal)}</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Custo Total (Produtos)</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(data.custoTotal)}</p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Margem Média</p>
          <p className="text-2xl font-bold mt-1">{data.margemMedia.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Pedidos por Status</h2>
          {data.pedidosPorStatus.length === 0 ? (
            <p className="text-zinc-400 text-sm">Nenhum pedido encontrado.</p>
          ) : (
            <div className="space-y-3">
              {data.pedidosPorStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{item.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-800 dark:bg-zinc-200 rounded-full"
                        style={{ width: `${(item.count / Math.max(...data.pedidosPorStatus.map((p) => p.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Produtos com Maior Custo</h2>
          {data.produtosMaisCaros.length === 0 ? (
            <p className="text-zinc-400 text-sm">Nenhum produto cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {data.produtosMaisCaros.slice(0, 10).map((p) => (
                <div key={p.sku} className="flex items-center justify-between text-sm">
                  <div className="truncate flex-1">
                    <span className="font-medium">{p.sku}</span>
                    <span className="text-zinc-400 ml-2">{p.nome}</span>
                  </div>
                  <div className="text-right ml-4">
                    <span className="font-medium">{formatCurrency(p.custoTotal)}</span>
                    {p.precoSugerido > 0 && (
                      <span className="text-zinc-400 ml-2">
                        ({((p.precoSugerido - p.custoTotal) / p.custoTotal * 100).toFixed(0)}% margem)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Resumo Geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-zinc-500">Produtos</p>
            <p className="text-xl font-bold">{data.totalProdutos}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Pedidos</p>
            <p className="text-xl font-bold">{data.totalPedidos}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Materiais</p>
            <p className="text-xl font-bold">{data.totalMateriais}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Ticket Médio</p>
            <p className="text-xl font-bold">
              {data.totalPedidos > 0 ? formatCurrency(data.receitaTotal / data.totalPedidos) : "R$ 0,00"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
