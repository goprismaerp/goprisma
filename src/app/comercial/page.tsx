"use client";

import Link from "next/link";

const subs = [
  { href: "/comercial/vendas", label: "Vendas / PDV", desc: "Carrinho de compras e finalização de pedidos" },
  { href: "/comercial/clientes", label: "Clientes", desc: "Cadastro e histórico de clientes" },
  { href: "/comercial/orcamentos", label: "Orçamentos", desc: "Criação e envio de orçamentos" },
];

export default function ComercialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo Comercial</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">PDV, vendas, clientes e orçamentos</p>
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
