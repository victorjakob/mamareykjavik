import { Resend } from "resend";

function missingKeyError() {
  return new Error("RESEND_API_KEY environment variable is not set");
}

export function createResend() {
  if (!process.env.RESEND_API_KEY) {
    return {
      emails: {
        async send() {
          throw missingKeyError();
        },
      },
    };
  }

  return new Resend(process.env.RESEND_API_KEY);
}
