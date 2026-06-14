"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoPedido() {
  const router = useRouter();
  const [form, setForm] = useState({
    cliente: "",
    status: "pendente",
    valorTotal: 0,
    sinal: 0,
    observacao: "",
  });

  const saldoReceber = Number(form.valorTotal) - Number(form.sinal);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valorTotal: Number(form.valorTotal),
        sinal: Number(form.sinal),
      }),
    });
    if (res.ok) {
      router.push("/pedidos");
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Novo Pedido</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cliente *</label>
          <input name="cliente" value={form.cliente} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
            <option value="pendente">Pendente</option>
            <option value="em produção">Em Produção</option>
            <option value="concluído">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor Total</label>
            <input name="valorTotal" type="number" step="0.01" value={form.valorTotal} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sinal</label>
            <input name="sinal" type="number" step="0.01" value={form.sinal} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Saldo a Receber</label>
          <input
            value={`R$ ${saldoReceber.toFixed(2)}`}
            disabled
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observação</label>
          <textarea name="observacao" value={form.observacao} onChange={handleChange} rows={3} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
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
