"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EstoquePage() {
  const [stats, setStats] = useState({ produtos: 0, materiais: 0, movimentos: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/produtos").then((r) => r.json()),
      fetch("/api/materiais").then((r) => r.json()),
      fetch("/api/estoque/movimentos?limit=1").then((r) => r.json()),
    ]).then(([p, m, mv]) => {
      setStats({
        produtos: p.length,
        materiais: Array.isArray(m) ? m.length : 0,
        movimentos: Array.isArray(mv) ? mv.length : 0,
      });
    });
  }, []);

  const cards = [
    { href: "/estoque/movimentos", label: "Movimentos", desc: "Registrar entrada/saída", value: stats.movimentos, unit: "movimentos" },
    { href: "/estoque/saldo", label: "Saldo Atual", desc: "Consultar estoque", value: stats.produtos + stats.materiais, unit: "itens" },
    { href: "/estoque/inventario", label: "Inventário", desc: "Ajuste manual", value: "manual", unit: "" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Módulo Estoque</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Movimentação e saldo de produtos e materiais</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <p className="text-xs text-zinc-400 uppercase tracking-wider">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value} <span className="text-sm font-normal text-zinc-400">{c.unit}</span></p>
            <p className="text-sm text-zinc-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
