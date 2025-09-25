const KEY = "responsables_recientes"

export function getRecentNames(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]") } catch { return [] }
}
export function pushRecentName(name: string) {
  const n = name.trim(); if (!n) return
  const arr = [n, ...getRecentNames().filter(x => x !== n)].slice(0, 8)
  localStorage.setItem(KEY, JSON.stringify(arr))
}
export function getDefaultName() { return getRecentNames()[0] ?? "" }
