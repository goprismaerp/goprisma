"use client";

import { useEffect, useState } from "react";

interface Regra {
  id: number;
  categoriaId: number;
  markup: number;
  margemSeguranca: number;
  categoria: { id: number; nome: string };
}

interface Config {
  id: number;
  chave: string;
  valor: string;
  descricao: string;
}

const CONFIG_DEFAULT: { chave: string; label: string; descricao: string }[] = [
  { chave: "taxa_marketplace", label: "Taxa Marketplace (%)", descricao: "Taxa média cobrada por marketplaces (ML, Shopee, Amazon)" },
  { chave: "custo_holografico", label: "Custo Acabamento Holográfico (R$)", descricao: "Depreciação da placa holográfica por produto" },
  { chave: "markup_padrao", label: "Markup Padrão (%)", descricao: "Markup usado quando a categoria não tem regra específica" },
];

export default function PrecificacaoPage() {
  const [regras, setRegras] = useState<Regra[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/regras-precificacao").then((r) => r.json()),
      fetch("/api/config-precificacao").then((r) => r.json()),
    ]).then(([regrasData, configsData]) => {
      setRegras(regrasData);
      setConfigs(configsData);
      setLoading(false);
    });
  }, []);

  async function salvarRegra(categoriaId: number, markup: number, margemSeguranca: number) {
    setMsg("Salvando...");
    const res = await fetch("/api/regras-precificacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoriaId, markup: markup / 100, margemSeguranca: margemSeguranca / 100 }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Regra salva!");
      setRegras((prev) => {
        const idx = prev.findIndex((r) => r.categoriaId === categoriaId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data.regra;
          return updated;
        }
        return [...prev, data.regra];
      });
    } else {
      setMsg(`Erro: ${data.error}`);
    }
  }

  async function salvarConfig(chave: string, valor: string) {
    setMsg("Salvando...");
    const res = await fetch("/api/config-precificacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave, valor, descricao: CONFIG_DEFAULT.find((c) => c.chave === chave)?.descricao ?? "" }),
    });
    const data = await res.json();
    if (data.success) {
      setMsg("Configuração salva!");
      setConfigs((prev) => {
        const idx = prev.findIndex((c) => c.chave === chave);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data.config;
          return updated;
        }
        return [...prev, data.config];
      });
    } else {
      setMsg(`Erro: ${data.error}`);
    }
  }

  async function recalcularTodos() {
    setMsg("Recalculando todos os produtos...");
    const res = await fetch("/api/recalcular-todos", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setMsg(`${data.produtosRecalculados} produtos recalculados!`);
    } else {
      setMsg(`Erro: ${data.error}`);
    }
  }

  if (loading) return <div className="p-8 text-zinc-500">Carregando...</div>;

  const configMap = Object.fromEntries(configs.map((c) => [c.chave, c.valor]));

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Precificação</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Configure as regras de markup e taxas para cálculo automático de preços
          </p>
        </div>
        <button
          onClick={recalcularTodos}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
        >
          Recalcular Todos
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm">{msg}</div>
      )}

      <div className="grid gap-6">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Configurações Globais</h2>
          <div className="space-y-4">
            {CONFIG_DEFAULT.map((cfg) => {
              const config = configs.find((c) => c.chave === cfg.chave);
              const valor = config?.valor ?? "";
              return (
                <div key={cfg.chave} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">{cfg.label}</label>
                    <p className="text-xs text-zinc-400">{cfg.descricao}</p>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={valor}
                    className="w-32 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-transparent text-sm text-right"
                    onBlur={(e) => salvarConfig(cfg.chave, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Markup por Categoria</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Defina o markup (%) para cada categoria. O preço sugerido será: custo × (1 + markup)
          </p>
          <div className="space-y-3">
            {regras.length === 0 && (
              <p className="text-sm text-zinc-400">Nenhuma regra configurada. Use o formulário abaixo para adicionar.</p>
            )}
            {regras.map((regra) => (
              <div key={regra.id} className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <span className="font-medium w-32">{regra.categoria.nome}</span>
                <input
                  type="number"
                  step="1"
                  defaultValue={Math.round(regra.markup * 100)}
                  className="w-24 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-transparent text-sm text-right"
                  onBlur={(e) => {
                    const mk = parseFloat(e.target.value) || 0;
                    const ms = regra.margemSeguranca;
                    salvarRegra(regra.categoriaId, mk, Math.round(ms * 100));
                  }}
                />
                <span className="text-sm text-zinc-400 w-24">% markup</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
