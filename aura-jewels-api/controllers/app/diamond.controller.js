import mongoose from "mongoose";
import DiamondMaster from "../../models/diamond.model.js";
import Parameter from "../../models/parameter.model.js";
import { STATUS_CODE } from "../../constants/statusCode.constant.js";
import { MESSAGES } from "../../constants/messages.constant.js";
import { getExchangeRateFromRequest, adjustPricesForCurrency } from "../../utils/currencyConvertor.js";

const getParameterIds = async (values) => {
    if (!values) return [];
    const arr = Array.isArray(values) ? values : [values];
    if (arr.length === 0) return [];

    const objectIds = [];
    const strings = [];

    for (const v of arr) {
        if (mongoose.Types.ObjectId.isValid(v) && v.length === 24) {
            objectIds.push(new mongoose.Types.ObjectId(v));
        } else {
            strings.push(v);
        }
    }

    if (strings.length > 0) {
        // Case-insensitive match for name or code
        const regexStrings = strings.map(s => new RegExp(`^${s}$`, 'i'));
        const params = await Parameter.find({
            $or: [
                { name: { $in: regexStrings } },
                { code: { $in: regexStrings } }
            ]
        }).lean();

        for (const p of params) {
            objectIds.push(p._id);
        }
    }

    return objectIds;
};

