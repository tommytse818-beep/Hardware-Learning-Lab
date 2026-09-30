type PasswordResetError = {
  code?: string;
  status?: number;
} | null;

export function getPasswordResetFeedback(error: PasswordResetError) {
  if (!error) {
    return {
      type: "message" as const,
      message:
        "If an account exists for that address, a password-reset email has been sent.",
    };
  }

  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return {
      type: "message" as const,
      message:
        "If an account exists, a recovery email may already have been sent. Wait at least 60 seconds before requesting another link.",
    };
  }

  return {
    type: "error" as const,
    message: "The reset request could not be sent. Try again shortly.",
  };
}
