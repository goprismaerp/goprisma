"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  custoHora: number;
  ativa: boolean;
}

interface Produto {
  id: number;
  sku: string;
  nome: string;
  tempoProducao: number;
  precoSugerido: number;
}

interface ProducaoItem {
  impressora: Impressora;
  tempoTotal: number;
  produtos: { produto: Produto; qtd: number }[];
}

export default function ProducaoPage() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fila, setFila] = useState<Record<number, { produtoId: number; qtd: number }[]>>({});

  useEffect(() => {
    fetch("/api/impressoras").then((r) => r.json()).then(setImpressoras);
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
  }, []);

  const itensProducao: ProducaoItem[] = impressoras.filter((i) => i.ativa).map((imp) => {
    const itens = fila[imp.id] || [];
    const produtosNaFila = itens
      .map((f) => {
        const p = produtos.find((pr) => pr.id === f.produtoId);
        return p ? { produto: p, qtd: f.qtd } : null;
      })
      .filter(Boolean) as { produto: Produto; qtd: number }[];
    const tempoTotal = produtosNaFila.reduce((acc, { produto, qtd }) => acc + produto.tempoProducao * qtd, 0);
    return { impressora: imp, tempoTotal, produtos: produtosNaFila };
  });

  function addProduto(impressoraId: number, produtoId: number) {
    if (!produtoId) return;
    setFila((prev) => {
      const atual = prev[impressoraId] || [];
      const existente = atual.find((f) => f.produtoId === produtoId);
      if (existente) {
        return { ...prev, [impressoraId]: atual.map((f) => f.produtoId === produtoId ? { ...f, qtd: f.qtd + 1 } : f) };
      }
      return { ...prev, [impressoraId]: [...atual, { produtoId, qtd: 1 }] };
    });
  }

  function removerProduto(impressoraId: number, produtoId: number) {
    setFila((prev) => {
      const atual = (prev[impressoraId] || []).filter((f) => f.produtoId !== produtoId);
      return atual.length ? { ...prev, [impressoraId]: atual } : (() => { const { [impressoraId]: _, ...rest } = prev; return rest; })();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Agenda de Produção</h2>
        <p className="text-sm text-zinc-500 mt-1">Fila de produtos por impressora</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {itensProducao.length === 0 && (
          <p className="text-zinc-400 text-sm col-span-2">Nenhuma impressora ativa encontrada.</p>
        )}

        {itensProducao.map(({ impressora, tempoTotal, produtos: prods }) => (
          <div key={impressora.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{impressora.nome}</h3>
                  <p className="text-xs text-zinc-500">{impressora.modelo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Tempo total</p>
                  <p className="font-bold text-lg">{tempoTotal.toFixed(1)}h</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <select
                  onChange={(e) => addProduto(impressora.id, Number(e.target.value))}
                  value=""
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800"
                >
                  <option value="">Adicionar produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>{p.sku} — {p.nome}</option>
                  ))}
                </select>
              </div>

              {prods.length === 0 ? (
                <p className="text-sm text-zinc-400 italic">Fila vazia</p>
              ) : (
                <div className="space-y-1">
                  {prods.map(({ produto, qtd }) => (
                    <div key={produto.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{produto.nome}</p>
                        <p className="text-xs text-zinc-400">{produto.sku} — {produto.tempoProducao}h x {qtd}</p>
                      </div>
                      <button onClick={() => removerProduto(impressora.id, produto.id)} className="ml-2 text-red-500 text-xs hover:underline">Remover</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
                <span className="text-zinc-500">Custo estimado:</span>
                <span className="font-semibold">{formatCurrency(tempoTotal * impressora.custoHora)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
