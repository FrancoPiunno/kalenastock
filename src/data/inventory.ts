import { addDoc, collection, deleteField, doc, getDoc, getDocs, limit, orderBy, query,
  runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase"
import { toDate } from "@/lib/dates"
import type { Item, Movement, MovementType } from "@/types"

// Colecciones
const itemsCol = () => collection(db, "items")
const itemDoc = (id: string) => doc(db, "items", id)
const movCol = () => collection(db, "movements")

// -------- Helpers --------
const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ")

// -------- Items --------

export async function addItem(input: {
  nombre: string
  stockMin: number
  stockInicial?: number
}) {
  const ref = doc(itemsCol())
  const item: Omit<Item, "id" | "createdAt"> & { createdAt: unknown } = {
    nombre: normalizeName(input.nombre),
    stockMin: Math.max(0, Number(input.stockMin) || 0),
    stockActual: Math.max(0, Number(input.stockInicial) || 0),
    activo: true,
    createdAt: serverTimestamp(), // reloj del servidor
  }
  await setDoc(ref, item)

  // Si hay stock inicial, registrar movimiento de ingreso
  if ((input.stockInicial ?? 0) > 0) {
    await addMovement({
      itemId: ref.id,
      tipo: "INGRESO",
      cantidad: Number(input.stockInicial) || 0,
      responsable: "Sistema",
    })
  }

  return ref.id
}

export async function updateItem(
  id: string,
  data: { nombre: string; stockMin: number },
) {
  await updateDoc(itemDoc(id), {
    nombre: normalizeName(data.nombre),
    stockMin: Math.max(0, Number(data.stockMin) || 0),
  })
}

export async function softDeleteItem(id: string) {
  await updateDoc(itemDoc(id), { activo: false })
}

export async function getActiveItems(): Promise<Item[]> {
  // Requiere índice compuesto: activo (asc) + nombre (asc)
  const q = query(
    itemsCol(),
    where("activo", "==", true),
    orderBy("nombre", "asc"),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, "id">) }))
}

export async function getItem(id: string): Promise<Item | null> {
  const snap = await getDoc(itemDoc(id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<Item, "id">) }
}

// -------- Movimientos --------

export async function addMovement(p: {
  itemId: string
  tipo: MovementType
  cantidad: number
  responsable: string
  nota?: string
}) {
  const n = Math.max(0, Number(p.cantidad) || 0)
  if (!n) throw new Error("Cantidad inválida")

  await runTransaction(db, async (tx) => {
    const refItem = itemDoc(p.itemId)
    const snap = await tx.get(refItem)
    if (!snap.exists()) throw new Error("Producto inexistente")

    const item = snap.data() as Omit<Item, "id">
    if (item.activo === false) throw new Error("El producto está inactivo")

    const delta = p.tipo === "INGRESO" ? n : -n
    const nuevoStock = Math.max(0, (Number(item.stockActual) || 0) + delta)

    tx.update(refItem, { stockActual: nuevoStock })

    const refMov = doc(movCol())

    // base del movimiento (sin 'nota')
    const movBase: Omit<Movement, "id" | "ts"> = {
      itemId: p.itemId,
      tipo: p.tipo,
      cantidad: n,
      responsable: p.responsable.trim(),
    }

    // si hay nota válida, la agregamos; si no, la omitimos
    const notaTrim = p.nota?.trim()
    const mov = notaTrim
      ? { ...movBase, nota: notaTrim, ts: serverTimestamp() as unknown }
      : { ...movBase, ts: serverTimestamp() as unknown }

    tx.set(refMov, mov)
  })
}

export async function getLastMovements(limitTo = 50): Promise<Movement[]> {
  const q = query(movCol(), orderBy("ts", "desc"), limit(limitTo))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      id: d.id,
      ...data,
      ts: toDate(data.ts) ?? new Date(0), // garantizamos Date
    } as Movement
  })
}

// === NUEVO: actualizar muchos stocks en una sola operación ===
export async function updateManyStock(
  rows: Array<{ id: string; stockActual: number }>
) {
  if (!rows.length) return
  const batch = writeBatch(db)
  for (const r of rows) {
    batch.update(itemDoc(r.id), {
      stockActual: Math.max(0, Number(r.stockActual) || 0),
    })
  }
  await batch.commit()
}
