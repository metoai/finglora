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
 * Clean SaaS Email Base Wrapper
 */
function emailLayout(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; text-align: left;" cellspacing="0" cellpadding="0">
          
          <!-- Header: Clean Brand Wordmark -->
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.05em; color: #E0246A; text-decoration: none;">FINGLORA</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px 32px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background: #fafafa; border-top: 1px solid #f0f0f0; font-size: 12px; color: #888888; text-align: left;">
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
 * 1. Welcome Email Template
 */
export function getWelcomeEmailHtml(name: string = 'there') {
  const cleanName = (name || '').trim() || 'there';

  const content = `
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
  `;

  return emailLayout('Welcome to Finglora', content);
}

/**
 * 2. Salon Recipe / Nail Tech Specification Email
 */
export function getPassportEmailHtml(params: {
  recipientName?: string;
  passportCode: string;
  designName: string;
  shape: string;
  length?: string;
  colors?: string[];
  imageUrl?: string;
  fingerDetails?: Array<{ finger: string; color: string; finish?: string }>;
}) {
  const {
    recipientName = 'there',
    passportCode,
    designName,
    shape,
    length = 'Medium',
    colors = ['#F9E9E9', '#E0246A'],
    imageUrl,
  } = params;

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background: #FDF2F8; border: 1px solid #FCE7F3; color: #E0246A; font-size: 12px; font-weight: 700; font-family: monospace; padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">
        ${passportCode}
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #171717; margin: 4px 0 6px;">
        ${designName}
      </h2>
      <p style="font-size: 14px; color: #525252; margin: 0;">
        Prepared for ${recipientName}. Show this specification sheet to your nail technician at your appointment.
      </p>
    </div>

    ${
      imageUrl
        ? `<div style="margin-bottom: 24px; text-align: center;">
            <img src="${imageUrl}" alt="${designName}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e5e5;" />
           </div>`
        : ''
    }

    <!-- Specifications Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Recipe Code</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; font-family: monospace; color: #171717; text-align: right;">${passportCode}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Silhouette Shape</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; text-transform: capitalize; color: #171717; text-align: right;">${shape}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Length</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; text-transform: capitalize; color: #171717; text-align: right;">${length}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-size: 13px; color: #737373;">Palette Swatches</td>
        <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #171717; text-align: right;">
          ${colors
            .map(
              (c) =>
                `<span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background-color: ${c}; border: 1px solid rgba(0,0,0,0.15); vertical-align: middle; margin-left: 4px;"></span> <span style="font-family: monospace; font-size: 11px; color: #525252;">${c}</span>`
            )
            .join(' &nbsp;')}
        </td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 20px;">
      <tr>
        <td align="left">
          <a href="https://finglora.vercel.app" style="display: inline-block; background-color: #E0246A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
            Open in Finglora
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #737373; margin: 0;">
      Tip: You can show your phone screen with this email directly to your nail technician.
    </p>
  `;

  return emailLayout(`Salon Recipe — ${passportCode}`, content);
}

/**
 * 3. Low Credits Alert Email (Free Tier conversion reminder)
 */
export function getLowCreditsEmailHtml(params: {
  name?: string;
  remainingCredits: number;
}) {
  const { name = 'there', remainingCredits = 1 } = params;

  const content = `
    <p style="font-size: 16px; font-weight: 600; color: #171717; margin: 0 0 16px;">
      Hi ${name},
    </p>

    <div style="background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
      <p style="font-size: 14px; color: #92400E; margin: 0; font-weight: 600;">
        You have ${remainingCredits} try-on credit${remainingCredits === 1 ? '' : 's'} remaining.
      </p>
    </div>

    <p style="font-size: 15px; color: #404040; margin: 0 0 16px;">
      You've been exploring manicures on Finglora! With ${remainingCredits} credit left, here is how you can continue without limits:
    </p>

    <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 24px; background: #fafafa;">
      <div style="font-size: 15px; font-weight: 700; color: #171717; margin-bottom: 6px;">
        Finglora Pro &mdash; Unlimited Manicures
      </div>
      <ul style="margin: 0 0 12px; padding-left: 20px; font-size: 14px; color: #525252; line-height: 1.6;">
        <li>Unlimited AI Virtual Try-Ons on your hand</li>
        <li>Unlimited 5-Finger Bespoke Studio Customizations</li>
        <li>Exclusive VIP & Trending Manicure Drops</li>
        <li>High-resolution salon recipe exports</li>
      </ul>
      <p style="font-size: 13px; color: #737373; margin: 0;">
        Plans start at just <strong>$7/month</strong> or <strong>$29 for 6 months</strong> ($4.83/mo).
      </p>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 20px;">
      <tr>
        <td align="left">
          <a href="https://finglora.vercel.app" style="display: inline-block; background-color: #E0246A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
            Upgrade to Pro
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #737373; margin: 0;">
      Want to keep your free account? You can still view, favorite, and browse all curated looks anytime.
    </p>
  `;

  return emailLayout('Your Try-On Credits on Finglora', content);
}

/**
 * 4. Pro Subscription Confirmation & Receipt Email
 */
export function getProReceiptEmailHtml(params: {
  name?: string;
  planName: string;
  amountPaid: string;
  period: string;
  dateStr?: string;
}) {
  const {
    name = 'there',
    planName,
    amountPaid,
    period,
    dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  } = params;

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background: #ECFDF5; border: 1px solid #D1FAE5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">
        PAYMENT CONFIRMED
      </span>
      <h2 style="font-size: 20px; font-weight: 700; color: #171717; margin: 4px 0 6px;">
        Welcome to Finglora Pro!
      </h2>
      <p style="font-size: 14px; color: #525252; margin: 0;">
        Hi ${name}, thank you for your subscription. Your account has been upgraded to unlimited access.
      </p>
    </div>

    <!-- Receipt Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Plan</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; color: #171717; text-align: right;">Finglora Pro (${planName})</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Billing Period</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; color: #171717; text-align: right;">${period}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; color: #737373;">Date</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; font-weight: 600; color: #171717; text-align: right;">${dateStr}</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; font-size: 13px; color: #737373;">Total Paid</td>
        <td style="padding: 10px 14px; font-size: 14px; font-weight: 700; color: #E0246A; text-align: right;">${amountPaid}</td>
      </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 20px;">
      <tr>
        <td align="left">
          <a href="https://finglora.vercel.app" style="display: inline-block; background-color: #E0246A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
            Go to Your Pro Studio
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #737373; margin: 0;">
      You can manage your subscription or view your past receipts in your Profile settings anytime.
    </p>
  `;

  return emailLayout('Finglora Pro Subscription Receipt', content);
}
