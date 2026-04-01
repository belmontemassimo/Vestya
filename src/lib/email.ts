import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "noreply@vestya.net";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vestya.net";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!resend) {
    console.log("[Email Dev] To:", params.to);
    console.log("[Email Dev] Subject:", params.subject);
    console.log("[Email Dev] Body:", params.html);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    throw error;
  }
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Vestya</span>
      </div>
      ${content}
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Vestya — Property management for families<br />
          <a href="${APP_URL}" style="color: #94a3b8;">vestya.net</a>
        </p>
      </div>
    </div>
  `;
}

function button(text: string, url: string): string {
  return `
    <a href="${url}"
       style="display: inline-block; padding: 12px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
      ${text}
    </a>
  `;
}

export function buildWelcomeEmail(
  userName: string,
): { subject: string; html: string } {
  return {
    subject: "Welcome to Vestya",
    html: emailWrapper(`
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 600; margin: 0 0 12px;">
        Welcome, ${userName}!
      </h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        Your account has been created. You can now create a family workspace or join an existing one using an invite code.
      </p>
      <p style="margin: 0 0 32px;">
        ${button("Go to Vestya", `${APP_URL}/en/dashboard`)}
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    `),
  };
}

export function buildInvitationEmail(
  familyName: string,
  inviterName: string,
  inviteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `You've been invited to join ${familyName} on Vestya`,
    html: emailWrapper(`
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 600; margin: 0 0 12px;">
        Join ${familyName}
      </h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        ${inviterName} has invited you to join their family workspace on Vestya.
      </p>
      <p style="margin: 0 0 32px;">
        ${button("Accept Invitation", inviteUrl)}
      </p>
      <p style="color: #64748b; font-size: 13px; margin: 0;">
        This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
      </p>
    `),
  };
}
