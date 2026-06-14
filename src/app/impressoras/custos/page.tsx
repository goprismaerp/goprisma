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
  nome: string;
  sku: string;
  tempoProducao: number;
  idImpressora: string;
}

export default function CustosImpressoraPage() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    fetch("/api/impressoras").then((r) => r.json()).then(setImpressoras);
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
  }, []);

  const custos = impressoras.map((imp) => {
    const prodsVinculados = produtos.filter(
      (p) => p.idImpressora && p.idImpressora.toLowerCase() === imp.nome.toLowerCase()
    );
    const horasProdutos = prodsVinculados.reduce((acc, p) => acc + (p.tempoProducao || 0), 0);
    const custoOperacional = horasProdutos * imp.custoHora;

    return {
      ...imp,
      produtosVinculados: prodsVinculados.length,
      horasProdutos,
      custoOperacional,
      eficiencia: imp.custoHora > 0 && horasProdutos > 0
        ? ((custoOperacional / (horasProdutos * imp.custoHora)) * 100).toFixed(1)
        : "—",
    };
  });

  const totalHoras = custos.reduce((a, c) => a + c.horasProdutos, 0);
  const totalCusto = custos.reduce((a, c) => a + c.custoOperacional, 0);

  const prodsSemImpressora = produtos.filter((p) => !p.idImpressora || p.idImpressora === "");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Custos por Máquina</h2>
        <p className="text-sm text-zinc-500 mt-1">Cálculo de hora/máquina e eficiência</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">Máquinas Ativas</p>
          <p className="text-2xl font-bold mt-1">{impressoras.filter((i) => i.ativa).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">Horas em Produção</p>
          <p className="text-2xl font-bold mt-1">{totalHoras.toFixed(1)}h</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wide">Custo Operacional Total</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalCusto)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Máquina</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium text-right">Custo Hora</th>
              <th className="px-4 py-3 font-medium text-right">Produtos</th>
              <th className="px-4 py-3 font-medium text-right">Horas</th>
              <th className="px-4 py-3 font-medium text-right">Custo Operac.</th>
              <th className="px-4 py-3 font-medium text-right">Eficiência</th>
            </tr>
          </thead>
          <tbody>
            {custos.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{c.nome}</td>
                <td className="px-4 py-3 text-zinc-500">{c.modelo}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(c.custoHora)}</td>
                <td className="px-4 py-3 text-right">{c.produtosVinculados}</td>
                <td className="px-4 py-3 text-right">{c.horasProdutos.toFixed(1)}h</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.custoOperacional)}</td>
                <td className="px-4 py-3 text-right">{c.eficiencia}%</td>
              </tr>
            ))}
            {custos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  Nenhuma impressora cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {prodsSemImpressora.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {prodsSemImpressora.length} produto(s) sem impressora vinculada
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Edite os produtos para preencher o campo "ID Impressora" com o nome da máquina.
          </p>
        </div>
      )}
    </div>
  );
}
