"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface FormData {
  skuMat: string;
  nome: string;
  descricao: string;
  tipo: string;
  unidades: number;
  valor: number;
  vlUni: number;
}

export default function EditarMaterial() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<FormData>({
    skuMat: "", nome: "", descricao: "", tipo: "",
    unidades: 1, valor: 0, vlUni: 0,
  });

  useEffect(() => {
    fetch(`/api/materiais/${params.id}`)
      .then((r) => r.json())
      .then((data) => setForm(data));
  }, [params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value || "0") : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/materiais/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/materiais");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Editar Material</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input name="skuMat" value={form.skuMat} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <input name="descricao" value={form.descricao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <input name="tipo" value={form.tipo} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unidades</label>
            <input name="unidades" type="number" value={form.unidades} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor Uni (R$)</label>
            <input name="vlUni" type="number" step="0.001" value={form.vlUni} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Salvar</button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
