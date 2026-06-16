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
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html,
        });

        logger.info(`Email successfully sent to ${to} via Nodemailer SMTP`);
    } catch (error: any) {
        logger.error(`Failed to send email to ${to} via Nodemailer SMTP`, {
            error: error.message || error,
            code: error.code
        });
        throw error;
    }
};