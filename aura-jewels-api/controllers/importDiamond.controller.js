import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";
import Parameter from "../models/parameter.model.js";
import Diamond from "../models/diamond.model.js";
import StockFile from "../models/stockFile.model.js";
import BaseURL from "../constants/baseUrl.js";
import { resolveUploadedFileUrl } from "../utils/uploadPaths.js";
import { create_excel_files } from "../utils/createExcelFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalize = (str) =>
  str
    ?.toString()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

export const import_diamonds_service = async function (req, res) {
  const startTime = new Date();
  const baseUrl = BaseURL(req);

  const file = Array.isArray(req.files) ? req.files[0] : null;
  if (!file) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      errorCode: STATUS_CODE.BAD_REQUEST,
      message: "Please upload a file",
    });
  }

  const fileName = file.filename || "";
  const originalName = file.originalname || "";

  // Create StockFile log entry
  const stockFile = await StockFile.create({
    userFileName: originalName,
    fileName,
    uploadedFileUrl: resolveUploadedFileUrl(file, baseUrl),
    uploadedBy: req.user?.userId || null,
    importType: 'diamond',
    batchLogs: {},
  });

  try {
    // 1. Fetch active parameters to map names to MongoDB ObjectIDs
    const parameters = await Parameter.find({ status: "ACTIVE", isDeleted: 0 }).lean();

    const shape = {};
    const color = {};
    const clarity = {};
    const cut = {};
    const polish = {};
    const symmetry = {};
    const fluorescence = {};
    const lab = {};

    const parameterIdMaps = { shape, color, clarity, cut, polish, symmetry, fluorescence, lab };

    for (const p of parameters) {
      const map = parameterIdMaps[ p.type];
      if (!map) continue;

      const paramData = {
        _id: p._id.toString(),
        name: p.name,
        code: p.code
      };

      // Map ObjectID as string
      map[p._id.toString()] = paramData;

      // Map code
      if (p.code) {
        const normCode = normalize(p.code);
        if (normCode) map[normCode] = paramData;
      }

      // Map name
      if (p.name) {
        const normName = normalize(p.name);
        if (normName) map[normName] = paramData;
      }

      // Map synonyms/aliases
      if (Array.isArray(p.synonyms)) {
        for (const syn of p.synonyms) {
          const normSyn = normalize(syn);
          if (normSyn) map[normSyn] = paramData;
        }
      }

      // Map acceptableValues
      if (Array.isArray(p.acceptableValues)) {
        for (const val of p.acceptableValues) {
          const normVal = normalize(val);
          if (normVal) map[normVal] = paramData;
        }
      }
    }

    // Fetch existing diamonds pricing to preserve rap and disc during update/upsert
    const existingDiamonds = await Diamond.find({ isDeleted: 0 }).select("stockId rap disc ppc price").lean();
    const existingPricing = {};
    for (const d of existingDiamonds) {
      if (d.stockId) {
        existingPricing[d.stockId.toUpperCase().trim()] = {
          rap: d.rap || 0,
          disc: d.disc || 0,
          ppc: d.ppc || 0,
          price: d.price || 0
        };
      }
    }

    // 2. Prepare child worker thread data
    const workerPath = path.resolve(__dirname, '../workers/importDiamond.worker.js');
    const workerData = {
      filePath: file.path || null,
      fileBuffer: file.buffer || null,
      mimeType: file.mimetype,
      parameterIdMaps,
      existingPricing,
      userId: req.user?.userId || null,
    };
    // console.log("parameterIdMaps>>>>>>>>>>>>>>>>>", workerData)

    // 3. Execute child worker thread
    const workerResult = await new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, { workerData });

      worker.on('message', (message) => {
        if (message.success) resolve(message);
        else reject(new Error(message.error || 'Worker thread failed execution'));
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit status ${code}`));
      });
    });

    const { operations, totalRows, rejectedRows } = workerResult;

    let inserted = 0;
    let updated = 0;

    // 4. Perform bulkWrite to save diamonds
    if (operations && operations.length > 0) {
      const bulkResult = await Diamond.bulkWrite(operations);
      inserted = bulkResult.upsertedCount || 0;
      updated = (bulkResult.modifiedCount || bulkResult.matchedCount || 0) - inserted;
      if (updated < 0) updated = 0;
    }

    // 5. Handle rejected rows
    let rejectUrl = null;
    let rejectedFileUrl = null;
    if (rejectedRows && rejectedRows.length > 0) {
      rejectUrl = await create_excel_files(rejectedRows, "Rejected");
      rejectedFileUrl = rejectUrl ? (rejectUrl.startsWith("http") ? rejectUrl : baseUrl + rejectUrl) : null;
    }

    const duration = ((new Date() - startTime) / 1000).toFixed(2) + "s";

    // 6. Save batchLogs stats
    stockFile.batchLogs = {
      inserted,
      updated,
      rejected: rejectedRows.length,
      duration,
    };

    if (rejectedFileUrl) {
      stockFile.rejectedUrl = rejectedFileUrl;
    }

    await stockFile.save();
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: `${inserted} diamonds imported, ${updated} updated, ${rejectedRows.length} rejected.`,
      data: {
        totalRows,
        inserted,
        updated,
        rejected: rejectedRows.length,
        rejectedFileUrl,
        duration,
      }
    });

  } catch (error) {
    console.error("import_diamonds_service error:", error);
    stockFile.batchLogs = {
      error: error.message,
      duration: ((new Date() - startTime) / 1000).toFixed(2) + "s"
    };
    await stockFile.save();

    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
    });
  }
};

export const get_diamond_import_history = async (req, res) => {
  try {
    const page = parseInt(req.body?.page || req.query.page) || 1; //3
    const limit = parseInt(req.body?.limit || req.query.limit) || 10;
    const skip = (page - 1) * limit; //(3-1)*10 = 20




    const query = { importType: 'diamond' };
    const total = await StockFile.countDocuments(query);

    const data = await StockFile.find(query)
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
        fileName: d.userFileName || d.fileName || "-",
        url: d.uploadedFileUrl,
        rejectedDiamondUrl: d.rejectedUrl,
        inserted: d.batchLogs?.inserted || 0,
        updated: d.batchLogs?.updated || 0,
        rejected: d.batchLogs?.rejected || 0,
        duration: d.batchLogs?.duration || null,
        uploadedBy: d.uploadedBy ? (d.uploadedBy.name || "-") : "Admin",
        createdBy: d.uploadedBy ? (d.uploadedBy.name || "-") : "Admin",
        createdAt: formattedDateTime
      };
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond import history fetched successfully",
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

export const get_diamonds_list_admin = async (req, res) => {
  try {
    const page = parseInt(req.body?.page || req.query.page) || 1;
    const limit = parseInt(req.body?.limit || req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const diamondType = req.body?.diamondType || req.query.diamondType || "Lab Grown";
    const search = req.body?.search || req.query.search || "";
    const minRap = req.body?.minRap || req.query?.minRap;
    const maxRap = req.body?.maxRap || req.query?.maxRap;
    const minDiscount = req.body?.minDiscount || req.query?.minDiscount;
    const maxDiscount = req.body?.maxDiscount || req.query?.maxDiscount;

    const shape = req.body?.shape || req.query?.shape;
    const color = req.body?.color || req.query?.color;
    const clarity = req.body?.clarity || req.query?.clarity;
    const cut = req.body?.cut || req.query?.cut;
    const polish = req.body?.polish || req.query?.polish;
    const symmetry = req.body?.symmetry || req.query?.symmetry;
    const fluorescence = req.body?.fluorescence || req.query?.fluorescence;
    const certLab = req.body?.certLab || req.query?.certLab;

    const query = { isDeleted: 0 };

    if (diamondType === 'Lab Grown') {
      query.creation = { $in: ['CVD', 'HPHT', 'cvd', 'hpht', 'Lab Grown', 'lab grown', 'Lab-Grown', 'lab-grown', '', null] };
    } else if (diamondType === 'Natural') {
      query.creation = { $nin: ['CVD', 'HPHT', 'cvd', 'hpht', 'Lab Grown', 'lab grown', 'Lab-Grown', 'lab-grown', '', null] };
    }

    if (search) {
      query.$or = [
        { stockId: { $regex: search, $options: 'i' } },
        { certNo: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const toObjectId = (val) => {
      try { return new mongoose.Types.ObjectId(val); } catch (e) { return null; }
    };

    if (shape) query.shape = toObjectId(shape);
    if (color) query.color = toObjectId(color);
    if (clarity) query.clarity = toObjectId(clarity);
    if (cut) query.cut = toObjectId(cut);
    if (polish) query.polish = toObjectId(polish);
    if (symmetry) query.symmetry = toObjectId(symmetry);
    if (fluorescence) query.fluorescence = toObjectId(fluorescence);
    if (certLab) query.certLab = toObjectId(certLab);

    // Remove keys that failed to parse as objectIds (e.g., if they were empty or invalid)
    ['shape', 'color', 'clarity', 'cut', 'polish', 'symmetry', 'fluorescence', 'certLab'].forEach(key => {
      if (query[key] === null) delete query[key];
    });

    if (minRap !== undefined || maxRap !== undefined) {
      query.rap = {};
      if (minRap !== undefined && minRap !== '') query.rap.$gte = Number(minRap);
      if (maxRap !== undefined && maxRap !== '') query.rap.$lte = Number(maxRap);
      if (Object.keys(query.rap).length === 0) delete query.rap;
    }

    if (minDiscount !== undefined || maxDiscount !== undefined) {
      query.disc = {};
      if (minDiscount !== undefined && minDiscount !== '') query.disc.$gte = Number(minDiscount);
      if (maxDiscount !== undefined && maxDiscount !== '') query.disc.$lte = Number(maxDiscount);
      if (Object.keys(query.disc).length === 0) delete query.disc;
    }

    const sortField = req.body?.sortField || req.query?.sortField || "price";
    const sortOrder = req.body?.sortOrder || req.query?.sortOrder || "asc";
    const sortQuery = {};
    sortQuery[sortField] = sortOrder === "asc" ? 1 : -1;

    const aggregationPipeline = [
      { $match: query },
      { $sort: sortQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: 'parameters', localField: 'shape', foreignField: '_id', as: 'shape' } },
            { $unwind: { path: "$shape", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'color', foreignField: '_id', as: 'color' } },
            { $unwind: { path: "$color", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'clarity', foreignField: '_id', as: 'clarity' } },
            { $unwind: { path: "$clarity", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'cut', foreignField: '_id', as: 'cut' } },
            { $unwind: { path: "$cut", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'polish', foreignField: '_id', as: 'polish' } },
            { $unwind: { path: "$polish", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'symmetry', foreignField: '_id', as: 'symmetry' } },
            { $unwind: { path: "$symmetry", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'fluorescence', foreignField: '_id', as: 'fluorescence' } },
            { $unwind: { path: "$fluorescence", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'parameters', localField: 'certLab', foreignField: '_id', as: 'certLab' } },
            { $unwind: { path: "$certLab", preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ];

    const aggregationResult = await Diamond.aggregate(aggregationPipeline);
    const total = aggregationResult[0]?.metadata[0]?.total || 0;
    const diamonds = aggregationResult[0]?.data || [];

    const formatted = diamonds.map(d => ({
      _id: d._id,
      stockId: d.stockId,
      status: d.status === 'ACTIVE' ? 'available' : 'suspended',
      shape: d.shape?.code || d.shape?.name || "-",
      carat: d.carat,
      color: d.color?.code || d.color?.name || "-",
      clarity: d.clarity?.code || d.clarity?.name || "-",
      cut: d.cut?.code || d.cut?.name || "-",
      polish: d.polish?.code || d.polish?.name || "-",
      sym: d.symmetry?.code || d.symmetry?.name || "-",
      flo: d.fluorescence?.code || d.fluorescence?.name || "-",
      lab: d.certLab?.code || d.certLab?.name || "-",
      certno: d.certNo,
      measurement: d.sizeMM,
      price_per_carat: d.ppc,
      rapnet: d.rap,
      finalamount: d.price,
      discount: d.disc,
      image: d.certLink
    }));

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond list fetched successfully",
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

export const add_diamond = async function (req, res) {
  try {
    const {
      stockId,
      status,
      shape,
      color,
      clarity,
      sizeMM,
      cut,
      polish,
      symmetry,
      fluorescence,
      creation,
      gemstoneType,
      gemstoneOrigin,
      carat,
      caratNo,
      certNo,
      certLab,
      certLink,
      country,
      rap,
      disc,
    } = req.body;

    const normStock = stockId.toString().trim().toUpperCase();
    const exists = await Diamond.findOne({ stockId: normStock, isDeleted: 0 });
    if (exists) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Stock ID already exists",
      });
    }

    const caratNum = Number(carat) || 0;
    const rapNum = Number(rap) || 0;
    const discNum = Number(disc) || 0;
    const ppc = Number((rapNum - (rapNum * discNum / 100)).toFixed(2));
    const price = Number((ppc * caratNum).toFixed(2));
    const discount = `${discNum}%`;

    const newDiamond = new Diamond({
      stockId: normStock,
      status: status || "ACTIVE",
      shape: shape || null,
      color: color || null,
      clarity: clarity || null,
      sizeMM: sizeMM || "",
      cut: cut || null,
      polish: polish || null,
      symmetry: symmetry || null,
      fluorescence: fluorescence || null,
      creation: creation || "",
      gemstoneType: gemstoneType || "",
      gemstoneOrigin: gemstoneOrigin || "",
      carat: caratNum,
      caratNo: caratNo || "",
      certNo: certNo || "",
      certLab: certLab || null,
      certLink: certLink || "",
      country: country || "",
      rap: rapNum,
      disc: discNum,
      discount,
      ppc,
      price,
      createdBy: req.user?.userId || null,
      updatedBy: req.user?.userId || null,
    });

    await newDiamond.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond created successfully",
      data: newDiamond,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const get_diamond_details = async function (req, res) {
  try {
    const { id } = req.params;
    const diamond = await Diamond.findOne({ _id: id, isDeleted: 0 })
      .populate('shape color clarity cut polish symmetry fluorescence certLab')
      .lean();

    if (!diamond) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Diamond not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond details fetched successfully",
      data: diamond,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const update_diamond = async function (req, res) {
  try {
    const { id } = req.params;
    const diamond = await Diamond.findOne({ _id: id, isDeleted: 0 });
    if (!diamond) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Diamond not found",
      });
    }

    const {
      stockId,
      status,
      shape,
      color,
      clarity,
      sizeMM,
      cut,
      polish,
      symmetry,
      fluorescence,
      creation,
      gemstoneType,
      gemstoneOrigin,
      carat,
      caratNo,
      certNo,
      certLab,
      certLink,
      country,
      rap,
      disc,
    } = req.body;

    if (stockId) {
      const normStock = stockId.toString().trim().toUpperCase();
      const exists = await Diamond.findOne({ stockId: normStock, _id: { $ne: id }, isDeleted: 0 });
      if (exists) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Stock ID already exists",
        });
      }
      diamond.stockId = normStock;
    }

    if (status !== undefined) diamond.status = status;
    if (shape !== undefined) diamond.shape = shape || null;
    if (color !== undefined) diamond.color = color || null;
    if (clarity !== undefined) diamond.clarity = clarity || null;
    if (sizeMM !== undefined) diamond.sizeMM = sizeMM || "";
    if (cut !== undefined) diamond.cut = cut || null;
    if (polish !== undefined) diamond.polish = polish || null;
    if (symmetry !== undefined) diamond.symmetry = symmetry || null;
    if (fluorescence !== undefined) diamond.fluorescence = fluorescence || null;
    if (creation !== undefined) diamond.creation = creation || "";
    if (gemstoneType !== undefined) diamond.gemstoneType = gemstoneType || "";
    if (gemstoneOrigin !== undefined) diamond.gemstoneOrigin = gemstoneOrigin || "";
    if (caratNo !== undefined) diamond.caratNo = caratNo || "";
    if (certNo !== undefined) diamond.certNo = certNo || "";
    if (certLab !== undefined) diamond.certLab = certLab || null;
    if (certLink !== undefined) diamond.certLink = certLink || "";
    if (country !== undefined) diamond.country = country || "";

    if (carat !== undefined) diamond.carat = Number(carat) || 0;
    if (rap !== undefined) diamond.rap = Number(rap) || 0;
    if (disc !== undefined) diamond.disc = Number(disc) || 0;

    // Recalculate price details
    const ppc = Number((diamond.rap - (diamond.rap * diamond.disc / 100)).toFixed(2));
    const price = Number((ppc * diamond.carat).toFixed(2));
    diamond.ppc = ppc;
    diamond.price = price;
    diamond.discount = `${diamond.disc}%`;

    diamond.updatedBy = req.user?.userId || null;

    await diamond.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond updated successfully",
      data: diamond,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const delete_diamond = async function (req, res) {
  try {
    const { id } = req.params;
    const diamond = await Diamond.findOneAndUpdate(
      { _id: id, isDeleted: 0 },
      { $set: { isDeleted: 1, updatedBy: req.user?.userId || null } },
      { new: true }
    );

    if (!diamond) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Diamond not found or already deleted",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond deleted successfully",
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};

export const update_diamond_status = async function (req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const diamond = await Diamond.findOneAndUpdate(
      { _id: id, isDeleted: 0 },
      { $set: { status, updatedBy: req.user?.userId || null } },
      { new: true }
    );

    if (!diamond) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Diamond not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Diamond status updated successfully",
      data: diamond,
    });
  } catch (error) {
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR,
    });
  }
};
