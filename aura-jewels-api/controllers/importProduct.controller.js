// import { convert_excel_to_array_jewellery } from "../utils/excelToArray.js";
// import { convertKeysToLowercase } from "../utils/convertKeysToLowercase.js";
import { create_excel_files } from "../utils/createExcelFile.js";
// import ProductMaster from "../models/product.model.js";
// import Constant from "../constants/user.constant.js";
// import StockFile from "../models/stockFile.model.js"
// import { delete_product_stone_db, get_all_category_db, get_all_labour_db, get_all_metal_stamp_db, get_all_metal_type_db, get_all_stone_group_db, get_other_charge_db, get_products_db, insert_product_stone_db, insert_stock_file_db } from "../services/importProduct.services.js";

// import ProductStone from "../models/productStone.model.js";
import BaseURL from "../constants/baseUrl.js";
import { createSlug } from "../utils/createSlug.js";
// Single source of truth for carat-bucket matching, shared with the price sync.
import { matchStoneGroupSize as matchStoneGroupSizeShared } from "../utils/stoneMatch.js";
// import Category from "../models/category.model.js";
// import Collection from "../models/collection.model.js";
// import Tag from "../models/tag.model.js";
// import Metal from "../models/metal.model.js";
// import Charges from "../models/charges.model.js";
// import MetalType from "../models/metalType.model.js";
// import MetalStamp from "../models/metalStamp.model.js";
// import LabourCharge from "../models/labourCharges.model.js";
// import OtherCharge from "../models/otherCharges.model.js";
// import StoneGroup from "../models/stoneGroup.model.js";
// import Parameter from "../models/parameter.model.js";

// const normalize = (str) =>
//     str
//         ?.toString()
//         .toLowerCase()
//         .replace(/\s+/g, "")        // remove all spaces
//         .replace(/[^a-z0-9]/g, "")  // remove special chars
//         .trim();

// const normalizeColor = (val) => {
//     val = normalize(val);
//     if (val === "fg") return "ef";
//     return val;
// };

// const normalizeClarity = (val) => {
//     val = normalize(val);
//     if (val.includes("vvs")) return "vvs";
//     if (val.includes("vs")) return "vs";
//     return val;
// };

// const toNumber = (val) => {
//     const num = Number(val);
//     return isNaN(num) ? null : num;
// };

// export const import_products_service = async function (req) {
//     let baseUrl = BaseURL(req);
//     let data = await convert_excel_to_array_jewellery(req);

//     let startTime = new Date();
//     let file = Array.isArray(req.files) ? req.files[0] : null;

//     let filePath = file?.path || "";
//     let fileName = file?.filename || "";
//     let originalName = file?.originalname || "";
//     let cleanPath = filePath.split("uploads")[1]; // remove system path

//     let stockFile = await StockFile.create({
//         userFileName: originalName,
//         fileName: fileName,
//         uploadedFileUrl: cleanPath
//             ? baseUrl + "/uploads" + cleanPath.replace(/\\/g, "/")
//             : null,
//         uploadedBy: req.userId || null,
//         batchLogs: {},
//     });

//     if (!data.length) {
//         return { errorCode: 400, message: "Empty file" };
//     }

//     // ---------- LOAD MASTERS ----------
//     let [
//         categories,
//         collections,
//         tags,
//         allMetals,
//         allCharges,
//         // metals,
//         // stamps,
//         // labour,
//         // other,
//         stoneGroups,
//         parameters,
//     ] = await Promise.all([
//         Category.find({ status: "ACTIVE" }),
//         Collection.find({ status: "ACTIVE" }),
//         Tag.find({ status: "ACTIVE" }),
//         Metal.find({ status: "ACTIVE" }),
//         Charges.find({ status: "ACTIVE", isDeleted: false }),
//         // MetalType.find({ status: "ACTIVE" }),
//         // MetalStamp.find({ status: "ACTIVE" }),
//         // LabourCharge.find({ status: "ACTIVE" }),
//         // OtherCharge.find({ status: "ACTIVE" }),
//         StoneGroup.find({ status: "ACTIVE" }).populate("shape color clarity"),
//         Parameter.find({ status: "ACTIVE", isDeleted: 0 }),
//     ]);


//     // ---------- MAPS ----------
//     const categoryMap = Object.fromEntries(
//         categories.map((c) => [normalize(c.categoryName), c])
//     );
//     const collectionMap = Object.fromEntries(
//         collections.map((c) => [normalize(c.collectionName), c])
//     );
//     const tagMap = Object.fromEntries(
//         tags.map((t) => [normalize(t.name), t])
//     );
//     // const metalMap = Object.fromEntries(
//     //      metals.map((m) => [normalize(m.metalName), m])
//     // );
//     // const stampMap = Object.fromEntries(
//     //     stamps.map((s) => [normalize(s.karat), s])
//     // );
//     // const labourMap = Object.fromEntries(
//     //     labour.map((l) => [normalize(l.labourCode), l])
//     // );
//     // const otherMap = Object.fromEntries(
//     //     other.map((o) => [normalize(o.chargeCode), o])
//     // );
//     const metalMap = Object.fromEntries(
//         allMetals.map((m) => [normalize(m.type) + " " + normalize(m.stamp), m])
//     );
//     const chargesMap = Object.fromEntries(
//         allCharges.map((c) => [normalize(c.code), c])
//     );

//     // ---------- PARAMETER MAPS ----------
//     const parameterMaps = {
//         shape: new Set(parameters.filter(p => p.type === "shape").map(p => normalize(p.code))),
//         color: new Set(parameters.filter(p => p.type === "color").map(p => normalizeColor(p.code))),
//         clarity: new Set(parameters.filter(p => p.type === "clarity").map(p => normalizeClarity(p.code))),
//     };


//     const parameterIdMaps = {
//         shape: Object.fromEntries(parameters.filter(p => p.type === "shape").map(p => [normalize(p.code), p._id])),
//         color: Object.fromEntries(parameters.filter(p => p.type === "color").map(p => [normalizeColor(p.code), p._id])),
//         clarity: Object.fromEntries(parameters.filter(p => p.type === "clarity").map(p => [normalizeClarity(p.code), p._id])),
//     };
//     // const metalMapLegacy = Object.fromEntries(metals.map((m) => [normalize(m.metalName), m]));  
//     // const stampMapLegacy = Object.fromEntries(stamps.map((s) => [normalize(s.karat), s]));
//     // const labourMapLegacy = Object.fromEntries(labour.map((l) => [normalize(l.labourCode), l]));
//     // const otherMapLegacy = Object.fromEntries(other.map((o) => [normalize(o.chargeCode), o]));

//     let insertProduct = [];
//     let rejectedProduct = [];
//     let currentParent = null;
//     let tempRejected = null;
//     let hasIssue = false;
//     let itemCodeSet = new Set();

//     // ---------- LOOP ----------
//     for (let row of data) {
//         let value = convertKeysToLowercase(row);
//         // value means EXCEL RECORD
//         // ---------- PRODUCT ROW ----------
//         if (value.itemcode) {
//             if (itemCodeSet.has(value.itemcode)) {
//                 value.issues = "Duplicate itemCode in Excel";
//                 rejectedProduct.push(value);
//                 continue;
//             }

//             itemCodeSet.add(value.itemcode);

//             if (currentParent) {
//                 if (hasIssue) rejectedProduct.push(tempRejected);
//                 else insertProduct.push(currentParent);
//             }

//             hasIssue = false;

//             let category = categoryMap[normalize(value.prodcategory)];
//             let metalKey = normalize(value.metaltype) + " " + normalize(value.metalstamp);
//             let metal = metalMap[metalKey];
//             let labourObj = chargesMap[normalize(value.labourcode)];
//             let otherObj = chargesMap[normalize(value.otherchargescode)];

//             // let metalLegacy = metalMapLegacy[normalize(value.metaltype)];
//             // let stampLegacy = stampMapLegacy[normalize(value.metalstamp)];
//             // let labourObjLegacy = labourMapLegacy[normalize(value.labourcode)];
//             // let otherObjLegacy = otherMapLegacy[normalize(value.otherchargescode)];

//             // ---------- VALIDATION ----------
//             if (!category) {
//                 value.issues = "Invalid category";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }
//             // if (!metal) {
//             //     value.issues = "Invalid metal type";
//             //     rejectedProduct.push(value);
//             //     currentParent = null;
//             //     continue;
//             // }

//             // SUBCATEGORY
//             let subCategoryIds = [];
//             if (value.prodsubcategory) {
//                 let subNames = value.prodsubcategory.split(",");
//                 subCategoryIds = subNames.map((sub) => {
//                     let normalizedSub = normalize(sub);
//                     let found = categories.find(
//                         (c) =>
//                             normalize(c.categoryName) === normalizedSub &&
//                             c.parentCategoryId &&
//                             c.parentCategoryId.toString() === category._id.toString()
//                     );
//                     return found?._id;
//                 }).filter(Boolean);
//             }
//             // OPTIONAL STRICT VALIDATION
//             // if (!stamp) {
//             //     value.issues = "Invalid metal stamp";
//             //     rejectedProduct.push(value);
//             //     currentParent = null;
//             //     continue;
//             // }
//             if (!metal) {
//                 value.issues = "Invalid metal type or stamp combination";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }

//             if (!labourObj) {
//                 value.issues = "Invalid labour charge";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }

