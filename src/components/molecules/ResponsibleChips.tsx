import { Button } from "@/components/ui/button"

export function ResponsibleChips({
  values, onPick,
}: { values: string[]; onPick: (v: string) => void }) {
  if (!values.length) return null
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {values.map(v => (
        <Button key={v} variant="outline" size="sm" onClick={()=>onPick(v)}>{v}</Button>
      ))}
    </div>
  )
}
