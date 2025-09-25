import type { Item } from "@/types";

export function LowStockPanel({ items }: { items: Item[] }) {
  const low = items.filter(i => i.stockActual <= i.stockMin);

  if (!low.length) {
    return <div className="text-sm text-muted-foreground">Sin avisos de stock bajo.</div>;
  }

  return (
    <div className="grid gap-2">
      {low.map(i => (
        <div key={i.id} className="rounded-md border p-2 text-sm">
          <b>{i.nombre}</b> · stock {i.stockActual} / mínimo {i.stockMin}
        </div>
      ))}
    </div>
  );
}