//             if (!otherObj) {
//                 value.issues = "Invalid other charge";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }

//             // COLLECTION
//             let collectionIds = (value.collection || "")
//                 .split(",")
//                 .map((c) => collectionMap[normalize(c)]?._id)
//                 .filter(Boolean);

//             // TAGS
//             let tagIds = (value.tags || "")
//                 .split(",")
//                 .map((t) => tagMap[normalize(t)]?._id)
//                 .filter(Boolean);

//             currentParent = {
//                 designNumber: value.maindesignnumber,
//                 itemCode: value.itemcode,
//                 parentItemCode: value.parentitemcode || "",
//                 productTitle: value.prodtitle,
//                 productDesc: value.proddesc,
//                 categoryId: category._id,
//                 subCategoryId: subCategoryIds,
//                 collectionId: collectionIds,
//                 tags: tagIds,
//                 gender: value.gender,
//                 metalId: metal._id,
//                 // metalType: metal._id,
//                 // metalStamp: stamp._id,
//                 appxMetalWgt: toNumber(value.appxmetalweight),
//                 qty: toNumber(value.qty),
//                 height: value.height,
//                 width: value.width,
//                 length: value.length,
//                 labourCode: labourObj?._id,
//                 otherChargeCode: otherObj?._id,
//                 isEngraving: value.isengraving === "Yes",
//                 images: [
//                     value.imageurl1,
//                     value.imageurl2,
//                     value.imageurl3,
//                     value.imageurl4,
//                     value.imageurl5,
//                 ]
//                     .filter(Boolean)
//                     .map((img, i) => ({
//                         MediaLocation: img,
//                         MediaSeqNo: i + 1,
//                     })),
//                 videos: value.videourl
//                     ? [{ MediaLocation: value.videourl, MediaSeqNo: 1 }]
//                     : [],
//                 slug:
//                     value.slug ||
//                     createSlug(`${value.prodtitle}-${value.itemcode}`),
//                 haveChain: value.havechain || "No",
//                 // cMetalType:
//                 //     metalMap[normalize(value.chainmetaltype)]?._id || null,
//                 // cMetalStamp:
//                 //     stampMap[normalize(value.chainmetalstamp)]?._id || null,
//                 // cWgt: toNumber(value.chainweight),

//                 cMetalId: metalMap[normalize(value.chainmetaltype) + " " + normalize(value.chainmetalstamp)]?._id || null,
//                 cWgt: toNumber(value.weight), // "Weight" column after ChainMetalStamp is chain weight
//                 cLength: value.chainlength || null,
//                 shipmentDays: toNumber(value.shipmentdays),
//                 SEODetails: {
//                     metaTitle: value.seoTitle,
//                     metaKeyword: value.tags,
//                     slug: value.slug,
//                     metaDescription: value.seoDesc,
//                 },
//                 diamond: [],
//                 createdBy: req.userId || null,
//             };

//             tempRejected = JSON.parse(JSON.stringify(currentParent));

//             // ADD THIS: HANDLE STONE IN SAME ROW (CENTER DIAMOND)
//             let hasStoneInSameRow =
//                 value.shape ||
//                 value.color ||
//                 value.clarity ||
//                 value.size ||
//                 value.pieces ||
//                 value.wgt;

//             if (hasStoneInSameRow) {

//                 let shape = normalize(value.shape);
//                 let color = normalizeColor(value.color);
//                 let clarity = normalizeClarity(value.clarity);

//                 // Validate against parameters master
//                 if (value.shape && !parameterMaps.shape.has(shape)) {
//                     value.issues = `Invalid shape parameter: ${value.shape}`;
//                     rejectedProduct.push(value);
//                     currentParent = null;
//                     continue;
//                 }
//                 if (value.color && !parameterMaps.color.has(color)) {
//                     value.issues = `Invalid color parameter: ${value.color}`;
//                     rejectedProduct.push(value);
//                     currentParent = null;
//                     continue;
//                 }
//                 if (value.clarity && !parameterMaps.clarity.has(clarity)) {
//                     value.issues = `Invalid clarity parameter: ${value.clarity}`;
//                     rejectedProduct.push(value);
//                     currentParent = null;
//                     continue;
//                 }

//                 let rawSize = value.size;
//                 let carat = null;

//                 if (rawSize) {
//                     let match = rawSize.toString().match(/[\d.]+/);
//                     if (match) {
//                         carat = Number(match[0]);
//                     }
//                 }
//                 let sg = stoneGroups.find(
//                     (s) => {
//                         const sShape = s.shape?.code || s.shape;
//                         const sColor = s.color?.code || s.color;
//                         const sClarity = s.clarity?.code || s.clarity;
//                         return (
//                             normalize(sShape) === shape &&
//                             normalizeColor(sColor) === color &&
//                             normalizeClarity(sClarity) === clarity &&
//                             carat !== null &&
//                             carat >= s.minCarat &&
//                             carat <= s.maxCarat
//                         );
//                     }
//                 );

//                 if (!sg) {
//                     value.issues = `Stone group not found for shape: ${value.shape}, color: ${value.color}, clarity: ${value.clarity}, size: ${value.size}`;
//                     rejectedProduct.push(value);
//                     currentParent = null;
//                     continue;
//                 }



//                 let stoneObj = {
//                     stoneGroup: sg?._id || null,
//                     type: value.type,
//                     pieces: toNumber(value.pieces),
//                     wgt: toNumber(value.wgt),
//                     size: value.size,
//                     shape: parameterIdMaps.shape[shape] || null,
//                     color: parameterIdMaps.color[color] || null,
//                     clarity: parameterIdMaps.clarity[clarity] || null,
//                     totalCarat: carat
//                 };

//                 currentParent.diamond.push(stoneObj);
//                 tempRejected.diamond.push(stoneObj);
//             }
//         }

//         // ---------- STONE ROW ----------
//         else if (currentParent) {
//             let shape = normalize(value.shape);
//             let color = normalizeColor(value.color);
//             let clarity = normalizeClarity(value.clarity);

//             // Validate subsequent stone row against parameter master
//             if (value.shape && !parameterMaps.shape.has(shape)) {
//                 hasIssue = true;
//                 tempRejected.issues = `Invalid shape parameter: ${value.shape} in stone row`;
//             }
//             if (value.color && !parameterMaps.color.has(color)) {
//                 hasIssue = true;
//                 tempRejected.issues = `Invalid color parameter: ${value.color} in stone row`;
//             }
//             if (value.clarity && !parameterMaps.clarity.has(clarity)) {
//                 hasIssue = true;
//                 tempRejected.issues = `Invalid clarity parameter: ${value.clarity} in stone row`;
//             }

//             // FIX: extract numeric carat from size
//             let rawSize = value.size;
//             let carat = null;

//             if (rawSize) {
//                 let match = rawSize.toString().match(/[\d.]+/);
//                 if (match) {
//                     carat = Number(match[0]);
//                 }
//             }

//             let sg = stoneGroups.find(
//                 (s) => {
//                     const sShape = s.shape?.code || s.shape;
//                     const sColor = s.color?.code || s.color;
//                     const sClarity = s.clarity?.code || s.clarity;
//                     return (
//                         normalize(sShape) === shape &&
//                         normalizeColor(sColor) === color &&
//                         normalizeClarity(sClarity) === clarity &&
//                         carat !== null &&
//                         carat >= s.minCarat &&
//                         carat <= s.maxCarat
//                     );
//                 }
//             );



//             if (!sg) {
//                 hasIssue = true;
//                 tempRejected.issues = `Stone group not found in subsequent stone row for shape: ${value.shape}, color: ${value.color}, clarity: ${value.clarity}, size: ${value.size}`;
//                 continue;
//             }

//             let stoneObj = {
//                 stoneGroup: sg?._id || null,
//                 type: value.type,
//                 pieces: toNumber(value.pieces),
//                 wgt: toNumber(value.wgt),
//                 size: value.size,

//                 shape: parameterIdMaps.shape[shape] || null,
//                 color: parameterIdMaps.color[color] || null,
//                 clarity: parameterIdMaps.clarity[clarity] || null,

//                 totalCarat: carat
//             };

//             currentParent.diamond.push(stoneObj);
//             tempRejected.diamond.push(stoneObj);
//         }
//     }

//     if (currentParent) {
//         if (hasIssue) rejectedProduct.push(tempRejected);
//         else insertProduct.push(currentParent);
//     }

//     // ---------- DB ----------
//     let itemCodes = insertProduct.map((p) => p.itemCode);

//     let existing = await ProductMaster.find({
//         itemCode: { $in: itemCodes },
//     });

//     let existingMap = Object.fromEntries(
//         existing.map((p) => [p.itemCode, p])
//     );

//     let insertList = [];
//     let updateList = [];

//     for (let p of insertProduct) {
//         if (existingMap[p.itemCode]) {
//             updateList.push({
//                 updateOne: {
//                     filter: { itemCode: p.itemCode },
//                     update: { $set: p },
//                 },
//             });
//         } else {
//             insertList.push(p);
//         }
//     }

//     if (insertList.length) await ProductMaster.insertMany(insertList);
//     if (updateList.length) await ProductMaster.bulkWrite(updateList);

//     // ---------- PRODUCT STONE INSERT ----------
//     let allProductsData = [...insertProduct];

//     for (let u of updateList) {
//         allProductsData.push(u.updateOne.update.$set);
//     }

