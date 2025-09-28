import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Item } from "@/types"

export function ItemManager({
  items,
  onAdd,
  onSoftDelete,
  onUpdate,
}: {
  items: Item[]
  onAdd: (p: { nombre: string; stockMin: number; stockInicial?: number }) => Promise<void> | void
  onSoftDelete: (id: string) => Promise<void> | void
  onUpdate: (id: string, p: { nombre: string; stockMin: number }) => Promise<void> | void
}) {
  const [nombre, setNombre] = useState("")
  const [stockMin, setStockMin] = useState<number>(0)
  const [stockInicial, setStockInicial] = useState<number>(0)

  const disabled = !nombre.trim()

  return (
    <div className="grid gap-6">
      <h3 className="font-semibold text-2xl mb-3 ">Agregar producto</h3>
      <div className="grid gap-6">
        {/* Formulario de alta */}
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label>Nombre</Label>
            <Input
              type="text"
              placeholder="Ej: Bolson Transparente 42x64"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-3">
              <Label>Stock mínimo</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={stockMin}
                onChange={(e) => setStockMin(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-3">
              <Label>Stock inicial</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={stockInicial}
                onChange={(e) => setStockInicial(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              disabled={disabled}
              onClick={() =>
                onAdd({
                  nombre: nombre.trim(),
                  stockMin,
                  stockInicial,
                })
              }
            >
              Añadir producto
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Formulario de edición usado dentro del Dialog */
function EditForm({
  item,
  onUpdate,
}: {
  item: Item
  onUpdate: (id: string, p: { nombre: string; stockMin: number }) => Promise<void> | void
}) {
  const [nombre, setNombre] = useState(item.nombre)
  const [stockMin, setStockMin] = useState(item.stockMin)

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label>Nombre</Label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>Stock mínimo</Label>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={stockMin}
          onChange={(e) => setStockMin(Number(e.target.value))}
        />
      </div>
      <div className="pt-2">
        <Button
          onClick={() =>
            onUpdate(item.id, { nombre: nombre.trim(), stockMin })
          }
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
