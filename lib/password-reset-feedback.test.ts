import { describe, expect, it } from "vitest";

import { getPasswordResetFeedback } from "./password-reset-feedback";

describe("password reset feedback", () => {
  it("returns the privacy-safe success message when Supabase accepts the request", () => {
    expect(getPasswordResetFeedback(null)).toEqual({
      type: "message",
      message:
        "If an account exists for that address, a password-reset email has been sent.",
    });
  });

  it("treats the email cooldown as a neutral already-requested state", () => {
    expect(
      getPasswordResetFeedback({
        code: "over_email_send_rate_limit",
        status: 429,
      }),
    ).toEqual({
      type: "message",
      message:
        "If an account exists, a recovery email may already have been sent. Wait at least 60 seconds before requesting another link.",
    });
  });

  it("keeps unexpected provider errors generic", () => {
    expect(getPasswordResetFeedback({ code: "unexpected_failure", status: 500 }))
      .toEqual({
        type: "error",
        message: "The reset request could not be sent. Try again shortly.",
      });
  });
});
