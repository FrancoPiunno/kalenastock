// src/lib/dates.ts
import type { Timestamp } from "firebase/firestore"

export function toDate(value: unknown): Date | null {
  // Firestore Timestamp
  // @ts-expect-error - runtime check
  if (value && typeof value?.toDate === "function") return (value as Timestamp).toDate()
  // JS Date
  if (value instanceof Date) return value
  return null
}
