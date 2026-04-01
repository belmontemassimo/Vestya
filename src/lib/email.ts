import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "noreply@hestia.dev";

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

export function buildInvitationEmail(
  familyName: string,
  inviterName: string,
  inviteUrl: string
): { subject: string; html: string } {
  return {
    subject: `You've been invited to join ${familyName} on Hestia`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Join ${familyName} on Hestia</h2>
        <p>${inviterName} has invited you to join their family workspace.</p>
        <p>
          <a href="${inviteUrl}"
             style="display: inline-block; padding: 12px 24px; background: #1a1a2e; color: white; text-decoration: none; border-radius: 8px;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
      </div>
    `,
  };
}
