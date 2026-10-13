import { STATUS_CODE } from '../constants/statusCode.constant.js';
import { MESSAGES } from '../constants/messages.constant.js';

const SOURCES = ['body', 'query', 'params'];

export const validate = (schema, source = 'body') => async (req, res, next) => {
    try {
        if (!SOURCES.includes(source)) {
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: `Unknown validation source: ${source}`
            });
        }

        const data = req[source] ?? {};

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors = error.details.map(d => d.message.replace(/"/g, ''));
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: errors[0] || MESSAGES.COMMON.INVALID_REQUEST,
                errors
            });
        }

        // Express 5 made req.query a getter-only property — assigning to it
        // throws "Cannot set property query ... which has only a getter".
        // Mutate the existing object in place for `query`; safe assignment
        // works for body/params.
        if (source === 'query') {
            for (const key of Object.keys(req.query)) {
                delete req.query[key];
            }
            Object.assign(req.query, value || {});
        } else {
            req[source] = value;
        }
        return next();
    } catch (err) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: err?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export default validate;
