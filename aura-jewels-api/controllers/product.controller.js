import mongoose from "mongoose";
import Product from "../models/product.model.js";
import ProductStone from "../models/productStone.model.js";
import User from "../models/user.model.js";
import Constant from "../constants/user.constant.js";
import BaseURL from "../constants/baseUrl.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import fs from "fs";
import ExcelJS from "exceljs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { uploadsPath, resolveAssetUrl } from "../utils/uploadPaths.js";

import Category from "../models/category.model.js";
import CollectionModel from "../models/collection.model.js";
import StoneGroup from "../models/stoneGroup.model.js";
import Tag from "../models/tag.model.js";
import Sizes from "../models/sizes.model.js";
import Metal from "../models/metal.model.js";
import MetalPrice from "../models/metalPrice.model.js";
import chargesModel from "../models/charges.model.js";
import Parameter from "../models/parameter.model.js";
import { absolutizeImages, decorateRedirects } from "../utils/homeRedirect.js";
import { buildRedirectMaps } from "../utils/redirectMaps.js";
import { appendMediaUrls } from "../utils/imageUrl.js";

import {
  safeString,
  normalize,
  normalizeColor,
  normalizeClarity,
  toNumber,
  extractCarat,
  parseObjectIdList,
  loadValidationMasters,
  validateProduct,
  validateStones,
  loadStonesValidationMasters,
} from "../services/productValidation.services.js";
import { createSlug } from "../utils/createSlug.js";
import { calculateProductsPriceService } from "../services/calcProductPrice.services.js";
import { create_excel_files } from "../utils/createExcelFile.js";
import { generateProductReportPDF } from "../utils/generateReciept.js";
import { uploadBufferToS3 } from "../utils/multer.js";

const toObjectIdOrString = (val) => {
  if (!val) return null;
  if (mongoose.Types.ObjectId.isValid(val)) {
    return new mongoose.Types.ObjectId(val);
  }
  return val.toString().toLowerCase();
};

// export const addProduct = async (req, res) => {
//     try {
//         // Convert to ObjectId helper
//         const toObjectId = (id) => (id && mongoose.Types.ObjectId.isValid(id)) ? new mongoose.Types.ObjectId(id) : null;

//         // Parse arrays (IDs)
//         const subCategoryId = parseObjectIdList(req.body.subCategoryId);
//         const collectionId = parseObjectIdList(req.body.collectionId);
//         const tags = parseObjectIdList(req.body.tags);

//         // similarProducts / combineWith — stored as plain itemCode strings
//         // on the product. The admin form posts them as comma-separated
//         // strings (matching the import sheet's "SimilarProducts" /
//         // "CombineWith" cell format). Accept arrays too for callers that
//         // already split.
//         const parseItemCodeList = (raw) => {
//             if (!raw) return [];
//             if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
//             return String(raw)
//                 .split(",")
//                 .map((x) => x.trim())
//                 .filter(Boolean);
//         };
//         const similarProducts = parseItemCodeList(req.body.similarProducts);
//         const combineWith = parseItemCodeList(req.body.combineWith);

//         // Parse images & videos
//         let images = [];
//         if (req.body.images) {
//             try {
//                 images = typeof req.body.images === 'string'
//                     ? JSON.parse(req.body.images)
//                     : req.body.images;
//             } catch (err) {
//                 console.log("Error parsing images:", err);
//             }
//         }
//         if (!Array.isArray(images)) images = [];

//         let videos = [];
//         if (req.body.videos) {
//             try {
//                 videos = typeof req.body.videos === 'string'
//                     ? JSON.parse(req.body.videos)
//                     : req.body.videos;
//             } catch (err) {
//                 console.log("Error parsing videos:", err);
//             }
//         }
//         if (!Array.isArray(videos)) videos = [];

//         if (req.body.videoUrl && videos.length === 0) {
//             videos.push({
//                 MediaLocation: req.body.videoUrl,
//                 IsMainMedia: true,
//                 MediaSeqNo: 1
//             });
//         }

//         function resolveParam(type, value) {
//             if (!value) return null;
//             const strVal = value.toString().trim();
//             if (parameterResolver[type].has(strVal)) {
//                 return parameterResolver[type].get(strVal);
//             }
//             if (type === "color") {
//                 return parameterResolver.color.get(normalizeColor(value)) || null;
//             }
//             if (type === "clarity") {
//                 return parameterResolver.clarity.get(normalizeClarity(value)) || null;
//             }
//             return parameterResolver.shape.get(normalize(value)) || null;
//         }

//         // ---------------- STONE GROUP LOOKUP ----------------
//         const stoneGroupMap = new Map();
//         for (const sg of stoneGroups) {
//             const key = [
//                 normalize(sg.stoneType || ""),
//                 sg.shape?._id?.toString() || sg.shape?.toString(),
//                 sg.color?._id?.toString() || sg.color?.toString(),
//                 sg.clarity?._id?.toString() || sg.clarity?.toString(),
//             ].join("|");

//             if (!stoneGroupMap.has(key)) {
//                 stoneGroupMap.set(key, []);
//             }
//             stoneGroupMap.get(key).push(sg);
//         }

//         function findStoneGroup({
//             stoneType,
//             shapeDoc,
//             colorDoc,
//             clarityDoc,
//             carat,
//         }) {
//             if (!shapeDoc || !colorDoc || !clarityDoc || carat === null) {
//                 return null;
//             }

//             const key = [
//                 normalize(stoneType || ""),
//                 shapeDoc._id.toString(),
//                 colorDoc._id.toString(),
//                 clarityDoc._id.toString(),
//             ].join("|");

//             const groups = stoneGroupMap.get(key) || [];

//             return (
//                 groups.find(
//                     (sg) =>
//                         Number(carat) >= Number(sg.minCarat) &&
//                         Number(carat) <= Number(sg.maxCarat)
//                 ) || null
//             );
//         }

//         // ---------------- VALIDATIONS ----------------
//         const existingItemCode = await Product.findOne({
//             itemCode: req.body.itemCode,
//             isDeleted: { $ne: 1 }
//         });

//         if (existingItemCode) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "ItemCode already exists"
//             });
//         }

//         const existingSlug = await Product.findOne({
//             slug: req.body.slug,
//             isDeleted: { $ne: 1 }
//         });

//         if (existingSlug) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Slug already exists"
//             });
//         }
//         // Validate Chain Metal
//         let cMetal = null;
//         if (req.body.haveChain === "Yes") {
//             const cMetalIdStr = req.body.cMetalId ? req.body.cMetalId.toString() : "";
//             cMetal = metalMap.get(cMetalIdStr);
//             if (!cMetal) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: "Invalid chain metal type/stamp"
//                 });
//             }
//         }

//         // ---------------- STONES VALIDATION & PARSING ----------------
//         let stones = [];
//         if (req.body.stones) {
//             try {
//                 stones = typeof req.body.stones === "string"
//                     ? JSON.parse(req.body.stones)
//                     : req.body.stones;
//             } catch (err) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: "Invalid stones JSON format"
//                 });
//             }
//         }

//         const formattedStones = [];
//         let calculatedStonePrice = 0;

//         for (let idx = 0; idx < stones.length; idx++) {
//             const stone = stones[idx];
//             const allowedTypes = ["CENTER", "SIDE"];
//             const type = stone.type?.toUpperCase();

//             if (!allowedTypes.includes(type)) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid stone type: ${stone.type}`
//                 });
//             }

//             const shapeDoc = resolveParam("shape", stone.shape);
//             const colorDoc = resolveParam("color", stone.color);
//             const clarityDoc = resolveParam("clarity", stone.clarity);

//             if (!shapeDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing shape: ${stone.shape}`
//                 });
//             }

//             if (!colorDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing color: ${stone.color}`
//                 });
//             }

//             if (!clarityDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing clarity: ${stone.clarity}`
//                 });
//             }

//             const pieces = toNumber(stone.pieces);
//             const weightVal = toNumber(stone.weight || stone.wgt);
//             const size = safeString(stone.size);
//             const carat = extractCarat(size, weightVal, pieces);

//             const sg = findStoneGroup({
//                 stoneType: stone.stoneType || "diamond",
//                 shapeDoc,
//                 colorDoc,
//                 clarityDoc,
//                 carat,
//             });

//             if (!sg) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Stone group not found for shape=${stone.shape}, color=${stone.color}, clarity=${stone.clarity}, size=${stone.size}`
//                 });
//             }

//             const calculatedPrice = (sg.amount || 0) * weightVal;
//             calculatedStonePrice += calculatedPrice;

//             formattedStones.push({
//                 type,
//                 stoneGroup: sg._id,
//                 pieces,
//                 weight: weightVal,
//                 totalCarat: carat,
//                 shape: shapeDoc._id,
//                 color: colorDoc._id,
//                 clarity: clarityDoc._id,
//                 size,
//                 price: calculatedPrice,
//                 status: "ACTIVE",
//                 createdBy: req.user?._id
//             });
//         }

//         // Base object
//         let obj = {
//             designNumber: req.body.designNumber,
//             itemCode: req.body.itemCode,
//             parentItemCode: req.body.parentItemCode,

//             productTitle: req.body.productTitle,
//             productDesc: req.body.productDesc,

//             categoryId: category._id,
//             subCategoryId: subCategoryIds,
//             collectionId: collectionIds,
//             tags: tagIds,

//             gender: req.body.gender,

//             metalId: metal._id,
//             labourCode: labourObj._id,
//             otherChargeCode: otherObj._id,

//             appxMetalWgt: req.body.appxMetalWgt,
//             qty: req.body.qty,

//             height: req.body.height,
//             width: req.body.width,
//             length: req.body.length,

//             isEngraving: req.body.isEngraving === "true",

//             stonePrice: toNumber(req.body.stonePrice) || calculatedStonePrice,

//             images,
//             videos,

//             slug: req.body.slug,
//             haveChain: req.body.haveChain,
//             defaultSize: toObjectId(req.body.defaultSize),
//             shipmentDays: req.body.shipmentDays,

//             similarProducts,
//             combineWith,

//             ...(req.body.status ? { status: req.body.status } : {}),

//             SEODetails: {
//                 metaTitle: req.body.metaTitle,
//                 metaKeyword: req.body.metaKeyword,
//                 slug: req.body.seoSlug,
//                 metaDescription: req.body.metaDescription
//             },

//             createdBy: req.user?._id
//         };

//         // Chain logic (Unified Metal)
//         if (req.body.haveChain === "Yes") {
//             obj.cMetalId = cMetal._id;
//             obj.cWgt = req.body.cWgt;
//             obj.cLength = req.body.cLength;
//         }

//         // --------------------------------------------------
//         // FILE HANDLING
//         // --------------------------------------------------
//         let imageSeq = obj.images.length + 1;
//         let videoSeq = obj.videos.length + 1;

//         if (req.files?.length) {
//             for (let file of req.files) {

//                 // IMAGE
//                 if (file.fieldname === "images") {
//                     if (!Constant.ALLOWEDIMAGES.includes(file.mimetype)) {
//                         fs.unlinkSync(file.path);
//                         return res.status(STATUS_CODE.BAD_REQUEST).json({
//                             errorCode: STATUS_CODE.BAD_REQUEST,
//                             message: "Invalid image"
//                         });
//                     }

//                     obj.images.push({
//                         MediaLocation: file.filename,
//                         MediaSeqNo: imageSeq,
//                         IsMainMedia: imageSeq === 1
//                     });

//                     imageSeq++;
//                 }

//                 // VIDEO
//                 if (file.fieldname === "videos") {
//                     if (!Constant.ALLOWEDVIDEOS.includes(file.mimetype)) {
//                         fs.unlinkSync(file.path);
//                         return res.status(STATUS_CODE.BAD_REQUEST).json({
//                             errorCode: STATUS_CODE.BAD_REQUEST,
//                             message: "Invalid video"
//                         });
//                     }

//                     obj.videos.push({
//                         MediaLocation: file.filename,
//                         MediaSeqNo: videoSeq,
//                         IsMainMedia: videoSeq === 1
//                     });

//                     videoSeq++;
//                 }
//             }
//         }

//         // --------------------------------------------------
//         // CREATE PRODUCT
//         // --------------------------------------------------
//         const product = await Product.create(obj);

//         // --------------------------------------------------
//         // INSERT STONES
//         // --------------------------------------------------
//         if (formattedStones.length) {
//             formattedStones.forEach((s) => {
//                 s.itemCode = product.itemCode;
//                 s.productId = product._id;
//             });
//             await ProductStone.insertMany(formattedStones);
//         }

//         return res.status(STATUS_CODE.OK).json({
//             errorCode: STATUS_CODE.OK,
//             message: "Product added successfully",
//             data: product
//         });

//     } catch (error) {
//         console.log(error);

//         if (error.code === 11000) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "ItemCode must be unique"
//             });
//         }

//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//             errorCode: STATUS_CODE.INTERNAL_ERROR,
//             message: error.message
//         });
//     }
// };

