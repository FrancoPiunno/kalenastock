// src/components/organisms/MovementsTable.tsx
import { memo, useMemo } from "react"
import type { Item, Movement } from "@/types"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"


// ---- helpers ----
const fmt = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
})

function formatDate(d: unknown): string {
  // Firestore Timestamp -> Date
  // @ts-ignore runtime check
  if (d && typeof d?.toDate === "function") d = d.toDate()
  if (d instanceof Date && !Number.isNaN(d.getTime())) return fmt.format(d)
  return "—"
}

function TipoBadge({ tipo }: { tipo: Movement["tipo"] }) {
  const isIngreso = tipo === "INGRESO"
  return (
    <Badge
      variant={isIngreso ? "default" : "secondary"}
      className={cn(
        "text-xs",
        isIngreso ? "bg-emerald-600 hover:bg-emerald-600" : "bg-slate-200 text-slate-900"
      )}
    >
      {isIngreso ? "Ingreso" : "Egreso"}
    </Badge>
  )
}

// ---- component ----
export const MovementsTable = memo(function MovementsTable({
  rows,
  items,
  loading,
  error,
}: {
  rows: Movement[]
  items: Item[]
  loading?: boolean
  error?: unknown
}) {
  const itemNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const it of items) m.set(it.id, it.nombre)
    return m
  }, [items])

  if (error) {
    const msg = typeof error === "string" ? error : (error as any)?.message ?? "Error desconocido"
    return <p className="text-sm text-red-600">No se pudieron cargar los movimientos: {msg}</p>
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando movimientos…</p>
  }

  if (!rows?.length) {
    return <p className="text-sm text-muted-foreground">Todavía no hay movimientos.</p>
  }

  return (
    <div className="relative">
      <Table>
        <TableCaption>Últimos movimientos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[110px]">Fecha</TableHead>
            <TableHead className="w-[90px]">Tipo</TableHead>
            <TableHead>Insumo</TableHead>
            <TableHead className="w-[110px] text-right">Cantidad</TableHead>
            <TableHead className="w-[220px]">Responsable</TableHead>
            <TableHead>Nota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const name = itemNameById.get(r.itemId) ?? r.itemId
            const isIngreso = r.tipo === "INGRESO"
            return (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{formatDate(r.ts)}</TableCell>
                <TableCell>
                  <TipoBadge tipo={r.tipo} />
                </TableCell>
                <TableCell className="max-w-[380px] truncate" title={name}>
                  {name}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {isIngreso ? "+" : "−"}
                  {r.cantidad}
                </TableCell>
                <TableCell className="max-w-[240px] truncate" title={r.responsable}>
                  {r.responsable}
                </TableCell>
                <TableCell className="max-w-[420px] truncate" title={r.nota ?? ""}>
                  {r.nota ?? "—"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
})
