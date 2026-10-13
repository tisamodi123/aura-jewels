import * as contactService from "../services/contactInquiry.services.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { verifyCaptcha } from "../utils/verifyCaptcha.js";

// ─────────────────────────────────────────────────────────────────────────────
// Submit throttle
//
// The submit endpoint is public and fires two emails per call, so without a cap
// it is a free spam relay against our own SMTP reputation. Same in-process Map
// approach as app/search.controller.js — good enough for a single node; if the
// API is ever scaled horizontally this needs to move to Redis.
//
// Unlike the search limiter, this one evicts expired entries so the Map cannot
// grow without bound across a long-lived process.
// ─────────────────────────────────────────────────────────────────────────────
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000; // 5 messages per 10 minutes per IP
const submitHits = new Map();

const isSubmitRateLimited = (ip) => {
    const now = Date.now();

    for (const [key, entry] of submitHits) {
        if (now > entry.resetTime) submitHits.delete(key);
    }

    const hit = submitHits.get(ip);
    if (!hit || now > hit.resetTime) {
        submitHits.set(ip, { count: 1, resetTime: now + SUBMIT_WINDOW_MS });
        return false;
    }

    hit.count += 1;
    return hit.count > SUBMIT_LIMIT;
};

const clientIp = (req) =>
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

// ─────────────────────────────────────────────────────────────────────────────
// Public
// ─────────────────────────────────────────────────────────────────────────────

export const createContactInquiry = async (req, res) => {
    try {
        if (isSubmitRateLimited(clientIp(req))) {
            return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
                errorCode: STATUS_CODE.TOO_MANY_REQUESTS,
                message: MESSAGES.COMMON.TOO_MANY_REQUESTS,
            });
        }

        const { firstName, lastName, email, subject, message, captcha } = req.body;

        if (!captcha) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Captcha is required",
            });
        }
        await verifyCaptcha(captcha);

        const inquiry = await contactService.createContactInquiry({
            firstName,
            lastName,
            email,
            subject,
            message,
        });

        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: "Thank you for reaching out. Our concierge will contact you within 24 hours.",
            data: { _id: inquiry._id },
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────────────

export const getContactInquiryList = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, subject, search } = req.body;

        const filter = {};
        if (status) filter.status = status;
        if (subject) filter.subject = subject;

        const { total, inquiries } = await contactService.getContactInquiryList(
            filter,
            Number(page),
            Number(limit),
            search
        );

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            total,
            data: inquiries,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const getContactInquiryDetail = async (req, res) => {
    try {
        const inquiry = await contactService.getContactInquiryById(req.params.id);

        if (!inquiry) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            data: inquiry,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const updateContactInquiryStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const updated = await contactService.updateContactInquiryStatus(
            req.params.id,
            status,
            adminNotes
        );

        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.STATUS_UPDATED,
            data: updated,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};

export const deleteContactInquiry = async (req, res) => {
    try {
        const deleted = await contactService.deleteContactInquiry(req.params.id);

        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.COMMON.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.DELETED,
        });
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR,
        });
    }
};
