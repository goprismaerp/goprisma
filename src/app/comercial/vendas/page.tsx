"use client";

import { useState, useEffect } from "react";

interface Produto {
  id: number;
  sku: string;
  nome: string;
  precoSugerido: number;
}

interface ItemCarrinho {
  produto: Produto;
  qtd: number;
}

export default function VendasPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
  }, []);

  const filtrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.sku.toLowerCase().includes(busca.toLowerCase())
  );

  function addAoCarrinho(produto: Produto) {
    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produto.id === produto.id);
      if (existente) {
        return prev.map((i) =>
          i.produto.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i
        );
      }
      return [...prev, { produto, qtd: 1 }];
    });
  }

  function remover(id: number) {
    setCarrinho((prev) => prev.filter((i) => i.produto.id !== id));
  }

  const total = carrinho.reduce((sum, i) => sum + i.produto.precoSugerido * i.qtd, 0);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Produtos</h2>
        <input
          value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
        />
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {filtrados.map((p) => (
            <button
              key={p.id}
              onClick={() => addAoCarrinho(p)}
              className="w-full text-left p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 transition-colors"
            >
              <span className="text-xs text-zinc-400">{p.sku}</span>
              <p className="font-medium">{p.nome}</p>
              <p className="text-sm text-zinc-500">R$ {p.precoSugerido.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Carrinho</h2>
        {carrinho.length === 0 ? (
          <p className="text-zinc-400 text-sm">Carrinho vazio. Selecione produtos ao lado.</p>
        ) : (
          <>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {carrinho.map((i) => (
                <div key={i.produto.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <div>
                    <p className="text-sm font-medium">{i.produto.nome}</p>
                    <p className="text-xs text-zinc-400">{i.produto.sku} x{i.qtd}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">R$ {(i.produto.precoSugerido * i.qtd).toFixed(2)}</span>
                    <button onClick={() => remover(i.produto.id)} className="text-red-500 text-sm hover:underline">Remover</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <button className="w-full mt-3 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                Finalizar Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
