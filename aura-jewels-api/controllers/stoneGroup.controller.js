import { excel_to_array_convertor } from "../utils/excelToArray.js";
import { convertKeysToLowercase } from "../utils/convertKeysToLowercase.js";
import { create_excel_files } from "../utils/createExcelFile.js";
import BaseUrl from "../constants/baseUrl.js";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import StoneGroup from "../models/stoneGroup.model.js";
import mongoose from "mongoose";
import fs from "fs";
import ExcelJS from "exceljs";
import { join } from "path";
import { uploadsPath, resolveUploadedFileUrl } from "../utils/uploadPaths.js";

import {
    insert_update_stone_group_db, update_stone_group_db, get_stone_group_list_db,
    create_stone_group_db, find_duplicate_stone_group_db, get_stone_group_by_id_db
} from "../services/stoneGroup.services.js"

import StoneGroupHistory from "../models/stoneGroupHistory.model.js";
import Parameter from "../models/parameter.model.js";
import Tag from "../models/tag.model.js";
import ProductStone from "../models/productStone.model.js";

export const import_stone_group = async function (req, res) {
    try {

        let baseUrl = BaseUrl(req);

        let data = await excel_to_array_convertor(req);

        if (data?.errorCode) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: data.errorCode,
                message: data.message
            });
        }

        if (!data?.length) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "No data found in file..!"
            });
        }

        let insertStone = [];
        let rejectedStone = [];
        // let importedStone = [];

        let parameters = await Parameter.find({ status: "ACTIVE", isDeleted: 0 });
        // console.log("parameters==================>",parameters)
        // Matches the product-sheet importer's normalisation so both resolve a
        // shape cell the same way.
        const normalize = (str) =>
            (str || "")
                .toString()
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/\s+/g, "")        // remove all spaces
                .replace(/[^a-z0-9]/g, "")  // remove special chars
                .trim();

        const buildResolver = (paramType) => {
            const resolver = new Map();
            const addKey = (raw, doc, rank) => {
                const key = normalize(raw);
                if (!key) return;
                const existing = resolver.get(key);
                if (existing && existing.rank <= rank) return;
                resolver.set(key, { id: doc._id, doc, rank });
            };
            for (const p of parameters) {
                if (p.type !== paramType) continue;
                addKey(p._id?.toString(), p, 0);
                addKey(p.code, p, 0);
                addKey(p.name, p, 1);
                for (const s of (Array.isArray(p.synonyms) ? p.synonyms : [])) {
                    addKey(s, p, 2);
                }
            }
            return resolver;
        };

        const resolvers = {
            shape: buildResolver("shape"),
            color: buildResolver("color"),
            clarity: buildResolver("clarity"),
            cut: buildResolver("cut"),
            polish: buildResolver("polish"),
            fluorescence: buildResolver("fluorescence"),
            symmetry: buildResolver("symmetry"),
            lab: buildResolver("lab")
        };

        // Header lookup helper — accepts both "Stone Type" (lowercased to
        // "stone type") and the legacy "StoneType" -> "stonetype" form.
        const pick = (obj, ...keys) => {
            for (const k of keys) {
                if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
            }
            return undefined;
        };

        for (let item of data) {
            let stone = convertKeysToLowercase(item);

            const stoneTypeRaw = pick(stone, "stone type", "stonetype", "type");
            const gemTypeRaw = pick(stone, "gemtype", "gem type", "creation");
            const shapeRaw = pick(stone, "shape");
            const colorRaw = pick(stone, "color");
            const clarityRaw = pick(stone, "clarity");
            const sizeRaw = pick(stone, "size");
            const lgdPriceRaw = pick(stone, "lgd price", "lgdprice", "lgd_price");
            const naturalPriceRaw = pick(stone, "natural price", "naturalprice", "natural_price");

            // const minCaratRaw = pick(stone, "mincarat", "min carat");
            // const maxCaratRaw = pick(stone, "maxcarat", "max carat");
            // const amountRaw = pick(stone, "amount");

            // -----------------------------
            // VALIDATIONS — every column is its own field, no parsing.
            // -----------------------------
            if (!stoneTypeRaw) {
                stone.issues = "stone type missing";
                console.log("stone type missing", stone);
                rejectedStone.push(stone);
                continue;
            }

            const normStoneType = stoneTypeRaw.toString().toLowerCase().trim();
            if (!Constant?.DIAMOND_TYPES?.ALL_TYPES.includes(normStoneType)) {
                stone.issues = "invalid stone type";
                console.log("invalid stone type", normStoneType);
                rejectedStone.push(stone);
                continue;
            }

            const dbStoneType = normStoneType === "diamond" ? Constant.DIAMOND_TYPES.DIAMOND : Constant.DIAMOND_TYPES.GEMSTONE;

            if (stoneTypeRaw === Constant.DIAMOND_TYPES.GEMSTONE && !gemTypeRaw) {
                stone.issues = "gem type missing";
                console.log("gem type missing");
                rejectedStone.push(stone);
                continue;
            }

            const normType = gemTypeRaw ? gemTypeRaw.toString().toLowerCase().trim() : "";
            // console.log(Constant?.[normStoneType]?.ALL_TYPES, "normType");
            // if (!Constant?.[normStoneType]?.ALL_TYPES.includes(normType)) {
            //     stone.issues = "invalid creation type (DIAMOND TYPEs or GEMSTONE TYPEs)" + normType;
            //     rejectedStone.push(stone);
            //     continue;
            // }



            // if (normStoneType == Constant.DIAMOND_TYPES.DIAMOND) {
            //     if (!Constant?.DIA_TYPES?.ALL_TYPES.includes(normType)) {
            //         stone.issues = "invalid creation type (DIAMOND TYPEs)";
            //         rejectedStone.push(stone);
            //         continue;
            //     }
            // } else if (normStoneType == Constant.DIAMOND_TYPES.GEMSTONE) {
            if (normStoneType == Constant.DIAMOND_TYPES.GEMSTONE && !Constant?.GEM_TYPES?.ALL_TYPES.includes(normType)) {
                stone.issues = "invalid gem type";
                console.log("invalid gem type", normType);
                rejectedStone.push(stone);
                continue;
            }
            // }

            const cutRaw = pick(stone, "cut");
            const polishRaw = pick(stone, "polish");
            const fluorescenceRaw = pick(stone, "fluorescence", "fluor");
            const symmetryRaw = pick(stone, "symmetry", "sym");
            const labRaw = pick(stone, "lab");

            const resolveParamVal = (type, raw, isRequired) => {
                if (!raw) return isRequired ? null : undefined;
                const strVal = String(raw).trim();
                if (!strVal || strVal.toLowerCase() === "undefined" || strVal.toLowerCase() === "null") {
                    return isRequired ? null : undefined;
                }
                const norm = normalize(strVal);
                const match = resolvers[type]?.get(norm);
                if (match && match.id) return new mongoose.Types.ObjectId(match.id.toString());
                if (mongoose.Types.ObjectId.isValid(strVal)) {
                    return new mongoose.Types.ObjectId(strVal);
                }
                return null;
            };

            // Check shape exist or not
            if (!shapeRaw) {
                stone.issues = "shape missing";
                rejectedStone.push(stone);
                continue;
            }

            const shapeId = resolveParamVal("shape", shapeRaw, true);
            if (!shapeId) {
                stone.issues = `invalid shape parameter: ${shapeRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const isDiamond = String(stoneTypeRaw).toLowerCase() === Constant.DIAMOND_TYPES.DIAMOND.toLowerCase();

            if (isDiamond && !colorRaw) {
                stone.issues = "color missing";
                rejectedStone.push(stone);
                continue;
            }

            const colorId = resolveParamVal("color", colorRaw, isDiamond);
            if (colorRaw && colorId === null) {
                stone.issues = `invalid color parameter: ${colorRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            if (isDiamond && !clarityRaw) {
                stone.issues = "clarity missing";
                rejectedStone.push(stone);
                continue;
            }

            const clarityId = resolveParamVal("clarity", clarityRaw, isDiamond);
            if (clarityRaw && clarityId === null) {
                stone.issues = `invalid clarity parameter: ${clarityRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const cutId = resolveParamVal("cut", cutRaw, false);
            if (cutRaw && cutId === null) {
                stone.issues = `invalid cut parameter: ${cutRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const polishId = resolveParamVal("polish", polishRaw, false);
            if (polishRaw && polishId === null) {
                stone.issues = `invalid polish parameter: ${polishRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const fluorId = resolveParamVal("fluorescence", fluorescenceRaw, false);
            if (fluorescenceRaw && fluorId === null) {
                stone.issues = `invalid fluorescence parameter: ${fluorescenceRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const symId = resolveParamVal("symmetry", symmetryRaw, false);
            if (symmetryRaw && symId === null) {
                stone.issues = `invalid symmetry parameter: ${symmetryRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const labId = resolveParamVal("lab", labRaw, false);
            if (labRaw && labId === null) {
                stone.issues = `invalid lab parameter: ${labRaw}`;
                rejectedStone.push(stone);
                continue;
            }

            const lgdPrice = parseFloat(lgdPriceRaw);
            if (lgdPriceRaw && (isNaN(lgdPrice) || lgdPrice <= 0)) {
                stone.issues = "invalid lgdPrice";
                rejectedStone.push(stone);
                continue;
            }

            const naturalPrice = parseFloat(naturalPriceRaw);
            if (naturalPriceRaw && (isNaN(naturalPrice) || naturalPrice <= 0)) {
                stone.issues = "invalid naturalPrice";
                rejectedStone.push(stone);
                continue;
            }

            insertStone.push({
                stoneType: dbStoneType,
                type: normType,
                shape: shapeId,
                color: colorId,
                clarity: clarityId,
                cut: cutId,
                polish: polishId,
                fluorescence: fluorId,
                symmetry: symId,
                lab: labId,
                carat: sizeRaw,
                lgd_price: lgdPriceRaw ? lgdPrice : null,
                natural_price: naturalPriceRaw ? naturalPrice : null,
                createdBy: req.user.userId
            });

            // importedStone.push(stone);
        }

        // -----------------------------
        // VALIDATION GATE — all or nothing
        // -----------------------------
        // The sheet REPLACES the stone-group master, so a partially valid file
        // must never be applied: every row it omits gets pruned below. If any
        // row failed validation we write nothing and hand back the rejects.
        if (rejectedStone.length) {
            const rejectedPath = await create_excel_files(rejectedStone);
            const rejectedFileUrl = rejectedPath.startsWith("http")
                ? rejectedPath
                : (baseUrl + rejectedPath);

            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Validation failed for ${rejectedStone.length} of ${data.length} rows. No data was changed.`,
                result: {
                    totalRows: data.length,
                    valid: insertStone.length,
                    rejected: rejectedStone.length,
                    rejectedUrl: rejectedFileUrl
                }
            });
        }

        if (!insertStone.length) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "No valid rows found in file. No data was changed."
            });
        }

        // -----------------------------
        // UPSERT (preserves _id), then PRUNE
        // -----------------------------
        // We deliberately do NOT delete-then-insert. ProductStone.stoneGroup
        // stores the StoneGroup _id, and calcProductPrice prices a stone at 0
        // when that reference can't be resolved. Upserting on the same natural
        // key the bulk writer uses keeps existing _ids — and therefore every
        // product link — intact; then we remove whatever the sheet no longer
        // contains.
        const val = await insert_update_stone_group_db(insertStone);
        const insertCount = val?.upsertedCount || 0;
        const updateCount = val?.modifiedCount || 0;

        // Must mirror the upsert filter in insert_update_stone_group_db exactly:
        // clarity only participates for diamonds.
        //
        // Every component is coerced to a string. Sheet rows carry raw Excel
        // values (carat/color can be numbers) while the stored docs hold the
        // Mongoose-cast strings — comparing them untyped would mark every
        // existing row stale and delete the whole collection.
        const keyPart = (v) => (v === null || v === undefined ? "" : String(v));

        const naturalKey = (d) => JSON.stringify([
            keyPart(d.stoneType),
            keyPart(d.type),
            d.shape ? String(d.shape) : "",
            keyPart(d.color),
            keyPart(d.carat),
            d.stoneType === Constant.DIAMOND_TYPES.DIAMOND ? keyPart(d.clarity) : ""
        ]);

        const sheetKeys = new Set(insertStone.map(naturalKey));

        // Read AFTER the upsert so rows just written are present and survive.
        const existing = await StoneGroup.find(
            {},
            { stoneType: 1, type: 1, shape: 1, color: 1, clarity: 1, carat: 1 }
        ).lean();

        const staleIds = existing
            .filter((d) => !sheetKeys.has(naturalKey(d)))
            .map((d) => d._id);

        // Deleting a stone group that products still reference leaves those
        // ProductStone rows dangling, and the next price sync silently prices
        // them at 0. Per the chosen policy we still delete, but we report it.
        let orphanedStones = 0;
        let orphanedItemCodes = [];

        const CHUNK = 1000;
        if (staleIds.length) {
            for (let i = 0; i < staleIds.length; i += CHUNK) {
                const slice = staleIds.slice(i, i + CHUNK);
                orphanedStones += await ProductStone.countDocuments({
                    stoneGroup: { $in: slice }
                });
            }

            if (orphanedStones > 0) {
                const sample = await ProductStone.find(
                    { stoneGroup: { $in: staleIds.slice(0, CHUNK) } },
                    { itemCode: 1 }
                ).limit(50).lean();
                orphanedItemCodes = [...new Set(sample.map((s) => s.itemCode).filter(Boolean))];
            }

            for (let i = 0; i < staleIds.length; i += CHUNK) {
                await StoneGroup.deleteMany({ _id: { $in: staleIds.slice(i, i + CHUNK) } });
            }
        }

        const deletedCount = staleIds.length;
        const rejectedUrl = "";

        let file = Array.isArray(req.files) ? req.files[0] : null;

        let fileName = file?.filename || "";
        let originalName = file?.originalname || "";

        let uploadedFileUrl = null;

        if (insertCount > 0 || updateCount > 0 || deletedCount > 0) {
            // Prefer the S3 URL (production memoryStorage sets no `file.path`);
            // falls back to the local /uploads/... path in dev.
            uploadedFileUrl = resolveUploadedFileUrl(file, baseUrl);
        }
        // if (importedStone.length) {
        //     let importedFilePath = await create_excel_files(importedStone);
        //     uploadedFileUrl = importedFilePath.startsWith("http") ? importedFilePath : (baseUrl + importedFilePath);
        // }
        // -----------------------------
        // SAVE IMPORT HISTORY (NO batchLogs)
        // -----------------------------
        await StoneGroupHistory.create({
            userFileName: originalName,
            fileName: fileName,
            uploadedFileUrl,
            uploadedBy: req.user.userId,
            rejectedUrl
        });

        // -----------------------------
        // RESPONSE
        // -----------------------------
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: orphanedStones > 0
                ? `Stone groups replaced. WARNING: ${orphanedStones} product stone(s) referenced a removed stone group and will price at 0 on the next price sync.`
                : "Stone groups replaced successfully..!",
            result: {
                totalRows: data.length,
                insert: insertCount,
                update: updateCount,
                deleted: deletedCount,
                rejected: 0,
                orphanedStones,
                orphanedItemCodes
            }
            // uploadedFileUrl,
            // rejectedUrl
        });
        console.log("+++++++++++++++++>", parameterResolvers)
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const seed_and_import_stone_group = async function (req, res) {
    try {

        let baseUrl = BaseUrl(req);

        let data = await excel_to_array_convertor(req);

        if (data?.errorCode) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: data.errorCode,
                message: data.message
            });
        }

        if (!data.length) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "No data found in file..!"
            });
        }

        let insertStone = [];
        let rejectedStone = [];
        // let importedStone = [];

        let parameters = await Parameter.find({ status: "ACTIVE", isDeleted: 0 });
        let tags = await Tag.find({ status: "ACTIVE" });

        const normalize = (str) =>
            (str || "")
                .toString()
                .toLowerCase()
                .replace(/\s+/g, "")        // remove all spaces
                .replace(/[^a-z0-9]/g, "")  // remove special chars
                .trim();

        const parameterMaps = {
            shape: new Set(parameters.filter(p => p.type === "shape").map(p => normalize(p.code))),
            color: new Set(parameters.filter(p => p.type === "color").map(p => normalize(p.code))),
            clarity: new Set(parameters.filter(p => p.type === "clarity").map(p => normalize(p.code))),
        };

        const parameterIdMaps = {
            shape: Object.fromEntries(parameters.filter(p => p.type === "shape").map(p => [normalize(p.code), p._id])),
            color: Object.fromEntries(parameters.filter(p => p.type === "color").map(p => [normalize(p.code), p._id])),
            clarity: Object.fromEntries(parameters.filter(p => p.type === "clarity").map(p => [normalize(p.code), p._id])),
        };

        const tagSet = new Set(tags.map(t => normalize(t.name)));
        const tagIdMap = Object.fromEntries(tags.map(t => [normalize(t.name), t._id]));

        const maxSorts = {
            shape: 0,
            color: 0,
            clarity: 0,
        };
        for (let p of parameters) {
            if (maxSorts[p.type] !== undefined && p.sort > maxSorts[p.type]) {
                maxSorts[p.type] = p.sort;
            }
        }

        const getOrCreateParameter = async (type, rawValue, userId) => {
            if (!rawValue) return null;
            let normalized = normalize(rawValue);
            if (!normalized) return null;

            if (parameterIdMaps[type][normalized]) {
                return parameterIdMaps[type][normalized];
            }

            maxSorts[type] += 1;
            const nextSort = maxSorts[type];

            const newParam = await Parameter.create({
                type,
                name: rawValue.trim(),
                code: rawValue.trim().toUpperCase(),
                sort: nextSort,
                status: "ACTIVE",
                isDeleted: 0,
                createdBy: userId || null
            });

            parameterMaps[type].add(normalized);
            parameterIdMaps[type][normalized] = newParam._id;

            return newParam._id;
        };

        const getOrCreateTag = async (rawValue, userId) => {
            if (!rawValue) return null;
            let normalized = normalize(rawValue);
            if (!normalized) return null;

            if (tagIdMap[normalized]) {
                return tagIdMap[normalized];
            }

            const newTag = await Tag.create({
                name: rawValue.trim(),
                status: "ACTIVE",
                createdBy: userId || null
            });

            tagSet.add(normalized);
            tagIdMap[normalized] = newTag._id;

            return newTag._id;
        };

        const pick = (obj, ...keys) => {
            for (const k of keys) {
                if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
            }
            return undefined;
        };

        for (let item of data) {

            let stone = convertKeysToLowercase(item);

            const stoneTypeRaw = pick(stone, "stone type", "stonetype");
            const shapeRaw = pick(stone, "shape");
            const colorRaw = pick(stone, "color");
            const clarityRaw = pick(stone, "clarity");
            const minCaratRaw = pick(stone, "mincarat", "min carat");
            const maxCaratRaw = pick(stone, "maxcarat", "max carat");
            const amountRaw = pick(stone, "amount");

            if (!stoneTypeRaw) {
                stone.issues = "stone type missing";
                rejectedStone.push(stone);
                continue;
            }

            const normStoneType = stoneTypeRaw.toString().toLowerCase().trim();
            const dbStoneType = normStoneType === "diamond" ? Constant.STONETYPE.DIAMOND : Constant.STONETYPE.GEMSTONE;

            if (!shapeRaw) {
                stone.issues = "shape missing";
                rejectedStone.push(stone);
                continue;
            }

            if (!colorRaw) {
                stone.issues = "color missing";
                rejectedStone.push(stone);
                continue;
            }

            const isDiamond = String(stoneTypeRaw).toLowerCase() ===
                Constant.STONETYPE.DIAMOND.toLowerCase();
            if (isDiamond && !clarityRaw) {
                stone.issues = "clarity missing";
                rejectedStone.push(stone);
                continue;
            }

            // -----------------------------
            // RESOLVE / AUTO-CREATE PARAMS
            // -----------------------------
            const shapeId = await getOrCreateParameter("shape", shapeRaw, req.user?.userId);
            const colorId = await getOrCreateParameter("color", colorRaw, req.user?.userId);
            const clarityId = clarityRaw
                ? await getOrCreateParameter("clarity", clarityRaw, req.user?.userId)
                : null;

            // -----------------------------
            // RESOLVE / AUTO-CREATE TAGS (optional column for seed import)
            // -----------------------------
            const tagRaw = pick(stone, "tags", "tag", "tagname");
            if (tagRaw) {
                const tagList = String(tagRaw).split(",");
                for (const tagVal of tagList) {
                    if (tagVal.trim()) {
                        await getOrCreateTag(tagVal, req.user?.userId);
                    }
                }
            }

            const minCarat = parseFloat(minCaratRaw);
            const maxCarat = parseFloat(maxCaratRaw);

            if (isNaN(minCarat) || isNaN(maxCarat) || minCarat <= 0 || maxCarat <= 0) {
                stone.issues = "invalid carat range";
                rejectedStone.push(stone);
                continue;
            }
            if (minCarat > maxCarat) {
                stone.issues = "minCarat greater than maxCarat";
                rejectedStone.push(stone);
                continue;
            }

            const amount = parseFloat(amountRaw);
            if (isNaN(amount) || amount <= 0) {
                stone.issues = "invalid amount";
                rejectedStone.push(stone);
                continue;
            }

            insertStone.push({
                stoneType: dbStoneType,
                shape: shapeId,
                color: colorId,
                clarity: clarityId,
                carat: minCarat === maxCarat ? String(minCarat) : `${minCarat} to ${maxCarat}`,
                minCarat,
                maxCarat,
                amount,
                createdBy: req.user?.userId
            });

            // importedStone.push(stone);
        }

        let insertCount = 0;
        let updateCount = 0;

        // -----------------------------
        // INSERT / UPDATE
        // -----------------------------
        if (insertStone.length) {
            let val = await insert_update_stone_group_db(insertStone);

            insertCount = val?.upsertedCount || 0;
            updateCount = val?.modifiedCount || 0;
        }

        // -----------------------------
        // REJECT FILE
        // -----------------------------
        let rejectedUrl = "";

        if (rejectedStone.length) {
            let filePath = await create_excel_files(rejectedStone);
            rejectedUrl = filePath.startsWith("http") ? filePath : (baseUrl + filePath);
        }

        let file = Array.isArray(req.files) ? req.files[0] : null;

        let fileName = file?.filename || "";
        let originalName = file?.originalname || "";

        let uploadedFileUrl = null;

        if (insertCount > 0 || updateCount > 0) {
            // Prefer the S3 URL (production memoryStorage sets no `file.path`);
            // falls back to the local /uploads/... path in dev.
            uploadedFileUrl = resolveUploadedFileUrl(file, baseUrl);
        }
        //  if (importedStone.length) {
        //     let importedFilePath = await create_excel_files(importedStone);
        //     uploadedFileUrl = importedFilePath.startsWith("http") ? importedFilePath : (baseUrl + importedFilePath);
        //  }

        // -----------------------------
        // SAVE IMPORT HISTORY (NO batchLogs)
        // -----------------------------
        await StoneGroupHistory.create({
            userFileName: originalName,
            fileName: fileName,
            uploadedFileUrl,
            uploadedBy: req.user.userId,
            rejectedUrl
        });

        // -----------------------------
        // RESPONSE
        // -----------------------------
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group import successfully..!",
            result: {
                insert: insertCount,
                update: updateCount,
                rejected: rejectedStone.length
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const get_stone_group = async function (req, res) {
    try {

        let page = parseInt(req.body.page) || 1;
        let limit = parseInt(req.body.limit) || 10;
        let search = req.body.search || "";

        const filters = {
            stoneType: req.body.stoneType || "",
            type: req.body.type || "",
            shape: req.body.shape || "",
            color: req.body.color || "",
            clarity: req.body.clarity || "",
            status: req.body.status || "",
            caratMin: req.body.caratMin,
            caratMax: req.body.caratMax,
        };

        let { data, total } = await get_stone_group_list_db(page, limit, search, filters);

        let finalData = data.map(li => ({
            _id: li._id,
            id: li._id,
            shape: typeof li.shape === "object" && li.shape !== null ? (li.shape?.name || li.shape?.code || "") : String(li.shape || ""),
            shapeId: li.shape?._id || (mongoose.Types.ObjectId.isValid(li.shape) ? li.shape : null),
            type: li.type || "",
            color: typeof li.color === "object" && li.color !== null ? (li.color?.name || li.color?.code || "") : String(li.color || ""),
            colorId: li.color?._id || (mongoose.Types.ObjectId.isValid(li.color) ? li.color : null),
            clarity: typeof li.clarity === "object" && li.clarity !== null ? (li.clarity?.name || li.clarity?.code || "") : String(li.clarity || ""),
            clarityId: li.clarity?._id || (mongoose.Types.ObjectId.isValid(li.clarity) ? li.clarity : null),
            cut: typeof li.cut === "object" && li.cut !== null ? (li.cut?.name || li.cut?.code || "") : String(li.cut || ""),
            cutId: li.cut?._id || (mongoose.Types.ObjectId.isValid(li.cut) ? li.cut : null),
            polish: typeof li.polish === "object" && li.polish !== null ? (li.polish?.name || li.polish?.code || "") : String(li.polish || ""),
            polishId: li.polish?._id || (mongoose.Types.ObjectId.isValid(li.polish) ? li.polish : null),
            fluorescence: typeof li.fluorescence === "object" && li.fluorescence !== null ? (li.fluorescence?.name || li.fluorescence?.code || "") : String(li.fluorescence || ""),
            fluorescenceId: li.fluorescence?._id || (mongoose.Types.ObjectId.isValid(li.fluorescence) ? li.fluorescence : null),
            symmetry: typeof li.symmetry === "object" && li.symmetry !== null ? (li.symmetry?.name || li.symmetry?.code || "") : String(li.symmetry || ""),
            symmetryId: li.symmetry?._id || (mongoose.Types.ObjectId.isValid(li.symmetry) ? li.symmetry : null),
            lab: typeof li.lab === "object" && li.lab !== null ? (li.lab?.name || li.lab?.code || "") : String(li.lab || ""),
            labId: li.lab?._id || (mongoose.Types.ObjectId.isValid(li.lab) ? li.lab : null),
            carat: li.carat,
            lgdPrice: li.lgd_price,
            naturalPrice: li.natural_price,
            stoneType: li.stoneType,
            status: li.status
        }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group list fetched successfully..!",
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: finalData,
        });

    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
    }
};

// A blank price means "not offered in this origin", which the pricing code treats
// as absent (getStonePrice falls through to the other origin). "" must become
// null, not 0 — 0 would be a real, published rate of zero.
const toPriceOrNull = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Add a single stone group.
 *
 * Until now the only way to get a row into the master was importStoneGroup, which
 * DELETES the entire collection and re-inserts it — orphaning every
 * ProductStone.stoneGroup in the process. So adding one missing rate meant
 * breaking every product's price. This endpoint exists so a gap in the rate sheet
 * (e.g. no EF/VVS bucket at 1.00-1.49 ct) can be filled in place.
 */
export const add_stone_group = async function (req, res) {
    try {
        const stoneType = req.body.stoneType;
        const isDiamond = stoneType === Constant.DIAMOND_TYPES.DIAMOND;

        if (!isDiamond && !req.body.type) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Gem type is required for a colour stone."
            });
        }
        if (isDiamond && !req.body.clarity) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Clarity is required for a diamond."
            });
        }

        const shape = await Parameter.findOne({ _id: req.body.shape, type: "shape", isDeleted: 0 }).lean();
        if (!shape) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "Invalid shape."
            });
        }

        const resolveParamId = async (type, val) => {
            if (!val) return null;
            if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
            const norm = String(val).toLowerCase().replace(/&/g, "and").replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").trim();
            const params = await Parameter.find({ type, status: "ACTIVE", isDeleted: 0 }).lean();
            for (const p of params) {
                const keys = [p._id?.toString(), p.code, p.name, ...(Array.isArray(p.synonyms) ? p.synonyms : [])].map(k => (k || "").toString().toLowerCase().replace(/&/g, "and").replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").trim()).filter(Boolean);
                if (keys.includes(norm)) return p._id;
            }
            return null;
        };

        const colorId = await resolveParamId("color", req.body.color);
        const clarityId = isDiamond ? await resolveParamId("clarity", req.body.clarity) : null;
        const cutId = await resolveParamId("cut", req.body.cut);
        const polishId = await resolveParamId("polish", req.body.polish);
        const fluorId = await resolveParamId("fluorescence", req.body.fluorescence);
        const symId = await resolveParamId("symmetry", req.body.symmetry);
        const labId = await resolveParamId("lab", req.body.lab);

        const payload = {
            stoneType,
            type: isDiamond ? null : req.body.type,
            shape: shape._id,
            color: colorId || (req.body.color ? String(req.body.color).trim().toUpperCase() : null),
            clarity: clarityId || (req.body.clarity ? String(req.body.clarity).trim().toUpperCase() : ""),
            cut: cutId || null,
            polish: polishId || null,
            fluorescence: fluorId || null,
            symmetry: symId || null,
            lab: labId || null,
            carat: String(req.body.carat).trim(),
            lgd_price: toPriceOrNull(req.body.lgdPrice ?? req.body.lgd_price),
            natural_price: toPriceOrNull(req.body.naturalPrice ?? req.body.natural_price),
            status: req.body.status || Constant.STATUS.ACTIVE,
            createdBy: req.user.userId,
            updatedBy: req.user.userId
        };

        if (payload.lgd_price === null && payload.natural_price === null) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "At least one of LGD price or Natural price is required."
            });
        }

        const duplicate = await find_duplicate_stone_group_db(payload);
        if (duplicate) {
            return res.status(STATUS_CODE.CONFLICT).json({
                errorCode: STATUS_CODE.CONFLICT,
                message: `A stone group already exists for ${payload.color}/${payload.clarity || "-"} ${shape.name || shape.code} at ${payload.carat}.`
            });
        }

        const created = await create_stone_group_db(payload);

        return res.status(STATUS_CODE.CREATED).json({
            errorCode: STATUS_CODE.CREATED,
            message: "Stone group added successfully..!",
            data: { _id: created._id, id: created._id }
        });
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
    }
};

