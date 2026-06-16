import nodemailer from "nodemailer";
import { logger } from "../config/logger.js";

export const sendEmail = async (to: string, subject: string, html: string) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
        const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
        logger.info(`Sending email via Resend API to ${to}`, { subject, from: fromEmail });

        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [to],
                    subject,
                    html,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error(`Resend API error response when sending email to ${to}: ${response.status} - ${errorText}`);
                throw new Error(`Resend email sending failed: ${response.status} - ${errorText}`);
            }
            logger.info(`Email successfully sent via Resend API to ${to}`);
            return;
        } catch (error: any) {
            logger.error(`Failed to send email via Resend API to ${to}`, { error: error.message || error });
            throw error;
        }
    }

    // Fallback to Gmail SMTP
    logger.info(`Sending email via SMTP (Gmail) to ${to}`, { subject, user: process.env.EMAIL_USER });
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        logger.info(`Email successfully sent via SMTP (Gmail) to ${to}`);
    } catch (error: any) {
        logger.error(`Failed to send email via SMTP (Gmail) to ${to}`, { error: error.message || error });
        throw error;
    }
};