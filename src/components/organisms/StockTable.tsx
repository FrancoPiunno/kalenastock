import { memo, useMemo } from "react"
import type { Item } from "@/types"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export const StockTable = memo(function StockTable({ items }: { items: Item[] }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [items]
  )

  if (!sorted.length) {
    return (
      <>
        <CardHeader>
          <CardTitle>Stock actual</CardTitle>
          <CardDescription>Listado de todos los insumos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay insumos cargados.</p>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Stock actual</CardTitle>
        <CardDescription>Listado de todos los insumos ordenados por nombre</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2 font-medium">Insumo</th>
              <th className="p-2 font-medium">Stock</th>
              <th className="p-2 font-medium">Mínimo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((i) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="p-2">{i.nombre}</td>
                <td
                  className={
                    i.stockActual <= i.stockMin
                      ? "p-2 text-red-600 font-semibold"
                      : "p-2"
                  }
                >
                  {i.stockActual}
                </td>
                <td className="p-2">{i.stockMin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </>
  )
})