export const addProduct = async (req, res) => {
  try {
    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const toObjectId = (id) =>
      id && mongoose.Types.ObjectId.isValid(id)
        ? new mongoose.Types.ObjectId(id)
        : null;

    // Parse ObjectId arrays
    const subCategoryId = parseObjectIdList(req.body.subCategoryId);
    const collectionId = parseObjectIdList(req.body.collectionId);
    const tags = parseObjectIdList(req.body.tags);

    // Parse itemCode arrays
    const parseItemCodeList = (raw) => {
      if (!raw) return [];

      if (Array.isArray(raw)) {
        return raw.map((x) => String(x).trim()).filter(Boolean);
      }

      return String(raw)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    };

    const similarProducts = parseItemCodeList(req.body.similarProducts);
    const combineWith = parseItemCodeList(req.body.combineWith);

    // --------------------------------------------------
    // UNIQUE VALIDATIONS
    // --------------------------------------------------

    const existingItemCode = await Product.findOne({
      itemCode: req.body.itemCode,
      isDeleted: { $ne: 1 },
    }).lean();

    if (existingItemCode) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "ItemCode already exists",
      });
    }

    if (!req.body.slug) {
      const slug = createSlug(req.body.productTitle);

      const existingSlug = await Product.findOne({
        slug: slug,
        isDeleted: { $ne: 1 },
      }).lean();

      if (existingSlug) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Slug already exists",
        });
      }

      req.body.slug = slug;
    }

    // --------------------------------------------------
    // PARSE IMAGES
    // --------------------------------------------------

    let images = [];

    if (req.body.images) {
      try {
        images =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
      } catch (err) {
        console.log("Error parsing images:", err);
      }
    }

    if (!Array.isArray(images)) {
      images = [];
    }

    // --------------------------------------------------
    // PARSE VIDEOS
    // --------------------------------------------------

    let videos = [];

    if (req.body.videos) {
      try {
        videos =
          typeof req.body.videos === "string"
            ? JSON.parse(req.body.videos)
            : req.body.videos;
      } catch (err) {
        console.log("Error parsing videos:", err);
      }
    }

    if (!Array.isArray(videos)) {
      videos = [];
    }

    if (req.body.videoUrl && videos.length === 0) {
      videos.push({
        MediaLocation: req.body.videoUrl,
        IsMainMedia: true,
        MediaSeqNo: 1,
      });
    }

    // --------------------------------------------------
    // VALIDATE CHAIN METAL (OPTIONAL)
    // --------------------------------------------------

    let cMetalId = null;

    if (req.body.haveChain === "Yes") {
      const chainMetal = await Metal.findOne({
        _id: req.body.cMetalId,
        status: "ACTIVE",
        isDeleted: { $ne: 1 },
      }).lean();

      if (!chainMetal) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid chain metal",
        });
      }

      cMetalId = chainMetal._id;
    }

    // --------------------------------------------------
    // PARSE STONES
    // --------------------------------------------------

    let stones = [];

    if (req.body.stones) {
      try {
        stones =
          typeof req.body.stones === "string"
            ? JSON.parse(req.body.stones)
            : req.body.stones;
      } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid stones JSON format",
        });
      }
    }

    // --------------------------------------------------
    // STONE VALIDATION
    // --------------------------------------------------

    let formattedStones = [];
    let calculatedStonePrice = 0;

    if (stones.length > 0) {
      const stoneContext = await loadStonesValidationMasters();

      const stoneValidation = validateStones(
        stoneContext,
        stones,
        req.user?._id
      );

      if (!stoneValidation.isValid) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: stoneValidation.error,
        });
      }

      formattedStones = stoneValidation.formattedStones;
      calculatedStonePrice = stoneValidation.calculatedStonePrice;
    }

    // --------------------------------------------------
    // MAIN OBJECT
    // --------------------------------------------------

    let obj = {
      designNumber: req.body.designNumber,
      itemCode: req.body.itemCode,
      parentItemCode: req.body.parentItemCode,

      productTitle: req.body.productTitle,
      productDesc: req.body.productDesc,

      categoryId: req.body.categoryId,
      subCategoryId,
      collectionId,
      tags,

      gender: req.body.gender,

      metalId: req.body.metalId,
      labourCode: req.body.labourCode,
      otherChargeCode: toObjectId(req.body.otherChargeCode),

      appxMetalWgt: req.body.appxMetalWgt
        ? parseFloat(Number(req.body.appxMetalWgt).toFixed(4))
        : null,
      qty: req.body.qty,

      height: req.body.height,
      width: req.body.width,
      length: req.body.length,

      isEngraving: req.body.isEngraving === "true",

      stonePrice: toNumber(req.body.stonePrice) || calculatedStonePrice,

      images,
      videos,

      slug: req.body.slug,

      haveChain: req.body.haveChain,

      defaultSize: toObjectId(req.body.defaultSize),

      shipmentDays: req.body.shipmentDays,

      similarProducts,
      combineWith,

      ...(req.body.status ? { status: req.body.status } : {}),

      SEODetails: {
        metaTitle: req.body.metaTitle,
        metaKeyword: req.body.metaKeyword,
        slug: req.body.seoSlug,
        metaDescription: req.body.metaDescription,
      },

      createdBy: req.user?._id,
    };

    // --------------------------------------------------
    // CHAIN DETAILS
    // --------------------------------------------------

    if (req.body.haveChain === "Yes") {
      obj.cMetalId = cMetalId;
      obj.cWgt = req.body.cWgt;
      obj.cLength = req.body.cLength;
    }

    // --------------------------------------------------
    // FILE HANDLING
    // --------------------------------------------------

    let imageSeq = obj.images.length + 1;
    let videoSeq = obj.videos.length + 1;

    if (req.files?.length) {
      for (let file of req.files) {
        // IMAGE
        if (file.fieldname === "images") {
          if (!Constant.ALLOWEDIMAGES.includes(file.mimetype)) {
            fs.unlinkSync(file.path);

            return res.status(STATUS_CODE.BAD_REQUEST).json({
              errorCode: STATUS_CODE.BAD_REQUEST,
              message: "Invalid image",
            });
          }

          obj.images.push({
            MediaLocation: file.filename,
            MediaSeqNo: imageSeq,
            IsMainMedia: imageSeq === 1,
          });

          imageSeq++;
        }

        // VIDEO
        if (file.fieldname === "videos") {
          if (!Constant.ALLOWEDVIDEOS.includes(file.mimetype)) {
            fs.unlinkSync(file.path);

            return res.status(STATUS_CODE.BAD_REQUEST).json({
              errorCode: STATUS_CODE.BAD_REQUEST,
              message: "Invalid video",
            });
          }

          obj.videos.push({
            MediaLocation: file.filename,
            MediaSeqNo: videoSeq,
            IsMainMedia: videoSeq === 1,
          });

          videoSeq++;
        }
      }
    }

    // --------------------------------------------------
    // CREATE PRODUCT
    // --------------------------------------------------

    const product = await Product.create(obj);

    // --------------------------------------------------
    // INSERT STONES
    // --------------------------------------------------

    if (formattedStones.length > 0) {
      formattedStones.forEach((s) => {
        s.itemCode = product.itemCode;
        s.productId = product._id;
      });

      await ProductStone.insertMany(formattedStones);
    }

    await calculateProductsPriceService({
      productIds: [product._id],
    });
    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Duplicate value found",
      });
    }

    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};
// export const update_product = async (req, res) => {
//     try {
//         const toObjectId = (id) =>
//             id ? new mongoose.Types.ObjectId(id) : null;

//         const productId = req.params.id;

//         if (!productId) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Product id required"
//             });
//         }

//         const existingProduct = await Product.findById(productId);

//         if (!existingProduct) {
//             return res.status(STATUS_CODE.NOT_FOUND).json({
//                 errorCode: STATUS_CODE.NOT_FOUND,
//                 message: "Product not found"
//             });
//         }

//         // Parse arrays (IDs)
//         const subCategoryId = parseObjectIdList(req.body.subCategoryId);
//         const collectionId = parseObjectIdList(req.body.collectionId);
//         const tags = parseObjectIdList(req.body.tags);

//         // Mirror addProduct: similarProducts / combineWith arrive as CSV
//         // strings of item codes (or arrays from callers that pre-split).
//         const parseItemCodeList = (raw) => {
//             if (!raw) return [];
//             if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
//             return String(raw)
//                 .split(",")
//                 .map((x) => x.trim())
//                 .filter(Boolean);
//         };
//         const similarProducts = parseItemCodeList(req.body.similarProducts);
//         const combineWith = parseItemCodeList(req.body.combineWith);

//         // ---------------- LOAD MASTERS ----------------
//         const [
//             categories,
//             collections,
//             tagsMaster,
//             allMetals,
//             allCharges,
//             stoneGroups,
//             parameters,
//         ] = await Promise.all([
//             Category.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
//             CollectionModel.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
//             Tag.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
//             Metal.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
//             chargesModel.find({ status: "ACTIVE", isDeleted: false }).lean(),
//             StoneGroup.find({ status: "ACTIVE", isDeleted: { $ne: 1 } })
//                 .populate("shape color clarity")
//                 .lean(),
//             Parameter.find({ status: "ACTIVE", isDeleted: 0 }).lean(),
//         ]);

//         // ---------------- MAPS ----------------
//         const categoryMap = new Map();
//         for (const c of categories) {
//             categoryMap.set(c._id.toString(), c);
//             categoryMap.set(normalize(c.categoryName), c);
//         }

//         const metalMap = new Map();
//         for (const m of allMetals) {
//             metalMap.set(m._id.toString(), m);
//             metalMap.set(normalize(`${m.type || ""} ${m.stamp || ""}`), m);
//             metalMap.set(normalize(`${m.name || ""} ${m.stamp || ""}`), m);
//             metalMap.set(normalize(m.name), m);
//             metalMap.set(normalize(m.type), m);
//         }

//         const chargesMap = new Map();
//         for (const c of allCharges) {
//             chargesMap.set(c._id.toString(), c);
//             chargesMap.set(normalize(c.code), c);
//             chargesMap.set(normalize(c.name), c);
//         }

//         const collectionMap = new Map();
//         for (const col of collections) {
//             collectionMap.set(col._id.toString(), col);
//             collectionMap.set(normalize(col.collectionName), col);
//         }

//         const tagMap = new Map();
//         for (const t of tagsMaster) {
//             tagMap.set(t._id.toString(), t);
//             tagMap.set(normalize(t.name), t);
//         }

//         // ---------------- PARAMETER MAPS ----------------
//         const parameterResolver = {
//             shape: new Map(),
//             color: new Map(),
//             clarity: new Map(),
//         };

//         for (const p of parameters) {
//             if (!parameterResolver[p.type]) continue;
//             parameterResolver[p.type].set(p._id.toString(), p);

//             const keys = [
//                 p.code,
//                 p.name,
//                 ...(Array.isArray(p.synonyms) ? p.synonyms : []),
//             ];

//             for (const key of keys) {
//                 if (p.type === "color") {
//                     const k = normalizeColor(key);
//                     if (k) parameterResolver.color.set(k, p);
//                 } else if (p.type === "clarity") {
//                     const k = normalizeClarity(key);
//                     if (k) parameterResolver.clarity.set(k, p);
//                 } else {
//                     const k = normalize(key);
//                     if (k) parameterResolver.shape.set(k, p);
//                 }
//             }
//         }

//         function resolveParam(type, value) {
//             if (!value) return null;
//             const strVal = value.toString().trim();
//             if (parameterResolver[type].has(strVal)) {
//                 return parameterResolver[type].get(strVal);
//             }
//             if (type === "color") {
//                 return parameterResolver.color.get(normalizeColor(value)) || null;
//             }
//             if (type === "clarity") {
//                 return parameterResolver.clarity.get(normalizeClarity(value)) || null;
//             }
//             return parameterResolver.shape.get(normalize(value)) || null;
//         }

//         // ---------------- STONE GROUP LOOKUP ----------------
//         const stoneGroupMap = new Map();
//         for (const sg of stoneGroups) {
//             const key = [
//                 normalize(sg.stoneType || ""),
//                 sg.shape?._id?.toString() || sg.shape?.toString(),
//                 sg.color?._id?.toString() || sg.color?.toString(),
//                 sg.clarity?._id?.toString() || sg.clarity?.toString(),
//             ].join("|");

//             if (!stoneGroupMap.has(key)) {
//                 stoneGroupMap.set(key, []);
//             }
//             stoneGroupMap.get(key).push(sg);
//         }

//         function findStoneGroup({
//             stoneType,
//             shapeDoc,
//             colorDoc,
//             clarityDoc,
//             carat,
//         }) {
//             if (!shapeDoc || !colorDoc || !clarityDoc || carat === null) {
//                 return null;
//             }

//             const key = [
//                 normalize(stoneType || ""),
//                 shapeDoc._id.toString(),
//                 colorDoc._id.toString(),
//                 clarityDoc._id.toString(),
//             ].join("|");

//             const groups = stoneGroupMap.get(key) || [];

//             return (
//                 groups.find(
//                     (sg) =>
//                         Number(carat) >= Number(sg.minCarat) &&
//                         Number(carat) <= Number(sg.maxCarat)
//                 ) || null
//             );
//         }

//         // ---------------- VALIDATIONS ----------------

//         // Validate Category
//         const categoryIdStr = req.body.categoryId ? req.body.categoryId.toString() : "";
//         const category = categoryMap.get(categoryIdStr);
//         if (!category) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Invalid category"
//             });
//         }

//         // Validate Metal
//         const metalIdStr = req.body.metalId ? req.body.metalId.toString() : "";
//         const metal = metalMap.get(metalIdStr);
//         if (!metal) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Invalid metal type/stamp"
//             });
//         }

//         // Validate Labour Charge
//         const labourCodeStr = req.body.labourCode ? req.body.labourCode.toString() : "";
//         const labourObj = chargesMap.get(labourCodeStr);
//         if (!labourObj) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Invalid labour charge"
//             });
//         }

//         // Validate Other Charge
//         const otherChargeCodeStr = req.body.otherChargeCode ? req.body.otherChargeCode.toString() : "";
//         const otherObj = chargesMap.get(otherChargeCodeStr);
//         if (!otherObj) {
//             return res.status(STATUS_CODE.BAD_REQUEST).json({
//                 errorCode: STATUS_CODE.BAD_REQUEST,
//                 message: "Invalid other charge"
//             });
//         }

//         // Validate Subcategories
//         const subCategoryIds = [];
//         for (const subId of subCategoryId) {
//             const found = categories.find(
//                 (c) =>
//                     c._id.toString() === subId.toString() &&
//                     c.parentCategoryId &&
//                     c.parentCategoryId.toString() === category._id.toString()
//             );
//             if (found) {
//                 subCategoryIds.push(found._id);
//             } else {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Invalid subcategory: ${subId}`
//                 });
//             }
//         }

//         // Validate Collections
//         const collectionIds = [];
//         for (const colId of collectionId) {
//             const doc = collectionMap.get(colId.toString());
//             if (doc) {
//                 collectionIds.push(doc._id);
//             } else {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Invalid collection: ${colId}`
//                 });
//             }
//         }

//         // Validate Tags
//         const tagIds = [];
//         for (const tagId of tags) {
//             const doc = tagMap.get(tagId.toString());
//             if (doc) {
//                 tagIds.push(doc._id);
//             } else {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Invalid tag: ${tagId}`
//                 });
//             }
//         }

//         // Validate Chain Metal
//         let cMetal = null;
//         if (req.body.haveChain === "Yes") {
//             const cMetalIdStr = req.body.cMetalId ? req.body.cMetalId.toString() : "";
//             cMetal = metalMap.get(cMetalIdStr);
//             if (!cMetal) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: "Invalid chain metal type/stamp"
//                 });
//             }
//         }

//         // ---------------- STONES VALIDATION & PARSING ----------------
//         let stones = [];
//         if (req.body.stones) {
//             try {
//                 stones = typeof req.body.stones === "string"
//                     ? JSON.parse(req.body.stones)
//                     : req.body.stones;
//             } catch (err) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: "Invalid stones JSON format"
//                 });
//             }
//         }

//         const formattedStones = [];
//         let calculatedStonePrice = 0;

//         for (let idx = 0; idx < stones.length; idx++) {
//             const stone = stones[idx];
//             const allowedTypes = ["CENTER", "SIDE"];
//             const type = stone.type?.toUpperCase();

//             if (!allowedTypes.includes(type)) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid stone type: ${stone.type}`
//                 });
//             }

//             const shapeDoc = resolveParam("shape", stone.shape);
//             const colorDoc = resolveParam("color", stone.color);
//             const clarityDoc = resolveParam("clarity", stone.clarity);

//             if (!shapeDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing shape: ${stone.shape}`
//                 });
//             }

//             if (!colorDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing color: ${stone.color}`
//                 });
//             }

//             if (!clarityDoc) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Invalid or missing clarity: ${stone.clarity}`
//                 });
//             }

//             const pieces = toNumber(stone.pieces);
//             const weightVal = toNumber(stone.weight || stone.wgt);
//             const size = safeString(stone.size);
//             const carat = extractCarat(size, weightVal, pieces);

//             const sg = findStoneGroup({
//                 stoneType: stone.stoneType || "diamond",
//                 shapeDoc,
//                 colorDoc,
//                 clarityDoc,
//                 carat,
//             });

