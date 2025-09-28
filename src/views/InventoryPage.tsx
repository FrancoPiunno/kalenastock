// src/views/InventoryPage.tsx
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Boxes, Package, ArrowLeft } from "lucide-react"

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Item } from "@/types"

import { useInventory } from "@/hooks/useInventory"
import { useItemsLive } from "@/hooks/useItemsLive"
import { useEmployees } from "@/hooks/useEmployees"

import { MovementForm } from "@/components/organisms/MovementForm"
import { ItemManager } from "@/components/organisms/ItemManager"
import { LowStockPanel } from "@/components/organisms/LowStockPanel"
import { MovementsTable } from "@/components/organisms/MovementsTable"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// Ajustá la ruta de EditForm a donde lo tengas:


import { SendStockEmailDialog } from "@/components/molecules/SendStockEmailDialog"
import { BulkStockAdjustDialog } from "@/components/molecules/BulkStockAdjustDialog"

import { addItem, softDeleteItem, updateItem, addMovement } from "@/data/inventory"
import type { MovementType } from "@/types"

type ViewMode = "home" | "movements" | "items"

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




export default function InventoryPage() {
  const [mode, setMode] = useState<ViewMode>("home")

  // datos base
  const { items, movs, loading, error, refetch } = useInventory()
  const liveItems = useItemsLive()
  const itemsForUI = liveItems.length ? liveItems : items

  // empleados
  const { employees: empleados = [] } = useEmployees?.() ?? { employees: [] as any[] }

  // calcular bajo stock localmente
  const low = useMemo(
    () => itemsForUI.filter((it) => (it.stockActual ?? 0) <= (it.stockMin ?? 0)),
    [itemsForUI]
  )
  const lowCount = low.length

  // stock ordenado para la tabla
  const sortedItems = useMemo(
    () => [...itemsForUI].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [itemsForUI]
  )

  // handlers ------------------------------
  async function handleMovement(p: {
    itemId: string
    tipo: MovementType
    cantidad: number
    responsable: string
    nota?: string
  }) {
    try {
      await addMovement(p)
      toast.success(p.tipo === "INGRESO" ? "Ingreso registrado" : "Egreso registrado")
      await refetch()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo registrar el movimiento")
    }
  }

  async function handleAddItem(p: { nombre: string; stockMin: number; stockInicial?: number }) {
    try {
      await addItem(p)
      toast.success("Producto creado")
      await refetch()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo crear el producto")
    }
  }

  async function handleSoftDelete(id: string) {
    try {
      await softDeleteItem(id)
      toast.success("Producto dado de baja")
      await refetch()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo dar de baja")
    }
  }

  async function handleUpdateItem(id: string, p: { nombre: string; stockMin: number }) {
    try {
      await updateItem(id, p)
      toast.success("Producto actualizado")
      await refetch()
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo actualizar")
    }
  }

  // ---------------------------------------
  // Enviar stock por email (usa /api/email-stock)
  async function handleSendStockEmail() {
    const html = `
      <h2>Stock actual</h2>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr>
        ${sortedItems
          .map(
            (i) => `
          <tr>
            <td>${i.nombre}</td>
            <td>${i.stockActual ?? 0}</td>
            <td>${i.stockMin ?? 0}</td>
          </tr>`
          )
          .join("")}
      </table>
    `

    const csv = [
      "nombre,stockActual,stockMin",
      ...sortedItems.map((i) => `${i.nombre},${i.stockActual ?? 0},${i.stockMin ?? 0}`),
    ].join("\n")

    try {
      const res = await fetch("/.netlify/functions/email-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "francopiunno182@gmail.com", // Cambiar por email real
          subject: "Reporte de stock",
          html,
          csv,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "No se pudo enviar el email")
      toast.success("Email enviado ✅")
    } catch (e: any) {
      toast.error(e?.message || "Error al enviar email")
    }
  }

  const showHeader = mode === "home"

  return (
    <div className="mx-auto max-w-6xl px-8 mt-8">
      {/* Volver fuera del contenedor cuando no es Home */}
      {mode !== "home" && (
        <div className="mb-4">
          <Button className="bg-secondary2 p-2" onClick={() => setMode("home")}>
            <ArrowLeft className="w-5 h-5" strokeWidth={1.3} />
          </Button>
        </div>
      )}

      {/* Encabezado grande solo en Home */}
      {showHeader && (
          <div className="text-left space-y-3 ml-3 mb-10 mt-10">
            <h1 className="text-7xl">Bienvenido</h1>
            <p className="ml-1 text-muted-foreground">Elegí una opción para comenzar</p>
          </div>
      )}

      {/* HOME */}
      {mode === "home" && (
        <div className="grid gap-5 pb-20">
          <Card className="p-6 transition cursor-pointer"
            onClick={() => setMode("movements")}
          >
            <div className="w-22 h-22 rounded-xl3 bg-secondary2 flex items-center justify-center">
              <Boxes className="w-14 h-14 text-iconcolor" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-xl">Control de Stock</h3>
              <p className="text-muted-foreground pt-1">
                Registrar ingresos y egresos, ver avisos y últimos movimientos.
              </p>
            </div>
          </Card>

          <Card
            className="p-6 transition cursor-pointer"
            onClick={() => setMode("items")}
          >
            <div className="w-22 h-22 rounded-xl3 bg-secondary2 flex items-center justify-center">
              <Package className="w-14 h-14 text-iconcolor" strokeWidth={1.1} />
            </div>
            <div>
              <h3 className="text-xl">Gestión de Productos</h3>
              <p className="text-muted-foreground pt-1">
                Alta, edición, baja lógica y listado de productos.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* CONTROL DE STOCK */}
      {mode === "movements" && (
        <div className="space-y-6 pb-20">
          <div className="flex">
            <div className="flex gap-2">
              {/* NUEVO: botón directo */}
              <Button onClick={handleSendStockEmail}>Enviar stock</Button>
              <BulkStockAdjustDialog onDone={refetch} />
            </div>
          </div>

          {/* Avisos de bajo stock */}
          {lowCount > 0 && (
            <Card className="p-6 bg-backgroundalert">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Avisos de stock bajo</h3>
                <span className="text-sm text-muted-foreground">
                  {lowCount} producto(s)
                </span>
              </div>
              <div className="mt-4 rounded-lg">
                <LowStockPanel items={itemsForUI} />
              </div>
            </Card>
          )}


          {/* Tabla de Stock actual */}
          <Card className="p-4">
            <div className=" mb-3 space-y-1">
              <h3 className="font-semibold text-3xl">Stock actual</h3>
              <p className="text-muted-foreground pt-1">Podes ver la cantidad de insumos que tenes actualmente.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Producto</th>
                    <th className="py-2 pr-3">Stock</th>
                    <th className="py-2 pr-3">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-3 text-muted-foreground">
                        No hay productos cargados.
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((it) => {
                      const isLow = (it.stockActual ?? 0) <= (it.stockMin ?? 0)
                      return (
                        <tr
                          key={it.id}
                          className={`border-b last:border-0 ${isLow ? "bg-red-50/60 dark:bg-red-950/20" : ""}`}
                        >
                          <td className="py-2 pr-3">{it.nombre}</td>
                          <td className="py-2 pr-3 tabular-nums">{it.stockActual ?? 0}</td>
                          <td className="py-2 pr-3 tabular-nums">{it.stockMin ?? 0}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Formulario de movimiento */}
          <Card className="p-4">
            <div className=" mb-3 space-y-1">
              <h3 className="font-semibold text-3xl">Registrar movimiento</h3>
              <p className="text-muted-foreground pt-1">Registra los egresos o ingresos de productos.</p>
            </div>

            <MovementForm items={itemsForUI} empleados={empleados} onSubmit={handleMovement} />
          </Card>

          {/* Últimos movimientos */}
          <Card className="p-4">
            <div className=" mb-3 space-y-1">
              <h3 className="font-semibold text-3xl">Últimos movimientos</h3>
              <p className="text-muted-foreground pt-1">Encontrá los últimos movimientos que realizaste en tu inventario.</p>
            </div>
            <MovementsTable rows={movs} items={itemsForUI} loading={loading} error={error} />
          </Card>
        </div>
      )}

      {/* GESTIÓN DE PRODUCTOS */}
      {mode === "items" && (
        <div className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-semibold">Gestión de productos</h2>
          </div>

          <Card>
            <ItemManager
              items={itemsForUI}
              onAdd={handleAddItem}
              onSoftDelete={handleSoftDelete}
              onUpdate={handleUpdateItem}
            />
          </Card>
          
                    {/* Lista de productos */}
                    <Card>
                      <div className="grid gap-4">
                      <h3 className="font-semibold text-2xl px-2 mb-3 ">Lista de productos</h3>

                      {!items.length && (
                        <p className="text-sm text-muted-foreground">No hay productos cargados.</p>
                      )}

                      {items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between rounded-xl2 bg-muted py-3 px-5"
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
                                <Button className="bg-secondary2 text-iconcolor" size="sm">
                                  Editar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar producto</DialogTitle>
                                </DialogHeader>
                                {/* p es { nombre: string; stockMin: number } */}
                                  <EditForm item={it} onUpdate={(id, p) => handleUpdateItem(id, p)} />
                              </DialogContent>
                            </Dialog>

                            {/* Eliminar */}
                            <Button
                              className="bg-deleted text-deleted"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleSoftDelete(it.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    </Card>
                    
        </div>
      )}
    </div>
  )
}
