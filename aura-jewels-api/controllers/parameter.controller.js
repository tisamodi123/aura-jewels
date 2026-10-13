import {
    check_unique_parameter_db,
    create_parameter_db,
    update_parameter_db,
    delete_parameter_db,
    get_parameter_list_db,
    find_parameter_using_id_db,
    update_parameter_status_db
} from "../services/parameter.services.js";

import Constant from "../constants/user.constant.js";
import BaseURL from "../constants/baseUrl.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import { getUploadedOrCleanFilename, resolveAssetUrl } from "../utils/uploadPaths.js";

export const create_parameter = async function (req, res) {
    try {
        const { type, code, sort } = req.body;

        const codeExists = await check_unique_parameter_db({
            type,
            code,
            isDeleted: 0
        });

        if (codeExists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PARAMETER.UNIQUE_CODE
            });
        }

        const sortExists = await check_unique_parameter_db({
            type,
            sort,
            isDeleted: 0
        });

        if (sortExists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PARAMETER.UNIQUE_SORT
            });
        }

        // The admin form uploads the file under either `image` or `image1`
        // (legacy). Accept both and normalize onto req.body.image so the
        // service can persist the filename.
        // if (req.files && req.files.length) {
        //     const imageFile = req.files.find(
        //         (f) => f.fieldname === "image" || f.fieldname === "image1",
        //     );
        //     if (imageFile) {
        //         req.body.image = imageFile.filename;
        //     }
        // }

        const image = getUploadedOrCleanFilename(req, "image", req.body.image);
        const image1 = getUploadedOrCleanFilename(req, "image1", req.body.image1);
        req.body.image = image !== undefined ? image : image1;
        const response = await create_parameter_db(req);
        if (!response) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PARAMETER.CREATE_FAILED
            });
        }

        const Baseurl = BaseURL(req);
        const responseObj = response.toObject ? response.toObject() : response;
        if (responseObj.image) {
            responseObj.image = resolveAssetUrl(responseObj.image, Baseurl, "uploads/parameterImages") || "";
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PARAMETER.CREATED,
            data: responseObj
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_parameter = async function (req, res) {
    try {
        const { type, code, sort } = req.body;

        const codeExists = await check_unique_parameter_db({
            _id: { $ne: req.params.id },
            type,
            code,
            isDeleted: 0
        });

        if (codeExists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PARAMETER.UNIQUE_CODE
            });
        }

        const sortExists = await check_unique_parameter_db({
            _id: { $ne: req.params.id },
            type,
            sort,
            isDeleted: 0
        });

        if (sortExists) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: MESSAGES.PARAMETER.UNIQUE_SORT
            });
        }

        // The admin form uploads the file under either `image` or `image1`
        // (legacy). Accept both and normalize onto req.body.image so the
        // service can persist the filename.
        // if (req.files && req.files.length) {
        //     const imageFile = req.files.find(
        //         (f) => f.fieldname === "image" || f.fieldname === "image1",
        //     );
        //     if (imageFile) {
        //         req.body.image = imageFile.filename;
        //     }
        // }

        const image = getUploadedOrCleanFilename(req, "image", req.body.image);
        const image1 = getUploadedOrCleanFilename(req, "image1", req.body.image1);
        req.body.image = image !== undefined ? image : image1;

        const response = await update_parameter_db(req);

        if (!response) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PARAMETER.NOT_FOUND
            });
        }

        const Baseurl = BaseURL(req);
        const responseObj = response.toObject ? response.toObject() : response;
        if (responseObj.image) {
            // const fullUrl = `${Baseurl}/uploads/parameterImages/${responseObj.image}`;
            const fullUrl = resolveAssetUrl(responseObj.image, Baseurl, "uploads/parameterImages") || "";
            responseObj.image = fullUrl;
            responseObj.image1 = fullUrl;
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PARAMETER.UPDATED,
            data: responseObj
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const get_parameter = async function (req, res) {
    try {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.body.search || "";

        // `$ne: 1` includes legacy docs missing the isDeleted field.
        const filter = { isDeleted: { $ne: 1 } };
        if (req.body.type) filter.type = req.body.type;
        if (req.body.status) filter.status = req.body.status;
        if (req.body.diamondType) filter.diamondType = req.body.diamondType;
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const { data, total } = await get_parameter_list_db(filter, skip, limit);

        const Baseurl = BaseURL(req);
        const arr = data.map(field => {
            const fieldObj = field.toObject ? field.toObject() : field;
            return {
                ...fieldObj,
                image: field.image
                    //  ? `${Baseurl}/uploads/parameterImages/${field.image}`
                    ? resolveAssetUrl(field.image, Baseurl, "uploads/parameterImages")
                    : undefined
            };
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PARAMETER.LIST_FETCHED,
            data: arr,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const delete_parameter = async function (req, res) {
    try {
        const exists = await find_parameter_using_id_db(req.params.id);
        if (!exists) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PARAMETER.NOT_FOUND
            });
        }

        const data = await delete_parameter_db(req.params.id);
        if (data) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.PARAMETER.DELETED
            });
        }
        return res.status(STATUS_CODE.BAD_REQUEST).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.PARAMETER.DELETE_FAILED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};

export const update_parameter_status = async function (req, res) {
    try {
        const data = await find_parameter_using_id_db(req.params.id);
        if (!data) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PARAMETER.NOT_FOUND
            });
        }

        const status = data.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_parameter_status_db(req.params.id, status);
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: MESSAGES.PARAMETER.NOT_FOUND,
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.PARAMETER.STATUS_UPDATED
        });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
