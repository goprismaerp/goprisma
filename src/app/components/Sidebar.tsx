"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

interface LinkItem {
  href: string;
  label: string;
}

interface Section {
  title: string;
  links: LinkItem[];
}

const sections: Section[] = [
  {
    title: "Geral",
    links: [
      { href: "/", label: "Dashboard" },
      { href: "/produtos", label: "Catálogo" },
      { href: "/relatorios", label: "Relatórios" },
      { href: "/precificacao", label: "Precificação" },
    ],
  },
  {
    title: "Cadastros",
    links: [
      { href: "/cadastro", label: "Cadastro Produtos" },
      { href: "/materiais", label: "Materiais" },
      { href: "/embalagens", label: "Embalagens" },
    ],
  },
  {
    title: "Comercial",
    links: [
      { href: "/pedidos", label: "Pedidos" },
      { href: "/comercial", label: "Vendas / PDV" },
    ],
  },
  {
    title: "Financeiro",
    links: [
      { href: "/financeiro", label: "Fluxo de Caixa" },
    ],
  },
  {
    title: "Estoque",
    links: [
      { href: "/estoque", label: "Visão Geral" },
      { href: "/estoque/movimentos", label: "Movimentos" },
      { href: "/estoque/saldo", label: "Saldo Atual" },
      { href: "/estoque/inventario", label: "Inventário" },
      { href: "/filamentos", label: "Filamentos" },
    ],
  },
  {
    title: "Setup",
    links: [
      { href: "/users", label: "Users" },
      { href: "/setup/config", label: "Config" },
      { href: "/impressoras", label: "Impressoras" },
      { href: "/importar", label: "Importar" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);

  if (!user || pathname === "/login") return null;

  return (
    <>
      {/* Hamburger - mobile */}
      <button onClick={() => setAberto((p) => !p)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-black text-white border border-zinc-700">
        <span className="text-lg">{aberto ? "✕" : "☰"}</span>
      </button>

      {/* Overlay */}
      {aberto && (
        <div onClick={() => setAberto(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 min-h-screen bg-zinc-900 dark:bg-black text-zinc-100 flex flex-col border-r border-zinc-700 dark:border-zinc-800 overflow-y-auto transition-transform duration-200 ${
        aberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
      <div className="p-6 border-b border-zinc-700 dark:border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight">GoPrisma</h1>
        <p className="text-xs text-zinc-400 mt-1">Sistema ERP</p>
      </div>
      <nav className="flex-1 p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-700 dark:bg-zinc-800 text-white"
                        : "text-zinc-300 hover:bg-zinc-800 dark:hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <SidebarFooter />
    </aside>
    </>
  );
}

function SidebarFooter() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="p-4 border-t border-zinc-700 dark:border-zinc-800">
      <p className="text-xs text-zinc-400 truncate">{user.nome}</p>
      <p className="text-[10px] text-zinc-600 mb-2">{user.role === "admin" ? "Administrador" : "Visitante"}</p>
      <button onClick={logout}
        className="w-full px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors">
        Sair
      </button>
    </div>
  );
}