//     let products = await ProductMaster.find({
//         itemCode: { $in: allProductsData.map((p) => p.itemCode) },
//     });

//     let productMap = Object.fromEntries(
//         products.map((p) => [p.itemCode, p._id])
//     );

//     let stoneInsert = [];

//     for (let p of allProductsData) {
//         if (!Array.isArray(p.diamond)) continue;

//         for (let d of p.diamond) {
//             stoneInsert.push({
//                 itemCode: p.itemCode,
//                 productId: productMap[p.itemCode],
//                 stoneGroup: d.stoneGroup || null,
//                 type: d.type,
//                 shape: d.shape,
//                 pieces: d.pieces,
//                 weight: d.wgt,
//                 totalCarat: d.totalCarat,
//                 color: d.color,
//                 clarity: d.clarity,
//                 size: d.size,
//                 createdBy: req.userId || null,
//             });
//         }
//     }

//     if (stoneInsert.length) {
//         let productIds = stoneInsert.map((s) => s.productId);

//         await ProductStone.deleteMany({
//             productId: { $in: productIds },
//         });

//         await ProductStone.insertMany(stoneInsert);
//     }

//     // ---------- REJECT FILE ----------
//     let rejectUrl;

//     if (rejectedProduct.length) {
//         rejectUrl = await create_excel_files(rejectedProduct);
//     }

//     if (rejectUrl) {
//         stockFile.rejectedUrl = baseUrl + rejectUrl;
//     }

//     let endTime = new Date();

//     stockFile.batchLogs = {
//         totalRows: data.length,
//         inserted: insertList.length,
//         updated: updateList.length,
//         rejected: rejectedProduct.length,
//         startTime,
//         endTime,
//         duration: endTime - startTime + " ms",
//     };

//     await stockFile.save();

//     return {
//         errorCode: 200,
//         message: "Product imported successfully",
//         // totalRows: data.length,
//         totalProducts: insertProduct.length + rejectedProduct.length,
//         totalStones:
//             data.length - (insertProduct.length + rejectedProduct.length),
//         inserted: insertList.length,
//         updated: updateList.length,
//         rejected: rejectedProduct.length,
//         rejectedFileUrl: rejectUrl ? baseUrl + rejectUrl : null,
//     };
// };

// export const import_products_service = async function (req) {
//     let baseUrl = BaseURL(req);
//     let data = await convert_excel_to_array_jewellery(req);

//     let startTime = new Date();
//     let file = Array.isArray(req.files) ? req.files[0] : null;

//     let filePath = file?.path || "";
//     let fileName = file?.filename || "";
//     let originalName = file?.originalname || "";
//     let cleanPath = filePath.split("uploads")[1];

//     let stockFile = await StockFile.create({
//         userFileName: originalName,
//         fileName,
//         uploadedFileUrl: cleanPath
//             ? baseUrl + "/uploads" + cleanPath.replace(/\\/g, "/")
//             : null,
//         uploadedBy: req.userId || null,
//         batchLogs: {},
//     });

//     if (!data.length) {
//         return { errorCode: 400, message: "Empty file" };
//     }

//     // NORMALIZE FIX
//     const normalize = (str) => str?.toString().trim().toLowerCase();

//     // ---------- LOAD MASTERS ----------
//     let [
//         categories,
//         collections,
//         tags,
//         metals,
//         stamps,
//         labour,
//         other,
//         stoneGroups,
//     ] = await Promise.all([
//         Category.find({ status: "ACTIVE" }),
//         Collection.find({ status: "ACTIVE" }),
//         Tag.find({ status: "ACTIVE" }),
//         MetalType.find({ status: "ACTIVE" }),
//         MetalStamp.find({ status: "ACTIVE" }),
//         LabourCharge.find({ status: "ACTIVE" }),
//         OtherCharge.find({ status: "ACTIVE" }),
//         StoneGroup.find({ status: "ACTIVE" }),
//     ]);

//     // ---------- MAPS ----------
//     const categoryMap = Object.fromEntries(
//         categories.map((c) => [normalize(c.categoryName), c])
//     );
//     const collectionMap = Object.fromEntries(
//         collections.map((c) => [normalize(c.collectionName), c])
//     );
//     const tagMap = Object.fromEntries(
//         tags.map((t) => [normalize(t.name), t])
//     );
//     const metalMap = Object.fromEntries(
//         metals.map((m) => [normalize(m.metalName), m])
//     );
//     const stampMap = Object.fromEntries(
//         stamps.map((s) => [normalize(s.karat), s])
//     );
//     const labourMap = Object.fromEntries(
//         labour.map((l) => [normalize(l.labourCode), l])
//     );
//     const otherMap = Object.fromEntries(
//         other.map((o) => [normalize(o.chargeCode), o])
//     );

//     let insertProduct = [];
//     let rejectedProduct = [];
//     let currentParent = null;
//     let tempRejected = null;
//     let hasIssue = false;
//     let itemCodeSet = new Set();

//     for (let row of data) {
//         let value = convertKeysToLowercase(row);

//         // ---------------- PRODUCT ROW ----------------
//         if (value.itemcode) {
//             if (itemCodeSet.has(value.itemcode)) {
//                 value.issues = "Duplicate itemCode in Excel";
//                 rejectedProduct.push(value);
//                 continue;
//             }

//             itemCodeSet.add(value.itemcode);

//             if (currentParent) {
//                 if (hasIssue) rejectedProduct.push(tempRejected);
//                 else insertProduct.push(currentParent);
//             }

//             hasIssue = false;

//             let category = categoryMap[normalize(value.prodcategory)];
//             let metal = metalMap[normalize(value.metaltype)];
//             let stamp = stampMap[normalize(value.metalstamp)];
//             let labourObj = labourMap[normalize(value.labourcode)];
//             let otherObj = otherMap[normalize(value.otherchargescode)];

//             if (!category || !metal) {
//                 value.issues = "Invalid category or metal";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }

//             if (!stamp || !labourObj || !otherObj) {
//                 value.issues = "Invalid stamp/labour/other charge";
//                 rejectedProduct.push(value);
//                 currentParent = null;
//                 continue;
//             }

//             //  SUBCATEGORY FIX
//             //  CORRECT SUBCATEGORY MAPPING
//             let subCategoryIds = [];

//             if (value.prodsubcategory) {
//                 let subNames = value.prodsubcategory.split(",");

//                 subCategoryIds = subNames.map((sub) => {
//                     let normalizedSub = normalize(sub);

//                     let found = categories.find(
//                         (c) =>
//                             normalize(c.categoryName) === normalizedSub &&
//                             c.parentCategoryId &&
//                             c.parentCategoryId.toString() === category._id.toString()
//                     );

//                     if (!found) {
//                         console.log("SubCategory not found:", sub);
//                     }

//                     return found?._id;
//                 }).filter(Boolean);
//             }
//             //  COLLECTION FIX
//             let collectionIds = (value.collection || "")
//                 .split(",")
//                 .map((c) => collectionMap[normalize(c)]?._id)
//                 .filter(Boolean);

//             if (!collectionIds.length && value.collection) {
//                 console.log("Collection not found:", value.collection);
//             }

//             //  TAG FIX
//             let tagIds = (value.tags || "")
//                 .split(",")
//                 .map((t) => tagMap[normalize(t)]?._id)
//                 .filter(Boolean);

//             if (!tagIds.length && value.tags) {
//                 console.log("Tags not found:", value.tags);
//             }

//             currentParent = {
//                 designNumber: value.maindesignnumber,
//                 itemCode: value.itemcode,
//                 parentItemCode: value.parentitemcode || "",
//                 productTitle: value.prodtitle,
//                 productDesc: value.proddesc,

//                 categoryId: category._id,
//                 subCategoryId: subCategoryIds, //  FIXED
//                 collectionId: collectionIds,
//                 tags: tagIds,

//                 gender: value.gender,

//                 metalType: metal._id,
//                 metalStamp: stamp._id,

//                 appxMetalWgt: toNumber(value.appxmetalweight),

//                 //  NEW FIELDS FIX
//                 qty: toNumber(value.qty),
//                 height: toNumber(value.height),
//                 width: toNumber(value.width),
//                 length: toNumber(value.length),

//                 labourCode: labourObj._id,
//                 otherChargeCode: otherObj._id,

//                 isEngraving: value.isengraving === "Yes",

//                 images: [
//                     value.imageurl1,
//                     value.imageurl2,
//                     value.imageurl3,
//                     value.imageurl4,
//                     value.imageurl5,
//                 ]
//                     .filter(Boolean)
//                     .map((img, i) => ({
//                         MediaLocation: img,
//                         MediaSeqNo: i + 1,
//                     })),

//                 videos: value.videourl
//                     ? [{ MediaLocation: value.videourl, MediaSeqNo: 1 }]
//                     : [],

//                 slug:
//                     value.slug ||
//                     createSlug(`${value.prodtitle}-${value.itemcode}`),

//                 haveChain: value.havechain || "No",

//                 cMetalType:
//                     metalMap[normalize(value.chainmetaltype)]?._id || null,

//                 cMetalStamp:
//                     stampMap[normalize(value.chainmetalstamp)]?._id || null,

//                 cWgt: toNumber(value.chainweight),
//                 cLength: value.chainlength || null,

//                 shipmentDays: toNumber(value.shipmentdays),

