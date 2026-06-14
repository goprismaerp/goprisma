"use client";

import { useState } from "react";

export default function ImportarPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  async function handleImport(tipo: string) {
    setLoading(true);
    setStatus(`Importando ${tipo}...`);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setStatus("Importação concluída!");
      } else {
        setStatus(`Erro: ${data.error}`);
      }
    } catch {
      setStatus("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const opcoes = [
    { key: "all", label: "Importar Tudo", desc: "PRODUTOS + CUSTOS + Gestão + Precificação" },
    { key: "produtos", label: "PRODUTOS.xlsx", desc: "Produtos, categorias e custos" },
    { key: "custos", label: "CUSTOS.xlsx", desc: "Materiais e embalagens" },
    { key: "gestao", label: "Gestao_GoPrisma.xlsx", desc: "Pedidos e estoque" },
    { key: "precificacao", label: "PRECIFICACAO.xlsx", desc: "Preços sugeridos e marketplaces" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Importar Dados</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Importa dados diretamente das planilhas do Google Drive
        (<code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded">G:\Meu Drive\GoPrisma\financeiro</code>)
      </p>

      <div className="grid gap-4">
        {opcoes.map((op) => (
          <button
            key={op.key}
            onClick={() => handleImport(op.key)}
            disabled={loading}
            className="text-left p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{op.label}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{op.desc}</p>
              </div>
              {loading ? (
                <span className="text-sm text-zinc-400">Importando...</span>
              ) : (
                <span className="text-zinc-400 text-xl">&rarr;</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {status && (
        <div className="mt-6 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <p className="font-medium mb-2">{status}</p>
          {results.length > 0 && (
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li key={i} className={`text-sm ${r.includes("falhou") ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