//             if (!sg) {
//                 return res.status(STATUS_CODE.BAD_REQUEST).json({
//                     errorCode: STATUS_CODE.BAD_REQUEST,
//                     message: `Stone ${idx + 1}: Stone group not found for shape=${stone.shape}, color=${stone.color}, clarity=${stone.clarity}, size=${stone.size}`
//                 });
//             }

//             const calculatedPrice = (sg.amount || 0) * weightVal;
//             calculatedStonePrice += calculatedPrice;

//             formattedStones.push({
//                 type,
//                 stoneGroup: sg._id,
//                 pieces,
//                 weight: weightVal,
//                 totalCarat: carat,
//                 shape: shapeDoc._id,
//                 color: colorDoc._id,
//                 clarity: clarityDoc._id,
//                 size,
//                 price: calculatedPrice,
//                 status: "ACTIVE",
//                 createdBy: req.user?._id
//             });
//         }

//         // ---------------------------
//         // MAIN OBJECT
//         // ---------------------------
//         let obj = {
//             designNumber: req.body.designNumber,
//             itemCode: req.body.itemCode,
//             parentItemCode: req.body.parentItemCode,

//             productTitle: req.body.productTitle,
//             productDesc: req.body.productDesc,

//             categoryId: category._id,
//             subCategoryId: subCategoryIds,
//             collectionId: collectionIds,
//             tags: tagIds,

//             gender: req.body.gender,

//             metalId: metal._id,
//             labourCode: labourObj._id,
//             otherChargeCode: otherObj._id,

//             appxMetalWgt: req.body.appxMetalWgt,
//             qty: req.body.qty,

//             height: req.body.height,
//             width: req.body.width,
//             length: req.body.length,

//             isEngraving: req.body.isEngraving === "true",
//             stonePrice: toNumber(req.body.stonePrice) || calculatedStonePrice,

//             slug: req.body.slug,
//             haveChain: req.body.haveChain,
//             defaultSize: toObjectId(req.body.defaultSize),
//             shipmentDays: req.body.shipmentDays,

//             similarProducts,
//             combineWith,

//             ...(req.body.status ? { status: req.body.status } : {}),

//             SEODetails: {
//                 metaTitle: req.body.metaTitle,
//                 metaKeyword: req.body.metaKeyword,
//                 slug: req.body.seoSlug,
//                 metaDescription: req.body.metaDescription
//             }
//         };

//         // ---------------------------
//         // CHAIN LOGIC (Unified Metal)
//         // ---------------------------
//         if (req.body.haveChain === "Yes") {
//             obj.cMetalId = cMetal._id;
//             obj.cWgt = req.body.cWgt;
//             obj.cLength = req.body.cLength;
//         }

//         // ---------------------------
//         // IMAGES / VIDEOS
//         // ---------------------------
//         let images = [];
//         if (req.body.images) {
//             try {
//                 images = typeof req.body.images === "string"
//                     ? JSON.parse(req.body.images)
//                     : req.body.images;
//             } catch (err) {
//                 console.log("Error parsing images:", err);
//             }
//         }
//         if (!Array.isArray(images) || images.length === 0) {
//             images = existingProduct.images || [];
//         }

//         let videos = [];
//         if (req.body.videos) {
//             try {
//                 videos = typeof req.body.videos === "string"
//                     ? JSON.parse(req.body.videos)
//                     : req.body.videos;
//             } catch (err) {
//                 console.log("Error parsing videos:", err);
//             }
//         }
//         if (!Array.isArray(videos)) {
//             videos = [];
//         }

//         if (req.body.videoUrl && videos.length === 0) {
//             videos.push({
//                 MediaLocation: req.body.videoUrl,
//                 IsMainMedia: true,
//                 MediaSeqNo: 1
//             });
//         }

//         if (videos.length === 0) {
//             videos = existingProduct.videos || [];
//         }

//         let imageSeq = images.length + 1;
//         let videoSeq = videos.length + 1;

//         if (req.files?.length) {
//             for (let file of req.files) {

//                 if (file.fieldname === "images") {
//                     if (!Constant.ALLOWEDIMAGES.includes(file.mimetype)) {
//                         fs.unlinkSync(file.path);
//                         return res.status(STATUS_CODE.BAD_REQUEST).json({
//                             errorCode: STATUS_CODE.BAD_REQUEST,
//                             message: "Invalid image"
//                         });
//                     }

//                     images.push({
//                         MediaLocation: file.filename,
//                         MediaSeqNo: imageSeq,
//                         IsMainMedia: imageSeq === 1
//                     });

//                     imageSeq++;
//                 }

//                 if (file.fieldname === "videos") {
//                     if (!Constant.ALLOWEDVIDEOS.includes(file.mimetype)) {
//                         fs.unlinkSync(file.path);
//                         return res.status(STATUS_CODE.BAD_REQUEST).json({
//                             errorCode: STATUS_CODE.BAD_REQUEST,
//                             message: "Invalid video"
//                         });
//                     }

//                     videos.push({
//                         MediaLocation: file.filename,
//                         MediaSeqNo: videoSeq,
//                         IsMainMedia: videoSeq === 1
//                     });

//                     videoSeq++;
//                 }
//             }
//         }

//         obj.images = images;
//         obj.videos = videos;

//         // ---------------------------
//         // UPDATE PRODUCT
//         // ---------------------------
//         const updatedProduct = await Product.findByIdAndUpdate(
//             productId,
//             obj,
//             { new: true }
//         );

//         // DELETE OLD STONES
//         await ProductStone.deleteMany({ productId });

//         // INSERT NEW STONES
//         if (formattedStones.length) {
//             formattedStones.forEach((s) => {
//                 s.itemCode = updatedProduct.itemCode;
//                 s.productId = updatedProduct._id;
//             });
//             await ProductStone.insertMany(formattedStones);
//         }

//         return res.status(STATUS_CODE.OK).json({
//             errorCode: STATUS_CODE.OK,
//             message: "Product updated successfully",
//             data: updatedProduct
//         });

//     } catch (error) {
//         console.log(error);

//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//             errorCode: STATUS_CODE.INTERNAL_ERROR,
//             message: error.message
//         });
//     }
// };

export const update_product = async (req, res) => {
  try {
    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    const toObjectId = (id) =>
      id && mongoose.Types.ObjectId.isValid(id)
        ? new mongoose.Types.ObjectId(id)
        : null;

    const productId = req.params.id;

    if (!productId) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Product id required",
      });
    }

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Product not found",
      });
    }

    // --------------------------------------------------
    // PARSE ARRAYS
    // --------------------------------------------------

    const subCategoryId = parseObjectIdList(req.body.subCategoryId);

    const collectionId = parseObjectIdList(req.body.collectionId);

    const tags = parseObjectIdList(req.body.tags);

    // --------------------------------------------------
    // PARSE ITEMCODE ARRAYS
    // --------------------------------------------------

    const parseItemCodeList = (raw) => {
      if (!raw) return [];

      if (Array.isArray(raw)) {
        return raw.map((x) => String(x).trim()).filter(Boolean);
      }

      return String(raw)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    };

    const similarProducts = parseItemCodeList(req.body.similarProducts);

    const combineWith = parseItemCodeList(req.body.combineWith);

    // --------------------------------------------------
    // ITEMCODE UNIQUE VALIDATION
    // --------------------------------------------------

    if (req.body.itemCode && req.body.itemCode !== existingProduct.itemCode) {
      const existingItemCode = await Product.findOne({
        itemCode: req.body.itemCode,
        _id: { $ne: productId },
        isDeleted: { $ne: 1 },
      }).lean();

      if (existingItemCode) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "ItemCode already exists",
        });
      }
    }

    // --------------------------------------------------
    // SLUG UNIQUE VALIDATION
    // --------------------------------------------------

    if (req.body.slug && req.body.slug !== existingProduct.slug) {
      const existingSlug = await Product.findOne({
        slug: req.body.slug,
        _id: { $ne: productId },
        isDeleted: { $ne: 1 },
      }).lean();

      if (existingSlug) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Slug already exists",
        });
      }
    }

    // --------------------------------------------------
    // VALIDATE CHAIN METAL
    // --------------------------------------------------

    let cMetalId = null;

    if (req.body.haveChain === "Yes") {
      const chainMetal = await Metal.findOne({
        _id: req.body.cMetalId,
        status: "ACTIVE",
        isDeleted: { $ne: 1 },
      }).lean();

      if (!chainMetal) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid chain metal",
        });
      }

      cMetalId = chainMetal._id;
    }

    // --------------------------------------------------
    // PARSE STONES
    // --------------------------------------------------

    let stones = [];

    if (req.body.stones) {
      try {
        stones =
          typeof req.body.stones === "string"
            ? JSON.parse(req.body.stones)
            : req.body.stones;
      } catch (err) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Invalid stones JSON format",
        });
      }
    }

    // --------------------------------------------------
    // STONE VALIDATION
    // --------------------------------------------------

    let formattedStones = [];
    let calculatedStonePrice = 0;

    if (stones.length > 0) {
      /* ORIGINAL CODE COMMENTED OUT:
            for (let idx = 0; idx < stones.length; idx++) {

                const stone = stones[idx];

                const allowedTypes = ["CENTER", "SIDE"];

                const type =
                    stone.type?.toUpperCase();

                if (!allowedTypes.includes(type)) {

                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message:
                            `Stone ${idx + 1}: Invalid stone type`
                    });
                }

                // -----------------------------------------
                // REQUIRED IDS
                // -----------------------------------------

                if (!stone.shape) {

                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message:
                            `Stone ${idx + 1}: Shape required`
                    });
                }

                if (!stone.color) {

                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message:
                            `Stone ${idx + 1}: Color required`
                    });
                }

                if (!stone.clarity) {

                    return res.status(STATUS_CODE.BAD_REQUEST).json({
                        errorCode: STATUS_CODE.BAD_REQUEST,
                        message:
                            `Stone ${idx + 1}: Clarity required`
                    });
                }

                // -----------------------------------------
                // CALCULATIONS
                // -----------------------------------------

                const pieces =
                    toNumber(stone.pieces);

                const weightVal =
                    toNumber(
                        stone.weight || stone.wgt
                    );

                const size =
                    safeString(stone.size);

                const carat =
                    extractCarat(
                        size,
                        weightVal,
                        pieces
                    );

                const roundedCarat =
                    Number(
                        Number(carat).toFixed(3)
                    );

                // -----------------------------------------
                // FIND STONE GROUP
                // -----------------------------------------

                const stoneGroup =
                    await StoneGroup.findOne({
                        stoneType:
                            (stone.stoneType || "DIAMOND")
                                .toUpperCase(),
                        shape:
                            new mongoose.Types.ObjectId(
                                stone.shape._id
                            ),
                        color:
                            new mongoose.Types.ObjectId(
                                stone.color._id
                            ),
                        clarity:
                            new mongoose.Types.ObjectId(
                                stone.clarity._id
                            ),

                        minCarat: {
                            $lte: roundedCarat
                        },

                        maxCarat: {
                            $gte: roundedCarat
                        },

                        status: "ACTIVE",

                        isDeleted: {
                            $ne: 1
                        }

                    }).lean();

                if (!stoneGroup) {

                    return res.status(STATUS_CODE.BAD_REQUEST).json({

                        errorCode: STATUS_CODE.BAD_REQUEST,

                        message:
                            `Stone ${idx + 1} (${type}) : ` +
                            `Stone group not found for ` +
                            `StoneType=${stone.stoneType || "DIAMOND"}, ` +
                            `Shape=${stone.shape.name}, ` +
                            `Color=${stone.color.name}, ` +
                            `Clarity=${stone.clarity.name}, ` +
                            `Pieces=${pieces}, ` +
                            `Weight=${weightVal}, ` +
                            `Carat=${roundedCarat}, ` +
                            `Size=${size || "N/A"}`
                    });
                }

                // -----------------------------------------
                // PRICE
                // -----------------------------------------

                const calculatedPrice =
                    (stoneGroup.amount || 0)
                    * weightVal;

                calculatedStonePrice +=
                    calculatedPrice;

                // -----------------------------------------
                // PUSH
                // -----------------------------------------

                formattedStones.push({

                    type,

                    stoneType:
                        (stone.stoneType || "DIAMOND")
                            .toUpperCase(),

                    stoneGroup:
                        stoneGroup._id,

                    pieces,

                    weight: weightVal,

                    // Row TOTAL carat, not the per-piece value — same semantics
                    // as the importer. `roundedCarat` is per-piece and is only
                    // used for the stone-group lookup above.
                    totalCarat: weightVal,

                    shape:
                        stone.shape,

                    color:
                        stone.color,

                    clarity:
                        stone.clarity,

                    size,

                    price:
                        calculatedPrice,

                    status: "ACTIVE",

                    createdBy:
                        req.user?._id
                });
            }
            */

      const stoneContext = await loadStonesValidationMasters();
      const stoneValidation = validateStones(
        stoneContext,
        stones,
        req.user?._id
      );

      if (!stoneValidation.isValid) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: stoneValidation.error,
        });
      }

      formattedStones = stoneValidation.formattedStones;
      calculatedStonePrice = stoneValidation.calculatedStonePrice;
    }

    // --------------------------------------------------
    // PARSE IMAGES
    // --------------------------------------------------

    let images = [];

    if (req.body.images) {
      try {
        images =
          typeof req.body.images === "string"
            ? JSON.parse(req.body.images)
            : req.body.images;
      } catch (err) {
        console.log("Error parsing images:", err);
      }
    }

    // KEEP OLD IMAGES IF EMPTY

    if (!Array.isArray(images) || images.length === 0) {
      images = existingProduct.images || [];
    }

    // --------------------------------------------------
    // PARSE VIDEOS
    // --------------------------------------------------

    let videos = [];

    if (req.body.videos) {
      try {
        videos =
          typeof req.body.videos === "string"
            ? JSON.parse(req.body.videos)
            : req.body.videos;
      } catch (err) {
        console.log("Error parsing videos:", err);
      }
    }

    if (!Array.isArray(videos)) {
      videos = [];
    }

    // VIDEO URL SUPPORT

    if (req.body.videoUrl && videos.length === 0) {
      videos.push({
        MediaLocation: req.body.videoUrl,

        IsMainMedia: true,

        MediaSeqNo: 1,
      });
    }

    // KEEP OLD VIDEOS

    if (videos.length === 0) {
      videos = existingProduct.videos || [];
    }

    // --------------------------------------------------
    // FILE HANDLING
    // --------------------------------------------------

    let imageSeq = images.length + 1;

    let videoSeq = videos.length + 1;

    if (req.files?.length) {
      for (let file of req.files) {
        // IMAGE

        if (file.fieldname === "images") {
          if (!Constant.ALLOWEDIMAGES.includes(file.mimetype)) {
            fs.unlinkSync(file.path);

            return res.status(STATUS_CODE.BAD_REQUEST).json({
              errorCode: STATUS_CODE.BAD_REQUEST,

              message: "Invalid image",
            });
          }

          images.push({
            MediaLocation: file.filename,

            MediaSeqNo: imageSeq,

            IsMainMedia: imageSeq === 1,
          });

          imageSeq++;
        }

        // VIDEO

        if (file.fieldname === "videos") {
          if (!Constant.ALLOWEDVIDEOS.includes(file.mimetype)) {
            fs.unlinkSync(file.path);

            return res.status(STATUS_CODE.BAD_REQUEST).json({
              errorCode: STATUS_CODE.BAD_REQUEST,

              message: "Invalid video",
            });
          }

          videos.push({
            MediaLocation: file.filename,

            MediaSeqNo: videoSeq,

            IsMainMedia: videoSeq === 1,
          });

          videoSeq++;
        }
      }
    }

    // --------------------------------------------------
    // MAIN OBJECT
    // --------------------------------------------------

    let obj = {
      designNumber: req.body.designNumber,

      itemCode: req.body.itemCode || existingProduct.itemCode,

      parentItemCode: req.body.parentItemCode,

      productTitle: req.body.productTitle,

      productDesc: req.body.productDesc,

      categoryId: req.body.categoryId,

      subCategoryId,

      collectionId,

      tags,

      gender: req.body.gender,

      metalId: req.body.metalId,

      labourCode: req.body.labourCode,

      otherChargeCode: toObjectId(req.body.otherChargeCode),

      appxMetalWgt: req.body.appxMetalWgt
        ? parseFloat(Number(req.body.appxMetalWgt).toFixed(4))
        : null,

      qty: req.body.qty,

      height: req.body.height,

      width: req.body.width,

      length: req.body.length,

      isEngraving: req.body.isEngraving,

      stonePrice: toNumber(req.body.stonePrice) || calculatedStonePrice,

      slug: req.body.slug || existingProduct.slug,

      haveChain: req.body.haveChain,

      defaultSize: toObjectId(req.body.defaultSize),

      shipmentDays: req.body.shipmentDays,

      similarProducts,

      combineWith,

      images,

      videos,

      ...(req.body.status
        ? {
          status: req.body.status,
        }
        : {}),

      SEODetails: {
        metaTitle: req.body.metaTitle,

        metaKeyword: req.body.metaKeyword,

        slug: req.body.seoSlug,

        metaDescription: req.body.metaDescription,
      },

      updatedBy: req.user?._id,
    };

    // --------------------------------------------------
    // CHAIN DETAILS
    // --------------------------------------------------

    if (req.body.haveChain === "Yes") {
      obj.cMetalId = cMetalId;

      obj.cWgt = req.body.cWgt;

      obj.cLength = req.body.cLength;
    }

    // --------------------------------------------------
    // UPDATE PRODUCT
    // --------------------------------------------------

    const updatedProduct = await Product.findByIdAndUpdate(productId, obj, {
      new: true,
    });

    // --------------------------------------------------
    // REPLACE STONES
    // --------------------------------------------------

    await ProductStone.deleteMany({
      productId,
    });

    if (formattedStones.length > 0) {
      formattedStones.forEach((s) => {
        s.itemCode = updatedProduct.itemCode;

        s.productId = updatedProduct._id;
      });

      await ProductStone.insertMany(formattedStones);
    }
    await calculateProductsPriceService({
      productIds: [updatedProduct._id],
    });
    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,

      message: "Product updated successfully",

      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,

        message: "Duplicate value found",
      });
    }

    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,

      message: error.message,
    });
  }
};

