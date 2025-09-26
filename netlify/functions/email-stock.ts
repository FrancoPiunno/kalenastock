import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { Buffer } from "node:buffer";

// Cambiá por un correo de TU dominio verificado en Resend:
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@kalenastock.site";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const resend = new Resend(process.env.RESEND_API_KEY);

type SendBody = {
  to: string | string[];
  subject: string;
  html: string;
  csv?: string; // CSV plano opcional
  from?: string; // opcional para override
};

const ok = (data: unknown, status = 200) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  body: JSON.stringify(data),
});

const err = (message: string, status = 400) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  body: JSON.stringify({ error: message }),
});

export const handler: Handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return err("Method Not Allowed", 405);
  }

  if (!process.env.RESEND_API_KEY) {
    return err("Missing RESEND_API_KEY", 500);
  }

  try {
    if (!event.body) return err("Empty body");

    const { to, subject, html, csv, from }: SendBody = JSON.parse(event.body);

    if (!to || !subject || !html) {
      return err("Faltan campos obligatorios: 'to', 'subject', 'html'");
    }

    const recipients =
      Array.isArray(to)
        ? to
        : String(to).split(",").map((s) => s.trim()).filter(Boolean);

    if (!recipients.length) {
      return err("No hay destinatarios válidos en 'to'");
    }

    // Adjuntar CSV si viene
    const attachments =
      csv && csv.length
        ? [
            {
              filename: `stock-${new Date().toISOString().slice(0, 10)}.csv`,
              content: Buffer.from(csv, "utf8").toString("base64"),
              contentType: "text/csv",
            },
          ]
        : undefined;

    const { data, error } = await resend.emails.send({
      from: from || FROM_EMAIL,
      to: recipients,
      subject,
      html,
      attachments,
    });

    if (error) {
      console.error("Resend error:", error);
      return err(
        typeof error === "string" ? error : (error as any)?.message || "Send failed",
        502
      );
    }

    return ok({ success: true, id: (data as any)?.id || null });
  } catch (e: any) {
    console.error("Handler error:", e);
    return err(e?.message || "Unexpected error", 500);
  }
};
