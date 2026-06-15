"use client";

import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  nome: string;
  abreviatura: string;
}

interface Filamento {
  id: number;
  cor: string;
  material: string;
  marca: string;
}

type Tab = "categorias" | "subcategorias" | "cores" | "usuarios";

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>("categorias");

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 mb-6">
        {([
          { key: "categorias", label: "Categorias" },
          { key: "subcategorias", label: "Subcategorias" },
          { key: "cores", label: "Cores" },
          { key: "usuarios", label: "Usuários" },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-zinc-800 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categorias" && <CategoriasTab />}
      {tab === "subcategorias" && <SubcategoriasTab />}
      {tab === "cores" && <CoresTab />}
      {tab === "usuarios" && <UsuariosTab />}
    </div>
  );
}

function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [novo, setNovo] = useState({ nome: "", abreviatura: "" });

  function carregar() {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }

  useEffect(() => { carregar(); }, []);

  async function criar() {
    if (!novo.nome) return;
    await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    setNovo({ nome: "", abreviatura: "" });
    carregar();
  }

  async function atualizar() {
    if (!editando) return;
    await fetch("/api/categorias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando),
    });
    setEditando(null);
    carregar();
  }

  async function deletar(id: number) {
    if (!confirm("Excluir categoria?")) return;
    await fetch("/api/categorias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
        <h2 className="font-semibold mb-3">Nova Categoria</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Nome</label>
            <input value={novo.nome} onChange={(e) => setNovo((p) => ({ ...p, nome: e.target.value }))}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div className="w-24">
            <label className="block text-xs text-zinc-500 mb-1">Abreviatura</label>
            <input value={novo.abreviatura} onChange={(e) => setNovo((p) => ({ ...p, abreviatura: e.target.value.toUpperCase() }))} maxLength={6}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 font-mono uppercase" />
          </div>
          <button onClick={criar}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Abreviatura</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800">
                {editando?.id === c.id ? (
                  <>
                    <td className="px-4 py-2 text-zinc-400 text-xs">{c.id}</td>
                    <td className="px-4 py-2">
                      <input value={editando.nome} onChange={(e) => setEditando((p) => p ? { ...p, nome: e.target.value } : null)}
                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={editando.abreviatura} onChange={(e) => setEditando((p) => p ? { ...p, abreviatura: e.target.value.toUpperCase() } : null)} maxLength={6}
                        className="w-24 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800 font-mono uppercase" />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button onClick={atualizar} className="text-xs text-blue-600 hover:underline">Salvar</button>
                      <button onClick={() => setEditando(null)} className="text-xs text-zinc-400 hover:underline">Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{c.id}</td>
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{c.abreviatura}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setEditando({ ...c })} className="text-xs text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => deletar(c.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubcategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }, []);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500">
      As subcategorias são definidas livremente no cadastro de produtos (campo "SubCategoria").
      <br /><br />
      Abaixo as categorias existentes e exemplos de subcategorias usadas nos SKUs atuais:
      <ul className="mt-3 space-y-1 list-disc list-inside">
        {categorias.map((c) => (
          <li key={c.id}>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.nome}</span>
            {" "}(<span className="font-mono">{c.abreviatura || "—"}</span>)
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoresTab() {
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);

  useEffect(() => {
    fetch("/api/filamentos").then((r) => r.json()).then(setFilamentos);
  }, []);

  const cores = filamentos
    .filter((f) => f.cor)
    .reduce((acc, f) => {
      if (!acc.find((c) => c.cor === f.cor)) {
        acc.push({ cor: f.cor, materiais: [f.material].filter(Boolean).join(", "), marcas: [f.marca].filter(Boolean).join(", ") });
      }
      return acc;
    }, [] as { cor: string; materiais: string; marcas: string }[])
    .sort((a, b) => a.cor.localeCompare(b.cor));

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
        <h2 className="font-semibold mb-3">Cores de Filamento</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {cores.map((c) => (
            <div key={c.cor} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="w-8 h-8 rounded-full border border-zinc-300" style={{ backgroundColor: c.cor.toLowerCase() }} />
              <div>
                <p className="text-sm font-medium">{c.cor}</p>
                <p className="text-xs text-zinc-400">{c.materiais || c.marcas || "—"}</p>
              </div>
            </div>
          ))}
        </div>
        {cores.length === 0 && <p className="text-sm text-zinc-400 py-8 text-center">Nenhum filamento cadastrado</p>}
      </div>
    </div>
  );
}

interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

function UsuariosTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [editando, setEditando] = useState<Partial<User & { password: string }> | null>(null);
  const [novo, setNovo] = useState({ username: "", password: "", nome: "", role: "visitante" });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function carregar() {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }

  useEffect(() => { carregar(); }, []);

  async function criar() {
    if (!novo.username || !novo.password) return;
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    setNovo({ username: "", password: "", nome: "", role: "visitante" });
    carregar();
  }

  async function atualizar() {
    if (!editando?.id) return;
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    setEditando(null);
    carregar();
  }

  async function deletar(id: number) {
    if (!confirm("Excluir usuário?")) return;
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
        <h2 className="font-semibold mb-3">Novo Usuário</h2>
        <div className="grid grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Usuário</label>
            <input value={novo.username} onChange={(e) => setNovo((p) => ({ ...p, username: e.target.value }))}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Senha</label>
            <div className="relative">
              <input type={mostrarSenha ? "text" : "password"} value={novo.password} onChange={(e) => setNovo((p) => ({ ...p, password: e.target.value }))}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 pr-16 text-sm bg-white dark:bg-zinc-800" />
              <button type="button" onClick={() => setMostrarSenha((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600">
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Nome</label>
            <input value={novo.nome} onChange={(e) => setNovo((p) => ({ ...p, nome: e.target.value }))}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Tipo</label>
            <select value={novo.role} onChange={(e) => setNovo((p) => ({ ...p, role: e.target.value }))}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="visitante">Visitante</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={criar}
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors">
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800">
                {editando?.id === u.id ? (
                  <>
                    <td className="px-4 py-2 text-zinc-400 text-xs">{u.id}</td>
                    <td className="px-4 py-2">
                      <input value={editando.username || ""} onChange={(e) => setEditando((p) => p ? { ...p, username: e.target.value } : null)}
                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={editando.nome || ""} onChange={(e) => setEditando((p) => p ? { ...p, nome: e.target.value } : null)}
                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800" />
                    </td>
                    <td className="px-4 py-2">
                      <select value={editando.role || "visitante"} onChange={(e) => setEditando((p) => p ? { ...p, role: e.target.value } : null)}
                        className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800">
                        <option value="visitante">Visitante</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button onClick={atualizar} className="text-xs text-blue-600 hover:underline">Salvar</button>
                      <button onClick={() => setEditando(null)} className="text-xs text-zinc-400 hover:underline">Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{u.id}</td>
                    <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                    <td className="px-4 py-3">{u.nome}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {u.role === "admin" ? "Admin" : "Visitante"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setEditando({ ...u, password: "" })} className="text-xs text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => deletar(u.id)} className="text-xs text-red-500 hover:underline">Excluir</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400 text-xs">Nenhum usuário</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}