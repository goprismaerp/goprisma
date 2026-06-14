"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sugerirSku, buscarProximoSeq } from "@/lib/sku";

interface Categoria {
  id: number;
  nome: string;
  abreviatura: string;
}

interface FormData {
  sku: string;
  idImpressora: string;
  categoriaId: string;
  subCategoria: string;
  nome: string;
  uniMesa: number;
  idFilamento: string;
  pesoUsado: number;
  custoFilamento: number;
  tempoHoras: number;
  tempoMinutos: number;
  capacidade: number;
  tampa: string;
  comprimento: number;
  largura: number;
  altura: number;
  custoModelo3D: number;
  materiais: string;
  qtdMateriais: number;
  custoMaterial: number;
  protecao: string;
  qtdProtecao: number;
  custoProtecao: number;
  embalagem: string;
  custoEmbalagem: number;
  acabamento: string;
  maoObra: number;
  precoSugerido: number;
  imagem: string;
}

const INITIAL_FORM: FormData = {
  sku: "", idImpressora: "", categoriaId: "", subCategoria: "",
  nome: "", uniMesa: 1, idFilamento: "", pesoUsado: 0, custoFilamento: 0,
  tempoHoras: 0, tempoMinutos: 0, capacidade: 0, tampa: "",
  comprimento: 0, largura: 0, altura: 0, custoModelo3D: 0,
  materiais: "", qtdMateriais: 0, custoMaterial: 0,
  protecao: "", qtdProtecao: 0, custoProtecao: 0,
  embalagem: "", custoEmbalagem: 0, acabamento: "padrao",
  maoObra: 0, precoSugerido: 0, imagem: "",
};

