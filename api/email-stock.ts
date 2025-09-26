// api/email-stock.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// CORS simple para desarrollo y despliegue
function allowCors(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204; // No Content
    res.end();
    return true;
  }
  return false;
}

export default async function handler(req: any, res: any) {
  if (allowCors(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    // Vercel pasa el body parseado. Si llega string, lo parseamos.
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { to, subject = "Reporte de stock", html, csv } = body;

    if (!to || !html) {
      res.status(400).json({ error: "Faltan campos obligatorios: 'to' y/o 'html'." });
      return;
    }

    const recipients: string[] = Array.isArray(to) ? to : [to];

    const attachments =
      csv && typeof csv === "string"
        ? [{ filename: "stock.csv", content: Buffer.from(csv, "utf8") }]
        : [];

    const result = await resend.emails.send({
      // ✅ remitente del dominio verificado
      from: "adm@kalenastock.site",
      to: "francopiunno182@gmail.com", // probar con un solo destinatario
      subject: "Stock actual - KALENA SRL",
      html,
      attachments,
    });

    res.status(200).json({ ok: true, result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar el email", details: err?.message });
  }
}
