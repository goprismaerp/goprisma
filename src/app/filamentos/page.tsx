"use client";
import { useEffect, useState } from "react";

interface Filamento {
  id: number;
  idFilamento: string;
  material: string;
  marca: string;
  cor: string;
  pesoInicial: number;
  pesoAtual: number;
  precoRolo: number;
  custoPorG: number;
  fornecedor: string;
  status: string;
}

export default function FilamentosPage() {
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);

  function carregar() {
    fetch("/api/filamentos").then((r) => r.json()).then(setFilamentos);
  }

  useEffect(() => { carregar(); }, []);

  const totalFilamentos = filamentos.length;
  const totalInvestido = filamentos.reduce((s, f) => s + (f.precoRolo || 0), 0);
  const ativos = filamentos.filter((f) => f.status !== "ESGOTADO").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Filamentos</p>
          <p className="text-2xl font-bold">{totalFilamentos}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Total Investido</p>
          <p className="text-2xl font-bold">R$ {totalInvestido.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Ativos</p>
          <p className="text-2xl font-bold">{ativos}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Cor</th>
              <th className="px-4 py-3 font-medium">Peso</th>
              <th className="px-4 py-3 font-medium">Preço Rolo</th>
              <th className="px-4 py-3 font-medium">Custo/g</th>
              <th className="px-4 py-3 font-medium">Fornecedor</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filamentos.map((f) => (
              <tr key={f.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{f.idFilamento}</td>
                <td className="px-4 py-3">{f.material}</td>
                <td className="px-4 py-3">{f.marca}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block border border-zinc-300" style={{ backgroundColor: f.cor.toLowerCase() }} />
                    {f.cor}
                  </span>
                </td>
                <td className="px-4 py-3">{f.pesoInicial}g</td>
                <td className="px-4 py-3">R$ {f.precoRolo.toFixed(2)}</td>
                <td className="px-4 py-3">R$ {f.custoPorG.toFixed(4)}</td>
                <td className="px-4 py-3">{f.fornecedor}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    f.status === "ESGOTADO"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : f.status === "ATIVO"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
            {filamentos.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-400 text-xs">Nenhum filamento importado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
