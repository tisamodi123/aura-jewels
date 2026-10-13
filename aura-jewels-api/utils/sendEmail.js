import nodemailer from 'nodemailer';
import { MAIL } from '../config/mail.config.js';

// Single pooled transporter (reused across sends) instead of creating one per email.
let _transporter = null;
const getTransporter = () => {
    if (_transporter) return _transporter;
    _transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587 (STARTTLS)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        pool: true,
    });
    return _transporter;
};

// Rough HTML → text fallback (deliverability + non-HTML clients).
const htmlToText = (html = '') =>
    String(html)
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

// sendEmail(to, subject, html, opts?)
//   opts = { from, replyTo, text }  — all optional.
//   `from`    defaults to MAIL.from (the authenticated mailbox's default).
//   `replyTo` defaults to MAIL.replyTo (support@).
//   Back-compat: a STRING 4th arg is treated as `text` (old signature).
export const sendEmail = async function (to, subject, htmlContent, opts = {}) {
    try {
        if (typeof opts === 'string') opts = { text: opts };
        const mailOptions = {
            from: opts.from || MAIL.from,
            to,
            subject,
            html: htmlContent,
            text: opts.text || htmlToText(htmlContent),
            replyTo: opts.replyTo || MAIL.replyTo,
            attachments: opts.attachments || [],
        };
        await getTransporter().sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
};