export default function CadastroPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [salvando, setSalvando] = useState(false);
  const [imagemPreview, setImagemPreview] = useState("");

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias);
  }, []);

  const catSelecionada = categorias.find((c) => c.id === Number(form.categoriaId));

  async function gerarSku() {
    if (!catSelecionada?.abreviatura) { alert("Selecione uma categoria com abreviatura configurada"); return; }
    const seq = await buscarProximoSeq();
    const sku = sugerirSku(catSelecionada.abreviatura, form.subCategoria, form.nome, seq);
    setForm((prev) => ({ ...prev, sku }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" || name === "categoriaId" ? value : value,
    }));
  }

  function handleNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === "" ? 0 : parseFloat(value) }));
  }

  const custoFilCalc = form.pesoUsado > 0 && form.custoFilamento > 0
    ? Math.round(form.pesoUsado * form.custoFilamento * 100) / 100
    : 0;

  const tempoDecimal = form.tempoHoras + form.tempoMinutos / 60;
  const tempoTotal = `${String(Math.floor(tempoDecimal)).padStart(2, "0")}:${String(Math.round((tempoDecimal % 1) * 60)).padStart(2, "0")}`;

  const custoAcab = form.acabamento === "holográfico" ? 0.5 : 0;
  const custoTotal =
    Math.round((
      form.custoMaterial + form.custoProtecao + form.custoEmbalagem + custoAcab
    ) * 100) / 100;

  async function calcularPrecos() {
    if (!form.categoriaId) return;
    const res = await fetch("/api/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoriaId: Number(form.categoriaId), custoTotal }),
    });
    const data = await res.json();
    if (data.success) {
      setForm((prev) => ({ ...prev, precoSugerido: data.precoSugerido }));
    }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setImagemPreview(data);
      setForm((prev) => ({ ...prev, imagem: data }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoriaId: Number(form.categoriaId),
          tempoDecimal,
          custoTotalFilam: custoFilCalc,
          custoAcabamento: custoAcab,
          custoTotal,
          tempoProducao: tempoDecimal,
        }),
      });
      if (!res.ok) { alert("Erro ao salvar"); return; }
      router.push("/produtos");
    } catch {
      alert("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Produto</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Preencha os dados conforme a planilha. Custos são calculados automaticamente.
        </p>
        <p className="text-xs text-red-500 mt-1">
          <span className="text-red-500">*</span> campos obrigatórios para precificação
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Identificação</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">SKU</label>
              <div className="flex gap-2">
                <input name="sku" value={form.sku} onChange={handleChange} required className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800 font-mono" />
                <button type="button" onClick={gerarSku} className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap">
                  Gerar
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">ID Impressora</label>
              <input name="idImpressora" value={form.idImpressora} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Categoria <span className="text-red-500">*</span></label>
              <select name="categoriaId" value={form.categoriaId} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
                <option value="">Selecione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">SubCategoria</label>
              <input name="subCategoria" value={form.subCategoria} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium mb-1 text-zinc-500">Produto</label>
            <input name="nome" value={form.nome} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium mb-1 text-zinc-500">Imagem do Produto</label>
            <div className="flex items-start gap-4">
              <label className="cursor-pointer px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                Selecionar Arquivo
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              {(imagemPreview || form.imagem) && (
                <div className="relative">
                  <img src={imagemPreview || form.imagem} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                  <button type="button" onClick={() => { setImagemPreview(""); setForm((p) => ({ ...p, imagem: "" })); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                </div>
              )}
              {!imagemPreview && !form.imagem && (
                <div className="w-20 h-20 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-xs text-zinc-400">
                  Sem imagem
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Filamento</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">ID Filamento</label>
              <input name="idFilamento" value={form.idFilamento} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Peso Usado (g)</label>
              <input name="pesoUsado" type="number" step="0.1" value={form.pesoUsado} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo Filamento (R$/g)</label>
              <input name="custoFilamento" type="number" step="0.001" value={form.custoFilamento} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo Total Filamento</label>
              <input value={`R$ ${custoFilCalc.toFixed(2)}`} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-medium" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Tempo</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Horas</label>
              <input name="tempoHoras" type="number" step="0.1" value={form.tempoHoras} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Minutos</label>
              <input name="tempoMinutos" type="number" value={form.tempoMinutos} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Decimal</label>
              <input value={tempoDecimal.toFixed(2)} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Tempo Total (hh:mm)</label>
              <input value={tempoTotal} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-medium" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Modelo / Dimensões</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Capacidade</label>
              <input name="capacidade" type="number" value={form.capacidade} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Tampa</label>
              <input name="tampa" value={form.tampa} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">L (mm)</label>
              <input name="comprimento" type="number" step="0.1" value={form.comprimento} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">P (mm)</label>
              <input name="largura" type="number" step="0.1" value={form.largura} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">A (mm)</label>
              <input name="altura" type="number" step="0.1" value={form.altura} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo Modelo 3D (R$)</label>
              <input name="custoModelo3D" type="number" step="0.01" value={form.custoModelo3D} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Uni Mesa</label>
              <input name="uniMesa" type="number" value={form.uniMesa} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Materiais</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Outros Materiais</label>
                <input name="materiais" value={form.materiais} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Qtd</label>
                <input name="qtdMateriais" type="number" value={form.qtdMateriais} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo (R$) <span className="text-red-500">*</span></label>
              <input name="custoMaterial" type="number" step="0.01" value={form.custoMaterial} onChange={handleNumber} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Proteção</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Proteção</label>
                <input name="protecao" value={form.protecao} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Qtd</label>
                <input name="qtdProtecao" type="number" value={form.qtdProtecao} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo (R$) <span className="text-red-500">*</span></label>
              <input name="custoProtecao" type="number" step="0.01" value={form.custoProtecao} onChange={handleNumber} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Embalagem</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Embalagem</label>
                <input name="embalagem" value={form.embalagem} onChange={handleChange} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
              <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Custo (R$) <span className="text-red-500">*</span></label>
              <input name="custoEmbalagem" type="number" step="0.01" value={form.custoEmbalagem} onChange={handleNumber} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Acabamento</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Tipo <span className="text-red-500">*</span></label>
                <select name="acabamento" value={form.acabamento} onChange={handleChange} required className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800">
                  <option value="padrao">Padrão</option>
                  <option value="holográfico">Holográfico</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-500">Custo</label>
                <input value={`R$ ${custoAcab.toFixed(2)}`} disabled className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500" />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Mão de Obra</h2>
            <div>
              <label className="block text-xs font-medium mb-1 text-zinc-500">Mao Obra (min)</label>
              <input name="maoObra" type="number" value={form.maoObra} onChange={handleNumber} className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Custo Total</h2>
            <input value={`R$ ${custoTotal.toFixed(2)}`} disabled className="w-full text-lg font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200" />
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-4">Preço Sugerido</h2>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input name="precoSugerido" type="number" step="0.01" value={form.precoSugerido} onChange={handleNumber} className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-800" />
                <button type="button" onClick={calcularPrecos} className="px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors whitespace-nowrap">
                  Calcular
                </button>
              </div>
              {form.precoSugerido > 0 && custoTotal > 0 && (
                <p className="text-xs text-zinc-500">
                  Margem: {((form.precoSugerido / custoTotal - 1) * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={salvando} className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50">
            {salvando ? "Salvando..." : "Salvar Produto"}
          </button>
          <button type="button" onClick={() => router.push("/produtos")} className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
