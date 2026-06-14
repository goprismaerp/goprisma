"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface FormData {
  skuPack: string;
  tipo: string;
  comprimento: number;
  largura: number;
  altura: number;
  material: string;
  unidades: number;
  valor: number;
  vlUni: number;
  lacreTipo: string;
  lacreDescricao: string;
  lacreMaterial: string;
  lacreUnidades: number;
  vlLacre: number;
  uniLacre: number;
  consumoLacre: number;
  totalLacre: number;
  totalMat: number;
}

export default function EditarEmbalagem() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<FormData>({
    skuPack: "", tipo: "", comprimento: 0, largura: 0, altura: 0,
    material: "", unidades: 0, valor: 0, vlUni: 0,
    lacreTipo: "", lacreDescricao: "", lacreMaterial: "", lacreUnidades: 0,
    vlLacre: 0, uniLacre: 0, consumoLacre: 0, totalLacre: 0, totalMat: 0,
  });

  useEffect(() => {
    fetch(`/api/embalagens/${params.id}`)
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
    const res = await fetch(`/api/embalagens/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/embalagens");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Editar Embalagem</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU Pack *</label>
            <input name="skuPack" value={form.skuPack} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <input name="tipo" value={form.tipo} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Comprimento (mm)</label>
            <input name="comprimento" type="number" step="0.1" value={form.comprimento} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Largura (mm)</label>
            <input name="largura" type="number" step="0.1" value={form.largura} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Altura (mm)</label>
            <input name="altura" type="number" step="0.1" value={form.altura} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <input name="material" value={form.material} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
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
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <h3 className="text-sm font-semibold mb-3">Lacre</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Tipo</label>
              <input name="lacreTipo" value={form.lacreTipo} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Descrição</label>
              <input name="lacreDescricao" value={form.lacreDescricao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Material</label>
              <input name="lacreMaterial" value={form.lacreMaterial} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Unidades</label>
              <input name="lacreUnidades" type="number" value={form.lacreUnidades} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Valor Lacre</label>
              <input name="vlLacre" type="number" step="0.01" value={form.vlLacre} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Uni Lacre</label>
              <input name="uniLacre" type="number" value={form.uniLacre} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Consumo Lacre</label>
              <input name="consumoLacre" type="number" step="0.01" value={form.consumoLacre} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Total Lacre</label>
              <input name="totalLacre" type="number" step="0.01" value={form.totalLacre} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Material</label>
          <input name="totalMat" type="number" step="0.01" value={form.totalMat} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Salvar</button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
