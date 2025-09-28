import { memo, useCallback, useMemo, useState } from "react"
import type { Item, MovementType, Employee } from "@/types"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * Formulario para registrar Ingreso/Egreso de un insumo.
 * - Optimizado con memo/useMemo/useCallback.
 * - Usa Select de shadcn con z-index alto para evitar superposiciones.
 * - No envía campos undefined (nota).
 */
export const MovementForm = memo(function MovementForm({
  items,
  empleados,
  onSubmit,
}: {
  items: Item[]
  empleados: Employee[]
  onSubmit: (p: {
    itemId: string
    tipo: MovementType
    cantidad: number
    responsable: string
    nota?: string
  }) => void | Promise<void>
}) {
  // Estado del form
  const [tipo, setTipo] = useState<MovementType>("EGRESO")
  const [itemId, setItemId] = useState<string>("")
  const [cantidad, setCantidad] = useState<number>(0)
  const [responsable, setResponsable] = useState<string>("")
  const [nota, setNota] = useState<string>("")

  // Mapa para acceso rápido
  const itemsById = useMemo(() => {
    const m = new Map<string, Item>()
    for (const it of items) m.set(it.id, it)
    return m
  }, [items])

  const selected = itemId ? itemsById.get(itemId) : undefined
  const canSubmit = Boolean(itemId && responsable && cantidad > 0)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return

      const payload = {
        itemId,
        tipo,
        cantidad,
        responsable,
        // omitir nota si queda vacía (Firestore no acepta undefined)
        ...(nota.trim() ? { nota: nota.trim() } : {}),
      }

      await onSubmit(payload)
      // opcional: reset parcial manteniendo el item seleccionado
      setCantidad(0)
      setResponsable("")
      setNota("")
    },
    [canSubmit, itemId, tipo, cantidad, responsable, nota, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <div className="flex items-center gap-3">
        <Button className="variarnt"
          type="button"
          variant={tipo === "EGRESO" ? "egreso2" : "egreso1"}
          onClick={() => setTipo("EGRESO")}
        >
          − Egreso
        </Button>
        <Button
          type="button"
          variant={tipo === "INGRESO" ? "ingreso2" : "ingreso1"}
          onClick={() => setTipo("INGRESO")}
        >
          + Ingreso
        </Button>
      </div>

      {/* Insumo */}
      <div className="grid gap-3 relative z-50">   {/* 👈 relative + z-50 */}
        <Label>Insumo</Label>

        <Select value={itemId} onValueChange={setItemId}>
          <SelectTrigger className="z-50 bg-muted rounded-0 border-none shadow-none">       {/* 👈 también en el trigger */}
            <SelectValue className="bg-muted" placeholder="Elegí un insumo..." />
          </SelectTrigger>

          {/* 👇 z alto + popper */}
          <SelectContent
            className="z-[9999] bg-muted"   
            position="popper"
            sideOffset={6}
            align="start"
          >
            {items.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.nombre} · ({i.stockActual})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <p className="text-sm text-muted-foreground">
            Stock actual: <span className={cn(selected.stockActual <= selected.stockMin && "text-red-600 font-semibold")}>
              {selected.stockActual}
            </span>
          </p>
        )}
      </div>

      {/* Cantidad */}
      <div className="grid gap-3">
        <Label>Cantidad</Label>
        <Input
          inputMode="numeric"
          type="number"
          min={0}
          value={Number.isFinite(cantidad) ? cantidad : 0}
          onChange={(e) => setCantidad(Math.max(0, Number(e.target.value) || 0))}
          placeholder="0"
        />
      </div>

      {/* Responsable */}
      <div className="grid gap-3">
        <Label>Responsable</Label>
        <Select value={responsable} onValueChange={setResponsable}>
          <SelectTrigger className="z-50 bg-muted border-none shadow-none">
            <SelectValue placeholder="Elegí un empleado..." />
          </SelectTrigger>
          <SelectContent className="z-50 bg-muted" position="popper" sideOffset={4} align="start">
            {empleados.map((e) => (
              <SelectItem key={e.id} value={e.nombre}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nota */}
      <div className="grid gap-3">
        <Label>Nota (opcional)</Label>
        <Input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Lote, orden, observación..."
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!canSubmit}
          className={tipo === "EGRESO" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}
        >
          Confirmar {tipo.toLowerCase()}
        </Button>
      </div>
    </form>
  )
})
