"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

export default function UsuariosTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [editando, setEditando] = useState<Partial<User & { password: string }> | null>(null);
  const [novo, setNovo] = useState({ username: "", password: "", nome: "", role: "visitante" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenhaEdit, setMostrarSenhaEdit] = useState(false);

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
    <div>
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 mb-6">
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
              <th className="px-4 py-3 font-medium">Senha</th>
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
                      <div className="flex gap-1 items-center">
                        <input type={mostrarSenhaEdit ? "text" : "password"} value={editando.password || ""} onChange={(e) => setEditando((p) => p ? { ...p, password: e.target.value } : null)}
                          className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-sm bg-white dark:bg-zinc-800" placeholder="Nova senha" />
                        <button type="button" onClick={() => setMostrarSenhaEdit((p) => !p)}
                          className="text-xs text-zinc-400 hover:text-zinc-600 whitespace-nowrap">
                          {mostrarSenhaEdit ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
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
                    <td className="px-4 py-3 text-xs text-zinc-400">••••••••</td>
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
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-400 text-xs">Nenhum usuário</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
