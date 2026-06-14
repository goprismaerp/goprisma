"use client";

import Link from "next/link";

const subs = [
  { href: "/financeiro/fluxo-caixa", label: "Fluxo de Caixa", desc: "Contas a pagar/receber e saldo diário" },
  { href: "/financeiro/extrato", label: "Extrato", desc: "Movimentações por período" },
  { href: "/financeiro/recibos", label: "Recibos / NF", desc: "Emissão de recibos e notas fiscais" },
];

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo Financeiro</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Fluxo de caixa, contas e documentos fiscais</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {subs.map((s) => (
          <Link key={s.href} href={s.href}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <h3 className="font-semibold text-lg">{s.label}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
