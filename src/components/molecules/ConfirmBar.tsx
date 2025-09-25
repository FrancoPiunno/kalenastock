import { Button } from "@/components/ui/button"

export function ConfirmBar({
  onConfirm, confirmText, disabled, busy,
}: { onConfirm: () => void; confirmText: string; disabled?: boolean; busy?: boolean }) {
  return (
    <div className="pt-1">
      <Button disabled={disabled || busy} onClick={onConfirm}>
        {confirmText}
      </Button>
    </div>
  )
}
