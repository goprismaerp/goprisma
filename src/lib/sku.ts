export function sugerirSku(
  catAbrev: string,
  subCategoria: string,
  nome: string,
  seq: number
): string {
  const prefix = catAbrev.toUpperCase();
  const sub = subCategoria
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const nomePart = nome
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();
  const mid = sub || nomePart || "XX";
  const num = String(seq + 1).padStart(3, "0");
  return `${prefix}${mid}${num}`;
}

export async function buscarProximoSeq(): Promise<number> {
  const res = await fetch("/api/produtos");
  const produtos = await res.json();
  let max = 0;
  for (const p of produtos) {
    const match = p.sku?.match(/(\d{3,})$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max;
}