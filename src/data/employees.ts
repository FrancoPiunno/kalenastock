import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Employee } from "@/types"

const col = () => collection(db, "employees")

export async function getActiveEmployees(): Promise<Employee[]> {
  // sin orderBy para evitar índice compuesto
  const q = query(col(), where("activo", "==", true))
  const snap = await getDocs(q)
  const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Employee, "id">) }))
  // ordenar en el cliente
  return list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))
}