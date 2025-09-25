// src/views/InventoryPage.tsx
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

import { useInventory } from "@/hooks/useInventory"
import { useItemsLive } from "@/hooks/useItemsLive"
import { useEmployees } from "@/hooks/useEmployees"

import { MovementForm } from "@/components/organisms/MovementForm"
import { ItemManager } from "@/components/organisms/ItemManager"
import { LowStockPanel } from "@/components/organisms/LowStockPanel"
import { MovementsTable } from "@/components/organisms/MovementsTable"

import { SendStockEmailDialog } from "@/components/molecules/SendStockEmailDialog"
import { BulkStockAdjustDialog } from "@/components/molecules/BulkStockAdjustDialog"

import { addItem, softDeleteItem, updateItem, addMovement } from "@/data/inventory"
import type { MovementType } from "@/types"

type ViewMode = "home" | "movements" | "items"

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

  const showHeader = mode === "home"

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Volver fuera del contenedor cuando no es Home */}
      {mode !== "home" && (
        <div className="mb-4">
          <Button variant="secondary" onClick={() => setMode("home")}>
            ← Volver
          </Button>
        </div>
      )}

      {/* Encabezado grande solo en Home */}
      {showHeader && (
        <Card className="mb-6 p-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Elegí una opción para comenzar</p>
          </div>
        </Card>
      )}

      {/* HOME */}
      {mode === "home" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => setMode("movements")}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Control de stock</h3>
              <p className="text-muted-foreground">
                Registrar ingresos y egresos, ver avisos y últimos movimientos.
              </p>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => setMode("items")}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Gestión de productos</h3>
              <p className="text-muted-foreground">
                Alta, edición, baja lógica y listado de productos.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* CONTROL DE STOCK */}
      {mode === "movements" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Control de stock</h2>
            <div className="flex gap-2">
              <SendStockEmailDialog />
              <BulkStockAdjustDialog onDone={refetch} />
            </div>
          </div>

          {/* Avisos de bajo stock */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Avisos de stock bajo</h3>
              <span className="text-sm text-muted-foreground">
                {lowCount ? `${lowCount} producto(s)` : "Sin avisos"}
              </span>
            </div>
            <div className="mt-3">
              <LowStockPanel items={itemsForUI} />
            </div>
          </Card>

          {/* NUEVO: Tabla de Stock actual (contenedor que faltaba) */}
          <Card className="p-4">
            <h3 className="mb-3 text-lg font-semibold">Stock actual</h3>
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
            <h3 className="mb-3 text-lg font-semibold">Registrar movimiento</h3>
            <MovementForm items={itemsForUI} empleados={empleados} onSubmit={handleMovement} />
          </Card>

          {/* Últimos movimientos */}
          <Card className="p-4">
            <h3 className="mb-3 text-lg font-semibold">Últimos movimientos</h3>
            <MovementsTable rows={movs} items={itemsForUI} loading={loading} error={error} />
          </Card>
        </div>
      )}

      {/* GESTIÓN DE PRODUCTOS */}
      {mode === "items" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Gestión de productos</h2>
          </div>

          <Card className="p-4">
            <ItemManager
              items={itemsForUI}
              onAdd={handleAddItem}
              onSoftDelete={handleSoftDelete}
              onUpdate={handleUpdateItem}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
