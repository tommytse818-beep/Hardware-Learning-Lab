import "server-only";

export type EnquiryEmailPayload = {
  schoolName: string;
  contactName: string;
  email: string;
  message: string;
};

export type CatchUpReminderPayload = {
  to: string;
  learnerName: string;
  cohortName: string;
  targetLesson?: string | null;
};

type EmailResult =
  | { ok: true; reason: "sent" }
  | {
      ok: false;
      reason: "missing-recipient" | "missing-provider" | "provider-error";
      errorCode?: string;
    };

async function sendTransactionalEmail(input: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!input.to) return { ok: false, reason: "missing-recipient" };
  if (!apiKey || !from) return { ok: false, reason: "missing-provider" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "provider-error",
        errorCode: `resend-${response.status}`,
      };
    }

    return { ok: true, reason: "sent" };
  } catch {
    return {
      ok: false,
      reason: "provider-error",
      errorCode: "network-error",
    };
  }
}

export async function sendEnquiryNotification(
  payload: EnquiryEmailPayload,
): Promise<EmailResult> {
  const recipient = process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim() || "";

  return sendTransactionalEmail({
    to: recipient,
    replyTo: payload.email,
    subject: `New school enquiry: ${payload.schoolName}`,
    text: [
      `School: ${payload.schoolName}`,
      `Contact: ${payload.contactName}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n"),
  });
}

export async function sendCatchUpReminder(
  payload: CatchUpReminderPayload,
): Promise<EmailResult> {
  const targetLine = payload.targetLesson
    ? `The current class target is ${payload.targetLesson}.`
    : "Your teacher has shared a reminder to continue the next approved checkpoint.";

  return sendTransactionalEmail({
    to: payload.to,
    subject: `Continue your ${payload.cohortName} hardware project`,
    text: [
      `Hello ${payload.learnerName},`,
      "",
      targetLine,
      "Log in to Hardware Learning Lab to review your own course and continue from your next available step.",
      "",
      "This reminder does not include a rank or compare you with classmates.",
    ].join("\n"),
  });
}
