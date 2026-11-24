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
  process.env.RESEND_FROM_EMAIL || 'Finglora Atelier <onboarding@resend.dev>';

/**
 * Luxury Editorial Email Template for Finglora Welcome
 */
export function getWelcomeEmailHtml(name: string = 'Friend') {
  const cleanName = name || 'Friend';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Finglora</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF9F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;border:1px solid #f2e8ec;box-shadow:0 8px 24px rgba(0,0,0,0.03);overflow:hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Logo & Header -->
          <tr>
            <td align="center" style="padding:36px 32px 20px;text-align:center;">
              <!-- Finglora Luxury Nail Emblem Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 14px;">
                <tr>
                  <td align="center" style="width:52px;height:52px;background:#FFF0F5;border:1px solid #FCE7F3;border-radius:16px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C9.5 2 7.5 4 7.5 6.5V14C7.5 17.5 9.5 20.5 12 21.5C14.5 20.5 16.5 17.5 16.5 14V6.5C16.5 4 14.5 2 12 2Z" fill="#E0246A"/>
                      <path d="M10 5.5C10 4.5 10.8 3.8 12 3.8C12.4 3.8 12.8 4 13.1 4.3C12.3 4.8 11.2 5.8 10.8 7.2L10 5.5Z" fill="#FFFFFF" opacity="0.6"/>
                      <circle cx="12" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="font-family:Georgia,serif;font-size:24px;font-weight:600;letter-spacing:0.08em;color:#1c1917;margin:0 0 4px;">FINGLORA</div>
              <div style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#E0246A;">Virtual Nail Studio</div>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding:10px 32px 32px;line-height:1.6;">
              <h1 style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#1c1917;margin:0 0 12px;text-align:center;">
                Welcome, ${cleanName}!
              </h1>
              
              <p style="font-size:14px;color:#57534e;margin:0 0 20px;text-align:center;line-height:1.6;">
                Your account is ready with <strong>10 Free Try-On Credits</strong>. You can now try on any manicure style directly on your own hand photo in 1 tap.
              </p>

              <!-- 3 Simple Highlights -->
              <table role="presentation" width="100%" style="background:#FAF9F6;border-radius:16px;padding:16px;margin:0 0 24px;border:1px solid #f5ede8;" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#44403c;">
                    ✨ <strong>10 Free Try-Ons:</strong> Instant preview on your hand photo
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#44403c;">
                    📸 <strong>Feed to Hand:</strong> Extract nail art from Instagram or Pinterest
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#44403c;">
                    💅 <strong>Save Your Favorites:</strong> Bookmarks ready for your next salon appointment
                  </td>
                </tr>
              </table>

              <!-- Button CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:6px 0 16px;">
                    <a href="https://finglora.vercel.app" style="display:inline-block;background-color:#E0246A;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:12px;box-shadow:0 4px 12px rgba(224,36,106,0.25);">
                      Open Finglora Studio &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Clean Footer -->
          <tr>
            <td align="center" style="padding:18px 24px;background:#FAF9F6;border-top:1px solid #f5ede8;font-size:11px;color:#a8a29e;text-align:center;">
              &copy; ${new Date().getFullYear()} Finglora • Virtual Manicure Studio<br>
              Made for effortless, beautiful nails.
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
