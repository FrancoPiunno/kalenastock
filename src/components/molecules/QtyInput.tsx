import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Unit } from "@/types/inventory"
import { parseQty } from "@/lib/number"
import { useState } from "react"

export function QtyInput({
  unit, onChange,
}: { unit: Unit; onChange: (n: number, display: string) => void }) {
  const [val, setVal] = useState("")

  function set(v: string) {
    setVal(v)
    onChange(parseQty(v, unit), v)
  }
  function add(n: number) {
    const now = parseFloat(val.replace(",", ".") || "0") + n
    const next = String(now)
    set(next)
  }
  return (
    <div className="flex gap-2">
      <Input inputMode="decimal" value={val} onChange={(e)=>set(e.target.value)} placeholder="0" />
      <div className="flex gap-1">
        <Button type="button" variant="outline" onClick={()=>add(-1)}>-1</Button>
        <Button type="button" variant="outline" onClick={()=>add(1)}>+1</Button>
        <Button type="button" variant="outline" onClick={()=>add(10)}>+10</Button>
      </div>
    </div>
  )
}
