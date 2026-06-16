import nodemailer from "nodemailer";
import { logger } from "../config/logger.js";

export const sendEmail = async (to: string, subject: string, html: string) => {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE === "true" || (!process.env.SMTP_SECURE && smtpPort === 465);

    logger.info(`Sending email to ${to} via Nodemailer SMTP`, {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        subject
    });

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Fast failure settings to prevent hanging requests on network timeout
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds
            socketTimeout: 15000,     // 15 seconds
            // Force IPv4 connection to prevent ENETUNREACH errors on platforms (like Render) with disabled IPv6 routes
            family: 4,
        } as any);

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html,
        });

        logger.info(`Email successfully sent to ${to} via Nodemailer SMTP`);
    } catch (smtpError: any) {
        logger.warn(`Nodemailer SMTP failed to send email to ${to}, attempting Gmail API fallback...`, {
            error: smtpError.message || smtpError
        });

        const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
        const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

        if (refreshToken && clientId && clientSecret) {
            try {
                logger.info(`Exchanging refresh token for Gmail API access token...`);
                // 1. Get access token from Google OAuth
                const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        refresh_token: refreshToken,
                        grant_type: "refresh_token",
                    }).toString(),
                });

                if (!tokenResponse.ok) {
                    const errorText = await tokenResponse.text();
                    throw new Error(`Gmail OAuth token exchange failed: ${tokenResponse.status} - ${errorText}`);
                }

                const tokenData = await tokenResponse.json() as { access_token: string };
                const accessToken = tokenData.access_token;

                // 2. Build RFC 2822 raw email
                const emailContent = [
                    `From: ${process.env.EMAIL_USER}`,
                    `To: ${to}`,
                    `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
                    `MIME-Version: 1.0`,
                    `Content-Type: text/html; charset=utf-8`,
                    ``,
                    html
                ].join("\r\n");

                const base64SafeString = Buffer.from(emailContent)
                    .toString("base64")
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');

                // 3. Send email via Gmail REST API
                logger.info(`Sending email to ${to} via Gmail REST API (HTTPS)...`);
                const sendResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        raw: base64SafeString
                    })
                });

                if (!sendResponse.ok) {
                    const errorText = await sendResponse.text();
                    throw new Error(`Gmail REST API send failed: ${sendResponse.status} - ${errorText}`);
                }

                logger.info(`Email successfully sent to ${to} via Gmail REST API (HTTPS fallback)`);
            } catch (fallbackError: any) {
                logger.error(`Gmail API fallback failed for ${to}`, {
                    error: fallbackError.message || fallbackError
                });
                throw fallbackError;
            }
        } else {
            logger.error(`Gmail API fallback credentials missing for ${to}. Missing values: ` +
                `GMAIL_REFRESH_TOKEN: ${!!refreshToken}, GMAIL_CLIENT_ID/GOOGLE_CLIENT_ID: ${!!clientId}, GMAIL_CLIENT_SECRET/GOOGLE_CLIENT_SECRET: ${!!clientSecret}`);
            throw smtpError;
        }
    }
};