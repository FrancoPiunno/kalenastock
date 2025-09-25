import { collection, getDocs, writeBatch, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

/** Setea el mismo stockActual para TODOS los items (chunked x500). */
export async function setAllStocksTo(value: number) {
  const snap = await getDocs(collection(db, "items"))
  const val = Math.max(0, Number(value) || 0)
  const CHUNK = 500

  for (let i = 0; i < snap.docs.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const d of snap.docs.slice(i, i + CHUNK)) {
      batch.update(doc(db, "items", d.id), { stockActual: val })
    }
    await batch.commit()
  }
}

/** Setea stockActual por mapa { itemId: cantidad } (chunked x500). */
export async function setStocksByMap(stockMap: Record<string, number>) {
  const entries = Object.entries(stockMap)
  const CHUNK = 500

  for (let i = 0; i < entries.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const [id, qty] of entries.slice(i, i + CHUNK)) {
      batch.update(doc(db, "items", id), { stockActual: Math.max(0, Number(qty) || 0) })
    }
    await batch.commit()
  }
}
