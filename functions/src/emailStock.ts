import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { Resend } from "resend";
import { stringify } from "csv-stringify/sync";

initializeApp(); // inicializa admin una única vez

// Tomamos la API key desde env/config
const resend = new Resend(process.env.RESEND_API_KEY ?? process.env.resend_api_key);

// Helper para HTML seguro
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[ch]
  );
}

export const emailStock = onCall(
  { region: "southamerica-east1" }, // usa tu región si querés
  async (request) => {
    // v2: los datos vienen en request.data
    const to = (request.data?.to as string | undefined)?.trim();
    if (!to) {
      throw new HttpsError("invalid-argument", `Falta el campo "to" (destinatario).`);
    }

    const db = getFirestore();
    const itemsSnap = await db.collection("items").where("activo", "==", true).get();
    const rows = itemsSnap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        nombre: data.nombre ?? "",
        stockActual: Number(data.stockActual) || 0,
        stockMin: Number(data.stockMin) || 0,
      };
    });

    // CSV adjunto
    const csv = stringify(rows, { header: true });

    // HTML simple
    const html = `
      <h2>Stock actual</h2>
      <table border="1" cellspacing="0" cellpadding="6">
        <thead>
          <tr><th>Insumo</th><th>Stock</th><th>Mínimo</th></tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) =>
                `<tr><td>${escapeHtml(r.nombre)}</td><td>${r.stockActual}</td><td>${r.stockMin}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    await resend.emails.send({
      from: "onboarding@resend.dev", // o tu remitente verificado
      to,
      subject: "Reporte de stock",
      html,
      attachments: [
        {
          filename: `stock_${new Date().toISOString().slice(0, 10)}.csv`,
          content: Buffer.from(csv).toString("base64"),
        },
      ],
    });

    return { ok: true, count: rows.length };
  }
);