const escapeRegex = (string) => {
    if (typeof string !== 'string') return '';
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const isValidNumericInput = (val) => {
    if (val === undefined || val === null || val === "") return false;
    const num = Number(val);
    return !isNaN(num) && isFinite(num) && num >= 0;
};

export const diamondList = async function (req, res) {
    try {
        const { page = 1, limit = 10, search, sortBy, sortOrder, priceMin, priceMax, ...filters } = req.body;

        let query = {
            isDeleted: 0,
            status: { $in: ["ACTIVE", "active", "AVAILABLE", "available"] }
        };

        if (search) {
            const searchStr = String(search).trim();
            if (searchStr) {
                const escapedSearch = escapeRegex(searchStr);
                query.$or = [
                    { stockId: { $regex: escapedSearch, $options: "i" } },
                    { certNo: { $regex: escapedSearch, $options: "i" } }
                ];
            }
        }
        
        // Validate numeric query parameters to avoid NaN injection
        if (priceMin !== undefined && priceMin !== null && priceMin !== "" && !isValidNumericInput(priceMin)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid priceMin. Must be a non-negative number."
            });
        }
        if (priceMax !== undefined && priceMax !== null && priceMax !== "" && !isValidNumericInput(priceMax)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid priceMax. Must be a non-negative number."
            });
        }
        if (filters.caratMin !== undefined && filters.caratMin !== null && filters.caratMin !== "" && !isValidNumericInput(filters.caratMin)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid caratMin. Must be a non-negative number."
            });
        }
        if (filters.caratMax !== undefined && filters.caratMax !== null && filters.caratMax !== "" && !isValidNumericInput(filters.caratMax)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid caratMax. Must be a non-negative number."
            });
        }
        if (filters.polish && filters.polish.length > 0) {
            const ids = await getParameterIds(filters.polish);
            if (ids.length) query.polish = { $in: ids };
        }
        if (filters.symmetry && filters.symmetry.length > 0) {
            const ids = await getParameterIds(filters.symmetry);
            if (ids.length) query.symmetry = { $in: ids };
        }
        if (filters.fluorescence && filters.fluorescence.length > 0) {
            const ids = await getParameterIds(filters.fluorescence);
            if (ids.length) query.fluorescence = { $in: ids };
        }
        if (filters.certLab && filters.certLab.length > 0) {
            const ids = await getParameterIds(filters.certLab);
            if (ids.length) query.certLab = { $in: ids };
        }
        
        if (filters.caratMin || filters.caratMax) {
            query.carat = {};
            if (filters.caratMin) query.carat.$gte = Number(filters.caratMin);
            if (filters.caratMax) query.carat.$lte = Number(filters.caratMax);
        }

        // Safely parse and normalize pagination parameters
        let parsedPage = parseInt(page, 10);
        let parsedLimit = parseInt(limit, 10);

        if (isNaN(parsedPage) || parsedPage < 1) {
            parsedPage = 1;
        }
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            parsedLimit = 10;
        } else if (parsedLimit > 100) {
            parsedLimit = 100;
        }

        const options = {
            page: parsedPage,
            limit: parsedLimit,
            skip: (parsedPage - 1) * parsedLimit
        };

        // Resolve parameter lookup filters concurrently using Promise.all
        const filterKeys = ["shape", "color", "clarity", "cut", "polish", "symmetry", "fluorescence", "certLab"];
        const activeFilterKeys = [];
        const activeFilterPromises = [];

        for (const key of filterKeys) {
            const val = filters[key];
            if (val !== undefined && val !== null) {
                const isRequested = Array.isArray(val) ? val.length > 0 : (typeof val === 'string' ? val.trim().length > 0 : true);
                if (isRequested) {
                    activeFilterKeys.push(key);
                    activeFilterPromises.push(getParameterIds(val));
                }
            }
        }

        const resolvedIdsArray = await Promise.all(activeFilterPromises);

        let hasZeroResolvedFilter = false;
        for (let i = 0; i < activeFilterKeys.length; i++) {
            const key = activeFilterKeys[i];
            const ids = resolvedIdsArray[i];
            if (ids.length === 0) {
                hasZeroResolvedFilter = true;
            } else {
                query[key] = { $in: ids };
            }
        }

        // If any explicitly requested parameter filter resolved to 0 valid parameters,
        // return early with empty results, saving database load.
        if (hasZeroResolvedFilter) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: MESSAGES.COMMON.FETCHED,
                total: 0,
                page: options.page,
                limit: options.limit,
                data: []
            });
        }

        // Build carat query
        if (filters.caratMin !== undefined && filters.caratMin !== null && filters.caratMin !== "") {
            if (!query.carat) query.carat = {};
            query.carat.$gte = Number(filters.caratMin);
        }
        if (filters.caratMax !== undefined && filters.caratMax !== null && filters.caratMax !== "") {
            if (!query.carat) query.carat = {};
            query.carat.$lte = Number(filters.caratMax);
        }
        
        // Validate and apply currency conversions
        const { rate, currency } = await getExchangeRateFromRequest(req);
        let safeRate = 1;
        if (typeof rate === 'number' && !isNaN(rate) && isFinite(rate) && rate > 0) {
            safeRate = rate;
        } else {
            console.warn(`[diamondList] Invalid exchange rate: ${rate}. Using fallback 1.`);
        }

        if (priceMin !== undefined && priceMin !== null && priceMin !== "") {
            if (!query.price) query.price = {};
            query.price.$gte = Number(priceMin) / safeRate;
        }
        if (priceMax !== undefined && priceMax !== null && priceMax !== "") {
            if (!query.price) query.price = {};
            query.price.$lte = Number(priceMax) / safeRate;
        }
        
        // Whitelist sort fields to prevent Mongo Injection / performance issues
        const ALLOWED_SORT_FIELDS = [
            "price",
            "carat",
            "createdAt",
            "updatedAt",
            "stockId",
            "certNo",
            "shape",
            "color",
            "clarity",
            "cut",
            "polish",
            "symmetry",
            "fluorescence",
            "certLab"
        ];

        let sortObj = { createdAt: -1 };
        if (sortBy && typeof sortBy === 'string' && ALLOWED_SORT_FIELDS.includes(sortBy)) {
            const order = (sortOrder === 'asc' || sortOrder === '1' || sortOrder === 'ASC') ? 1 : -1;
            sortObj = { [sortBy]: order };
        }

        const aggregationPipeline = [
            { $match: query },
            { $sort: sortObj },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: options.skip },
                        { $limit: options.limit },
                        {
                            $lookup: { from: 'parameters', localField: 'shape', foreignField: '_id', as: 'shape' }
                        },
                        { $unwind: { path: "$shape", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'color', foreignField: '_id', as: 'color' }
                        },
                        { $unwind: { path: "$color", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'clarity', foreignField: '_id', as: 'clarity' }
                        },
                        { $unwind: { path: "$clarity", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'cut', foreignField: '_id', as: 'cut' }
                        },
                        { $unwind: { path: "$cut", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'polish', foreignField: '_id', as: 'polish' }
                        },
                        { $unwind: { path: "$polish", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'symmetry', foreignField: '_id', as: 'symmetry' }
                        },
                        { $unwind: { path: "$symmetry", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'fluorescence', foreignField: '_id', as: 'fluorescence' }
                        },
                        { $unwind: { path: "$fluorescence", preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: { from: 'parameters', localField: 'certLab', foreignField: '_id', as: 'certLab' }
                        },
                        { $unwind: { path: "$certLab", preserveNullAndEmptyArrays: true } },
                        {
                            $addFields: {
                                shape: { $cond: { if: "$shape", then: "$shape.name", else: null } },
                                color: { $cond: { if: "$color", then: "$color.name", else: null } },
                                clarity: { $cond: { if: "$clarity", then: "$clarity.name", else: null } },
                                cut: { $cond: { if: "$cut", then: "$cut.name", else: null } },
                                polish: { $cond: { if: "$polish", then: "$polish.name", else: null } },
                                symmetry: { $cond: { if: "$symmetry", then: "$symmetry.name", else: null } },
                                fluorescence: { $cond: { if: "$fluorescence", then: "$fluorescence.name", else: null } },
                                certLab: { $cond: { if: "$certLab", then: "$certLab.name", else: null } }
                            }
                        }
                    ]
                }
            }
        ];

        const aggregationResult = await DiamondMaster.aggregate(aggregationPipeline);
        const total = aggregationResult[0]?.metadata[0]?.total || 0;
        const diamonds = aggregationResult[0]?.data || [];

        // Adjust prices based on currency using safeRate
        const adjustedDiamonds = diamonds.map(diamond => {
            if (diamond.price) {
                diamond.price = adjustPricesForCurrency(diamond.price, safeRate);
            }
            return diamond;
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.COMMON.FETCHED,
            total,
            page: options.page,
            limit: options.limit,
            data: adjustedDiamonds
        });

    } catch (error) {
        console.error("diamondList error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
};