//                 SEODetails: {
//                     metaTitle: value.prodtitle,
//                     metaKeyword: value.tags,
//                     slug: value.slug,
//                     metaDescription: value.proddesc,
//                 },

//                 diamond: [],
//                 createdBy: req.user?.userId || null,
//             };

//             // DEBUG
//             console.log("FINAL PRODUCT:", currentParent);

//             tempRejected = JSON.parse(JSON.stringify(currentParent));
//         }

//         // ---------------- STONE ROW ----------------
//         else if (currentParent) {
//             // ---------------- CLEAN FUNCTION ----------------
//             const clean = (str) =>
//                 str?.toString().replace(/[^a-z0-9]/gi, "").toLowerCase();

//             // ---------------- NORMALIZED VALUES ----------------
//             let shape = clean(value.shape);
//             let color = clean(value.color);
//             let clarity = clean(value.clarity);

//             // ---------------- EXTRACT CARAT ----------------
//             let match = value.size?.toString().match(/[\d.]+/);
//             let carat = match ? Number(match[0]) : null;

//             // ---------------- FIND STONE GROUP ----------------
//             let sg = stoneGroups.find(
//                 (s) =>
//                     clean(s.shape) === shape &&
//                     clean(s.color) === color &&
//                     clean(s.clarity) === clarity &&
//                     carat !== null &&
//                     carat >= s.minCarat &&
//                     carat <= s.maxCarat
//             );

//             // ---------------- FALLBACK (VERY IMPORTANT) ----------------
//             if (!sg) {
//                 sg = stoneGroups.find(
//                     (s) => clean(s.shape) === shape
//                 );
//             }

//             // ---------------- DEBUG ----------------
//             if (!sg) {
//                 console.log("❌ StoneGroup not found:", {
//                     shape: value.shape,
//                     color: value.color,
//                     clarity: value.clarity,
//                     size: value.size
//                 });
//             }

//             let stoneObj = {
//                 stoneGroup: sg?._id || null,
//                 type: value.type,
//                 pieces: toNumber(value.pieces),
//                 wgt: toNumber(value.wgt),
//                 size: value.size,
//                 shape,
//                 color,
//                 clarity,
//                 totalCarat: carat,
//             };

//             currentParent.diamond.push(stoneObj);
//             tempRejected.diamond.push(stoneObj);
//         }
//     }

//     if (currentParent) {
//         if (hasIssue) rejectedProduct.push(tempRejected);
//         else insertProduct.push(currentParent);
//     }

//     // ---------- DB ----------
//     let itemCodes = insertProduct.map((p) => p.itemCode);

//     let existing = await ProductMaster.find({
//         itemCode: { $in: itemCodes },
//     });

//     let existingMap = Object.fromEntries(
//         existing.map((p) => [p.itemCode, p])
//     );

//     let insertList = [];
//     let updateList = [];

//     for (let p of insertProduct) {
//         if (existingMap[p.itemCode]) {
//             updateList.push({
//                 updateOne: {
//                     filter: { itemCode: p.itemCode },
//                     update: { $set: p },
//                 },
//             });
//         } else {
//             insertList.push(p);
//         }
//     }

//     if (insertList.length) await ProductMaster.insertMany(insertList);
//     if (updateList.length) await ProductMaster.bulkWrite(updateList);

//     return {
//         errorCode: 200,
//         message: "Product imported successfully",
//         inserted: insertList.length,
//         updated: updateList.length,
//         rejected: rejectedProduct.length,
//     };
// };
import mongoose from "mongoose";

import ProductMaster from "../models/product.model.js";
import ProductStone from "../models/productStone.model.js";
import Category from "../models/category.model.js";
import Collection from "../models/collection.model.js";
import Tag from "../models/tag.model.js";
import Metal from "../models/metal.model.js";
import Charges from "../models/charges.model.js";
import StoneGroup from "../models/stoneGroup.model.js";
import Parameter from "../models/parameter.model.js";
import StockFile from "../models/stockFile.model.js";
import StoneGroupDefault from "../models/stoneGroupDefault.model.js";

import { applyProductImportToLive } from "../services/productImportApply.services.js";
import { calculateProductsPriceService } from "../services/calcProductPrice.services.js";
import { convert_excel_to_array_jewellery, validateHeader, getExcelHeaders } from "../utils/excelToArray.js";
import { resolveUploadedFileUrl } from "../utils/uploadPaths.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import Constant from "../constants/user.constant.js"
// import {
//     convert_excel_to_array_jewellery,
//     create_excel_files,
// } from "../helpers/excel.helper.js";

// import { BaseURL } from "../helpers/baseUrl.helper.js";
// import { createSlug } from "../helpers/slug.helper.js";

function safeString(v) {
    return (v ?? "").toString().trim();
}

function normalize(v) {
    return safeString(v)
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
}
const NORM_COLOR_STONE = "colorstone";
const NORM_DIAMOND = "diamond";

function normalizeStoneType(value) {
    const v = normalize(value);

    if (
        v === "gemstone" ||
        v === "colorstone" ||
        v === NORM_COLOR_STONE ||
        Constant.GEM_TYPES.ALL_TYPES.includes(v)
    ) {
        return NORM_COLOR_STONE;
    }

    return NORM_DIAMOND;
}

function normalizeColor(v) {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");

    if (["EF", "E-F", "E/F"].includes(x)) return "EF";
    if (["GH", "G-H", "G/H"].includes(x)) return "GH";
    if (["IJ", "I-J", "I/J"].includes(x)) return "IJ";

    return x;
}

function normalizeClarity(v) {
    const x = safeString(v).toUpperCase().replace(/\s+/g, "");

    if (["VVS", "VVS1VVS2", "VVS1-VVS2", "VVS1/VVS2"].includes(x)) {
        return "VVS";
    }

    if (["VS", "VS1VS2", "VS1-VS2", "VS1/VS2"].includes(x)) {
        return "VS";
    }

    if (["SI", "SI1SI2", "SI1-SI2", "SI1/SI2"].includes(x)) {
        return "SI";
    }

    if (["VVSVS", "VVS-VS", "VVS/VS"].includes(x)) {
        return "VVSVS";
    }

    return x;
}

function normalizeSize(v) {
    return safeString(v)
        .toUpperCase()
        .replace(/\s+/g, "");
}

function toNumber(v, def = 0) {
    if (v === null || v === undefined || v === "") {
        return def;
    }

    const n = Number(String(v).replace(/,/g, "").trim());

    return Number.isFinite(n) ? n : def;
}

function convertKeysToLowercase(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
    }, {});
}

// This used to be a private copy of the size matcher and had drifted from the
// one the price sync uses (utils/stoneMatch.js): no support for prose ranges
// ("0.60 to 0.70"), and no 2dp rounding. The published buckets are consecutive
// over two-decimal carats — 0.001-0.06 | 0.07-0.09 | 0.10-0.15 ... — so a sheet
// size of 0.065, or Excel's 0.35000000000000003, fell between buckets and the
// row was rejected with "Stone group not found". Delegating means the importer,
// the price sync and the storefront can never disagree again.
function matchStoneGroupSize(groupSize, importSize) {
    return matchStoneGroupSizeShared(groupSize, importSize);
}

// for multiple stone default
// function getStonePrice(stoneGroup, stoneOrigin) {
//     let preferred = Constant.DEFAULT_PRICE_SOURCE;
//     if (stoneOrigin) {
//         const originLower = String(stoneOrigin).toLowerCase();
//         if (originLower === "natural") {
//             preferred = Constant.STONE_PRICE_SOURCE.NATURAL;
//         } else if (originLower === "lab grown" || originLower === "labgrown") {
//             preferred = Constant.STONE_PRICE_SOURCE.LGD;
//         }
//     }
//      if (stoneGroup?.[preferred] > 0) {
//         return stoneGroup[preferred];
//     }

//     const fallback =
//         preferred === Constant.STONE_PRICE_SOURCE.NATURAL
//             ? Constant.STONE_PRICE_SOURCE.LGD
//             : Constant.STONE_PRICE_SOURCE.NATURAL;

//     if (stoneGroup?.[fallback] > 0) {
//         return stoneGroup[fallback];
//     }

//     return null;
// }

function getStonePrice(stoneGroup) {
    const preferred = Constant.DEFAULT_PRICE_SOURCE;

    if (stoneGroup?.[preferred] > 0) {
        return stoneGroup[preferred];
    }

    const fallback =
        preferred === Constant.STONE_PRICE_SOURCE.NATURAL
            ? Constant.STONE_PRICE_SOURCE.LGD
            : Constant.STONE_PRICE_SOURCE.NATURAL;

    if (stoneGroup?.[fallback] > 0) {
        return stoneGroup[fallback];
    }

    return null;
}

// Returns the PER-PIECE carat used to bucket a stone into a StoneGroup.
//
//   - Size       : per-piece carat (the canonical bucket key).
//   - Wgt        : row aggregate (Size × Pieces). Not a per-piece value.
//   - TotalCarat : product-wide aggregate across all stone rows (center +
//                  side combined). Purely informational, never for lookup.
//
// Priority:
//   1. `Size` — explicit per-piece value, always use it when present.
//   2. `Wgt / Pieces` — derive per-piece for sheets that only carry Wgt.
//
// TotalCarat is intentionally ignored for matching.
function extractCarat(size, weight, pieces) {
    if (size !== null && size !== undefined && size !== "") {
        const match = String(size).match(/[\d.]+/);
        if (match) {
            const n = Number(match[0]);
            if (Number.isFinite(n) && n > 0) return n;
        }
    }

    const w = toNumber(weight, null);
    const p = toNumber(pieces, null);
    if (w !== null && w > 0 && p !== null && p > 0) {
        return w / p;
    }

    return null;
}

