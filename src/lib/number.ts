import type { Unit } from "@/types/inventory"

export function parseQty(raw: string, unit: Unit): number {
  const n = Number(raw.replace(",", "."))
  if (!Number.isFinite(n) || n <= 0) return 0
  // si unidad no admite decimales, redondear a entero
  return unit === "unidad" || unit === "rollo" || unit === "bolsa"
    ? Math.round(n)
    : n
}