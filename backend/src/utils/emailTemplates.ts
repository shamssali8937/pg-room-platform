// ─── Branded Email Templates ──────────────────────────────────────────────────
// Matches the dark-theme / purple-accent style used by the OTP reset email.
// All templates return raw HTML strings consumed by sendEmail().

const wrapTemplate = (title: string, bodyHtml: string): string => `
<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 16px; border: 1px solid #2d2d2d;">
    <h2 style="color: #a78bfa; margin-bottom: 8px;">${title}</h2>
    ${bodyHtml}
    <hr style="border: none; border-top: 1px solid #2d2d2d; margin: 24px 0;" />
    <p style="color: #6b7280; font-size: 12px; margin: 0;">This is an automated message from PG Room Platform. Please do not reply to this email.</p>
</div>
`;

// ─── Booking Emails ──────────────────────────────────────────────────────────

export const bookingCreatedEmail = (ownerName: string, tenantName: string, roomTitle: string, requestType: string): string =>
    wrapTemplate(
        requestType === "visit_request" ? "New Visit Request 🏠" : "New Booking Inquiry 📋",
        `<p style="color: #9ca3af; margin-bottom: 16px;">Hi <strong style="color:#fff;">${ownerName}</strong>,</p>
         <p style="color: #9ca3af; margin-bottom: 16px;"><strong style="color:#fff;">${tenantName}</strong> has sent a ${requestType === "visit_request" ? "visit request" : "booking inquiry"} for your listing:</p>
         <div style="background: #1a1a2e; border: 1px solid #7c3aed; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
             <p style="color: #a78bfa; font-size: 18px; font-weight: 700; margin: 0;">${roomTitle}</p>
         </div>
         <p style="color: #9ca3af;">Please log in to your dashboard to review and respond to this request.</p>`
    );

export const bookingStatusChangedEmail = (
    tenantName: string,
    roomTitle: string,
    status: string,
    ownerNote?: string
): string => {
    const statusConfig: Record<string, { emoji: string; color: string; message: string }> = {
        approved:  { emoji: "🎉", color: "#22c55e", message: "Your booking has been <strong>approved</strong> by the owner!" },
        rejected:  { emoji: "❌", color: "#ef4444", message: "Unfortunately, your booking was <strong>not approved</strong> by the owner." },
        completed: { emoji: "✅", color: "#3b82f6", message: "Your stay has been marked as <strong>completed</strong>." },
        closed:    { emoji: "🔒", color: "#6b7280", message: "Your booking has been <strong>closed</strong>." },
    };

    const cfg = statusConfig[status] ?? { emoji: "ℹ️", color: "#9ca3af", message: `Your booking status has changed to <strong>${status}</strong>.` };

    return wrapTemplate(
        `Booking ${status.charAt(0).toUpperCase() + status.slice(1)} ${cfg.emoji}`,
        `<p style="color: #9ca3af; margin-bottom: 16px;">Hi <strong style="color:#fff;">${tenantName}</strong>,</p>
         <div style="background: #1a1a2e; border-left: 4px solid ${cfg.color}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
             <p style="color: #e5e7eb; margin: 0 0 8px 0;">${cfg.message}</p>
             <p style="color: #a78bfa; font-weight: 600; margin: 0;">Room: ${roomTitle}</p>
         </div>
         ${ownerNote ? `<p style="color: #9ca3af;"><strong>Owner's note:</strong> ${ownerNote}</p>` : ""}
         <p style="color: #9ca3af;">Log in to view full details in your bookings dashboard.</p>`
    );
};

export const bookingCancelledEmail = (ownerName: string, tenantName: string, roomTitle: string): string =>
    wrapTemplate(
        "Booking Cancelled ❌",
        `<p style="color: #9ca3af; margin-bottom: 16px;">Hi <strong style="color:#fff;">${ownerName}</strong>,</p>
         <p style="color: #9ca3af; margin-bottom: 16px;"><strong style="color:#fff;">${tenantName}</strong> has cancelled their booking request for:</p>
         <div style="background: #1a1a2e; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
             <p style="color: #a78bfa; font-weight: 600; margin: 0;">${roomTitle}</p>
         </div>
         <p style="color: #9ca3af;">The room has been restored to active status.</p>`
    );

// ─── Listing Moderation Emails ───────────────────────────────────────────────

export const listingModeratedEmail = (ownerName: string, roomTitle: string, status: string, reason?: string): string => {
    const statusConfig: Record<string, { emoji: string; color: string; message: string }> = {
        active:    { emoji: "✅", color: "#22c55e", message: "Your listing has been <strong>approved</strong> and is now live!" },
        rejected:  { emoji: "❌", color: "#ef4444", message: "Your listing was <strong>rejected</strong> by our admin team." },
        suspended: { emoji: "⚠️", color: "#f59e0b", message: "Your listing has been <strong>suspended</strong> by our admin team." },
    };

    const cfg = statusConfig[status] ?? { emoji: "ℹ️", color: "#9ca3af", message: `Your listing status has changed to <strong>${status}</strong>.` };

    return wrapTemplate(
        `Listing ${status === "active" ? "Approved" : status.charAt(0).toUpperCase() + status.slice(1)} ${cfg.emoji}`,
        `<p style="color: #9ca3af; margin-bottom: 16px;">Hi <strong style="color:#fff;">${ownerName}</strong>,</p>
         <div style="background: #1a1a2e; border-left: 4px solid ${cfg.color}; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
             <p style="color: #e5e7eb; margin: 0 0 8px 0;">${cfg.message}</p>
             <p style="color: #a78bfa; font-weight: 600; margin: 0;">Listing: ${roomTitle}</p>
         </div>
         ${reason ? `<p style="color: #9ca3af;"><strong>Reason:</strong> ${reason}</p>` : ""}
         <p style="color: #9ca3af;">Log in to your owner dashboard for more details.</p>`
    );
};

// ─── Points Earned Email ─────────────────────────────────────────────────────

export const pointsEarnedEmail = (userName: string, points: number, reason: string): string =>
    wrapTemplate(
        "Points Earned! 🪙",
        `<p style="color: #9ca3af; margin-bottom: 16px;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
         <div style="background: #1a1a2e; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 16px;">
             <span style="font-size: 36px; font-weight: 900; color: #a78bfa;">+${points}</span>
             <p style="color: #9ca3af; margin: 8px 0 0 0;">points earned</p>
         </div>
         <p style="color: #9ca3af;"><strong>Reason:</strong> ${reason}</p>
         <p style="color: #9ca3af;">Check your wallet for the updated balance.</p>`
    );