function hasStoneData(v) {
    return Boolean(
        safeString(v.diamondtype) ||
        safeString(v.stonetype) ||
        safeString(v.type) ||
        safeString(v.shape) ||
        safeString(v.size) ||
        safeString(v.pieces) ||
        safeString(v.wgt) ||
        safeString(v.totalcarat)
    );
}

export const import_products_service = async function (req) {
    const baseUrl = BaseURL(req);

    const data = await convert_excel_to_array_jewellery(req);

    const startTime = new Date();

    const file = Array.isArray(req.files) ? req.files[0] : null;

    const fileName = file?.filename || "";
    const originalName = file?.originalname || "";

    const stockFile = await StockFile.create({
        userFileName: originalName,
        fileName,
        // Resolves to the S3 URL in production (memoryStorage sets no `file.path`)
        // and to the /uploads/... URL locally. Reading `file.path` alone stored
        // null on the server, making the uploaded file undownloadable there.
        uploadedFileUrl: resolveUploadedFileUrl(file, baseUrl),
        uploadedBy: req.userId || null,
        batchLogs: {},
    });

    if (!data.length) {
        return {
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: "Empty file",
        };
    }

    // ---------------- FEATURE SWITCHES ----------------
    // Note from Smit : these switches work as feature so that we can have different feature for different requirement and validation 
    const SWITCH_CHECK_HEADER = true; // Set to false to disable header validation
    const SWITCH_ALLOW_EMPTY_SIZE_FALLBACK = true; // Set to true to allow fallback to stonegroup with empty size when size match fails
    const SWITCH_VALIDATE_COLOR_STONE_PARAMS = false; // Set to true to validate/resolve GemColor/GemClarity against Parameter master for color stones
    const SWITCH_VALIDATE_CATEGORY_AND_SUBCATEGORY = true; // Set to true to validate/enforce category and subcategory check during import
    const SWITCH_ALLOW_PARTIAL_IMPORT = true; // Set to true to allow partial import

    // Read the header row once (row 1). The data parser's row.eachCell() skips
    // empty cells, so a column that exists but is blank everywhere is invisible
    // if you union keys from data rows.
    const originalHeaders = await getExcelHeaders(req);
    const sheetHeaders = originalHeaders.map((h) =>
        String(h || "").trim().toLowerCase()
    );

    // The canonical sheet has no `qty` column. Without this guard,
    // `qty: toNumber(value.qty)` resolves to 0 and $set wipes the stored
    // quantity of every product on import. When the column is absent we simply
    // omit qty so the existing value is preserved (schema default on insert).
    const hasQtyColumn = sheetHeaders.includes("qty");

    if (SWITCH_CHECK_HEADER) {
        // const expectedHeaders = [
        //     "maindesignnumber", "itemcode", "parentitemcode", "prodcategory", "prodsubcategory",
        //     "prodtitle", "proddesc", "collection", "tags", "gender", "metaltype", "metalstamp",
        //     "appxmetalweight", "qty", "width", "height", "length", "labourcode", "otherchargescode",
        //     "isengraving", "type", "stonetype", "shape", "gemcolor", "gemclarity", "size", "pieces", "wgt", "totalcarat",
        //     "imageurl1", "imageurl2", "imageurl3", "imageurl4", "imageurl5", "videourl", "status",
        //     "similarproducts", "combinewith", "slug", "havechain", "chainmetaltype", "chainmetalstamp",
        //     "weight", "chainlength", "shipmentdays", "seo_title", "seo_description"
        // ];
        const expectedHeaders = [
            "maindesignnumber", "itemcode", "parentitemcode", "prodcategory", "prodsubcategory",
            "prodtitle", "proddesc", "collection", "tags", "gender", "metaltype", "metalstamp",
            "appxmetalweight", "width", "height", "length", "labourcode", "otherchargescode",
            "isengraving", "type", "stonetype", "shape", "gemcolor", "gemclarity", "size", "pieces", "wgt", "totalcarat",
            "imageurl1", "imageurl2", "imageurl3", "imageurl4", "imageurl5", "videourl", "status",
            "matchingproducts", "similarproducts", "slug", "havechain", "chainmetaltype", "chainmetalstamp",
            "weight", "chainlength", "shipmentdays", "seo_title", "seo_description"
        ];

        const headerValidation = validateHeader(sheetHeaders, expectedHeaders);

        if (!headerValidation.isValid) {
            const endTime = new Date();
            stockFile.batchLogs = {
                totalRows: data.length,
                validProducts: 0,
                inserted: 0,
                updated: 0,
                matched: 0,
                stonesInserted: 0,
                rejected: data.length,
                status: "FAILED_VALIDATION",
                error: headerValidation.message,
                startTime,
                endTime,
                duration: (endTime - startTime) + " ms",
            };
            await stockFile.save();

            return {
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: headerValidation.message,
            };
        }
    }

    // ---------------- LOAD MASTERS ----------------
    //
    // Every master query filters soft-deleted rows. Without the
    // `isDeleted` predicate, an admin who soft-deletes a category /
    // collection / tag / metal / stone-group would still see the imported
    // products silently link to those dead records.
    //
    // Use `{ $ne: 1 }` instead of `{ $eq: 0 }` so legacy rows that pre-date
    // the field (i.e. where `isDeleted` is absent) still match.

    const [
        categories,
        collections,
        tags,
        allMetals,
        allCharges,
        stoneGroups,
        defaultStoneGroups,
        parameters,
    ] = await Promise.all([
        Category.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Collection.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Tag.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Metal.find({ status: "ACTIVE", isDeleted: { $ne: 1 } }).lean(),
        Charges.find({ status: "ACTIVE", isDeleted: false }).lean(),
        StoneGroup.find({ status: "ACTIVE", isDeleted: { $ne: 1 } })
            .populate("shape")
            .lean(),
        // ACTIVE only — a SUSPENDED quality must never be picked as the default
        // for blank sheet GemColor/GemClarity, even if it still carries the
        // isDefault flag. Every other master here is filtered the same way.
        StoneGroupDefault.find({ status: "ACTIVE", isDeleted: false }).lean(),
        Parameter.find({ status: "ACTIVE", isDeleted: 0 }).lean(),
    ]);

    // ---------------- MAPS ----------------

    function addMapValue(map, key, doc) {
        const k = normalize(key);

        if (k) {
            map.set(k, doc);
        }
    }

    function buildSimpleMap(list, field) {
        const map = new Map();

        for (const doc of list) {
            addMapValue(map, doc[field], doc);
        }

        return map;
    }

    const categoryMap = buildSimpleMap(categories, "categoryName");
    const collectionMap = buildSimpleMap(collections, "collectionName");
    const tagMap = buildSimpleMap(tags, "name");

    const metalMap = new Map();

    for (const m of allMetals) {
        addMapValue(metalMap, `${m.type || ""} ${m.stamp || ""}`, m);
        addMapValue(metalMap, `${m.name || ""} ${m.stamp || ""}`, m);
        addMapValue(metalMap, m.name, m);
        addMapValue(metalMap, m.type, m);
    }

    const chargesMap = new Map();

    for (const c of allCharges) {
        addMapValue(chargesMap, c.code, c);
        addMapValue(chargesMap, c.name, c);
    }

    // ---------------- PARAMETER MAPS ----------------

    const parameterResolver = {
        shape: new Map(),
        color: new Map(),
        clarity: new Map(),
    };

    for (const p of parameters) {
        if (!parameterResolver[p.type]) continue;

        const keys = [
            p._id.toString(),
            p.code,
            p.name,
            ...(Array.isArray(p.synonyms) ? p.synonyms : []),
        ];

        for (const key of keys) {
            if (p.type === "color") {
                const k = normalizeColor(key);

                if (k) {
                    parameterResolver.color.set(k, p);
                }
            } else if (p.type === "clarity") {
                const k = normalizeClarity(key);

                if (k) {
                    parameterResolver.clarity.set(k, p);
                }
            } else {
                const k = normalize(key);

                if (k) {
                    parameterResolver.shape.set(k, p);
                }
            }
        }
    }

    function resolveParam(type, value) {
        if (!value) return null;

        if (type === "color") {
            return parameterResolver.color.get(normalizeColor(value)) || null;
        }

        if (type === "clarity") {
            return parameterResolver.clarity.get(normalizeClarity(value)) || null;
        }

        return parameterResolver.shape.get(normalize(value)) || null;
    }

    const defaultStoneGroupMap = new Map();

    for (const item of defaultStoneGroups) {
        const key = normalize(item.stoneType);
        if (item.isDefault || !defaultStoneGroupMap.has(key)) {
            if (item.isDefault || !defaultStoneGroupMap.get(key)?.isDefault) {
                defaultStoneGroupMap.set(key, item);
            }
        }
        // defaultStoneGroupMap.set(
        //     normalize(item.stoneType),
        //     item
        // );
    }

    // Pre-resolve defaults for optimization outside the loop.
    let defaultDiamondColorDoc = null;
    let defaultDiamondClarityDoc = null;
    const diamondDefault = defaultStoneGroupMap.get("diamond") || null;
    if (diamondDefault) {
        if (diamondDefault.color) {
            defaultDiamondColorDoc = resolveParam("color", diamondDefault.color) || diamondDefault.color;
        }
        if (diamondDefault.clarity) {
            defaultDiamondClarityDoc = resolveParam("clarity", diamondDefault.clarity) || diamondDefault.clarity;
        }
    }

    // Pre-resolve defaults for optimization outside the loop by origin.
    //
    // StoneGroupDefault.color/.clarity are FREE TEXT (the old `ObjectId ref:
    // "Parameter"` fields are commented out in the model). They therefore hold
    // whatever grade the Settings & Qualities master defines — e.g. "VVS-VS" —
    // which need not exist as a row in the Parameter collection.
    //
    // So resolve through Parameter when possible (to pick up synonyms/codes),
    // but FALL BACK TO THE RAW STRING when it isn't a Parameter — exactly as the
    // sheet-supplied path below already does. Requiring a Parameter here made a
    // perfectly valid default (e.g. EF / "VVS-VS") resolve to null and rejected
    // every diamond row with a blank sheet GemClarity.
    //
    // Safe downstream: findStoneGroup() reads `doc.code || doc.name || doc`, and
    // the StoneGroup index is keyed with the same normalizeColor/normalizeClarity,
    // so a raw "VVS-VS" matches a StoneGroup whose clarity is "VVS-VS".
    // for multiple stone default
    // const getDiamondDefaultByOrigin = (origin) => {
    //     // origin: "Natural", "Lab Grown", "Both"
    //     // First priority: specific origin
    //     let def = defaultStoneGroups.find(
    //         (d) => d.stoneType === "diamond" && d.isDefault && d.origin === origin
    //     );
    //     // Second priority: "Both"
    //     if (!def) {
    //         def = defaultStoneGroups.find(
    //             (d) => d.stoneType === "diamond" && d.isDefault && d.origin === "Both"
    //         );
    //     }
    //     // Fallback: any active diamond default
    //     if (!def) {
    //         def = defaultStoneGroups.find(
    //             (d) => d.stoneType === "diamond" && d.isDefault
    //         );
    //     }
    //     return def;
    // };
    // let defaultDiamondColorDoc = null;
    // let defaultDiamondClarityDoc = null;
    // const diamondDefault = defaultStoneGroupMap.get("diamond") || null;
    // if (diamondDefault) {
    //     if (diamondDefault.color) {
    //         defaultDiamondColorDoc = resolveParam("color", diamondDefault.color) || diamondDefault.color;
    //     }
    //     if (diamondDefault.clarity) {
    //         defaultDiamondClarityDoc = resolveParam("clarity", diamondDefault.clarity) || diamondDefault.clarity;
    //     }
    // }
    // uncomment for multiple stone default
    // const getDiamondDefaultDocs = (origin) => {
    //     const def = getDiamondDefaultByOrigin(origin);
    //     if (!def) return { colorDoc: null, clarityDoc: null, diamondDefault: null };
    //     const colorDoc = def.color ? (resolveParam("color", def.color) || def.color) : null;
    //     const clarityDoc = def.clarity ? (resolveParam("clarity", def.clarity) || def.clarity) : null;
    //     return { colorDoc, clarityDoc, diamondDefault: def };
    // };

    // ---------------- STONE GROUP LOOKUP ----------------

    const stoneGroupMap = new Map();

    const resolveColorCode = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && (val.code || val.name)) {
            return val.code || val.name;
        }
        const doc = resolveParam("color", val);
        if (doc && typeof doc === "object") {
            return doc.code || doc.name || val;
        }
        return String(val);
    };

    const resolveClarityCode = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && (val.code || val.name)) {
            return val.code || val.name;
        }
        const doc = resolveParam("clarity", val);
        if (doc && typeof doc === "object") {
            return doc.code || doc.name || val;
        }
        return String(val);
    };

    const resolveShapeId = (val) => {
        if (!val) return "";
        if (typeof val === "object" && val !== null && val._id) {
            return val._id.toString();
        }
        const doc = resolveParam("shape", val);
        if (doc && typeof doc === "object" && doc._id) {
            return doc._id.toString();
        }
        return String(val);
    };

    for (const sg of stoneGroups) {
        let key = null;
        const normalizedType = normalizeStoneType(sg.stoneType);
        const shapeId = resolveShapeId(sg.shape);
        const colorCode = resolveColorCode(sg.color);
        const clarityCode = resolveClarityCode(sg.clarity);

        if (normalizedType === "colorstone") {
            key = [
                normalizedType,
                normalize(sg.type),
                shapeId,
                normalizeColor(colorCode),
                normalizeClarity(clarityCode)
            ].join("|");
        } else {
            key = [
                normalizedType,
                shapeId,
                normalizeColor(colorCode),
                normalizeClarity(clarityCode),
            ].join("|");
        }
        if (!stoneGroupMap.has(key)) {
            stoneGroupMap.set(key, []);
        }

        stoneGroupMap.get(key).push(sg);
    }

    function findStoneGroup({
        stoneType,
        gemType,
        shapeDoc,
        colorDoc,
        clarityDoc,
        size,
        gemColor,
        gemClarity,
    }) {
        const normalizedType = normalizeStoneType(stoneType);
        if (normalizedType === "colorstone") {
            if (!shapeDoc || !gemType || !safeString(size)) {
                return null;
            }
        } else {
            if (!shapeDoc || !colorDoc || !clarityDoc || !safeString(size)) {
                return null;
            }
        }
        let key;

        const shapeId = resolveShapeId(shapeDoc);
        const colorCode = resolveColorCode(colorDoc);
        const clarityCode = resolveClarityCode(clarityDoc);

        if (normalizedType === "colorstone") {
            const finalColor = colorDoc ? colorCode : gemColor;
            const finalClarity = clarityDoc ? clarityCode : (gemClarity || "");
            key = [
                normalizedType,
                normalize(gemType),
                shapeId,
                normalizeColor(finalColor),
                normalizeClarity(finalClarity)
            ].join("|");
        } else {
            key = [
                normalizedType,
                shapeId,
                normalizeColor(colorCode),
                normalizeClarity(clarityCode),
            ].join("|");
        }

        const groups = stoneGroupMap.get(key) || [];
        const found = groups.find(
            sg => matchStoneGroupSize(sg.carat, size)
        );
        if (found) return found;

        if (SWITCH_ALLOW_EMPTY_SIZE_FALLBACK) {
            return groups.find(sg => !sg.carat || sg.carat.toString().trim() === "") || null;
        }

        return null;
    }

    // ---------------- STONE BUILDER ----------------

    function buildStone(v, rowNo, issues) {
        if (!hasStoneData(v)) {
            return null;
        }

        const lookupType = safeString(v.stonetype);
        const stoneType = normalizeStoneType(lookupType);

        // uncomment for multiple stone default
        // let origin = "Both";
        // if (stoneType === "diamond") {
        //     const lookupTypeLower = lookupType.toLowerCase();
        //     if (lookupTypeLower.includes("natural")) {
        //         origin = "Natural";
        //     } else if (["lab grown", "labgrown", "lgd"].some(term => lookupTypeLower.includes(term))) {
        //         origin = "Lab Grown";
        //     }
        // }

        const shapeDoc = resolveParam("shape", v.shape);
        if (safeString(v.shape) && !shapeDoc) {
            issues.push(`Row ${rowNo}: Invalid shape "${v.shape}"`);
        }

        let colorDoc = null;
        let clarityDoc = null;
        let gemType = null;
        let gemColor = "";
        let gemClarity = "";

        if (stoneType === "colorstone") {
            gemType = safeString(v.gemtype) ? normalize(v.gemtype) : null;
            // if (!gemType && Constant.GEM_TYPES.ALL_TYPES.includes(normalize(v.stonetype))) {
            //     gemType = normalize(v.stonetype);
            // }
            if (!gemType) {
                issues.push(`Row ${rowNo}: Gemstone type is required for color stone`);
                return null;
            }

            gemColor = safeString(v.gemcolor);
            gemClarity = safeString(v.gemclarity);
            if (!gemColor) {
                issues.push(`Row ${rowNo}: GemColor is required for color stone`);
                return null;
            }

            if (SWITCH_VALIDATE_COLOR_STONE_PARAMS) {
                colorDoc = resolveParam("color", gemColor);
                if (!colorDoc) {
                    issues.push(`Row ${rowNo}: Invalid GemColor "${gemColor}"`);
                    return null;
                }
                if (gemClarity) {
                    clarityDoc = resolveParam("clarity", gemClarity);
                    if (!clarityDoc) {
                        issues.push(`Row ${rowNo}: Invalid GemClarity "${gemClarity}"`);
                        return null;
                    }
                }
            } else {
                // The switch is OFF, so the Parameter master is not consulted and
                // colorDoc/clarityDoc stay null. Without this the row was written
                // with color: null, clarity: null and the storefront had nothing
                // to show for a colour stone. Keep the sheet's own values — a
                // colour stone's grade is never varied, so the sheet IS the truth.
                colorDoc = gemColor;
                clarityDoc = gemClarity || "";
            }
        } else {
            // Diamonds. The sheet's GemColor / GemClarity ARE the manufactured
            // grade, and the stone group (hence the price) is looked up by them.
            //
            // This branch used to ignore the sheet entirely and stamp every
            // diamond with the Diamond Quality Master default (D / IF). Rates are
            // only published for D/IF from 1.00 ct upwards, so a 0.65 ct EF/VVS
            // stone matched no stone group at all and was silently priced at 0.
            //
            // The Parameter master is not authoritative for colour/clarity — the
            // stone-group import stores them as raw strings — so fall back to the
            // sheet's own text when the parameter lookup does not recognise it,
            // rather than rejecting an otherwise valid row.
            //un comment for multiple stone default
            // const { colorDoc: defaultDiamondColorDoc, clarityDoc: defaultDiamondClarityDoc, diamondDefault } = getDiamondDefaultDocs(origin);

            const sheetColor = safeString(v.gemcolor);
            const sheetClarity = safeString(v.gemclarity);

            colorDoc = sheetColor
                ? (resolveParam("color", sheetColor) || sheetColor)
                : defaultDiamondColorDoc;

            clarityDoc = sheetClarity
                ? (resolveParam("clarity", sheetClarity) || sheetClarity)
                : defaultDiamondClarityDoc;

            // Distinguish "no default row exists" from "a default row exists but
            // its value is blank". The old message claimed nothing was configured
            // even when a default WAS set, which sent people hunting for missing
            // config that was actually present.
            if (!colorDoc) {
                issues.push(
                    `Row ${rowNo}: Color is required for diamond — sheet GemColor is blank and ${diamondDefault
                        ? `the default quality "${diamondDefault.displayName || diamondDefault.stoneType}" has no Color set`
                        : `no default diamond quality is configured in Settings & Qualities`}`
                );
                return null;
            }
            if (!clarityDoc) {
                issues.push(
                    `Row ${rowNo}: Clarity is required for diamond — sheet GemClarity is blank and ${diamondDefault
                        ? `the default quality "${diamondDefault.displayName || diamondDefault.stoneType}" has no Clarity set`
                        : `no default diamond quality is configured in Settings & Qualities`}`
                );
                return null;
            }
        }

        // Per-piece carat. Kept for the consistency check below; the stone-group
        // lookup keys off the raw `v.size` string so it matches StoneGroup.carat
        // (also a string) exactly.
        const caratPerPiece = extractCarat(v.size, v.wgt, v.pieces);

        const sg = findStoneGroup({
            stoneType,
            gemType,
            shapeDoc,
            colorDoc,
            clarityDoc,
            size: v.size,
            gemColor,
            gemClarity
        });

        if (!sg) {
            issues.push(
                `Row ${rowNo}: Stone group not found for type=${stoneType}${gemType ? ` (${gemType})` : ""}, shape=${v.shape || ""}, size=${v.size || ""}`
            );
            return null;
        }

        let type = normalize(v.type || v.diamondtype || "SIDE");

        if (["center", "main", "centre"].includes(type)) {
            type = "CENTER";
        } else if (["side", "accent"].includes(type)) {
            type = "SIDE";
        } else {
            type = "SIDE";
        }

        const weightVal = parseFloat(toNumber(v.wgt).toFixed(4));

        // Wgt should equal Size x Pieces. A mismatch means the sheet's own
        // columns disagree, and since pricing multiplies by Wgt it would quote
        // the wrong amount. Warn rather than reject: the row is still importable
        // and rejecting it would block an otherwise valid catalogue upload.
        const piecesVal = toNumber(v.pieces);
        if (caratPerPiece > 0 && piecesVal > 0 && weightVal > 0) {
            const expected = caratPerPiece * piecesVal;
            if (Math.abs(expected - weightVal) > 0.0051) {
                console.warn(
                    `[importProduct] Row ${rowNo}: Wgt ${weightVal} != Size ${caratPerPiece} x Pieces ${piecesVal} (= ${expected.toFixed(4)}). Pricing will use Wgt.`
                );
            }
        }

        // uncomment for multiple stone default
        // const stonePrice = getStonePrice(sg, stoneType === "diamond" ? origin : null);

        const stonePrice = getStonePrice(sg);

        if (stonePrice === null) {
            issues.push(
                `Row ${rowNo}: No price configured for stone group`
            );
            return null;
        }

        return {
            stoneGroup: sg._id,
            type,
            pieces: toNumber(v.pieces),
            wgt: weightVal,
            weight: weightVal,
            size: safeString(v.size),
            shape: shapeDoc?._id || null,
            color: colorDoc?._id || null,
            clarity: clarityDoc?._id || null,
            // This row's TOTAL carat is the sheet's Wgt column (= Size x Pieces),
            // i.e. `weightVal` — the same number pricing multiplies by. It used
            // to store the PER-PIECE carat instead, which made the storefront's
            // "Total Weight" read 0.005 ct for 16 x 0.005 ct stones, not 0.080.
            totalCarat: weightVal,
            price: stonePrice * weightVal,
            lgdPrice: (sg.lgd_price || 0) * weightVal,
            naturalPrice: (sg.natural_price || 0) * weightVal
            // ,
            // ...(stoneType === "diamond" ? { origin } : {}) // for multiple stone default
        };
    }

    // ---------------- MAIN PARSE ----------------

    const insertProduct = [];
    const rejectedProduct = [];

    let currentGroup = null;

    const itemCodeSet = new Set();

    function finalizeCurrentGroup() {
        if (!currentGroup) return;

        if (currentGroup.issues.length) {
            rejectedProduct.push({
                ...currentGroup.rejectRow,
                issues: currentGroup.issues.join(" | "),
            });
        } else {
            insertProduct.push(currentGroup.product);
        }
    }

    for (let i = 0; i < data.length; i++) {
        const rowNo = i + 2;

        const value = convertKeysToLowercase(data[i]);

        const isProductRow = Boolean(safeString(value.itemcode));

        // ---------------- PRODUCT ROW ----------------

        if (isProductRow) {
            finalizeCurrentGroup();

            currentGroup = null;

            const issues = [];

            const itemCode = safeString(value.itemcode);

            if (itemCodeSet.has(itemCode)) {
                rejectedProduct.push({
                    ...data[i],
                    issues: `Duplicate itemCode in excel`,
                });

                continue;
            }

            itemCodeSet.add(itemCode);

            const category = categoryMap.get(normalize(value.prodcategory));

            const metal = metalMap.get(
                normalize(`${value.metaltype} ${value.metalstamp}`)
            );

            const labourObj = chargesMap.get(normalize(value.labourcode));
            const otherChargeCode = safeString(value.otherchargescode);
            console.log('otherChargeCode', otherChargeCode)
            const otherObj = otherChargeCode ? chargesMap.get(normalize(otherChargeCode)) : null;

            if (SWITCH_VALIDATE_CATEGORY_AND_SUBCATEGORY && !category) {
                issues.push(`Invalid category: "${value.prodcategory || ""}"`);
            }

            if (!metal) {
                issues.push(`Invalid metal type/stamp`);
            }

            if (!labourObj) {
                issues.push(`Invalid labour charge`);
            }
            if (otherChargeCode && !otherObj) {
                issues.push(`Invalid other charge`);
            }

            // ---------------- SUB CATEGORY ----------------

            const subCategoryIds = [];

            if (safeString(value.prodsubcategory)) {
                const subNames = safeString(value.prodsubcategory).split(",");
                for (const sub of subNames) {
                    // if subCategory All then ignore
                    if (normalize(sub) === "all" || normalize(sub) === "allbracelets") {
                        continue;
                    }
                    const found = category
                        ? categories.find(
                            (c) =>
                                normalize(c.categoryName) === normalize(sub) &&
                                c.parentCategoryId &&
                                c.parentCategoryId.toString() ===
                                category._id.toString()
                        )
                        : null;
                    if (found) {
                        subCategoryIds.push(found._id);
                    } else if (SWITCH_VALIDATE_CATEGORY_AND_SUBCATEGORY) {
                        issues.push(`Invalid subcategory: "${sub}"`);
                    }
                }
            }

            // ---------------- COLLECTION ---------------- 
            // Each comma-separated value must resolve to an active,
            // non-deleted collection. Unknown/deleted names are surfaced
            // as row issues — earlier they were silently dropped, so a
            // typo would import the row without the link.

            const collectionIds = [];

            if (safeString(value.collection)) {
                for (const raw of safeString(value.collection).split(",")) {
                    const name = raw.trim();
                    if (!name) continue;
                    const doc = collectionMap.get(normalize(name));
                    if (doc) {
                        collectionIds.push(doc._id);
                    } else {
                        issues.push(`Invalid collection: "${name}"`);
                    }
                }
            }

            // ---------------- TAGS ----------------
            // Same contract as collections — every listed tag must exist
            // and be active.

            const tagIds = [];

            if (safeString(value.tags)) {
                for (const raw of safeString(value.tags).split(",")) {
                    const name = raw.trim();
                    if (!name) continue;
                    const doc = tagMap.get(normalize(name));
                    if (doc) {
                        tagIds.push(doc._id);
                    } else {
                        issues.push(`Invalid tag: "${name}"`);
                    }
                }
            }

            // ---------------- PRODUCT OBJECT ----------------

            let productStatus = Constant.PRODUCT_STATUS.AVAILABLE;
            console.log('value.status', value.status)
            if (value.status) {
                const rawStatus = safeString(value.status).toLowerCase();
                if (["suspend", "suspended", "hold"].includes(rawStatus)) {
                    productStatus = Constant.PRODUCT_STATUS.HOLD;
                }
            }

            const product = {
                designNumber: safeString(value.maindesignnumber),

                itemCode,

                parentItemCode: safeString(value.parentitemcode),

                productTitle: safeString(value.prodtitle),

                productDesc: safeString(value.proddesc),

                categoryId: category?._id || null,

                subCategoryId: subCategoryIds,

                collectionId: collectionIds,

                tags: tagIds,

                gender: safeString(value.gender),

                metalId: metal?._id || null,

                appxMetalWgt: parseFloat(toNumber(value.appxmetalweight).toFixed(4)),

                // Only written when the sheet actually carries a qty column —
                // otherwise the key is omitted and $set leaves qty untouched.
                ...(hasQtyColumn ? { qty: toNumber(value.qty) } : {}),

                height: safeString(value.height),

                width: safeString(value.width),

                length: safeString(value.length),

                labourCode: labourObj?._id || null,

                otherChargeCode: otherObj?._id || null,

                isEngraving:
                    normalize(value.isengraving) === "yes",

                images: [
                    value.imageurl1,
                    value.imageurl2,
                    value.imageurl3,
                    value.imageurl4,
                    value.imageurl5,
                ]
                    .filter(Boolean)
                    .map((img, index) => ({
                        MediaLocation: img,
                        MediaSeqNo: index + 1,
                        IsMainMedia: index === 0,
                    })),

                videos: safeString(value.videourl)
                    ? [
                        {
                            MediaLocation: value.videourl,
                            MediaSeqNo: 1,
                            IsMainMedia: true,
                        },
                    ]
                    : [],

                slug: createSlug(
                    `${safeString(value.prodtitle)}-${itemCode}`
                ),

                haveChain: safeString(value.havechain) || "No",
                cMetalId: metalMap.get(normalize(`${value.chainmetaltype} ${value.chainmetalstamp}`))?._id || null,

                cWgt: parseFloat(toNumber(value.weight).toFixed(4)),
                cLength: safeString(value.chainlength),

                // Keep the RAW sheet value — it can be a range ("15 to 17",
                // "15-17"); toNumber() turned those into 0 and lost the range.
                shipmentDays: safeString(value.shipmentdays),

                SEODetails: {
                    metaTitle: safeString(value.seo_title),
                    metaKeyword: safeString(value.tags),
                    slug: safeString(value.slug),
                    // Reference sheet uses `SEO_Description`; older exports
                    // used `SeoDesc`. Accept either after lowercase.
                    metaDescription: safeString(
                        value.seo_description || value.seodesc
                    ),
                },

                // Cross-sell / upsell SKU lists from the import sheet.
                // Both are comma-separated itemCodes; trim and drop blanks.
                similarProducts: safeString(value.similarproducts)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                // Header is "matchingproducts" (see expectedHeaders) — was reading
                // the old "combinewith" column, so this field imported empty.
                combineWith: safeString(value.matchingproducts ?? value.combinewith)
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                status: productStatus,

                diamond: [],

                createdBy: req.userId || null,
            };

            currentGroup = {
                product,
                issues,
                rejectRow: data[i],
            };

            // ---------------- SAME ROW STONE ----------------

            const sameRowStone = buildStone(
                value,
                rowNo,
                currentGroup.issues
            );

            if (sameRowStone) {
                currentGroup.product.diamond.push(sameRowStone);
            }

            continue;
        }

        // ---------------- CHILD STONE ROW ----------------

        if (!isProductRow && currentGroup) {
            const stone = buildStone(
                value,
                rowNo,
                currentGroup.issues
            );

            if (stone) {
                currentGroup.product.diamond.push(stone);
            }

            continue;
        }
    }

    finalizeCurrentGroup();

    // ---------------- APPLY TO LIVE DB ----------------

    let applyResult = null;

    const canImport =
        insertProduct.length > 0 &&
        (
            SWITCH_ALLOW_PARTIAL_IMPORT ||
            rejectedProduct.length === 0
        );

    // Snapshot which itemCodes already existed, so the Success sheet can say
    // INSERTED vs UPDATED per product. Must run BEFORE the upsert.
    let preExistingItemCodes = new Set();

    if (canImport) {
        const existingRows = await ProductMaster.find(
            { itemCode: { $in: insertProduct.map((p) => p.itemCode) } },
            { itemCode: 1 }
        ).lean();
        preExistingItemCodes = new Set(existingRows.map((r) => r.itemCode));

        applyResult = await applyProductImportToLive({
            mongoose,
            ProductMaster,
            ProductStone,
            validProducts: insertProduct,
            userId: req.userId,
        });

        // ---------------- CALCULATE PRICES FOR IMPORTED PRODUCTS ----------------
        try {
            const savedProducts = await ProductMaster.find(
                { itemCode: { $in: insertProduct.map(p => p.itemCode) } },
                { _id: 1 }
            ).lean();
            const productIds = savedProducts.map(p => p._id);
            if (productIds.length > 0) {
                await calculateProductsPriceService({ productIds });

                // finalPrice just changed, so any live offer pinned to these
                // products now holds a stale discounted price. Re-resolve the
                // active offers (same step /products/syncPrice performs).
                const { sync_offers_db } = await import("../services/offer.services.js");
                await sync_offers_db();
            }
        } catch (calcError) {
            console.error("Failed to calculate imported product prices:", calcError);
        }
    }

    // create_excel_files returns an absolute S3/CloudFront URL when S3 uploads
    // are enabled, and a relative "/uploads/..." path otherwise. Only the
    // relative form may be prefixed with baseUrl.
    const toPublicUrl = (u) =>
        u ? (u.startsWith("http") ? u : baseUrl + u) : null;

    // ---------------- SUCCESS FILE ----------------
    // What actually landed in the DB, one row per product, so the operator can
    // confirm the import rather than infer it from counters.

    let successUrl = null;

    if (canImport && insertProduct.length) {
        const successRows = insertProduct.map((p) => ({
            ItemCode: p.itemCode || "",
            MainDesignNumber: p.designNumber || "",
            ParentItemCode: p.parentItemCode || "",
            ProdTitle: p.productTitle || "",
            Action: preExistingItemCodes.has(p.itemCode) ? "UPDATED" : "INSERTED",
            Stones: (p.diamond || []).length,
        }));

        successUrl = await create_excel_files(successRows, "Success");
    }

    const successFileUrl = toPublicUrl(successUrl);

    // ---------------- REJECT FILE ----------------

    let rejectUrl = null;

    if (rejectedProduct.length) {
        rejectUrl = await create_excel_files(rejectedProduct, "Rejected", [...originalHeaders, "issues"]);
    }

    const rejectedFileUrl = toPublicUrl(rejectUrl);

    if (rejectedFileUrl) {
        stockFile.rejectedUrl = rejectedFileUrl;
    }

    // ---------------- LOGS ----------------

    const endTime = new Date();

    stockFile.batchLogs = {
        totalRows: data.length,

        validProducts: insertProduct.length,

        inserted: applyResult?.inserted || 0,

        updated: applyResult?.updated || 0,

        matched: applyResult?.matched || 0,

        stonesInserted: applyResult?.stonesInserted || 0,

        rejected: rejectedProduct.length,

        successFileUrl,

        rejectedFileUrl,

        status: rejectedProduct.length
            ? (
                SWITCH_ALLOW_PARTIAL_IMPORT
                    ? "PARTIAL_SUCCESS"
                    : "FAILED_VALIDATION"
            )
            : "COMPLETED",

        startTime,

        endTime,

        duration: endTime - startTime + " ms",
    };

    await stockFile.save();

    return {
        errorCode: rejectedProduct.length ? STATUS_CODE.BAD_REQUEST : STATUS_CODE.OK,

        message: rejectedProduct.length
            ? (
                SWITCH_ALLOW_PARTIAL_IMPORT
                    ? `${insertProduct.length} products imported, ${rejectedProduct.length} rejected`
                    : "Import validation failed. Live products not changed."
            )
            : "Products imported successfully",

        totalRows: data.length,

        validProducts: insertProduct.length,

        inserted: applyResult?.inserted || 0,

        updated: applyResult?.updated || 0,

        matched: applyResult?.matched || 0,

        stonesInserted: applyResult?.stonesInserted || 0,

        rejected: rejectedProduct.length,

        rejectedFileUrl,

        successFileUrl,
    };
};

export const get_import_history = async (req, res) => {
    try {
        const page = parseInt(req.body?.page || req.query.page) || 1;
        const limit = parseInt(req.body?.limit || req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await StockFile.countDocuments();

        const data = await StockFile.find()
            .populate({
                path: "uploadedBy",
                model: "User",
                select: "name email role"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formatted = data.map(d => {
            const createdDate = new Date(d.createdAt);
            const formattedDateTime = createdDate.toLocaleString("en-GB", {
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
                // Only present on imports run after the Success sheet was added.
                successFileUrl: d.batchLogs?.successFileUrl || null,
                inserted: d.batchLogs?.inserted || 0,
                updated: d.batchLogs?.updated || 0,
                rejected: d.batchLogs?.rejected || 0,
                duration: d.batchLogs?.duration || null,
                uploadedBy: d.uploadedBy
                    ? { name: d.uploadedBy.name, email: d.uploadedBy.email }
                    : null,
                createdAt: formattedDateTime
            };
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: MESSAGES.IMPORT.HISTORY_FETCHED,
            data: formatted,
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