export const delete_product = async function (req, res) {
  try {
    let product = await Product.findOne({ _id: req.params.id });

    if (product) {
      let del = await await Product.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: { isDeleted: product.isDeleted ? 0 : 1 },
        }
      );
      if (del) {
        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.OK,
          message: "Product delete successfully..!",
        });
      }
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Product not exist..!",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const update_product_status = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Product id is required",
      });
    }

    if (!status) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Status is required",
      });
    }

    const allowedStatus = [
      Constant.PRODUCT_STATUS.AVALIABLE,
      Constant.PRODUCT_STATUS.HOLD,
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: `Invalid status. Allowed: ${allowedStatus.join(", ")}`,
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Product not found",
      });
    }

    product.status = status;
    await product.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product status updated successfully",
      data: {
        id: product._id,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("update_product_status error:", error);

    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// -----------------------------
// HELPER FUNCTION
// -----------------------------
const toObjectIdArray = (value) => {
  if (!value) return [];

  const arr = Array.isArray(value) ? value : [value];

  return arr
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
};

export const get_product_list = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      metalType,
      metalStamp,
      status,
      category,
      subCategory,
      collectionId,
      tags,
      minPrice,
      maxPrice,
      metalId,
      ids,
      lastNDays
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // -----------------------------
    // PRODUCT FILTER
    // -----------------------------
    // `$ne: 1` matches both isDeleted=0 and legacy rows missing the field.
    let matchStage = {
      isDeleted: { $ne: 1 },
    };

    // STATUS (multi)
    if (status) {
      const statusArr = Array.isArray(status) ? status : [status];
      matchStage.status = { $in: statusArr };
    }

    // EXPLICIT IDS — used by CMS pickers to hydrate already-selected items.
    if (Array.isArray(ids) && ids.length) {
      const objIds = toObjectIdArray(ids);
      if (objIds.length) matchStage._id = { $in: objIds };
    }

    // SEARCH
    if (search) {
      matchStage.$or = [
        { itemCode: { $regex: search, $options: "i" } },
        { parentItemCode: { $regex: search, $options: "i" } },
        { productTitle: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // -----------------------------
    // MULTI ID FILTERS
    // -----------------------------
    // const metalTypeIds = toObjectIdArray(metalType);
    // if (metalTypeIds.length) {
    //     matchStage.metalType = { $in: metalTypeIds };
    // }
    // const metalStampIds = toObjectIdArray(metalStamp);
    // if (metalStampIds.length) {
    //     matchStage.metalStamp = { $in: metalStampIds };
    // }
    const metalIds = toObjectIdArray(metalId);
    if (metalIds.length) {
      matchStage.metalId = { $in: metalIds };
    }

    const categoryIds = toObjectIdArray(category);
    if (categoryIds.length) {
      matchStage.categoryId = { $in: categoryIds };
    }

    const subCategoryIds = toObjectIdArray(subCategory);
    if (subCategoryIds.length) {
      matchStage.subCategoryId = { $in: subCategoryIds };
    }

    const collectionIds = toObjectIdArray(collectionId);
    if (collectionIds.length) {
      matchStage.collectionId = { $in: collectionIds };
    }

    const tagIds = toObjectIdArray(tags);
    if (tagIds.length) {
      matchStage.tags = { $in: tagIds };
    }

    let priceFilter = {};
    if (minPrice) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      matchStage.finalPrice = priceFilter;
    }

    if (lastNDays) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number(lastNDays));
      matchStage.createdAt = {
        $gte: fromDate
      };
    }

    if (req.body?.parentOnly) {
      const parentOnlyFilter = {
        $or: [
          { parentItemCode: { $exists: false } },
          { parentItemCode: null },
          { parentItemCode: "" }
        ]
      };
      matchStage = { ...matchStage, ...parentOnlyFilter }
    }
    // -----------------------------
    // AGGREGATION PIPELINE
    // -----------------------------
    let pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      // LOOKUPS (Unified Masters)
      // { $lookup: { from: "metaltypes", localField: "metalType", foreignField: "_id", as: "metalType" } },
      // { $unwind: { path: "$metalType", preserveNullAndEmptyArrays: true } },
      // { $lookup: { from: "metalstamps", localField: "metalStamp", foreignField: "_id", as: "metalStamp" } },
      // { $unwind: { path: "$metalStamp", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "metals",
          localField: "metalId",
          foreignField: "_id",
          as: "metal",
        },
      },
      { $unwind: { path: "$metal", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "metals",
          localField: "cMetalId",
          foreignField: "_id",
          as: "cMetal",
        },
      },
      { $unwind: { path: "$cMetal", preserveNullAndEmptyArrays: true } },

      // { $lookup: { from: "labourcharges", localField: "labourCode", foreignField: "_id", as: "labour" } },
      // { $unwind: { path: "$labour", preserveNullAndEmptyArrays: true } },
      // { $lookup: { from: "othercharges", localField: "otherChargeCode", foreignField: "_id", as: "otherCharge" } },
      // { $unwind: { path: "$otherCharge", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "charges",
          localField: "labourCode",
          foreignField: "_id",
          as: "labour",
        },
      },
      { $unwind: { path: "$labour", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "charges",
          localField: "otherChargeCode",
          foreignField: "_id",
          as: "otherCharge",
        },
      },
      { $unwind: { path: "$otherCharge", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "sizes",
          localField: "defaultSize",
          foreignField: "_id",
          as: "size",
        },
      },
      { $unwind: { path: "$size", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // -----------------------------
      // SUB CATEGORY (array)
      // -----------------------------
      {
        $lookup: {
          from: "categories",
          //  let: { categoryId: "$categoryId" },
          // pipeline: [
          //     {
          //         $match: {
          //             $expr: {
          //                 $eq: ["$parentCategoryId", "$$categoryId"]
          //             }
          //         }
          //     },
          //     {
          //         $match: {
          //             isDeleted: 0,
          //             status: "ACTIVE"
          //         }
          //     }
          // ],
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategories",
        },
      },

      // ...(subCategory ? (() => {
      //     const subCategoryIds = toObjectIdArray(subCategory);

      //     return subCategoryIds.length > 0
      //         ? [{
      //             $match: {
      //                 "subCategories._id": { $in: subCategoryIds }
      //             }
      //         }]
      //         : [];
      // })() : []),

      {
        $lookup: {
          from: "productstones",
          localField: "_id",
          foreignField: "productId",
          as: "stones",
        },
      },

      {
        $project: {
          productTitle: 1,
          itemCode: 1,
          parentItemCode: 1,
          designNumber: 1,
          status: 1,
          finalPrice: 1,
          appxMetalWgt: 1,

          // Legacy Metal Keys (populated from unified metal)
          metalType: {
            _id: "$metal._id",
            metalName: "$metal.name",
            price: "$metal.price_per_gram",
          },
          metalStamp: {
            _id: "$metal._id",
            karat: "$metal.stamp",
          },

          // Singular aliases for frontend consistency
          metalTypeDetail: {
            _id: "$metal._id",
            metalName: "$metal.name",
            price: "$metal.price_per_gram",
          },
          metalStampDetail: {
            _id: "$metal._id",
            karat: "$metal.stamp",
          },

          // New Metal Keys
          metalDetails: {
            _id: "$metal._id",
            name: "$metal.name",
            type: "$metal.type",
            stamp: "$metal.stamp",
          },
          cMetalDetails: {
            _id: "$cMetal._id",
            name: "$cMetal.name",
            type: "$cMetal.type",
            stamp: "$cMetal.stamp",
          },

          category: {
            _id: "$category._id",
            categoryName: "$category.categoryName",
          },

          // SUB CATEGORIES ARRAY
          subCategories: {
            $map: {
              input: "$subCategories",
              as: "sub",
              in: {
                _id: "$$sub._id",
                categoryName: "$$sub.categoryName",
              },
            },
          },
          size: {
            _id: "$size._id",
            name: "$size.name",
            code: "$size.code",
          },

          labourDetails: {
            _id: "$labour._id",
            name: "$labour.name",
            labourCode: "$labour.code",
            amount: "$labour.amount_per_gm",
          },
          otherChargeDetails: {
            _id: "$otherCharge._id",
            name: "$otherCharge.name",
            chargeCode: "$otherCharge.code",
            amount: "$otherCharge.amount_per_gm",
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    const [data, total] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(matchStage),
    ]);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product list fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const get_product_list_v2 = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      metalType,
      metalStamp,
      status,
      category,
      subCategory,
      collectionId,
      tags,
      minPrice,
      maxPrice,
      metalId,
      ids,
    } = req.body;

    let matchStage = { isDeleted: { $ne: 1 } };

    if (ids && ids.length > 0) {
      matchStage._id = {
        $in: ids
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      matchStage.$or = [
        { productTitle: searchRegex },
        { itemCode: searchRegex },
        { designNumber: searchRegex },
      ];
    }

    if (status) matchStage.status = status;
    if (category) matchStage.categoryId = new mongoose.Types.ObjectId(category);

    if (subCategory) {
      const subCategoryIds = (Array.isArray(subCategory) ? subCategory : subCategory.split(","))
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (subCategoryIds.length > 0) {
        matchStage.subCategoryId = { $in: subCategoryIds };
      }
    }

    if (collectionId) matchStage.collectionId = new mongoose.Types.ObjectId(collectionId);
    if (tags) matchStage.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    if (minPrice || maxPrice) {
      matchStage.finalPrice = {};
      if (minPrice) matchStage.finalPrice.$gte = Number(minPrice);
      if (maxPrice) matchStage.finalPrice.$lte = Number(maxPrice);
    }

    if (metalId) matchStage.metalId = new mongoose.Types.ObjectId(metalId);

    if (metalType || metalStamp) {
      const metalFilter = { isDeleted: 0 };
      if (metalType) metalFilter.type = metalType;
      if (metalStamp) metalFilter.stamp = metalStamp;

      const matchingMetals = await mongoose.model("Metal").find(metalFilter).select("_id").lean();
      const metalIds = matchingMetals.map(m => m._id);
      matchStage.metalId = { $in: metalIds };
    }

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) },
      {
        $project: {
          productTitle: 1,
          itemCode: 1,
          parentItemCode: 1,
          designNumber: 1,
          status: 1,
          finalPrice: 1,
          appxMetalWgt: 1,
          metalId: 1,
          cMetalId: 1,
          labourCode: 1,
          otherChargeCode: 1,
          defaultSize: 1,
          categoryId: 1,
          subCategoryId: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];

    const [rawProducts, total, metals, charges, sizes, categories] = await Promise.all([
      Product.aggregate(pipeline),
      Product.countDocuments(matchStage),
      mongoose.model("Metal").find({ isDeleted: 0 }).lean(),
      mongoose.model("Charge").find({ isDeleted: 0 }).lean(),
      mongoose.model("sizes").find({ isDeleted: 0 }).lean(),
      mongoose.model("Category").find({ isDeleted: 0 }).lean()
    ]);

    const metalsMap = new Map(metals.map(m => [m._id.toString(), m]));
    const chargesMap = new Map(charges.map(c => [c._id.toString(), c]));
    const sizesMap = new Map(sizes.map(s => [s._id.toString(), s]));
    const categoriesMap = new Map(categories.map(c => [c._id.toString(), c]));

    const data = rawProducts.map(prod => {
      const metal = metalsMap.get(prod.metalId?.toString());
      const cMetal = metalsMap.get(prod.cMetalId?.toString());
      const labour = chargesMap.get(prod.labourCode?.toString());
      const otherCharge = chargesMap.get(prod.otherChargeCode?.toString());
      const size = sizesMap.get(prod.defaultSize?.toString());
      const category = categoriesMap.get(prod.categoryId?.toString());

      const subCategories = Array.isArray(prod.subCategoryId)
        ? prod.subCategoryId.map(subId => {
          const sub = categoriesMap.get(subId.toString());
          return sub ? { _id: sub._id, categoryName: sub.categoryName } : null;
        }).filter(Boolean)
        : [];

      return {
        _id: prod._id,
        productTitle: prod.productTitle,
        itemCode: prod.itemCode,
        parentItemCode: prod.parentItemCode,
        designNumber: prod.designNumber,
        status: prod.status,
        finalPrice: prod.finalPrice,
        appxMetalWgt: prod.appxMetalWgt,

        metalType: metal ? {
          _id: metal._id,
          metalName: metal.name,
          price: metal.price_per_gram
        } : null,
        metalStamp: metal ? {
          _id: metal._id,
          karat: metal.stamp
        } : null,

        metalTypeDetail: metal ? {
          _id: metal._id,
          metalName: metal.name,
          price: metal.price_per_gram
        } : null,
        metalStampDetail: metal ? {
          _id: metal._id,
          karat: metal.stamp
        } : null,

        metalDetails: metal ? {
          _id: metal._id,
          name: metal.name,
          type: metal.type,
          stamp: metal.stamp
        } : null,
        cMetalDetails: cMetal ? {
          _id: cMetal._id,
          name: cMetal.name,
          type: cMetal.type,
          stamp: cMetal.stamp
        } : null,

        category: category ? {
          _id: category._id,
          categoryName: category.categoryName
        } : null,

        subCategories,

        size: size ? {
          _id: size._id,
          name: size.name,
          code: size.code
        } : null,

        labourDetails: labour ? {
          _id: labour._id,
          name: labour.name,
          labourCode: labour.code,
          amount: labour.amount_per_gm
        } : null,
        otherChargeDetails: otherCharge ? {
          _id: otherCharge._id,
          name: otherCharge.name,
          chargeCode: otherCharge.code,
          amount: otherCharge.amount_per_gm
        } : null,
        createdAt: prod.createdAt,
        updatedAt: prod.updatedAt
      };
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product list fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const export_product = async (req, res) => {
  try {
    // -----------------------------
    // FILTERS (same as list API)
    // -----------------------------
    const { filters = {}, selectedIds = [] } = req.body;

    const {
      search,
      status,
      category,
      subCategory,
      collectionId,
      tags,
      minPrice,
      maxPrice,
      metalId,
    } = filters;

    const Baseurl = BaseURL(req);

    let matchStage = { isDeleted: { $ne: 1 } };

    if (selectedIds && selectedIds.length > 0) {
      matchStage._id = {
        $in: selectedIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id)),
      };
    } else {
      // Apply same filters as get_product_list

      // STATUS (multi)
      if (status) {
        const statusArr = Array.isArray(status) ? status : [status];
        matchStage.status = { $in: statusArr };
      }
      // if (metalType && mongoose.Types.ObjectId.isValid(metalType)) {
      //         matchStage.metalType = new mongoose.Types.ObjectId(metalType);
      //     }

      //     if (metalStamp && mongoose.Types.ObjectId.isValid(metalStamp)) {
      //         matchStage.metalStamp = new mongoose.Types.ObjectId(metalStamp);
      //     }

      //     if (category && mongoose.Types.ObjectId.isValid(category)) {
      //         matchStage.categoryId = new mongoose.Types.ObjectId(category);
      //     }
      // SEARCH
      if (search) {
        matchStage.$or = [
          { itemCode: { $regex: search, $options: "i" } },
          { productTitle: { $regex: search, $options: "i" } },
        ];
      }

      const metalIds = toObjectIdArray(metalId);
      if (metalIds.length) {
        matchStage.metalId = { $in: metalIds };
      }

      const categoryIds = toObjectIdArray(category);
      if (categoryIds.length) {
        matchStage.categoryId = { $in: categoryIds };
      }

      const subCategoryIds = toObjectIdArray(subCategory);
      if (subCategoryIds.length) {
        matchStage.subCategoryId = { $in: subCategoryIds };
      }

      const collectionIds = toObjectIdArray(collectionId);
      if (collectionIds.length) {
        matchStage.collectionId = { $in: collectionIds };
      }

      const tagIds = toObjectIdArray(tags);
      if (tagIds.length) {
        matchStage.tags = { $in: tagIds };
      }

      let priceFilter = {};
      if (minPrice) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice) {
        priceFilter.$lte = Number(maxPrice);
      }
      if (Object.keys(priceFilter).length > 0) {
        matchStage.finalPrice = priceFilter;
      }
    }

    // -----------------------------
    // COLUMNS
    // -----------------------------
    //
    // Column order and header names are an EXACT match for the canonical
    // reference sheet ("Final ProductData Sheet Consolidated") — 49 columns —
    // so a file exported here re-imports without any column edits.
    //
    // The importer's validateHeader() lowercases, so `Stonetype`/`isEngraving`
    // casing is irrelevant, but the NAMES must match: it requires `gemcolor`,
    // `gemclarity` and `matchingproducts` (we used to emit Color / Clarity /
    // CombineWith, which failed header validation and dropped stone data).
    //
    // `Qty` is intentionally absent — the reference sheet has no such column.
    // The importer therefore leaves qty untouched (see the qty-column guard in
    // importProduct.controller.js).
    //
    // `MM Size` is not stored on ProductStone, so it always exports blank.
    //
    // Image/video values are bare MediaLocation strings (no URL prefix)
    // so re-import preserves the original DB values.
    //
    // Layout: one row per product with the first stone columns inline.
    // Additional stones get rows where all product columns are blank
    // and only the stone columns are populated — same shape the importer
    // already expects.
    //
    const EXPORT_HEADERS = [
      "MainDesignNumber",
      "ItemCode",
      "ParentItemCode",
      "ProdCategory",
      "ProdSubCategory",
      "ProdTitle",
      "ProdDesc",
      "Collection",
      "Tags",
      "Ring Size",
      "Gender",
      "MetalType",
      "MetalStamp",
      "AppxMetalWeight",
      "Width",
      "Height",
      "Length",
      "LabourCode",
      "OtherChargesCode",
      "isEngraving",
      "Type",
      "Stonetype",
      "GemType",
      "Shape",
      "GemColor",
      "GemClarity",
      "Size",
      "Pieces",
      "Wgt",
      "MM Size",
      "TotalCarat",
      "ImageUrl1",
      "ImageUrl2",
      "ImageUrl3",
      "ImageUrl4",
      "ImageUrl5",
      "VideoUrl",
      "Status",
      "MatchingProducts",
      "SimilarProducts",
      "Slug",
      "HaveChain",
      "ChainMetalType",
      "ChainMetalStamp",
      "Weight",
      "ChainLength",
      "ShipmentDays",
      "SEO_Title",
      "SEO_Description",
    ];

    const BLANK_ROW = Object.fromEntries(EXPORT_HEADERS.map((h) => [h, ""]));

    // Only the fields the sheet reads. The old pipeline pulled whole documents.
    const PRODUCT_FIELDS = {
      designNumber: 1, itemCode: 1, parentItemCode: 1, categoryId: 1,
      subCategoryId: 1, productTitle: 1, productDesc: 1, collectionId: 1,
      tags: 1, defaultSize: 1, gender: 1, metalId: 1, appxMetalWgt: 1, width: 1,
      height: 1, length: 1, labourCode: 1, otherChargeCode: 1, isEngraving: 1,
      images: 1, videos: 1, status: 1, similarProducts: 1, combineWith: 1,
      slug: 1, haveChain: 1, cMetalId: 1, cWgt: 1, cLength: 1, shipmentDays: 1,
      SEODetails: 1,
    };

    const STONE_FIELDS = {
      productId: 1, type: 1, stoneGroup: 1, shape: 1, color: 1, clarity: 1,
      size: 1, pieces: 1, weight: 1, wgt: 1, totalCarat: 1,
    };

    // -----------------------------
    // MASTER LOOKUPS — fetched ONCE
    // -----------------------------
    // Previously every one of these was a $lookup executed per product, and
    // `stonegroups` + `parameters` were looked up once per STONE (N×M joins).
    // They are small reference collections, so resolve them in memory instead.
    const toMap = (rows, pick) => new Map(rows.map((r) => [String(r._id), pick(r)]));

    const [categoryRows, collectionRows, tagRows, metalRows, chargeRows, paramRows, sizeRows] =
      await Promise.all([
        Category.find({}, { categoryName: 1 }).lean(),
        CollectionModel.find({}, { collectionName: 1 }).lean(),
        Tag.find({}, { name: 1 }).lean(),
        Metal.find({}, { type: 1, stamp: 1 }).lean(),
        chargesModel.find({}, { code: 1 }).lean(),
        Parameter.find({}, { code: 1 }).lean(),
        Sizes.find({}, { name: 1 }).lean(),
      ]);

    const categoryName = toMap(categoryRows, (r) => r.categoryName);
    const collectionName = toMap(collectionRows, (r) => r.collectionName);
    const tagName = toMap(tagRows, (r) => r.name);
    const metalById = toMap(metalRows, (r) => r);
    const chargeCode = toMap(chargeRows, (r) => r.code);
    const shapeCode = toMap(paramRows, (r) => r.code);
    const sizeName = toMap(sizeRows, (r) => r.name);

    // stoneGroup -> { stoneType, type }. `type` is the gem type (GemType column).
    // Filled lazily per chunk and cached across chunks, so we never load the
    // (potentially large) stonegroups collection.
    const stoneGroupById = new Map();

    const names = (ids, map) => {
      const arr = Array.isArray(ids) ? ids : ids ? [ids] : [];
      return arr.map((id) => map.get(String(id))).filter(Boolean).join(", ");
    };

    const stoneCols = (stone) => {
      const group = stone?.stoneGroup
        ? stoneGroupById.get(String(stone.stoneGroup))
        : null;
      return {
        Type: stone?.type || "",
        Stonetype: group?.stoneType || "",
        GemType: group?.type || "",
        Shape:
          (stone?.shape && shapeCode.get(String(stone.shape))) ||
          (stone?.shape ? String(stone.shape) : ""),
        GemColor: stone?.color || "",
        GemClarity: stone?.clarity || "",
        Size: stone?.size || "",
        Pieces: stone?.pieces || "",
        Wgt: stone?.wgt ?? stone?.weight ?? "",
        // Not stored on ProductStone — exported blank to keep the column.
        "MM Size": "",
        TotalCarat: stone?.totalCarat || "",
      };
    };

    // -----------------------------
    // ROW BUILDER
    // -----------------------------
    // Exactly 2 queries per chunk of products (stones + any uncached stone
    // groups) — never one query per product or per stone.
    const buildRows = async (chunk) => {
      const ids = chunk.map((p) => p._id);

      const stones = await ProductStone.find(
        { productId: { $in: ids } },
        STONE_FIELDS
      ).lean();

      const missing = [
        ...new Set(
          stones
            .map((s) => s.stoneGroup && String(s.stoneGroup))
            .filter((id) => id && !stoneGroupById.has(id))
        ),
      ];
      if (missing.length) {
        const groups = await StoneGroup.find(
          { _id: { $in: missing } },
          { stoneType: 1, type: 1 }
        ).lean();
        for (const g of groups) {
          stoneGroupById.set(String(g._id), { stoneType: g.stoneType, type: g.type });
        }
      }

      const stonesByProduct = new Map();
      for (const s of stones) {
        const key = String(s.productId);
        let list = stonesByProduct.get(key);
        if (!list) stonesByProduct.set(key, (list = []));
        list.push(s);
      }
      // Stable stone order within a product.
      for (const list of stonesByProduct.values()) {
        list.sort((a, b) => String(a._id).localeCompare(String(b._id)));
      }

      const rows = [];
      for (const product of chunk) {
        const list = stonesByProduct.get(String(product._id)) || [];
        const images = product.images || [];
        const metal = metalById.get(String(product.metalId));
        const cMetal = metalById.get(String(product.cMetalId));

        rows.push({
          MainDesignNumber: product.designNumber || "",
          ItemCode: product.itemCode || "",
          ParentItemCode: product.parentItemCode || "",
          ProdCategory: categoryName.get(String(product.categoryId)) || "",
          ProdSubCategory: names(product.subCategoryId, categoryName),
          ProdTitle: product.productTitle || "",
          ProdDesc: product.productDesc || "",
          Collection: collectionName.get(String(product.collectionId)) || "",
          Tags: names(product.tags, tagName),
          "Ring Size": sizeName.get(String(product.defaultSize)) || "",
          Gender: product.gender || "",
          MetalType: metal?.type || "",
          MetalStamp: metal?.stamp || "",
          AppxMetalWeight: product.appxMetalWgt ?? "",
          Width: product.width || "",
          Height: product.height || "",
          Length: product.length || "",
          LabourCode: chargeCode.get(String(product.labourCode)) || "",
          OtherChargesCode: chargeCode.get(String(product.otherChargeCode)) || "",
          isEngraving: product.isEngraving ? "Yes" : "No",
          ...stoneCols(list[0]),
          ImageUrl1: images[0]?.MediaLocation || "",
          ImageUrl2: images[1]?.MediaLocation || "",
          ImageUrl3: images[2]?.MediaLocation || "",
          ImageUrl4: images[3]?.MediaLocation || "",
          ImageUrl5: images[4]?.MediaLocation || "",
          VideoUrl: product.videos?.[0]?.MediaLocation || "",
          Status: product.status || "",
          // The importer reads `matchingproducts ?? combinewith` into combineWith.
          MatchingProducts: (product.combineWith || []).join(", "),
          SimilarProducts: (product.similarProducts || []).join(", "),
          Slug: product.slug || "",
          HaveChain: product.haveChain || "No",
          ChainMetalType: cMetal?.type || "",
          ChainMetalStamp: cMetal?.stamp || "",
          Weight: product.cWgt ?? "",
          ChainLength: product.cLength || "",
          ShipmentDays: product.shipmentDays ?? "",
          SEO_Title: product.SEODetails?.metaTitle || "",
          SEO_Description: product.SEODetails?.metaDescription || "",
        });

        // Additional stones go on their own rows; product columns blank,
        // only the stone block is filled — importer recognizes those rows
        // by an empty ItemCode and appends the stones to the parent.
        for (const stone of list.slice(1)) {
          rows.push({ ...BLANK_ROW, ...stoneCols(stone) });
        }
      }
      return rows;
    };

    // -----------------------------
    // STREAM INTO A SINGLE XLSX
    // -----------------------------
    // Rows are committed to disk as they are produced, so peak memory stays
    // flat instead of holding every product + every row + the whole workbook.
    const fileName = `product_export_${Date.now()}.xlsx`;
    const dir = uploadsPath("exportproduct");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = join(dir, fileName);

    const CHUNK_SIZE = 500;
    const cursor = Product.find(matchStage, PRODUCT_FIELDS)
      .lean()
      .cursor({ batchSize: CHUNK_SIZE });

    let workbook = null;
    let sheet = null;
    let totalProducts = 0;
    let totalRows = 0;
    const widths = EXPORT_HEADERS.map((h) => h.length + 2);

    // Streaming fixes column widths before the first row is committed, so size
    // them from the headers plus the first chunk of real data.
    const startSheet = (sampleRows) => {
      for (const row of sampleRows) {
        EXPORT_HEADERS.forEach((h, i) => {
          const len = row[h] == null ? 0 : String(row[h]).length;
          if (len + 2 > widths[i]) widths[i] = Math.min(len + 2, 50);
        });
      }

      workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        filename: filePath,
        useStyles: true,
      });
      sheet = workbook.addWorksheet("Products");
      sheet.columns = EXPORT_HEADERS.map((h, i) => ({ key: h, width: widths[i] }));

      const headerRow = sheet.addRow(EXPORT_HEADERS);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ADD8E6" },
        };
      });
      headerRow.commit();
    };

    let buffer = [];
    const drain = async () => {
      if (!buffer.length) return;
      const chunk = buffer;
      buffer = [];
      const rows = await buildRows(chunk);
      totalProducts += chunk.length;
      if (!workbook) startSheet(rows);
      for (const row of rows) {
        sheet.addRow(EXPORT_HEADERS.map((h) => row[h] ?? "")).commit();
        totalRows++;
      }
    };

    for await (const product of cursor) {
      buffer.push(product);
      if (buffer.length >= CHUNK_SIZE) await drain();
    }
    await drain();

    // Nothing matched — no file was ever created.
    if (!workbook) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "No data found to export",
      });
    }

    await sheet.commit();
    await workbook.commit();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Export successful",
      totalProducts, // number of products
      totalRows, // number of excel rows
      url: Baseurl + `/uploads/exportproduct/${fileName}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const get_product_detail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Product id is required",
      });
    }

    // -----------------------------
    // PIPELINE
    // -----------------------------
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: { $ne: 1 },
        },
      },

      // Absolutize image/video MediaLocation values against the
      // CloudFront product-list base. The admin detail page renders
      // `<img src={img.MediaLocation}>` directly — without this stage
      // the browser would request relative filenames from the admin
      // host and 404.
      appendMediaUrls(),

      // -----------------------------
      // STONES
      // -----------------------------
      {
        $lookup: {
          from: "productstones",
          localField: "_id",
          foreignField: "productId",
          as: "stones",
        },
      },
      // -----------------------------
      // UNWIND STONES
      // -----------------------------
      {
        $unwind: {
          path: "$stones",
          preserveNullAndEmptyArrays: true,
        },
      },

      // -----------------------------
      // LOOKUP STONEGROUP
      // -----------------------------
      {
        $lookup: {
          from: "stonegroups",
          localField: "stones.stoneGroup",
          foreignField: "_id",
          as: "stoneGroupDetails",
        },
      },
      {
        $unwind: {
          path: "$stoneGroupDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // -----------------------------
      // LOOKUP PARAMETERS FOR STONES
      // -----------------------------
      {
        $lookup: {
          from: "parameters",
          localField: "stones.shape",
          foreignField: "_id",
          as: "shapeParam",
        },
      },
      { $unwind: { path: "$shapeParam", preserveNullAndEmptyArrays: true } },

      // {
      //     $lookup: {
      //         from: "parameters",
      //         localField: "stones.color",
      //         foreignField: "_id",
      //         as: "colorParam"
      //     }
      // },
      // { $unwind: { path: "$colorParam", preserveNullAndEmptyArrays: true } },

      // {
      //     $lookup: {
      //         from: "parameters",
      //         localField: "stones.clarity",
      //         foreignField: "_id",
      //         as: "clarityParam"
      //     }
      // },
      // { $unwind: { path: "$clarityParam", preserveNullAndEmptyArrays: true } },

      // -----------------------------
      // ADD STONEGROUP AND PARAMETERS DATA INTO STONE
      // -----------------------------
      // Originally this stage OVERWROTE `stones.shape/color/clarity`
      // with the matching Parameter `code` string for display, but
      // that destroyed the ObjectId reference and made the admin
      // edit form unable to pre-select the dropdowns (options are
      // keyed by `_id`). Now we keep the original ObjectId in place
      // and surface the human-readable bits under separate
      // `*Details` sub-objects. Any reader that wants the code can
      // pull it from there.
      {
        $addFields: {
          "stones.stoneGroupDetails": {
            _id: "$stoneGroupDetails._id",
            stoneType: "$stoneGroupDetails.stoneType",
            type: "$stoneGroupDetails.type",
            gemType: "$stoneGroupDetails.type",
          },
          "stones.shapeDetails": {
            _id: "$shapeParam._id",
            code: "$shapeParam.code",
            name: "$shapeParam.name",
          },
          // "stones.colorDetails": {
          //     _id: "$colorParam._id",
          //     code: "$colorParam.code",
          //     name: "$colorParam.name"
          // },
          // "stones.clarityDetails": {
          //     _id: "$clarityParam._id",
          //     code: "$clarityParam.code",
          //     name: "$clarityParam.name"
          // }
        },
      },
      // -----------------------------
      // CATEGORY
      // -----------------------------
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      // -----------------------------
      // SUBCATEGORIES (FROM CATEGORY)
      // -----------------------------
      {
        $lookup: {
          from: "categories",
          let: { categoryId: "$categoryId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$parentCategoryId", "$$categoryId"],
                },
              },
            },
            {
              $match: {
                isDeleted: 0,
                status: "ACTIVE",
              },
            },
          ],
          as: "subCategories",
        },
      },

      // METAL DETAILS (Unified)
      // {
      //     $lookup: {
      //         from: "metaltypes",
      //         localField: "metalType",
      //         foreignField: "_id",
      //         as: "metalTypeDetails"
      //     }
      // },
      // { $unwind: { path: "$metalTypeDetails", preserveNullAndEmptyArrays: true } },
      // {
      //     $lookup: {
      //         from: "metalstamps",
      //         localField: "metalStamp",
      //         foreignField: "_id",
      //         as: "metalStampDetails"
      //     }
      // },
      // { $unwind: { path: "$metalStampDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "metals",
          localField: "metalId",
          foreignField: "_id",
          as: "metalDetails",
        },
      },
      { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },

      // CHAIN METAL DETAILS
      {
        $lookup: {
          from: "metals",
          localField: "cMetalId",
          foreignField: "_id",
          as: "cMetalDetails",
        },
      },
      { $unwind: { path: "$cMetalDetails", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "collections",
          localField: "collectionId",
          foreignField: "_id",
          as: "collectionDetails",
        },
      },

      {
        $lookup: {
          from: "tags",
          localField: "tags",
          foreignField: "_id",
          as: "tagDetails",
        },
      },

      // LABOUR (Charges Master)
      // {
      //     $lookup: {
      //         from: "labourcharges",
      //         localField: "labourCode",
      //         foreignField: "_id",
      //         as: "labourDetails"
      //     }
      // },
      // { $unwind: { path: "$labourDetails", preserveNullAndEmptyArrays: true } },
      // {
      //     $lookup: {
      //         from: "othercharges",
      //         localField: "otherChargeCode",
      //         foreignField: "_id",
      //         as: "otherChargeDetails"
      //     }
      // },
      // { $unwind: { path: "$otherChargeDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "charges",
          localField: "labourCode",
          foreignField: "_id",
          as: "labourDetails",
        },
      },
      { $unwind: { path: "$labourDetails", preserveNullAndEmptyArrays: true } },

      // OTHER CHARGE (Charges Master)
      {
        $lookup: {
          from: "charges",
          localField: "otherChargeCode",
          foreignField: "_id",
          as: "otherChargeDetails",
        },
      },
      {
        $unwind: {
          path: "$otherChargeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // -----------------------------
      // GROUP BACK STONES
      // -----------------------------
      {
        $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          stones: { $push: "$stones" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$doc", { stones: "$stones" }],
          },
        },
      },
      // -----------------------------
      // FINAL RESPONSE
      // -----------------------------
      {
        $project: {
          // -----------------------------
          // ORIGINAL DATA (KEEP THESE)
          // -----------------------------
          _id: 1,
          designNumber: 1,
          itemCode: 1,
          parentItemCode: 1,

          productTitle: 1,
          productDesc: 1,

          // categoryId: 1,
          // subCategoryId: 1,
          // metalType: 1,
          // metalStamp: 1,
          // labourCode: 1,
          // otherChargeCode: 1,

          metalId: 1,
          cMetalId: 1,
          labourCode: 1,
          otherChargeCode: 1,
          categoryId: 1,
          // Pre-selected subcategories — admin form pre-checks
          // these in the Style multi-select on edit.
          subCategoryId: 1,
          collectionId: 1,
          tags: 1,
          // Default size (Ring/Bracelet size ObjectId) when the
          // category requires a size and this SKU was tied to one.
          defaultSize: 1,

          // COLLECTIONS
          collectionDetails: {
            $map: {
              input: "$collectionDetails",
              as: "col",
              in: {
                _id: "$$col._id",
                collectionName: "$$col.collectionName",
                image: "$$col.image",
              },
            },
          },

          // TAGS
          tagDetails: {
            $map: {
              input: "$tagDetails",
              as: "tag",
              in: {
                _id: "$$tag._id",
                name: "$$tag.name",
                acceptableValues: "$$tag.acceptableValues",
              },
            },
          },
          gender: 1,
          appxMetalWgt: 1,

          images: 1,
          videos: 1,

          finalPrice: 1,

          slug: 1,
          haveChain: 1,
          shipmentDays: 1,

          status: 1,
          SEODetails: 1,

          isEngraving: 1,
          qty: 1,
          height: 1,
          width: 1,
          length: 1,

          // Cross-sell + bundle item-code arrays — the admin
          // edit form pre-fills its pickers from these.
          similarProducts: 1,
          combineWith: 1,

          createdAt: 1,
          updatedAt: 1,

          offerDetails: 1,
          discountedPrice: 1,

          // -----------------------------
          // POPULATED DATA (NEW FIELDS)
          // -----------------------------
          categoryDetails: {
            _id: "$category._id",
            categoryName: "$category.categoryName",
          },

          subCategories: {
            $map: {
              input: "$subCategories",
              as: "sub",
              in: {
                _id: "$$sub._id",
                categoryName: "$$sub.categoryName",
              },
            },
          },

          // metalTypeDetails: {
          //     _id: "$metalTypeDetails._id",
          //     metalName: "$metalTypeDetails.metalName",
          //     price: "$metalTypeDetails.price"
          // },
          // metalStampDetails: {
          //     _id: "$metalStampDetails._id",
          //     karat: "$metalStampDetails.karat"
          // },
          // Backward Compatibility (Plural)
          metalTypeDetails: {
            _id: "$metalDetails._id",
            metalName: "$metalDetails.name",
            price: "$metalDetails.price_per_gram",
          },
          metalStampDetails: {
            _id: "$metalDetails._id",
            karat: "$metalDetails.stamp",
          },

          // Backward Compatibility (Singular - expected by some frontend components)
          metalTypeDetail: {
            _id: "$metalDetails._id",
            metalName: "$metalDetails.name",
            price: "$metalDetails.price_per_gram",
          },
          metalStampDetail: {
            _id: "$metalDetails._id",
            karat: "$metalDetails.stamp",
          },

          // Unified Metal Field
          metalDetails: {
            _id: "$metalDetails._id",
            name: "$metalDetails.name",
            type: "$metalDetails.type",
            stamp: "$metalDetails.stamp",
            price_per_gram: "$metalDetails.price_per_gram",
          },

          cMetalDetails: {
            _id: "$cMetalDetails._id",
            name: "$cMetalDetails.name",
            type: "$cMetalDetails.type",
            stamp: "$cMetalDetails.stamp",
            price_per_gram: "$cMetalDetails.price_per_gram",
          },

          labourDetails: {
            _id: "$labourDetails._id",
            labourCode: "$labourDetails.code",
            amount: "$labourDetails.amount_per_gm",
            name: "$labourDetails.name",
            code: "$labourDetails.code",
            amount_per_gm: "$labourDetails.amount_per_gm",
            min_amount: "$labourDetails.min_amount",
          },

          otherChargeDetails: {
            _id: "$otherChargeDetails._id",
            chargeCode: "$otherChargeDetails.code",
            amount: "$otherChargeDetails.amount_per_gm",
            name: "$otherChargeDetails.name",
            code: "$otherChargeDetails.code",
            amount_per_gm: "$otherChargeDetails.amount_per_gm",
            min_amount: "$otherChargeDetails.min_amount",
          },

          stones: 1,
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    if (!result.length) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Product not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product detail fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const calcutationProduct = async function (req, res) {
  try {
    const {
      itemCode,
      selectedItems = [],
      selectedProductIds = [],
    } = req.body || {};

    const { password } = req.body;
    if (!password) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Please provide password..!",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        errorCode: STATUS_CODE.UNAUTHORIZED,
        message: "Invalid password",
      });
    }

    let condition = {
      isDeleted: 0,
      status: Constant.PRODUCT_STATUS.AVALIABLE,
    };

    if (itemCode) {
      condition.itemCode = itemCode;
    }

    // Multiple itemCodes
    if (selectedItems.length > 0) {
      condition.itemCode = { $in: selectedItems };
    }

    // Multiple Product IDs
    if (selectedProductIds.length > 0) {
      condition._id = {
        $in: selectedProductIds,
      };
    }

    // Stream the ids and re-price in bounded chunks. Passing the whole
    // catalogue in one call made the pricing service load every product and
    // every stone into memory and issue one giant bulkWrite.
    const CHUNK_SIZE = 500;
    const cursor = Product.find(condition).select("_id").lean().cursor({
      batchSize: CHUNK_SIZE,
    });

    let scanned = 0;
    let buffer = [];
    const allOrphans = [];

    const flush = async () => {
      if (!buffer.length) return;
      const productIds = buffer;
      buffer = [];
      const result = await calculateProductsPriceService({ productIds });
      if (result && result.orphans && result.orphans.length > 0) {
        allOrphans.push(...result.orphans);
      }
      scanned += productIds.length;
    };

    for await (const p of cursor) {
      buffer.push(p._id);
      if (buffer.length >= CHUNK_SIZE) await flush();
    }
    await flush();

    // finalPrice may have moved, so re-resolve live offers against the new
    // prices — otherwise offerDetails/discounted prices stay stale until the
    // next /offer/syncOffers. Same step the product import now performs.
    let offersSynced = false;
    if (scanned > 0) {
      const { sync_offers_db } = await import("../services/offer.services.js");
      await sync_offers_db();
      offersSynced = true;
    }

    let issueSheetUrl = null;
    if (allOrphans.length > 0) {
      const generatedPath = await create_excel_files(allOrphans, "Pricing Issues");
      if (generatedPath) {
        if (generatedPath.startsWith("http")) {
          issueSheetUrl = generatedPath;
        } else {
          issueSheetUrl = BaseURL(req) + generatedPath;
        }
      }
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Price calculated successfully",
      products: scanned,
      offersSynced,
      issueSheetUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const calculationProductOptimised = async function (req, res) {
  try {
    const {
      itemCode,
      selectedItems = [],
      selectedProductIds = [],
    } = req.body || {};

    const { password } = req.body;
    if (!password) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Please provide password..!",
      });
    }

    // 1. Parallelize Auth and Target Product Scanning
    const userPromise = User.findById(req.user.userId)
      .select("+password")
      .lean();

    const condition = {
      isDeleted: 0,
      status: Constant.PRODUCT_STATUS.AVALIABLE,
    };
    if (selectedProductIds.length > 0) {
      condition._id = { $in: selectedProductIds };
    } else if (selectedItems.length > 0) {
      condition.itemCode = { $in: selectedItems };
    } else if (itemCode) {
      condition.itemCode = itemCode;
    }

    const productsPromise = Product.find(condition)
      .select(
        "_id itemCode appxMetalWgt haveChain cWgt metalId labourCode otherChargeCode metalPrice labourPrice otherChargePrice SideDiamondPrice CenterDiamondPrice TotalDiamondPrice finalPrice"
      )
      .lean();

    const [user, products] = await Promise.all([userPromise, productsPromise]);

    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        errorCode: STATUS_CODE.UNAUTHORIZED,
        message: "Invalid password",
      });
    }

    if (!products.length) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "No products matched the given criteria.",
      });
    }

    const targetedProductIds = products.map((p) => p._id);

    // 2. Optimized Global Queries (Using Lean and Explicit Projections)
    // CRITICAL OPTIMIZATION: Removed .populate() from StoneGroup
    const [stones, allMetals, metalPriceDoc, allCharges] = await Promise.all([
      ProductStone.find({
        productId: { $in: targetedProductIds },
        status: "ACTIVE",
      })
        .select(
          "productId type shape color clarity totalCarat weight stoneGroup"
        )
        .lean(),
      Metal.find({ status: "ACTIVE", isDeleted: 0 })
        .select("_id price_type purity price_per_gram")
        .lean(),
      MetalPrice.findOne({ status: "ACTIVE", isDeleted: 0 }).lean(),
      chargesModel
        .find({ status: Constant.STATUS.ACTIVE, isDeleted: false })
        .lean(),
    ]);

    // 3. Extrapolate specific IDs to prevent fetching entire massive collections over remote DB
    const stoneGroupIds = new Set();
    const shapeIds = new Set();
    const colorIds = new Set();
    const clarityIds = new Set();

    for (const s of stones) {
      if (s.stoneGroup) stoneGroupIds.add(s.stoneGroup.toString());
      if (s.shape) shapeIds.add(s.shape.toString());
      if (s.color) colorIds.add(s.color.toString());
      if (s.clarity) clarityIds.add(s.clarity.toString());
    }

    const sgQuery = { status: "ACTIVE", $or: [] };
    if (stoneGroupIds.size > 0) {
      sgQuery.$or.push({ _id: { $in: Array.from(stoneGroupIds) } });
    }

    if (shapeIds.size > 0 || colorIds.size > 0 || clarityIds.size > 0) {
      const attrMatch = {};
      if (shapeIds.size > 0) attrMatch.shape = { $in: Array.from(shapeIds) };
      if (colorIds.size > 0) attrMatch.color = { $in: Array.from(colorIds) };
      if (clarityIds.size > 0)
        attrMatch.clarity = { $in: Array.from(clarityIds) };
      sgQuery.$or.push(attrMatch);
    }

    let stoneGroups = [];
    if (sgQuery.$or.length > 0) {
      stoneGroups = await StoneGroup.find(sgQuery)
        .select("shape color clarity carat lgd_price natural_price")
        .lean();
    }

    const paramIdsToFetch = new Set([...shapeIds, ...colorIds, ...clarityIds]);
    for (const sg of stoneGroups) {
      if (sg.shape) paramIdsToFetch.add(sg.shape.toString());
      if (sg.color) paramIdsToFetch.add(sg.color.toString());
      if (sg.clarity) paramIdsToFetch.add(sg.clarity.toString());
    }

    let parameters = [];
    if (paramIdsToFetch.size > 0) {
      parameters = await Parameter.find({
        _id: { $in: Array.from(paramIdsToFetch) },
        status: "ACTIVE",
        isDeleted: 0,
      })
        .select("_id code")
        .lean();
    }

    // ================= FAST HASH INDEXING & PRE-COMPUTATION (O(1)) =================
    const normalize = (str) =>
      String(str || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const normalizeColor = (val) => {
      const v = normalize(val);
      return v === "fg" ? "ef" : v;
    };
    const normalizeClarity = (val) => {
      const v = normalize(val);
      return v.includes("vvs") ? "vvs" : v.includes("vs") ? "vs" : v;
    };

    // Pre-compute Normalized Parameters
    const paramShapeMap = new Map();
    const paramColorMap = new Map();
    const paramClarityMap = new Map();

    for (const p of parameters) {
      const idStr = p._id.toString();
      paramShapeMap.set(idStr, normalize(p.code));
      paramColorMap.set(idStr, normalizeColor(p.code));
      paramClarityMap.set(idStr, normalizeClarity(p.code));
    }

    const chargesMap = new Map(allCharges.map((c) => [c._id.toString(), c]));
    const getStonePrice = (sgDoc) => {
      const preferred = Constant.DEFAULT_PRICE_SOURCE;
      if (sgDoc?.[preferred] > 0) return sgDoc[preferred];
      const fallback =
        preferred === Constant.STONE_PRICE_SOURCE.NATURAL
          ? Constant.STONE_PRICE_SOURCE.LGD
          : Constant.STONE_PRICE_SOURCE.NATURAL;
      return sgDoc?.[fallback] > 0 ? sgDoc[fallback] : 0;
    };

    const matchStoneGroupSize = (groupSize, importSize) => {
      const sgStr = String(groupSize || "")
        .toUpperCase()
        .trim();
      const sizeStr = String(importSize || "")
        .toUpperCase()
        .trim();

      if (sgStr.includes("MM")) {
        return sgStr.replace(/\s+/g, "") === sizeStr.replace(/\s+/g, "");
      }

      const match = sgStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
      if (match) {
        const min = Number(match[1]);
        const max = Number(match[2]);
        const value = Number(sizeStr);
        return value >= min && value <= max;
      }
      return false;
    };

    const stoneGroupsMap = new Map(
      stoneGroups.map((sg) => [sg._id.toString(), getStonePrice(sg)])
    );
    const combinedMetalMap = new Map();

    // Sync and Index Metals
    if (metalPriceDoc) {
      const metalUpdates = [];
      for (const m of allMetals) {
        const basePrice = metalPriceDoc[m.price_type?.toLowerCase()] || 0;
        const price_per_gram = parseFloat(
          ((basePrice / 10) * (m.purity || 1)).toFixed(2)
        );

        const isMetalChanged = m.price_per_gram !== price_per_gram;

        m.price_per_gram = price_per_gram;
        combinedMetalMap.set(m._id.toString(), m);

        if (isMetalChanged) {
          metalUpdates.push({
            updateOne: {
              filter: { _id: m._id },
              update: { $set: { price_per_gram } },
            },
          });
        }
      }
      if (metalUpdates.length) {
        Metal.bulkWrite(metalUpdates, { ordered: false }).catch((e) =>
          console.error("Metal background sync failed", e)
        );
      }
    } else {
      for (const m of allMetals) combinedMetalMap.set(m._id.toString(), m);
    }

    // Build a Multi-Key Hash Map for manual attribute lookups
    // Key format: "shape_color_clarity" -> Array of ranges
    const attributeRulesMap = new Map();
    for (const sg of stoneGroups) {
      // Retrieve pre-normalized string via O(1) ObjectId lookup, fallback to standard normalization
      const shape =
        paramShapeMap.get(sg.shape?.toString()) || normalize(sg.shape);
      const color =
        paramColorMap.get(sg.color?.toString()) || normalizeColor(sg.color);
      const clarity =
        paramClarityMap.get(sg.clarity?.toString()) ||
        normalizeClarity(sg.clarity);

      const compoundKey = `${shape}_${color}_${clarity}`;
      if (!attributeRulesMap.has(compoundKey)) {
        attributeRulesMap.set(compoundKey, []);
      }
      attributeRulesMap.get(compoundKey).push({
        price: getStonePrice(sg),
        caratRange: sg.carat || "",
      });
    }

    // Group Stones by Product ID
    const stonesByProductMap = new Map();
    for (const stone of stones) {
      const pidStr = stone.productId.toString();
      if (!stonesByProductMap.has(pidStr)) stonesByProductMap.set(pidStr, []);
      stonesByProductMap.get(pidStr).push(stone);
    }

    // ================= LOOP PERFORMANCE (O(N)) =================
    const productUpdates = [];

    for (const product of products) {
      const productIdStr = product._id.toString();
      const currentProductStones = stonesByProductMap.get(productIdStr) || [];
      const combinedMetal = combinedMetalMap.get(product.metalId?.toString());

      let metalWeight = product.appxMetalWgt || 0;
      if (product.haveChain?.toLowerCase() === "yes") {
        metalWeight += product.cWgt || 0;
      }

      let metalPrice = 0,
        labourPrice = 0,
        otherPrice = 0;

      if (combinedMetal) {
        metalPrice = (combinedMetal.price_per_gram || 0) * metalWeight;
        const makingCharge = chargesMap.get(product.labourCode?.toString());
        const otherChargeItem = chargesMap.get(
          product.otherChargeCode?.toString()
        );

        if (makingCharge) {
          if (makingCharge.charge_mode === "fixed") {
            labourPrice = makingCharge.amount_per_gm || 0;
          } else {
            labourPrice = (makingCharge.amount_per_gm || 0) * metalWeight;
            if (
              makingCharge.min_amount &&
              labourPrice < makingCharge.min_amount
            )
              labourPrice = makingCharge.min_amount;
          }
        }

        if (otherChargeItem) {
          if (otherChargeItem.charge_mode === "fixed") {
            otherPrice = otherChargeItem.amount_per_gm || 0;
          } else {
            otherPrice = (otherChargeItem.amount_per_gm || 0) * metalWeight;
            if (
              otherChargeItem.min_amount &&
              otherPrice < otherChargeItem.min_amount
            )
              otherPrice = otherChargeItem.min_amount;
          }
        }
      }

      let totalDiamondPrice = 0,
        sideDiamondPrice = 0,
        centerDiamondPrice = 0;

      for (const stone of currentProductStones) {
        let matchedAmount = 0;

        if (stone.stoneGroup) {
          // O(1) instantaneous Map lookup by ID
          matchedAmount = stoneGroupsMap.get(stone.stoneGroup.toString()) || 0;
        } else {
          // O(1) Instantaneous Map lookup by Compound Key String
          const shape =
            paramShapeMap.get(stone.shape?.toString()) ||
            normalize(stone.shape);
          const color =
            paramColorMap.get(stone.color?.toString()) ||
            normalizeColor(stone.color);
          const clarity =
            paramClarityMap.get(stone.clarity?.toString()) ||
            normalizeClarity(stone.clarity);

          const compoundKey = `${shape}_${color}_${clarity}`;
          const ranges = attributeRulesMap.get(compoundKey);

          if (ranges) {
            const matchedRange = ranges.find((r) =>
              matchStoneGroupSize(r.caratRange, stone.size)
            );
            if (matchedRange) matchedAmount = matchedRange.price;
          }
        }

        if (matchedAmount === 0) continue;

        const stoneCost = matchedAmount * (stone.weight || 0);
        const type = normalize(stone.type);

        if (type === "side") {
          sideDiamondPrice += stoneCost;
          totalDiamondPrice += stoneCost;
        } else if (type === "center") {
          centerDiamondPrice += stoneCost;
          totalDiamondPrice += stoneCost;
        }
      }

      const newMetalPrice = Number(metalPrice.toFixed(2));
      const newLabourPrice = Number(labourPrice.toFixed(2));
      const newOtherPrice = Number(otherPrice.toFixed(2));
      const newSideDiamondPrice = Number(sideDiamondPrice.toFixed(2));
      const newCenterDiamondPrice = Number(centerDiamondPrice.toFixed(2));
      const newTotalDiamondPrice = Number(totalDiamondPrice.toFixed(2));
      const newFinalPrice = parseFloat(
        (metalPrice + labourPrice + otherPrice + totalDiamondPrice).toFixed(2)
      );

      // Avoid redundant DB writes if the price hasn't changed
      const isProductChanged =
        product.metalPrice !== newMetalPrice ||
        product.labourPrice !== newLabourPrice ||
        product.otherChargePrice !== newOtherPrice ||
        product.SideDiamondPrice !== newSideDiamondPrice ||
        product.CenterDiamondPrice !== newCenterDiamondPrice ||
        product.TotalDiamondPrice !== newTotalDiamondPrice ||
        product.finalPrice !== newFinalPrice;

      if (isProductChanged) {
        productUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                metalPrice: newMetalPrice,
                labourPrice: newLabourPrice,
                otherChargePrice: newOtherPrice,
                SideDiamondPrice: newSideDiamondPrice,
                CenterDiamondPrice: newCenterDiamondPrice,
                TotalDiamondPrice: newTotalDiamondPrice,
                finalPrice: newFinalPrice,
              },
            },
          },
        });
      }
    }

    if (productUpdates.length) {
      await Product.bulkWrite(productUpdates, { ordered: false });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Price calculated successfully",
    });
  } catch (error) {
    console.error("Critical calculation failures:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const get_category_list_for_product = async function (req, res) {
  try {
    // `$ne: 1` includes legacy rows missing the isDeleted field.
    let cate = await Category.find({
      parentCategoryId: null,
      isDeleted: { $ne: 1 },
    }).sort({ createdAt: -1 });
    let data = [];
    if (cate?.length) {
      for (let c of cate) {
        data.push({
          _id: c._id,
          categoryName: c.categoryName ? c.categoryName : undefined,
          hasSize: c.hasSize ? c.hasSize : undefined,
        });
      }
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Category list get successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No any category exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_subCategory_list_usingId = async function (req, res) {
  try {
    let cate = await Category.find({ parentCategoryId: req.params.id, isDeleted: { $ne: 1 } }).sort({
      createdAt: -1,
    });
    let data = [];
    if (cate?.length) {
      for (let c of cate) {
        data.push({
          _id: c._id,
          categoryName: c.categoryName ? c.categoryName : undefined,
        });
      }
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Category list get successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No any category exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_metal_list_product = async function (req, res) {
  try {
    let metals = await Metal.find({
      status: Constant.STATUS.ACTIVE,
      isDeleted: 0,
    }).sort({ name: 1 });

    if (metals.length) {
      let data = metals.map((m) => ({
        _id: m._id,
        name: m.name,
        type: m.type,
        stamp: m.stamp,
        metalName: m.name, // Legacy support
        karat: m.stamp, // Legacy support
      }));
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Metal list fetched successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No metals exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

// export const get_metalType_list = async function (req, res) {
//     try {
//         let mType = await MetalType.find({
//             status: Constant.STATUS.ACTIVE
//         }).sort({ createdAt: -1 });
//         let data = []
//         if (mType.length) {
//             for (let m of mType) {
//                 data.push({
//                     _id: m._id,
//                     metalName: m.metalName ? m.metalName : undefined
//                 })
//             };
//             return res.status(STATUS_CODE.OK).json({ errorCode: STATUS_CODE.OK, message: 'Metal type list get successfully..!', data: data })
//         } else {
//             return res.status(STATUS_CODE.NOT_FOUND).json({ errorCode: STATUS_CODE.NOT_FOUND, message: 'No metal type exist..!', data: [] })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message })
//     }
// }

// export const get_metalStamp_list = async function (req, res) {
//     try {
//         let mType = await MetalStamp.find({ status: Constant.STATUS.ACTIVE }).sort({ createdAt: -1 });
//         let data = []
//         if (mType.length) {
//             for (let m of mType) {
//                 data.push({
//                     _id: m._id,
//                     karat: m.karat ? m.karat : undefined
//                 })
//             };
//             return res.status(STATUS_CODE.OK).json({ errorCode: STATUS_CODE.OK, message: 'Metal stamp list get successfully..!', data: data })
//         } else {
//             return res.status(STATUS_CODE.NOT_FOUND).json({ errorCode: STATUS_CODE.NOT_FOUND, message: 'No metal stamp exist..!', data: [] })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(STATUS_CODE.INTERNAL_ERROR).json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message })
//     }
// }

export const get_collection_list_for_product = async function (req, res) {
  try {
    // `.lean()` is mandatory — without it the decorators below walk
    // Mongoose subdoc circular refs and the response dies with
    // "Maximum call stack size exceeded".
    // Collection has no isDeleted field (hard-deleted) — filter by status so
    // suspended collections don't leak into the storefront filter facet.
    const col = await CollectionModel.find({ status: Constant.STATUS.ACTIVE })
      .sort({ createdAt: -1 })
      .lean();
    if (col.length) {
      const Baseurl = BaseURL(req);
      // Pre-resolve every banner redirect target across all
      // collections so decorateRedirects emits absolute hrefs.
      const maps = await buildRedirectMaps(
        col.map((c) => c.interProductBanners || [])
      );
      const data = col.map((c) => ({
        _id: c._id,
        name: c.collectionName ? c.collectionName : undefined,
        slug: c.slug || undefined,
        // General collection image — used for the /collections index cards
        // (the wide pageBanner is reserved for the collection's own hero).
        image: resolveAssetUrl(c.image, Baseurl, "uploads/collectionImages") || undefined,
        description: c.description || undefined,
        pageBanner: c.pageBanner
          ? {
            image:
              resolveAssetUrl(
                c.pageBanner.image,
                Baseurl,
                "uploads/collectionImages"
              ) || "",
            imageMobile:
              resolveAssetUrl(
                c.pageBanner.imageMobile,
                Baseurl,
                "uploads/collectionImages"
              ) || "",
            heading: c.pageBanner.heading || "",
            subText: c.pageBanner.subText || "",
          }
          : undefined,
        interProductBanners: Array.isArray(c.interProductBanners)
          ? decorateRedirects(c.interProductBanners, maps, Baseurl)
          : [],
      }));
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Collection list get successfully..!",
        data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No any collection exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_tags_list_for_product = async function (req, res) {
  try {
    let mType = await Tag.find({
      status: Constant.STATUS.ACTIVE,
    }).sort({ createdAt: -1 });
    let data = [];
    if (mType.length) {
      for (let m of mType) {
        data.push({
          _id: m._id,
          name: m.name ? m.name : undefined,
        });
      }
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Tag list get successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No tag exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_labourCode_list_product = async function (req, res) {
  try {
    let labour = await chargesModel
      .find({
        status: Constant.STATUS.ACTIVE,
        type: Constant.CHARGE_TYPE.MAKING,
      })
      .sort({ createdAt: -1 });
    if (labour.length) {
      let data = [];
      for (let l of labour) {
        data.push({
          _id: l._id,
          labourCode: l.code ? l.code : undefined,
        });
      }
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Labour list get successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Labour code not exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_otherCharge_list_product = async function (req, res) {
  try {
    let other = await chargesModel
      .find({
        status: Constant.STATUS.ACTIVE,
        type: Constant.CHARGE_TYPE.OTHER,
      })
      .sort({ createdAt: -1 });
    if (other.length) {
      let data = [];
      for (let o of other) {
        data.push({
          _id: o._id,
          chargeCode: o.code ? o.code : undefined,
        });
      }
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Other charge list get successfully..!",
        data: data,
      });
    } else {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Other charge code not exist..!",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ errorCode: STATUS_CODE.INTERNAL_ERROR, message: error.message });
  }
};

export const get_category_with_children = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: {
          parentCategoryId: null,
          isDeleted: 0,
          status: "ACTIVE",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "parentCategoryId",
          as: "subcategories",
        },
      },
      {
        $project: {
          categoryName: 1,
          slug: 1,
          pageBanner: 1,
          interProductBanners: 1,
          menuSideCards: 1,
          subcategories: {
            _id: 1,
            categoryName: 1,
            slug: 1,
            pageBanner: 1,
            interProductBanners: 1,
          },
          hasSize: 1,
        },
      },
    ]);

    const Baseurl = BaseURL(req);
    // Collect every redirect target across banners + side cards
    // (parent + subcategories) so a single resolve query batch
    // covers the whole payload.
    const allTrees = categories.flatMap((c) => [
      c.interProductBanners || [],
      c.menuSideCards || [],
      ...(c.subcategories || []).map((sc) => sc.interProductBanners || []),
    ]);
    const maps = await buildRedirectMaps(allTrees);

    const decorated = categories.map((c) => ({
      ...c,
      pageBanner: c.pageBanner
        ? {
          image:
            resolveAssetUrl(
              c.pageBanner.image,
              Baseurl,
              "uploads/categoryImages"
            ) || "",
          imageMobile:
            resolveAssetUrl(
              c.pageBanner.imageMobile,
              Baseurl,
              "uploads/categoryImages"
            ) || "",
          heading: c.pageBanner.heading || "",
          subText: c.pageBanner.subText || "",
        }
        : c.pageBanner,
      interProductBanners: decorateRedirects(
        c.interProductBanners || [],
        maps,
        Baseurl
      ),
      menuSideCards: decorateRedirects(c.menuSideCards || [], maps, Baseurl),
      subcategories: (c.subcategories || []).map((sc) => ({
        ...sc,
        pageBanner: sc.pageBanner
          ? {
            image:
              resolveAssetUrl(
                sc.pageBanner.image,
                Baseurl,
                "uploads/categoryImages"
              ) || "",
            imageMobile:
              resolveAssetUrl(
                sc.pageBanner.imageMobile,
                Baseurl,
                "uploads/categoryImages"
              ) || "",
            heading: sc.pageBanner.heading || "",
            subText: sc.pageBanner.subText || "",
          }
          : sc.pageBanner,
        interProductBanners: decorateRedirects(
          sc.interProductBanners || [],
          maps,
          Baseurl
        ),
      })),
    }));

    res.status(STATUS_CODE.OK).json({ success: true, data: decorated });
  } catch (err) {
    res
      .status(STATUS_CODE.INTERNAL_ERROR)
      .json({ success: false, message: err.message });
  }
};

export const get_shape_list = async (req, res) => {
  try {
    const Baseurl = BaseURL(req);
    const result = await Parameter.find({
      type: "shape",
      status: "ACTIVE",
      isDeleted: 0,
    }).sort({ sort: 1, name: 1 });

    const data = result.map((p) => ({
      _id: p._id,
      name: p.name,
      code: p.code,
      // The shape master's uploaded icon — previously stripped here, so the
      // storefront never received it. resolveAssetUrl returns a full URL for
      // AWS/absolute values and the legacy uploads/parameterImages path otherwise.
      image: resolveAssetUrl(p.image, Baseurl, "uploads/parameterImages") || "",
    }));

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      data: data,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const get_product_association = async (req, res) => {
  try {
    const filterType = req.body.filterType; // 'category' | 'collection' | 'tag'
    const filterId = req.body.filterId;
    const assignedPage =
      parseInt(req.body.assignedPage) || parseInt(req.body.page) || 1;
    const unassignedPage =
      parseInt(req.body.unassignedPage) || parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const search = req.body.search || "";
    const associationMode = req.body.associationMode || "parent"; // 'parent' | 'sku'

    if (!filterType || !filterId) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "filterType and filterId are required.",
      });
    }

    const assignedMatch = { isDeleted: 0 };
    const unassignedMatch = { isDeleted: 0 };

    const andConditions = [];
    if (associationMode === "parent") {
      andConditions.push({
        $or: [
          { parentItemCode: { $exists: false } },
          { parentItemCode: null },
          { parentItemCode: "" },
        ],
      });
    }

    if (search) {
      andConditions.push({
        $or: [
          { designNumber: { $regex: search, $options: "i" } },
          { itemCode: { $regex: search, $options: "i" } },
          { productTitle: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      assignedMatch.$and = [...andConditions];
      unassignedMatch.$and = [...andConditions];
    }

    if (filterType === "category") {
      assignedMatch.categoryId = filterId;

      const catOrCond = {
        $or: [
          { categoryId: { $ne: filterId } },
          { categoryId: { $exists: false } },
          { categoryId: null },
        ],
      };
      if (unassignedMatch.$and) {
        unassignedMatch.$and.push(catOrCond);
      } else {
        unassignedMatch.$and = [catOrCond];
      }
    } else if (filterType === "collection") {
      assignedMatch.collectionId = filterId;
      unassignedMatch.collectionId = { $ne: filterId };
    } else if (filterType === "tag") {
      assignedMatch.tags = filterId;
      unassignedMatch.tags = { $ne: filterId };
    }

    const assignedProducts = await Product.find(assignedMatch)
      .populate("categoryId", "categoryName")
      .populate("collectionId", "collectionName")
      .populate("tags", "name")
      .populate("metalId", "metalName")
      .skip((assignedPage - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 });
    const assignedTotal = await Product.countDocuments(assignedMatch);

    const unassignedProducts = await Product.find(unassignedMatch)
      .populate("categoryId", "categoryName")
      .populate("collectionId", "collectionName")
      .populate("tags", "name")
      .populate("metalId", "metalName")
      .skip((unassignedPage - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 });
    const unassignedTotal = await Product.countDocuments(unassignedMatch);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      assigned: {
        data: assignedProducts,
        total: assignedTotal,
        page: assignedPage,
        limit,
      },
      unassigned: {
        data: unassignedProducts,
        total: unassignedTotal,
        page: unassignedPage,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const update_product_association = async (req, res) => {
  try {
    const filterType = req.body.filterType; // 'category' | 'collection' | 'tag'
    const filterId = req.body.filterId;
    const productIds = req.body.productIds || [];
    const action = req.body.action; // 'assign' | 'unassign'
    const associationMode = req.body.associationMode || "parent"; // 'parent' | 'sku'

    if (!filterType || !filterId || !action || !productIds.length) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "filterType, filterId, action, and productIds are required.",
      });
    }

    let updateQuery = { _id: { $in: productIds } };

    if (associationMode === "parent") {
      const parents = await Product.find({ _id: { $in: productIds } }).select(
        "itemCode"
      );
      const parentItemCodes = parents.map((p) => p.itemCode).filter(Boolean);

      updateQuery = {
        $or: [
          { _id: { $in: productIds } },
          { parentItemCode: { $in: parentItemCodes } },
        ],
      };
    }

    if (filterType === "category") {
      if (action === "assign") {
        await Product.updateMany(updateQuery, {
          $set: { categoryId: filterId },
        });
      } else {
        await Product.updateMany(updateQuery, { $set: { categoryId: null } });
      }
    } else if (filterType === "collection") {
      if (action === "assign") {
        await Product.updateMany(updateQuery, {
          $addToSet: { collectionId: filterId },
        });
      } else {
        await Product.updateMany(updateQuery, {
          $pull: { collectionId: filterId },
        });
      }
    } else if (filterType === "tag") {
      if (action === "assign") {
        await Product.updateMany(updateQuery, {
          $addToSet: { tags: filterId },
        });
      } else {
        await Product.updateMany(updateQuery, { $pull: { tags: filterId } });
      }
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product association updated successfully..!",
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

// export const get_ring_sizes = async (req, res) => {
//   try {
//     const ringSizes = await Sizes.find({ isDeleted: { $ne: 1 } });
//     console.log(ringSizes);
//     return res.status(STATUS_CODE.OK).json({
//       errorCode: STATUS_CODE.OK,
//       message: "Ring sizes fetched successfully",
//       data: ringSizes,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(STATUS_CODE.INTERNAL_ERROR).json({
//       errorCode: STATUS_CODE.INTERNAL_ERROR,
//       message: error.message,
//     });
//   }
// };

export const get_ring_sizes = async (req, res) => {
  try {
    const ringSizes = await Sizes.find({ isDeleted: { $ne: 1 } });
    console.log('ringSizes', ringSizes);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Ring sizes fetched successfully",
      data: ringSizes
    });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message
    });
  }
}

/**
 * Add or remove a single product from a collection.
 *
 * The admin's collection product-picker toggles a checkbox per row and posts
 * `{ jewelryId, collectionId, flag }` as FormData (flag: 1 = add, 0 = remove).
 * It previously called `collections/updateCollectionInJewelry`, a route that
 * never existed in this API (404), so the checkbox silently did nothing.
 */
export const update_collection_in_jewellery = async (req, res) => {
  try {
    const { jewelryId, collectionId, flag } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jewelryId) || !mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid jewelryId or collectionId",
      });
    }

    // FormData always arrives as a string, so "0" must not read as truthy.
    const raw = String(flag ?? "").trim().toLowerCase();
    const shouldAdd = raw === "1" || raw === "true";

    const collectionExists = await CollectionModel.exists({ _id: collectionId, isDeleted: 0 });
    if (!collectionExists) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Collection not found",
      });
    }

    const update = shouldAdd
      ? { $addToSet: { collectionId: new mongoose.Types.ObjectId(collectionId) } }
      : { $pull: { collectionId: new mongoose.Types.ObjectId(collectionId) } };

    const product = await Product.findOneAndUpdate(
      { _id: jewelryId, isDeleted: 0 },
      update,
      { new: true }
    ).select("_id itemCode collectionId").lean();

    if (!product) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Product not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: shouldAdd ? "Product added to collection" : "Product removed from collection",
      data: product,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};

export const generateProductReport = async (req, res) => {
  try {
    const { productIds } = req.body;
    console.log("generate Report Product IDS", productIds);

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "productIds must be a non-empty array",
        data: null
      });
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate("metalId categoryId subCategoryId collectionId");

    if (!products || products.length === 0) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "No products found for the provided IDs",
        data: null
      });
    }

    let finalProducts = products;
    if (req.body.parentOnly === true) {
      // Resolve any variant products to their parent products
      const finalProductsMap = new Map();
      const parentItemCodes = [];

      for (const prod of products) {
        if (prod.parentItemCode && prod.parentItemCode.trim() !== "") {
          parentItemCodes.push(prod.parentItemCode.trim());
        }
      }

      if (parentItemCodes.length > 0) {
        const parents = await Product.find({
          itemCode: { $in: parentItemCodes },
          isDeleted: { $ne: 1 }
        }).populate("metalId categoryId subCategoryId collectionId");

        parents.forEach(p => {
          finalProductsMap.set(p.itemCode, p);
        });
      }

      const tempProducts = [];
      const addedIds = new Set();

      for (const prod of products) {
        let targetProduct = prod;
        if (prod.parentItemCode && prod.parentItemCode.trim() !== "") {
          const parent = finalProductsMap.get(prod.parentItemCode.trim());
          if (parent) {
            targetProduct = parent;
          }
        }

        const idStr = targetProduct._id.toString();
        if (!addedIds.has(idStr)) {
          addedIds.add(idStr);
          tempProducts.push(targetProduct);
        }
      }
      finalProducts = tempProducts;
    }

    const filename = `report-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.pdf`;
    const reportsDir = uploadsPath("reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const finalPath = join(reportsDir, filename);
    await generateProductReportPDF(finalProducts, finalPath, { showPrice: false, showMeta: false });

    const baseUrl = BaseURL(req);
    const reportUrl = `${baseUrl}/uploads/reports/${filename}`;

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Product report generated successfully",
      data: {
        filename,
        url: reportUrl
      },
    });
  } catch (error) {
    console.error("generateProductReport error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error.message,
    });
  }
};