import { getFunctions, httpsCallable } from "firebase/functions"
import { app } from "@/lib/firebase"

const functions = getFunctions(app, "southamerica-east1") // usa tu región

export async function sendStockEmail(to: string) {
  const call = httpsCallable(functions, "emailStock")
  const { data } = await call({ to })
  return data as any
}