export const update_stone_group = async function (req, res) {
    try {
        const existing = await get_stone_group_by_id_db(req.params.id);
        if (!existing) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ errorCode: STATUS_CODE.NOT_FOUND, message: 'Stone group not found..!' });
        }

        let updateData = {
            updatedBy: req.user.userId
        };

        // Prices are only touched when the client actually sent them, so a
        // price-only edit cannot wipe the identity fields and vice versa.
        if (req.body.lgdPrice !== undefined || req.body.lgd_price !== undefined) {
            updateData.lgd_price = toPriceOrNull(req.body.lgdPrice ?? req.body.lgd_price);
        }
        if (req.body.naturalPrice !== undefined || req.body.natural_price !== undefined) {
            updateData.natural_price = toPriceOrNull(req.body.naturalPrice ?? req.body.natural_price);
        }
        if (req.body.status !== undefined) updateData.status = req.body.status;

        // Identity fields.
        if (req.body.stoneType !== undefined) updateData.stoneType = req.body.stoneType;
        if (req.body.type !== undefined) updateData.type = req.body.type || null;
        if (req.body.color !== undefined) {
            const colorId = await resolveParamId("color", req.body.color);
            updateData.color = colorId || String(req.body.color).trim().toUpperCase();
        }
        if (req.body.clarity !== undefined) {
            const clarityId = await resolveParamId("clarity", req.body.clarity);
            updateData.clarity = clarityId || String(req.body.clarity || "").trim().toUpperCase();
        }
        if (req.body.carat !== undefined) updateData.carat = String(req.body.carat).trim();

        if (req.body.shape !== undefined) {
            const shape = await Parameter.findOne({ _id: req.body.shape, type: "shape", isDeleted: 0 }).lean();
            if (!shape) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ errorCode: STATUS_CODE.BAD_REQUEST, message: "Invalid shape." });
            }
            updateData.shape = shape._id;
        }

        // Refuse to create a second row with the same natural key — pricing would
        // then have two candidates and refuse to price the stone at all.
        const identityTouched = ["stoneType", "type", "shape", "color", "clarity", "carat"]
            .some((k) => updateData[k] !== undefined);

        if (identityTouched) {
            const merged = {
                stoneType: updateData.stoneType ?? existing.stoneType,
                type: updateData.type ?? existing.type,
                shape: updateData.shape ?? existing.shape,
                color: updateData.color ?? existing.color,
                clarity: updateData.clarity ?? existing.clarity,
                carat: updateData.carat ?? existing.carat,
            };
            const duplicate = await find_duplicate_stone_group_db(merged, req.params.id);
            if (duplicate) {
                return res.status(STATUS_CODE.CONFLICT).json({
                    errorCode: STATUS_CODE.CONFLICT,
                    message: `Another stone group already uses ${merged.color}/${merged.clarity || "-"} at ${merged.carat}.`
                });
            }
        }

        const finalLgd = updateData.lgd_price !== undefined ? updateData.lgd_price : existing.lgd_price;
        const finalNatural = updateData.natural_price !== undefined ? updateData.natural_price : existing.natural_price;
        if ((finalLgd === null || finalLgd === undefined) && (finalNatural === null || finalNatural === undefined)) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: "At least one of LGD price or Natural price is required."
            });
        }

        let upd = await update_stone_group_db(req.params.id, updateData);

        if (upd) {
            return res.status(STATUS_CODE.OK).json({ errorCode: STATUS_CODE.OK, message: 'Stone group update successfully..!' })
        } else {
            return res.status(STATUS_CODE.NOT_FOUND).json({ errorCode: STATUS_CODE.NOT_FOUND, message: 'Stone group not found..!' })
        }

    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
    }
};

