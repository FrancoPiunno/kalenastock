import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInventory } from "@/hooks/useInventory"
import { updateManyStock } from "@/data/inventory"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { setAllStocksTo, setStocksByMap } from "@/data/inventory-admin"

function parseCsvToMap(text: string): Record<string, number> {
  const map: Record<string, number> = {}
  text.split(/\r?\n/).forEach((line) => {
    const clean = line.trim()
    if (!clean) return
    const [id, qty] = clean.split(/[,\t;]+/)
    if (!id) return
    const n = Number(qty)
    if (!Number.isFinite(n)) return
    map[id] = Math.max(0, Math.floor(n))
  })
  return map
}

export function BulkStockAdjustDialog({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"all" | "csv">("all")
  const [allValue, setAllValue] = useState<number>(0)
  const [csv, setCsv] = useState("")
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState("")                                  // búsqueda
  const [draft, setDraft] = useState<Record<string, string>>({})

  const parsedCount = useMemo(() => Object.keys(parseCsvToMap(csv)).length, [csv])

  async function applyAll() {
    try {
      setLoading(true)
      await setAllStocksTo(allValue)
      toast.success("Stock actualizado para todos los productos")
      setOpen(false)
      onDone?.()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo actualizar el stock")
    } finally {
      setLoading(false)
    }
  }

  async function applyCsv() {
    const map = parseCsvToMap(csv)
    if (!Object.keys(map).length) { toast.error("Pegá el CSV con formato: id,stock"); return }
    try {
      setLoading(true)
      await setStocksByMap(map)
      toast.success(`Stock actualizado (${Object.keys(map).length} productos)`)
      setOpen(false)
      onDone?.()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo actualizar el stock")
    } finally {
      setLoading(false)
    }
  }

  const { items } = useInventory()                                  // leemos productos del store
const filtered = useMemo(
  () =>
    items
      .filter((it) => it.activo !== false)
      .filter((it) => it.nombre.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
  [items, q]
)

const onChangeOne = (id: string, v: string) =>
  setDraft((d) => ({ ...d, [id]: v }))

const savePerItem = async () => {
  const updates = Object.entries(draft)
    .map(([id, v]) => ({ id, stockActual: Number(v) }))
    .filter((r) => Number.isFinite(r.stockActual))

  if (!updates.length) {
    toast.info("No hay cambios para guardar")
    return
  }

  await updateManyStock(updates)
  toast.success("Stock actualizado")
  setDraft({})
  onDone?.()          // <- si ya tenías esta prop/callback
  setOpen(false)      // <- usá tu setter actual del dialog
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">⚠️ Ajuste masivo de stock</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ajuste masivo de stock</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="per-item">

          {/* NUEVO contenido: edición uno a uno */}
          <TabsContent value="per-item" className="space-y-3">
            <div>
              <label className="text-sm font-medium">Buscar</label>
              <Input
                className="mt-1"
                placeholder="Escribí para filtrar productos..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
              {filtered.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{it.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      Actual: {it.stockActual ?? 0} · Mínimo: {it.stockMin ?? 0}
                    </div>
                  </div>
                  <Input
                    className="w-36"
                    type="number"
                    inputMode="numeric"
                    placeholder={`${it.stockActual ?? 0}`}
                    value={draft[it.id] ?? ""}
                    onChange={(e) => onChangeOne(it.id, e.target.value)}
                  />
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground py-6">
                  Sin resultados…
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setDraft({})}>Limpiar</Button>
              <Button onClick={savePerItem}>Guardar cambios</Button>
            </div>
          </TabsContent>

          {/* CONTENIDOS EXISTENTES: no toques tu lógica de estos dos */}
          <TabsContent value="all">
            {/* tu contenido actual para "Todos = X" */}
          </TabsContent>

          <TabsContent value="csv">
            {/* tu contenido actual para "Desde CSV" */}
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  )
}
