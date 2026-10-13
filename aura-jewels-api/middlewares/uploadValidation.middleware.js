import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

const DEFAULT_ALLOWED_MIME = Constant.MIMETYPE;

export const validateUploadedMimeTypes = (allowed = DEFAULT_ALLOWED_MIME) => (req, res, next) => {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length === 0) return next();

        for (const file of files) {
            if (!allowed.includes(file.mimetype)) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({
                    errorCode: STATUS_CODE.BAD_REQUEST,
                    message: "Invalid file..!"
                });
            }
        }
        return next();
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
