export function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>iCrowed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">iCrowed</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                © ${new Date().getFullYear()} iCrowed. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:13px;">
                If you have questions, reply to this email or contact our support team.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function itemsTable(
  items: { productName: string; variantName?: string | null; quantity: number; unitPrice: string | number }[]
): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;">
            ${item.productName}${item.variantName ? ` <span style="color:#6b7280;">(${item.variantName})</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;text-align:center;">
            ×${item.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;text-align:right;font-weight:500;">
            LKR ${Number(item.unitPrice).toLocaleString()}
          </td>
        </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <thead>
        <tr>
          <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:600;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
          <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:600;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
          <th style="padding:8px 0;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;font-weight:600;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#111827;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">${label}</a>`;
}

export function sectionLabel(text: string): string {
  return `<p style="margin:24px 0 8px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${text}</p>`;
}

export function divider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />`;
}
