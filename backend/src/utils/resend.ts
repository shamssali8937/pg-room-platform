import { Resend } from "resend";
import { logger } from "../config/logger.js";

// ─── Send email via Resend ────────────────────────────────────────────────────
// NOTE: We intentionally do NOT cache the Resend client at module level.
// This ensures process.env.RESEND_API_KEY is always read fresh, so updating
// the .env and restarting the server is all that's needed to pick up a new key.

export const sendResendEmail = async (
    to: string,
    subject: string,
    html: string
): Promise<void> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_your_api_key_here") {
        throw new Error(
            "RESEND_API_KEY is not configured. Please add a valid key to your .env file and restart the server."
        );
    }

    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    logger.info(`Sending email via Resend to ${to}`, { subject });

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
    });

    if (error) {
        logger.error(`Resend email failed for ${to}`, { error });
        throw new Error(`Resend error: ${error.message}`);
    }

    logger.info(`Email successfully sent via Resend to ${to}`);
};

