"use client";

import { useEffect, useState, useCallback } from "react";
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

const PERIODOS = [
  { label: "7 dias", dias: 7 },
  { label: "15 dias", dias: 15 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
] as const;

function InfoTip({ desc }: { desc: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setAberto((p) => !p)}
        onMouseEnter={() => setAberto(true)}
        onMouseLeave={() => setAberto(false)}
        className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-600 text-[10px] font-bold text-white flex items-center justify-center hover:bg-zinc-400 dark:hover:bg-zinc-500 transition-colors"
      >
        i
      </button>
      {aberto && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-black text-white text-xs shadow-lg z-10 pointer-events-none">
          {desc}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-black" />
        </div>
      )}
    </span>
  );
}

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [saldoReceber, setSaldoReceber] = useState(0);
  const [periodo, setPeriodo] = useState(15);
  const [vendasPeriodo, setVendasPeriodo] = useState(0);
  const [qtdPedidosPeriodo, setQtdPedidosPeriodo] = useState(0);

  const fetchVendas = useCallback(async (dias: number) => {
    const de = new Date(Date.now() - dias * 86400000).toISOString().split("T")[0];
    const _ = Date.now();
    const res = await fetch(`/api/financeiro/extrato?de=${de}&_=${_}`);
    const data = await res.json();
    setVendasPeriodo(data.receitas);
    setQtdPedidosPeriodo(data.quantidade);
  }, []);

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
    fetch("/api/pedidos").then((r) => r.json()).then(setPedidos);
    fetch("/api/financeiro/extrato").then((r) => r.json()).then((data) => setSaldoReceber(data.saldoReceber));
  }, []);

  useEffect(() => {
    fetchVendas(periodo);
  }, [periodo, fetchVendas]);

  const ticketMedio = qtdPedidosPeriodo > 0 ? vendasPeriodo / qtdPedidosPeriodo : 0;

  const cards = [
    { label: "Total de Produtos", value: produtos.length, formato: "numero", desc: "Quantidade de produtos cadastrados no catálogo" },
    { label: "Total de Pedidos", value: pedidos.length, formato: "numero", desc: "Quantidade total de pedidos registrados" },
    { label: "Saldo a Receber", value: saldoReceber, formato: "moeda", cor: "text-amber-500", desc: "Valor total de pedidos pendentes, em produção ou entregues aguardando pagamento" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <InfoTip desc={card.desc} />
            </div>
            <p className={`text-3xl font-bold mt-1 ${card.cor ?? ""}`}>
              {card.formato === "moeda" ? formatCurrency(card.value as number) : card.value}
            </p>
          </div>
        ))}

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Faturamento</p>
            <InfoTip desc="Valor total de todos os pedidos no período selecionado" />
          </div>
          <div className="relative mb-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value))}
              className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-[11px] rounded-md px-2 py-1 pr-6 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
            >
              {PERIODOS.map((p) => (
                <option key={p.dias} value={p.dias}>{p.label}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none">▼</span>
          </div>
          <p className="text-3xl font-bold mt-1 text-emerald-500">{formatCurrency(vendasPeriodo)}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ticket Médio</p>
            <InfoTip desc="Valor médio por pedido no período (faturamento ÷ quantidade de pedidos)" />
          </div>
          <p className="text-3xl font-bold mt-1 text-violet-500">{formatCurrency(ticketMedio)}</p>
        </div>
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
