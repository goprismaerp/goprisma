"use client";

import Link from "next/link";

export default function SetupPage() {
  const sections = [
    { href: "/impressoras", label: "Impressoras", desc: "Gerenciar impressoras 3D e custo por hora" },
    { href: "/setup/config", label: "Config", desc: "Categorias, subcategorias, variáveis de SKU e cores" },
    { href: "/importar", label: "Importar", desc: "Importar dados de planilhas" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Setup</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}
            className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
            <h2 className="font-semibold mb-1">{s.label}</h2>
            <p className="text-xs text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}