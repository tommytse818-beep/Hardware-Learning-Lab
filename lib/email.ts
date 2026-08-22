import "server-only";

export type EnquiryEmailPayload = {
  schoolName: string;
  contactName: string;
  email: string;
  message: string;
};

export async function sendEnquiryNotification(payload: EnquiryEmailPayload) {
  const recipient = process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!recipient) {
    return { ok: false, reason: "missing-recipient" as const };
  }

  if (!apiKey) {
    return { ok: false, reason: "missing-provider" as const };
  }

  const from = (process.env.EMAIL_FROM ?? "Hardware Learning Lab <noreply@localhost>").trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: payload.email,
        subject: `New school enquiry: ${payload.schoolName}`,
        text: [
          `School: ${payload.schoolName}`,
          `Contact: ${payload.contactName}`,
          `Email: ${payload.email}`,
          "",
          payload.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, reason: "provider-error", detail };
    }

    return { ok: true, reason: "sent" as const };
  } catch (error) {
    return {
      ok: false,
      reason: "provider-error" as const,
      detail: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
