import { useState } from "react"
import {
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
    <>
      <CardHeader>
        <CardTitle>Gestión de productos</CardTitle>
        <CardDescription>Alta, edición y baja de insumos</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* Formulario de alta */}
        <div className="grid gap-4 rounded-md border p-4">
          <div className="grid gap-1.5">
            <Label>Nombre</Label>
            <Input
              placeholder="Ej: Bolsa transparente 1kg"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="grid gap-1.5">
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

        {/* Lista de productos */}
        <div className="grid gap-2">
          <h3 className="font-semibold">Lista de productos</h3>
          {!items.length && (
            <p className="text-sm text-muted-foreground">No hay productos cargados.</p>
          )}
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div>
                <div className="font-medium">{it.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  Stock actual: {it.stockActual} · Mínimo: {it.stockMin}
                </div>
              </div>
              <div className="flex gap-2">
                {/* Editar */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar producto</DialogTitle>
                    </DialogHeader>
                    <EditForm item={it} onUpdate={onUpdate} />
                  </DialogContent>
                </Dialog>

                {/* Eliminar */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onSoftDelete(it.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
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
