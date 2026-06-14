"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Categoria {
  id: number;
  nome: string;
}

export default function NovoProduto() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [form, setForm] = useState({
    sku: "",
    nome: "",
    categoriaId: "",
    descricao: "",
    materiais: "",
    qtdMateriais: 0,
    custoMaterial: 0,
    protecao: "",
    qtdProtecao: 0,
    custoProtecao: 0,
    embalagem: "",
    custoEmbalagem: 0,
    acabamento: "padrao",
    tempoProducao: 0,
    precoSugerido: 0,
  });

  const [precosCalculados, setPrecosCalculados] = useState<{ precoSugerido: number; precoMkplaces: number } | null>(null);

  const custoAcabamento = form.acabamento === "holográfico" ? 0.5 : 0;
  const custoTotal =
    Number(form.custoMaterial) +
    Number(form.custoProtecao) +
    Number(form.custoEmbalagem) +
    custoAcabamento;

  async function calcularPrecos() {
    if (!form.categoriaId) return;
    const res = await fetch("/api/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoriaId: Number(form.categoriaId), custoTotal }),
    });
    const data = await res.json();
    if (data.success) {
      setPrecosCalculados({ precoSugerido: data.precoSugerido, precoMkplaces: data.precoMkplaces });
      setForm((prev) => ({
        ...prev,
        precoSugerido: data.precoSugerido,
      }));
    }
  }

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, categoriaId: Number(form.categoriaId) }),
    });
    if (res.ok) {
      router.push("/produtos");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Novo Produto</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input name="sku" value={form.sku} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria *</label>
          <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Materiais</label>
            <input name="materiais" value={form.materiais} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qtd Materiais</label>
            <input name="qtdMateriais" type="number" value={form.qtdMateriais} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custo Material</label>
            <input name="custoMaterial" type="number" step="0.01" value={form.custoMaterial} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Proteção</label>
            <input name="protecao" value={form.protecao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Qtd Proteção</label>
            <input name="qtdProtecao" type="number" value={form.qtdProtecao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custo Proteção</label>
            <input name="custoProtecao" type="number" step="0.01" value={form.custoProtecao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Embalagem</label>
            <input name="embalagem" value={form.embalagem} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custo Embalagem</label>
            <input name="custoEmbalagem" type="number" step="0.01" value={form.custoEmbalagem} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Acabamento</label>
            <select name="acabamento" value={form.acabamento} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
              <option value="padrao">Padrão</option>
              <option value="holográfico">Holográfico</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custo Acabamento</label>
            <input value={`R$ ${custoAcabamento.toFixed(2)}`} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Custo Total</label>
            <input value={`R$ ${custoTotal.toFixed(2)}`} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tempo Produção (h)</label>
            <input name="tempoProducao" type="number" step="0.1" value={form.tempoProducao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preço Sugerido</label>
            <div className="flex gap-2">
              <input name="precoSugerido" type="number" step="0.01" value={form.precoSugerido} onChange={handleChange} className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              <button type="button" onClick={calcularPrecos} className="px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors whitespace-nowrap">
                Calcular
              </button>
            </div>
            {precosCalculados && (
              <p className="text-xs text-zinc-500 mt-1">
                Marketplace: R$ {precosCalculados.precoMkplaces.toFixed(2)} | Markup: {(form.categoriaId ? ((Number(form.precoSugerido) / custoTotal - 1) * 100).toFixed(0) : "-")}%
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Salvar
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
