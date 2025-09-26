// src/components/molecules/SendStockEmailDialog.tsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useInventory } from "@/hooks/useInventory";

export function SendStockEmailDialog() {
  const { items } = useInventory();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(
    "francopiunno182@gmail.com, laurarpk@live.com.ar, adm@yerbamatekalena.com.ar"
  );
  const [subject, setSubject] = useState("Reporte de Stock");
  const [loading, setLoading] = useState(false);

  // HTML simple del email
  const html = `<h2>Stock actual</h2><p>Se adjunta CSV con el detalle de productos.</p>`;

  // Armamos el CSV con los items actuales
  const csv = useMemo(() => {
    const header = "id,nombre,stockActual,stockMin";
    const rows = (items ?? []).map(
      (it) => `${it.id},"${(it.nombre ?? "").replace(/"/g, '""')}",${it.stockActual ?? 0},${it.stockMin ?? 0}`
    );
    return [header, ...rows].join("\n");
  }, [items]);

  async function handleSend() {
    try {
      setLoading(true);

      // normalizamos destinatarios (separados por coma/espacio)
      const recipients = to
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (recipients.length === 0) {
        toast.error("Ingresá al menos un destinatario");
        return;
      }

      const res = await fetch("/api/email-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients,
          subject,
          html,
          csv, // adjunto
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Error enviando el email");

      toast.success("Email enviado correctamente");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo enviar el email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">📧 Enviar stock por email</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar stock por email</DialogTitle>
          <DialogDescription>
            Se enviará un email con un CSV adjunto y el resumen en HTML.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Destinatarios</Label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="correo1@dominio.com, correo2@dominio.com"
            />
            <p className="text-xs text-muted-foreground">
              Separá múltiples correos con coma o espacio.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Asunto</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Reporte de Stock"
            />
          </div>

          <div className="grid gap-2">
            <Label>Vista previa (HTML)</Label>
            <Textarea value={html} readOnly rows={4} />
          </div>

          <div className="grid gap-2">
            <Label>CSV (adjunto)</Label>
            <Textarea value={csv} readOnly rows={6} className="font-mono text-xs" />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Enviando…" : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
