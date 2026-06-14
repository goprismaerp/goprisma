"use client";

import { useEffect, useState } from "react";

interface Impressora {
  id: number;
  nome: string;
  modelo: string;
  custoHora: number;
  ativa: boolean;
}

interface FormData {
  nome: string;
  modelo: string;
  custoHora: string;
  ativa: boolean;
}

const emptyForm: FormData = { nome: "", modelo: "", custoHora: "", ativa: true };

export default function CadastroImpressoraPage() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  function carregar() {
    fetch("/api/impressoras").then((r) => r.json()).then(setImpressoras);
  }

  useEffect(() => { carregar(); }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function editar(i: Impressora) {
    setForm({ nome: i.nome, modelo: i.modelo, custoHora: String(i.custoHora), ativa: i.ativa });
    setEditId(i.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editId ? `/api/impressoras/${editId}` : "/api/impressoras";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      resetForm();
      carregar();
    }
  }

  async function deletar(id: number) {
    if (!confirm("Confirmar exclusão?")) return;
    await fetch(`/api/impressoras/${id}`, { method: "DELETE" });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Impressoras</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            + Nova Impressora
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <h3 className="font-medium">{editId ? "Editar" : "Nova"} Impressora</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800"
                placeholder="Ex: BA1_01" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <input name="modelo" value={form.modelo} onChange={handleChange} required
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800"
                placeholder="Ex: Bambu Lab A1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Custo Hora (R$)</label>
              <input name="custoHora" type="number" step="0.01" value={form.custoHora} onChange={handleChange}
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input name="ativa" type="checkbox" checked={form.ativa} onChange={handleChange}
                className="w-4 h-4 rounded border-zinc-300" />
              <label className="text-sm font-medium">Ativa</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              {editId ? "Atualizar" : "Salvar"}
            </button>
            <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Modelo</th>
              <th className="px-4 py-3 font-medium text-right">Custo Hora</th>
              <th className="px-4 py-3 font-medium text-center">Ativa</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {impressoras.map((i) => (
              <tr key={i.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{i.nome}</td>
                <td className="px-4 py-3 text-zinc-500">{i.modelo}</td>
                <td className="px-4 py-3 text-right">R$ {i.custoHora.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${i.ativa ? "bg-emerald-500" : "bg-zinc-300"}`} />
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => editar(i)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Editar</button>
                  <button onClick={() => deletar(i.id)} className="text-red-600 dark:text-red-400 hover:underline text-sm">Excluir</button>
                </td>
              </tr>
            ))}
            {impressoras.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Nenhuma impressora cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
