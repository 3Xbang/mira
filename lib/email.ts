/**
 * Email service using Gmail SMTP via Nodemailer
 * Sends OTP verification codes to customers
 */

// We use fetch to call Gmail SMTP via a simple approach
// Since we can't install nodemailer easily, we use Gmail REST API approach

const GMAIL_USER = process.env.GMAIL_USER ?? ''
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? ''
const FROM_NAME = process.env.GMAIL_FROM_NAME ?? 'Homeland Corporation'

/** Generate a 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/** Send OTP email via Gmail SMTP using fetch + base64 */
export async function sendOTPEmail(
  toEmail: string,
  otp: string,
  lang: 'en' | 'zh' | 'th' = 'en'
): Promise<void> {
  const subjects = {
    en: `【Homeland】Your verification code: ${otp}`,
    zh: `【泰国家园】您的验证码：${otp}`,
    th: `【Homeland】รหัสยืนยันของคุณ: ${otp}`,
  }

  const bodies = {
    en: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0ea5e9">Homeland Corporation</h2>
        <p>Your verification code for login:</p>
        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0ea5e9">${otp}</span>
        </div>
        <p style="color:#666;font-size:14px">This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#666;font-size:14px">If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#999;font-size:12px">Homeland Corporation Co.,Ltd · Ko Samui, Thailand</p>
        <p style="color:#999;font-size:12px">📱 WhatsApp: +66 83 523 4777 · Line: 0835234777</p>
      </div>
    `,
    zh: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0ea5e9">泰国家园 Homeland Corporation</h2>
        <p>您的登录验证码：</p>
        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0ea5e9">${otp}</span>
        </div>
        <p style="color:#666;font-size:14px">验证码有效期 <strong>10分钟</strong>，请勿泄露给他人。</p>
        <p style="color:#666;font-size:14px">如非本人操作，请忽略此邮件。</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#999;font-size:12px">Homeland Corporation Co.,Ltd · 苏梅岛，泰国</p>
        <p style="color:#999;font-size:12px">📱 WhatsApp: +66 83 523 4777 · Line: 0835234777</p>
      </div>
    `,
    th: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0ea5e9">Homeland Corporation</h2>
        <p>รหัสยืนยันการเข้าสู่ระบบของคุณ:</p>
        <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0ea5e9">${otp}</span>
        </div>
        <p style="color:#666;font-size:14px">รหัสนี้หมดอายุใน <strong>10 นาที</strong></p>
        <p style="color:#666;font-size:14px">หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#999;font-size:12px">Homeland Corporation Co.,Ltd · เกาะสมุย ประเทศไทย</p>
        <p style="color:#999;font-size:12px">📱 WhatsApp: +66 83 523 4777 · Line: 0835234777</p>
      </div>
    `,
  }

  // Build raw email
  const boundary = `boundary_${Date.now()}`
  const rawEmail = [
    `From: ${FROM_NAME} <${GMAIL_USER}>`,
    `To: ${toEmail}`,
    `Subject: ${subjects[lang]}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    `Your verification code: ${otp} (expires in 10 minutes)`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    bodies[lang],
    ``,
    `--${boundary}--`,
  ].join('\r\n')

  // Base64url encode
  const encoded = Buffer.from(rawEmail).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  // Send via Gmail API
  const auth = Buffer.from(`${GMAIL_USER}:${GMAIL_APP_PASSWORD}`).toString('base64')

  // Use SMTP via fetch is not directly possible — use nodemailer approach
  // Instead we use Gmail's REST API with OAuth... or simply use nodemailer
  // Since we're in Next.js server environment, we use the smtp2go approach

  // Actually use Gmail SMTP directly via a simple HTTP call to smtp.gmail.com
  // This requires nodemailer which we'll install
  // For now, use a workaround with the Gmail API approach via fetch

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({ raw: encoded }),
    }
  )

  // If Gmail API fails, fall back to SMTP
  if (!res.ok) {
    await sendViaSmtp(toEmail, subjects[lang], bodies[lang])
  }
}

/** Send via SMTP using a simple TCP approach (nodemailer-style) */
async function sendViaSmtp(to: string, subject: string, html: string): Promise<void> {
  // Dynamic import of nodemailer
  const nodemailer = await import('nodemailer')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${GMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
