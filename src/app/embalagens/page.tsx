"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Embalagem {
  id: number;
  skuPack: string;
  tipo: string;
  material: string;
  valor: number;
}

export default function EmbalagensPage() {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);

  function carregar() {
    fetch("/api/embalagens").then((r) => r.json()).then(setEmbalagens);
  }

  useEffect(() => { carregar(); }, []);

  async function deletar(id: number) {
    if (!confirm("Confirmar exclusão?")) return;
    await fetch(`/api/embalagens/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Embalagens</h1>
        <Link
          href="/embalagens/novo"
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Nova Embalagem
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium text-right">Valor</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {embalagens.map((e) => (
              <tr key={e.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-500">{e.skuPack}</td>
                <td className="px-4 py-3">{e.tipo}</td>
                <td className="px-4 py-3 text-zinc-500">{e.material}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.valor)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    href={`/embalagens/${e.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deletar(e.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {embalagens.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Nenhuma embalagem cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