export const update_stone_group_status = async function (req, res) {
    try {

        let exist = await StoneGroup.findOne({ _id: req.params.id });

        if (!exist) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Stone group not found..!"
            });
        }

        let status = exist.status === Constant.STATUS.ACTIVE
            ? Constant.STATUS.SUSPENDED
            : Constant.STATUS.ACTIVE;

        const updated = await update_stone_group_db(req.params.id, {
            status,
            updatedBy: req.user.userId
        });
        if (!updated) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Stone group not found..!"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Status updated successfully..!"
        });

    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
    }
};

export const export_stone_group = async (req, res) => {
    try {
        const Baseurl = BaseUrl(req);

        // -----------------------------
        // FETCH DATA WITH FILTERS/SELECTION
        // -----------------------------
        let query = {};
        if (req.body?.selectedIds && Array.isArray(req.body.selectedIds) && req.body.selectedIds.length > 0) {
            query._id = { $in: req.body.selectedIds };
        } else if (req.body?.search) {
            const search = req.body.search;
            const matchedParams = await Parameter.find({
                name: { $regex: search, $options: "i" },
                status: "ACTIVE",
                isDeleted: 0
            }).select("_id");
            const paramIds = matchedParams.map(p => p._id);

            query = {
                $or: [
                    { shape: { $in: paramIds } },
                    { color: { $in: paramIds } },
                    { clarity: { $in: paramIds } },
                    { stoneType: { $regex: search, $options: "i" } }
                ]
            };
        }

        const stoneGroups = await StoneGroup.find(query)
            .populate("shape")
            .sort({ createdAt: -1 });

        // -----------------------------
        // HANDLE EMPTY DATA
        // -----------------------------
        if (!stoneGroups.length) {
            return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.OK,
                message: "No data found to export",
                data: []
            });
        }

        // -----------------------------
        // TRANSFORM DATA — columns match the StoneGroup schema 1:1 so the
        // exported file is the same shape the importer reads:
        //   Stone Type, Shape, Color, Clarity, MinCarat, MaxCarat, Amount
        // No name concatenation, no size range parsing — every value is its
        // own column. Amount is numeric only (no currency prefix).
        // -----------------------------
        const valueOf = (param) =>
            param?.code || param?.name || param || "";

        const transformedData = stoneGroups.map((item) => ({
            "Stone Type": item.stoneType || "",
            "Gem Type": item.type || "",
            Shape: valueOf(item.shape),
            Color: valueOf(item.color),
            Clarity: valueOf(item.clarity),
            Size: item.carat ?? "",
            "LGD Price": item.lgd_price ?? "",
            "Natural Price": item.natural_price ?? "",
        }));

        // -----------------------------
        // EXCEL CREATE
        // -----------------------------
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("StoneGroups");

        const headers = Object.keys(transformedData[0]);
        sheet.addRow(headers);

        // HEADER STYLE
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ADD8E6" }
            };
        });

        // DATA ROWS
        transformedData.forEach((row) => {
            sheet.addRow(headers.map((h) => row[h] ?? ""));
        });

        // AUTO WIDTH
        sheet.columns.forEach((col) => {
            let max = 10;
            col.eachCell((cell) => {
                const len = cell.value ? cell.value.toString().length : 10;
                if (len > max) max = len;
            });
            col.width = max + 2;
        });

        // -----------------------------
        // SAVE FILE
        // -----------------------------
        const fileName = `stone_group_export_${Date.now()}.xlsx`;
        const dir = uploadsPath("exportstonegroup");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = join(dir, fileName);

        await workbook.xlsx.writeFile(filePath);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group export successful",
            url: Baseurl + `/uploads/exportstonegroup/${fileName}`
        });

    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const get_stone_group_history = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || parseInt(req.body?.page) || 1;
        let limit = parseInt(req.query.limit) || parseInt(req.body?.limit) || 10;
        let skip = (page - 1) * limit;

        // -----------------------------
        // TOTAL COUNT
        // -----------------------------
        let total = await StoneGroupHistory.countDocuments();

        // -----------------------------
        // FETCH DATA
        // -----------------------------
        let data = await StoneGroupHistory.find()
            .populate({
                path: "uploadedBy",
                model: "User",
                select: "name email"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // -----------------------------
        // FORMAT DATA
        // -----------------------------
        let formatted = data.map(d => {

            let createdDate = new Date(d.createdAt);

            let formattedDateTime = createdDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }).replace(",", "").toLowerCase();

            return {
                _id: d._id,

                fileName: d.userFileName,
                uploadedFileUrl: d.uploadedFileUrl,
                rejectedFileUrl: d.rejectedUrl,

                uploadedBy: d.uploadedBy
                    ? {
                        name: d.uploadedBy.name,
                        email: d.uploadedBy.email
                    }
                    : null,

                createdAt: formattedDateTime
            };
        });

        // -----------------------------
        // RESPONSE
        // -----------------------------
        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group history fetched successfully",
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: formatted
        });

    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const delete_stone_group = async function (req, res) {
    try {
        const id = req.params.id;
        const deleted = await StoneGroup.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(STATUS_CODE.NOT_FOUND).json({
                errorCode: STATUS_CODE.NOT_FOUND,
                message: "Stone group not found..!"
            });
        }

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group deleted successfully..!"
        });
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const get_distinct_stone_attributes = async function (req, res) {
    try {
        const rawColors = await StoneGroup.distinct("color", { color: { $ne: null, $exists: true } });
        const rawClarities = await StoneGroup.distinct("clarity", { clarity: { $ne: null, $exists: true } });

        const colorIds = rawColors.filter(c => c && mongoose.Types.ObjectId.isValid(c));
        const colorDocs = await Parameter.find({ _id: { $in: colorIds } }).select("_id name code").lean();
        const colorMap = new Map(colorDocs.map(c => [c._id.toString(), c.name || c.code]));
        const filteredColors = [...new Set(rawColors.map(c => {
            const str = String(c).trim();
            return colorMap.get(str) || str;
        }))].filter(Boolean).sort();

        const clarityIds = rawClarities.filter(c => c && mongoose.Types.ObjectId.isValid(c));
        const clarityDocs = await Parameter.find({ _id: { $in: clarityIds } }).select("_id name code").lean();
        const clarityMap = new Map(clarityDocs.map(c => [c._id.toString(), c.name || c.code]));
        const filteredClarities = [...new Set(rawClarities.map(c => {
            const str = String(c).trim();
            return clarityMap.get(str) || str;
        }))].filter(Boolean).sort();

        // Additive keys for the admin list filters. `shapes` are Parameter refs,
        // so resolve the ids actually in use rather than listing every shape.
        const stoneTypes = (await StoneGroup.distinct("stoneType", { stoneType: { $ne: null } }))
            .filter(Boolean).sort();

        const shapeIds = await StoneGroup.distinct("shape", { shape: { $ne: null } });
        const shapeDocs = await Parameter.find({ _id: { $in: shapeIds } })
            .select("_id name code")
            .sort({ name: 1 })
            .lean();
        const shapes = shapeDocs.map(s => ({ _id: s._id, name: s.name || s.code || "" }));

        // `allShapes` is every shape in the Parameter master, not just those a
        // stone group already uses — the Add form must be able to introduce the
        // first group for a shape.
        const allShapeDocs = await Parameter.find({ type: "shape", status: "ACTIVE", isDeleted: 0 })
            .select("_id name code")
            .sort({ name: 1 })
            .lean();
        const allShapes = allShapeDocs.map(s => ({ _id: s._id, name: s.name || s.code || "" }));

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Distinct stone attributes fetched successfully",
            data: {
                colors: filteredColors,
                clarities: filteredClarities,
                stoneTypes,
                shapes,
                allShapes
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};

export const get_stone_group_combinations = async function (req, res) {
    try {
        const combinations = await StoneGroup.aggregate([
            { $match: { stoneType: "diamond", color: { $ne: null, $exists: true }, clarity: { $ne: null, $exists: true } } },
            { $group: { _id: { color: "$color", clarity: "$clarity" } } },
            { $project: { _id: 0, color: "$_id.color", clarity: "$_id.clarity" } },
            { $sort: { color: 1, clarity: 1 } }
        ]);

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Stone group combinations fetched successfully",
            data: combinations
        });
    } catch (error) {
        console.log(error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error.message
        });
    }
};


/**
 * 
 * 
 i want to store like this object in liker 

 this is Synonyms

shape={
rd:_id,
round:_id,
rnd:_id 
pear:_id
}
color={
d:_id,
E:_id 
}

same as object of clerity dont store in one the problem is when color clerity same to store the first find value store fix this
 */