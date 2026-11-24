import { Resend } from 'resend';

let _resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_resendClient) {
    _resendClient = new Resend(apiKey);
  }
  return _resendClient;
}

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Finglora <onboarding@resend.dev>';

/**
 * Luxury Editorial Email Template for Finglora Welcome
 */
export function getWelcomeEmailHtml(name: string = 'there') {
  const cleanName = (name || '').trim() || 'there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Finglora</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; text-align: left;" cellspacing="0" cellpadding="0">
          
          <!-- Header: Clean Wordmark -->
          <tr>
            <td style="padding: 32px 36px 20px; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.05em; color: #E0246A; text-decoration: none;">FINGLORA</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 36px 36px;">
              <p style="font-size: 16px; font-weight: 600; color: #171717; margin: 0 0 16px;">
                Hi ${cleanName},
              </p>
              
              <p style="font-size: 15px; color: #404040; margin: 0 0 16px;">
                Thanks for joining Finglora. Your account is active and you have <strong>10 complimentary virtual try-on credits</strong> ready to use.
              </p>

              <p style="font-size: 15px; color: #404040; margin: 0 0 20px;">
                Here is what you can do right now:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #f5f5f5; font-size: 14px; color: #404040;">
                    <strong style="color: #171717;">Virtual Try-On</strong> &mdash; Upload a photo of your hand to test any shape, length, and polish in real time.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #f5f5f5; font-size: 14px; color: #404040;">
                    <strong style="color: #171717;">Inspiration Extraction</strong> &mdash; Upload any Instagram or Pinterest nail photo to isolate and replicate the design.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #f5f5f5; border-bottom: 1px solid #f5f5f5; font-size: 14px; color: #404040;">
                    <strong style="color: #171717;">Saved Designs</strong> &mdash; Keep your preferred manicures organized for your next salon visit.
                  </td>
                </tr>
              </table>

              <!-- Button CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 24px;">
                <tr>
                  <td align="left">
                    <a href="https://finglora.vercel.app" style="display: inline-block; background-color: #E0246A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
                      Open Finglora
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #737373; margin: 0;">
                If you have any questions or feedback, simply reply directly to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background: #fafafa; border-top: 1px solid #f0f0f0; font-size: 12px; color: #888888;">
              Finglora &bull; Virtual Manicure Studio<br>
              <a href="https://finglora.vercel.app" style="color: #888888; text-decoration: underline;">finglora.vercel.app</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Design Passport / Recipe Email
 */
export function getPassportEmailHtml(params: {
  recipientName?: string;
  passportCode: string;
  designName: string;
  shape: string;
  length?: string;
  colors?: string[];
  imageUrl?: string;
}) {
  const {
    recipientName = 'Client',
    passportCode,
    designName,
    shape,
    length = 'Medium',
    colors = ['#F9E9E9', '#E0246A'],
    imageUrl,
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Finglora Design Passport — ${passportCode}</title>
  <style>
    body {
      margin: 0; padding: 0; background: #FAF7F2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1F1A1C;
    }
    .box {
      max-width: 580px; margin: 30px auto; background: #FFF;
      border-radius: 20px; border: 1px solid rgba(31, 26, 28, 0.08);
      overflow: hidden;
    }
    .head {
      padding: 24px 30px; border-bottom: 1px solid rgba(31, 26, 28, 0.06); text-align: center;
    }
    .code {
      display: inline-block; background: #FAF7F2; border: 1px solid rgba(31, 26, 28, 0.1);
      padding: 4px 12px; border-radius: 999px; font-family: monospace; font-size: 11px;
      color: #E0246A; font-weight: 700; margin-top: 6px;
    }
    .body { padding: 30px; }
    .hero-img {
      width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px;
      margin: 16px 0; border: 1px solid rgba(31, 26, 28, 0.08);
    }
    .spec-grid {
      background: #FAF7F2; border-radius: 14px; padding: 16px; margin: 20px 0;
    }
    .spec-row {
      display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;
      border-bottom: 1px dashed rgba(31, 26, 28, 0.08);
    }
    .spec-row:last-child { border-bottom: none; }
    .label { color: #7B7075; }
    .val { font-weight: 600; color: #1F1A1C; }
  </style>
</head>
<body>
  <div class="box">
    <div class="head">
      <div style="font-family: Georgia, serif; font-size: 22px; font-weight: 500;">Finglora Passport</div>
      <div class="code">${passportCode}</div>
    </div>
    <div class="body">
      <h2 style="font-family: Georgia, serif; margin: 0 0 6px; font-size: 18px;">${designName}</h2>
      <p style="font-size: 13px; color: #554D50; margin: 0 0 16px;">
        Prepared for ${recipientName}. Show this specification sheet to your nail technician at the chair.
      </p>

      ${imageUrl ? `<img src="${imageUrl}" alt="${designName}" class="hero-img" />` : ''}

      <div class="spec-grid">
        <div class="spec-row"><span class="label">Passport Code</span><span class="val font-mono">${passportCode}</span></div>
        <div class="spec-row"><span class="label">Nail Silhouette</span><span class="val" style="text-transform: capitalize;">${shape}</span></div>
        <div class="spec-row"><span class="label">Length</span><span class="val">${length}</span></div>
        <div class="spec-row"><span class="label">Color Palette</span><span class="val">${colors.join(', ')}</span></div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
