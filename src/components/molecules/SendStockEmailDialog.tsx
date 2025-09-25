import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { sendStockEmail } from "@/data/reports"

export function SendStockEmailDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSend() {
    if (!email || !email.includes("@")) {
      toast.error("Ingresá un correo válido"); return
    }
    try {
      setLoading(true)
      await sendStockEmail(email)
      toast.success("Reporte enviado")
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo enviar el correo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">✉️ Enviar stock por email</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar stock por email</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="email">Correo destino</Label>
          <Input id="email" type="email" placeholder="tucorreo@empresa.com"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-xs text-muted-foreground">
            Se enviará un HTML y un CSV adjunto con el stock actual.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onSend} disabled={loading}>
            {loading ? "Enviando…" : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
