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
export function getWelcomeEmailHtml(name: string = 'Manicure Enthusiast') {
  const cleanName = name || 'Manicure Enthusiast';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Finglora Atelier</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF7F2;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F1A1C;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid rgba(31, 26, 28, 0.08);
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    }
    .header {
      padding: 36px 32px 24px;
      text-align: center;
      background: #FFFFFF;
      border-bottom: 1px solid rgba(31, 26, 28, 0.06);
    }
    .logo-badge {
      display: inline-block;
      width: 44px;
      height: 44px;
      background: #FFF1F5;
      border-radius: 50%;
      line-height: 44px;
      text-align: center;
      margin-bottom: 12px;
    }
    .brand-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 26px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1F1A1C;
      margin: 0 0 4px;
      font-weight: 500;
    }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #E0246A;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 20px;
      color: #1F1A1C;
      margin: 0 0 14px;
    }
    .paragraph {
      font-size: 14px;
      color: #554D50;
      margin: 0 0 20px;
    }
    .card-box {
      background: #FAF7F2;
      border: 1px solid rgba(31, 26, 28, 0.07);
      border-radius: 16px;
      padding: 20px;
      margin: 24px 0;
    }
    .card-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #E0246A;
      margin: 0 0 8px;
    }
    .feature-item {
      font-size: 13px;
      color: #3F3739;
      margin: 6px 0;
      display: flex;
      align-items: center;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .cta-btn {
      display: inline-block;
      background-color: #E0246A;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      padding: 13px 28px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(224, 36, 106, 0.25);
    }
    .footer {
      padding: 24px 32px;
      background: #FAF7F2;
      border-top: 1px solid rgba(31, 26, 28, 0.06);
      text-align: center;
      font-size: 11px;
      color: #8C8085;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">Finglora</div>
      <div class="brand-sub">Virtual Manicure Atelier</div>
    </div>
    <div class="content">
      <h1 class="greeting">Welcome to the Atelier, ${cleanName}.</h1>
      <p class="paragraph">
        Your personal nail studio is calibrated and ready. Whether you are extracting custom manicure art from Instagram or Pinterest, previewing designs on your own hand, or crafting 5-finger bespoke sets, Finglora gives you precision down to every cuticle.
      </p>

      <div class="card-box">
        <div class="card-title">What you can create today</div>
        <div class="feature-item">&#10003; <strong>Virtual Try-On:</strong> See how any polish, chrome, or French tip looks on your natural hand.</div>
        <div class="feature-item">&#10003; <strong>Inspo Extraction:</strong> Upload any feed photo and break it down across all 5 individual fingers.</div>
        <div class="feature-item">&#10003; <strong>Technician Passport:</strong> Exact pigment codes, apex layers, and cure times ready to show your nail artist.</div>
      </div>

      <div class="cta-container">
        <a href="https://finglora.com" class="cta-btn">Enter Your Atelier &rarr;</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Finglora Inc. Quiet Luxury Nail Artistry.<br>
      Crafted for precision, beauty, and authentic self-expression.
    </div>
  </div>
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
