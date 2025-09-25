import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item } from "@/types/inventory"

export function ItemSelect({
  items, value, onChange, placeholder = "Elegí un insumo..."
}: { items: Item[]; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map(i => (
          <SelectItem key={i.id} value={i.id}>
            {i.nombre} · ({i.stockActual})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
