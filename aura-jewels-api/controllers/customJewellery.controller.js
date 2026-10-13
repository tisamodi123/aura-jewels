import mongoose from "mongoose";
import BaseURL from "../constants/baseUrl.js";
import crypto from "crypto";
import STATUS_CODE from "../constants/statusCode.constant.js";
import CustomJewellery from "../models/customJewellery.model.js";
import { create_custom_payment_link_db } from "../services/paymentLink.services.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { CustomJewelleryCustomerMailTemplate } from "../mailtemplates/customJewellery.mail.js";
import Quotations from "../models/quotations.model.js";
import Metal from "../models/metal.model.js";
import Constant from "../constants/user.constant.js";
import MESSAGES from "../constants/messages.constant.js";
import { verifyCaptcha } from "../utils/verifyCaptcha.js";
import { verifyEmailLink } from "../mailtemplates/auth.mail.js";
import { MAIL } from "../config/mail.config.js";
import {
  generateCustomOrderInquiryName,
  generateQuotationName,
} from "../utils/sequenceHelper.js";
import {
  processGlobalRegistration,
  processIndianRegistration,
  processVerifyOtp,
} from "../services/auth.services.js";
import {
  normaliseCountryCode,
  normalisePhone,
} from "../services/otp.services.js";
import {
  resolveAssetUrl,
  getUploadedOrCleanFilename,
} from "../utils/uploadPaths.js";

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const toBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const normalizeArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
};

const cleanPayload = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
};

const sendCustomJewelleryRequestEmails = async (customJewelleryId) => {
  try {
    console.log(1111111);

    const customJewellery = await CustomJewellery.findById(customJewelleryId)
      .populate("categoryId", "categoryName")
      .populate("metalId", "name")
      .populate("ringSizeId", "name")
      .populate("userInfo", "name email phone");

    console.log(customJewellery, "customJewellery1221212");

    if (!customJewellery) return;

    const requestId =
      customJewellery._id?.toString()?.slice(-8)?.toUpperCase() || "N/A";

    // const adminEmail = process.env.CUSTOM_JEWELLERY_ADMIN_EMAIL;
    const customerEmail = customJewellery.email?.trim();

    const emailPromises = [];

    // if (adminEmail) {
    //   const adminHtml = CustomJewelleryAdminMailTemplate(customJewellery);

    //   emailPromises.push(
    //     sendEmail(
    //       adminEmail,
    //       `New Custom Jewellery Request - #${requestId}`,
    //       adminHtml
    //     )
    //   );
    // }

    if (customerEmail) {
      const customerHtml = CustomJewelleryCustomerMailTemplate(customJewellery);

      emailPromises.push(
        sendEmail(
          customerEmail,
          `Custom Jewellery Request Received - #${requestId}`,
          customerHtml
        )
      );
    }

    if (emailPromises.length > 0) {
      const results = await Promise.allSettled(emailPromises);
      results.forEach((result) => {
        console.log(result, "12212");

        if (result.status === "rejected") {
          console.error("Custom jewellery email error:", result.reason);
        }
      });
    }
  } catch (error) {
    console.error("sendCustomJewelleryRequestEmails error:", error);
  }
};

export const createCustomJewelleryController = async (req, res) => {
  try {
    // We only enforce reCAPTCHA verification on the INITIAL submission (where no OTP
    // is provided yet). Once the user receives the OTP, subsequent calls with `otp` bypass
    // as reCAPTCHA tokens are single-use and the user has already proven they are human.
    const isOtpVerification = Boolean(req.body.otp);
    if (!isOtpVerification) {
      if (!req.body.captcha) {
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Captcha is required",
        });
      }
      await verifyCaptcha(req.body.captcha);
    }

    console.log("[createCustomJewelleryController] Request received", {
      mobileNumber: req.body.mobileNumber,
      countryCode: req.body.countryCode,
      country: req.body.country,
      hasOtp: Boolean(req.body.otp),
      filesCount: Array.isArray(req.files) ? req.files.length : 0,
    });

    const files = Array.isArray(req.files) ? req.files : [];

    // Collect newly uploaded filenames (bare filename stored in DB)
    const uploadedFilenames = files
      .filter((f) => f.fieldname === "attachments" || f.fieldname?.startsWith("attachment"))
      .map((f) => f.filename)
      .filter(Boolean);

    // If the client also sent existing attachment URLs/filenames in the body, normalise them
    const bodyAttachments = normalizeArrayField(req.body.attachments)
      .map((val) => getUploadedOrCleanFilename(req, null, val))
      .filter(Boolean);

    // New uploads take priority; merge and cap at 5
    const attachments = [...uploadedFilenames, ...bodyAttachments]
      .filter(Boolean)
      .slice(0, 5);

    // If no uploaded files at all, fall back to collecting all uploaded files
    const allUploadedFilenames = files
      .map((f) => f.filename)
      .filter(Boolean);
    const finalAttachments = attachments.length > 0
      ? attachments
      : allUploadedFilenames.slice(0, 5);

    let urls = [];
    const rawUrls = req.body.urls || req.body.referenceUrls;
    if (rawUrls) {
      if (typeof rawUrls === "string") {
        try {
          const parsed = JSON.parse(rawUrls);
          urls = normalizeArrayField(parsed);
        } catch (e) {
          urls = normalizeArrayField(rawUrls);
        }
      } else {
        urls = normalizeArrayField(rawUrls);
      }
    }
    urls = urls.slice(0, 5);

    const email = (req.body.email || "").trim().toLowerCase();
    const mobileNumber = (req.body.mobileNumber || "").trim();
    const countryCode = (req.body.countryCode || "").trim();
    const country = (req.body.country || "").trim();
    const otp = (req.body.otp || "").trim();
    const firstName = (req.body.firstName || "").trim();
    const lastName = (req.body.lastName || "").trim();
    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || "Customer";

    const normalizedPhone = normalisePhone(mobileNumber);
    const normalizedCountryCode = normaliseCountryCode(countryCode);

    const isIndia = country.toUpperCase() === "IN"

    const createOrder = async (userId) => {
      console.log(
        "[createCustomJewelleryController] Creating custom jewellery order",
        {
          userId,
          mobileNumber,
          countryCode,
        }
      );

      const payload = cleanPayload({
        categoryId: req.body.categoryId,
        otherProduct: req.body.otherProduct,
        attachments: finalAttachments,
        urls,
        metalId: req.body.metalId,
        approxMetalWeight: toNumber(req.body.approxMetalWeight),
        ringSizeId: req.body.ringSizeId || undefined,
        stoneType: req.body.stoneType || undefined,
        approxStoneWeight: toNumber(req.body.approxStoneWeight),
        gemstonePreference: req.body.gemstonePreference,
        budget: toNumber(req.body.budget),
        engraving: req.body.engraving,
        isEngraving: toBoolean(req.body.isEngraving),
        remarks: req.body.remarks,
        firstName,
        lastName,
        mobileNumber,
        countryCode,
        email,
        userInfo: userId,
      });

      const customJewellery = await CustomJewellery.create(payload);

      console.log(
        "[createCustomJewelleryController] Custom jewellery order created",
        {
          customJewelleryId: customJewellery._id,
          userId,
        }
      );

      sendCustomJewelleryRequestEmails(customJewellery._id)
        .then(() => {
          console.log(
            "[createCustomJewelleryController] Custom jewellery email triggered",
            {
              customJewelleryId: customJewellery._id,
            }
          );
        })
        .catch((err) =>
          console.error(
            "[createCustomJewelleryController] Custom jewellery request email error",
            {
              customJewelleryId: customJewellery._id,
              error: err?.message,
            }
          )
        );

      return customJewellery;
    };

    let user = null
    if (isIndia) {
      user = await User.findOne({
        phone: normalizedPhone,
        phoneCountryCode: normalizedCountryCode,
        isDeleted: 0,
      }).select("_id phoneVerified emailVerified status role");
      if (!user) {
        user = await User.findOne({
          email: email,
          isDeleted: 0,
        }).select("_id phoneVerified emailVerified status role");
      }

    } else {
      user = await User.findOne({
        email: email,
        isDeleted: 0,
      }).select("_id phoneVerified emailVerified status role");
    }

    if (user && user.status === Constant.STATUS.ACTIVE && (isIndia ? user.phoneVerified || user.emailVerified : user.emailVerified)) {
      await createOrder(user._id);

      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "Custom jewellery request added successfully",
      });
    }

    if (otp && isIndia) {
      const verifyResponse = await processVerifyOtp({
        country: "india",
        phone: normalizedPhone,
        countryCode: normalizedCountryCode,
        otp,
      });

      const verifiedUserId = verifyResponse?.user?._id;

      if (!verifiedUserId) {

        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "OTP verification failed",
        });
      }
      await createOrder(verifiedUserId);
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.OK,
        message: "OTP verified and custom jewellery request added successfully",
      });
    } else if (!isIndia && user && !user?.emailVerified) {
      //send verify email mail
      const token = crypto.randomBytes(32).toString("hex");
      user.emailVerifyToken = token;
      user.emailVerifyTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      await user.save();

      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const html = verifyEmailLink({ name: fullName, verifyLink });
      await sendEmail(email, "Verify Your Email", html, { from: MAIL.senders.account });

      return res.status(STATUS_CODE.OK).json({
        emailVerificationRequired: true,
        message: "Email verification link sent successfully",
      });
    }

    let data = null;
    if (isIndia) {

      data = await processIndianRegistration({
        name: fullName,
        email,
        phone: normalizedPhone,
        countryCode: normalizedCountryCode,
        isWhatsAppSameAsMobile: true,
        country: country,
      });
    } else {
      data = await processGlobalRegistration({
        name: fullName,
        email,
        phone: normalizedPhone,
        countryCode: normalizedCountryCode,
        isWhatsAppSameAsMobile: true,
        country: country,
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: isIndia ? "OTP sent successfully" : "Email verification link sent successfully",
      data: isIndia ? {
        otpRequired: true,
        otp: data?.otp,
      } : {
        emailVerificationRequired: true
      },
    });
  } catch (error) {
    console.error("[createCustomJewelleryController] Error occurred", {
      message: error?.message,
      stack: error?.stack,
      mobileNumber: req.body?.mobileNumber,
      countryCode: req.body?.countryCode,
      country: req.body?.country,
      hasOtp: Boolean(req.body?.otp),
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const getMyCustomOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid user id",
      });
    }

    const page = Math.max(parseInt(req.body.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.body.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const matchStage = {
      userInfo: new mongoose.Types.ObjectId(userId),
    };

    if (status) {
      matchStage.orderStatus = status;
    }

    const result = await CustomJewellery.aggregate([
      {
        $match: matchStage,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryId",
              },
            },
            {
              $unwind: {
                path: "$categoryId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metalId",
              },
            },
            {
              $unwind: {
                path: "$metalId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "sizes",
                localField: "ringSizeId",
                foreignField: "_id",
                as: "ringSizeId",
              },
            },
            {
              $unwind: {
                path: "$ringSizeId",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userInfo",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            {
              $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                attachments: 1,
                urls: 1,
                approxMetalWeight: 1,
                stoneType: 1,
                approxStoneWeight: 1,
                gemstonePreference: 1,
                budget: 1,
                engraving: 1,
                remarks: 1,
                firstName: 1,
                lastName: 1,
                mobileNumber: 1,
                countryCode: 1,
                email: 1,
                orderStatus: 1,
                createdAt: 1,
                updatedAt: 1,
                categoryId: {
                  $cond: {
                    if: { $gt: ["$categoryId", null] },
                    then: {
                      _id: "$categoryId._id",
                      categoryName: "$categoryId.categoryName",
                    },
                    else: "$$REMOVE",
                  },
                },
                otherProduct: {
                  $cond: {
                    if: { $gt: ["$categoryId", null] },
                    then: "$$REMOVE",
                    else: "$otherProduct",
                  },
                },
                metalId: {
                  _id: "$metalId._id",
                  name: "$metalId.name",
                },
                ringSizeId: {
                  _id: "$ringSizeId._id",
                  name: "$ringSizeId.name",
                },
                userInfo: {
                  _id: "$userInfo._id",
                  name: "$userInfo.name",
                  email: "$userInfo.email",
                  mobileNumber: "$userInfo.mobileNumber",
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
        },
      },
    ]);
    console.log("result", result)
    const baseUrl = BaseURL(req);
    const customOrders = (result[0]?.data || []).map((order) => ({
      ...order,
      attachments: (order.attachments || []).map((filename) =>
        resolveAssetUrl(filename, baseUrl, "uploads/custom-order")
      ),
    }));
    const total = result[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "My custom orders fetched successfully",
      data: customOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const getMyOrderQuotations = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "customOrderId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid custom order id",
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid user id",
      });
    }

    const customOrderObjectId = new mongoose.Types.ObjectId(id);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log(userId, "111", id);

    const customOrder = await CustomJewellery.findOne({
      _id: customOrderObjectId,
      userInfo: userObjectId,
    }).select("_id userInfo");

    console.log(customOrder, "1111");

    if (!customOrder) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Custom order not found for this user",
      });
    }

    const quotation = await Quotations.aggregate([
      {
        $match: {
          customOrderId: customOrderObjectId,
        },
      },
      {
        $lookup: {
          from: "metals",
          localField: "quotationInfo.metalInfo.metalType",
          foreignField: "_id",
          as: "metalDetails",
        },
      },
      {
        $project: {
          quotationInfo: {
            $map: {
              input: "$quotationInfo",
              as: "item",
              in: {
                title: "$$item.title",
                quotationId: "$$item.quotationId",
                status: "$$item.status",
                approvedByAdmin: "$$item.approvedByAdmin",
                approvedByUser: "$$item.approvedByUser",
                canChangeStatus: {
                  $cond: {
                    if: {
                      $and: ["$$item.approvedByAdmin", "$$item.approvedByUser"],
                    },
                    then: false,
                    else: true,
                  },
                },
                metalInfo: {
                  metalType: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$metalDetails",
                          as: "metal",
                          cond: {
                            $eq: ["$$metal._id", "$$item.metalInfo.metalType"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  metalWeight: "$$item.metalInfo.metalWeight",
                  metalPrice: "$$item.metalInfo.metalPrice",
                },
                diamond: "$$item.diamond",
                totalPrice: "$$item.totalPrice",
                remarks: "$$item.remarks",
              },
            },
          },
        },
      },
    ]);

    if (!quotation.length) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Quotation not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Quotation fetched successfully",
      data: quotation[0].quotationInfo || [],
    });
  } catch (error) {
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const updateMyQuotationStatus = async (req, res) => {
  try {
    const { status, customOrderId, quotationId } = req.body;
    const userId = req.user?.userId;

    if (!customOrderId || !mongoose.Types.ObjectId.isValid(customOrderId)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid custom order id",
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid user id",
      });
    }

    if (!quotationId) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "quotationId is required",
      });
    }

    if (
      !status ||
      ![
        Constant.QUOTATION_STATUS.APPROVED,
        Constant.QUOTATION_STATUS.REJECT,
      ].includes(status)
    ) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const customOrder = await CustomJewellery.findOne({
      _id: customOrderId,
      userInfo: userId,
    }).select("_id userInfo");

    if (!customOrder) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Custom order not found for this user",
      });
    }

    const quotationDoc = await Quotations.findOne({
      customOrderId,
      "quotationInfo.quotationId": quotationId,
    });

    if (!quotationDoc) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Quotation not found",
      });
    }

    const selectedQuotation = quotationDoc.quotationInfo.find(
      (item) => item.quotationId === quotationId
    );

    if (!selectedQuotation) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Quotation item not found",
      });
    }

    if (selectedQuotation.approvedByAdmin && selectedQuotation.approvedByUser) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "This quotation status can't be changed after approval",
      });
    }

    if (status === Constant.QUOTATION_STATUS.REJECT) {
      selectedQuotation.status = Constant.QUOTATION_STATUS.REJECT;
      selectedQuotation.approvedByUser = false;
    }

    if (status === Constant.QUOTATION_STATUS.APPROVED) {
      quotationDoc.quotationInfo.forEach((item) => {
        if (item.quotationId === quotationId) {
          item.approvedByUser = true;

          if (item.approvedByAdmin) {
            item.status = Constant.QUOTATION_STATUS.APPROVED;
            console.log(
              "[updateMyQuotationStatus] Both admin and user approved quotation",
              {
                customOrderId,
                quotationId: item.quotationId,
              }
            );
          } else {
            item.status = Constant.QUOTATION_STATUS.ACCEPT;
          }
        } else {
          item.status = Constant.QUOTATION_STATUS.REJECT;
          item.approvedByUser = false;
        }
      });
    }

    await quotationDoc.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Quotation status updated successfully",
      data: quotationDoc.quotationInfo,
    });
  } catch (error) {
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

// ADMIN SIDE

export const getAllCustomOrder = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.body.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.body.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const result = await CustomJewellery.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryId",
              },
            },
            {
              $unwind: {
                path: "$categoryId",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $lookup: {
                from: "metals",
                localField: "metalId",
                foreignField: "_id",
                as: "metalId",
              },
            },
            {
              $unwind: {
                path: "$metalId",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $lookup: {
                from: "sizes",
                localField: "ringSizeId",
                foreignField: "_id",
                as: "ringSizeId",
              },
            },
            {
              $unwind: {
                path: "$ringSizeId",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $lookup: {
                from: "users",
                localField: "userInfo",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            {
              $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            // send quotation doc where approved by both side
            {
              $lookup: {
                from: "quotations",
                localField: "_id",
                foreignField: "customOrderId",
                as: "quotations",
                pipeline: [
                  {
                    $match: {
                      "quotationInfo.approvedByAdmin": true,
                      "quotationInfo.approvedByUser": true,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$quotations",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                attachments: 1,
                urls: 1,
                approxMetalWeight: 1,
                stoneType: 1,
                approxStoneWeight: 1,
                gemstonePreference: 1,
                budget: 1,
                engraving: 1,
                remarks: 1,
                firstName: 1,
                lastName: 1,
                mobileNumber: 1,
                countryCode: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                orderStatus: 1,
                // quotations: 1,
                canAddQuatation: {
                  $cond: {
                    if: { $gt: ["$quotations", null] },
                    then: false,
                    else: true,
                  },
                },
                categoryId: {
                  $cond: {
                    if: { $gt: ["$categoryId", null] },
                    then: {
                      _id: "$categoryId._id",
                      categoryName: "$categoryId.categoryName",
                    },
                    else: "$$REMOVE",
                  },
                },
                otherProduct: {
                  $cond: {
                    if: { $gt: ["$categoryId", null] },
                    then: "$$REMOVE",
                    else: "$otherProduct",
                  },
                },

                metalId: {
                  _id: "$metalId._id",
                  name: "$metalId.name",
                },

                ringSizeId: {
                  _id: "$ringSizeId._id",
                  name: "$ringSizeId.name",
                },

                userInfo: {
                  _id: "$userInfo._id",
                  name: "$userInfo.name",
                  email: "$userInfo.email",
                  mobileNumber: "$userInfo.mobileNumber",
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          data: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
          },
        },
      },
    ]);

    const baseUrl = BaseURL(req);
    const customOrders = (result[0]?.data || []).map((order) => ({
      ...order,
      attachments: (order.attachments || []).map((filename) =>
        resolveAssetUrl(filename, baseUrl, "uploads/custom-order")
      ),
    }));
    const total = result[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Custom orders fetched successfully",
      data: customOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.log("get All custom order error:", error);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const createQuotations = async (req, res) => {
  try {
    const { customOrderId, quotations } = req.body;

    const customOrder = await CustomJewellery.findById(customOrderId)
      .select("_id")
      .lean();

    if (!customOrder) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Custom order not found",
      });
    }

    // can not create new quotation after one quatation approved from both side 
    let quotationDoc = await Quotations.findOne({ customOrderId });
    if (quotationDoc) {
      const approvedQuotation = quotationDoc.quotationInfo.find(
        (item) => item.approvedByAdmin && item.approvedByUser
      );
      if (approvedQuotation) {
        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: "Cannot create new quotation after one quotation is approved from both side",
        });
      }
    }

    const metalIds = [
      ...new Set(quotations.map((item) => String(item.metalType))),
    ];

    const metals = await Metal.find({ _id: { $in: metalIds } })
      .select("_id")
      .lean();

    const foundMetalIds = new Set(metals.map((item) => String(item._id)));
    const invalidMetalId = metalIds.find((id) => !foundMetalIds.has(id));

    if (invalidMetalId) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: `Invalid metalType: ${invalidMetalId}`,
      });
    }

    let customOrderInqName = quotationDoc?.customOrderInqName;

    if (!customOrderInqName) {
      customOrderInqName = await generateCustomOrderInquiryName();
    }

    const newQuotationInfo = [];

    for (const item of quotations) {
      const quotationName = await generateQuotationName({
        customOrderId: customOrder._id.toString(),
        customOrderInqName,
      });

      newQuotationInfo.push({
        title: item.title?.trim() || "",
        quotationId: quotationName,
        status: item.status || Constant.QUOTATION_STATUS.PENDING,
        metalInfo: {
          metalType: item.metalType,
          metalWeight: toNumber(item.metalWeight),
          metalPrice: toNumber(item.metalPrice),
        },
        diamond: {
          diamondLabel: item.diamondLabel?.trim() || "",
          carate: toNumber(item.carate),
          price: toNumber(item.price),
        },
        totalPrice: toNumber(item.totalPrice),
        remarks: item.remarks?.trim() || "",
      });
    }

    if (!quotationDoc) {
      quotationDoc = await Quotations.create({
        customOrderId: customOrder._id,
        customOrderInqName,
        quotationInfo: newQuotationInfo,
      });
    } else {
      quotationDoc.quotationInfo.push(...newQuotationInfo);
      await quotationDoc.save();
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Quotations saved successfully",
      data: quotationDoc,
    });
  } catch (error) {
    console.error("createQuotations error:", error);

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const assignCustomerToOrder = async (req, res) => {
  try {
    const { userId, customOrderId } = req.body;

    if (!userId || !customOrderId) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "userId and customOrderId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(customOrderId)
    ) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid userId or customOrderId",
      });
    }

    const [user, customOrder] = await Promise.all([
      User.findById(userId)
        .select("_id firstName lastName email mobileNumber")
        .lean(),
      CustomJewellery.findById(customOrderId).select("_id userInfo").lean(),
    ]);

    if (!user) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });
    }

    if (!customOrder) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Custom order not found",
      });
    }

    const updatedOrder = await CustomJewellery.findByIdAndUpdate(
      customOrderId,
      {
        $set: {
          userInfo: userId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate("userInfo", "firstName lastName email mobileNumber")
      .lean();

    if (updatedOrder && updatedOrder.attachments) {
      const baseUrl = BaseURL(req);
      updatedOrder.attachments = (updatedOrder.attachments || []).map((filename) =>
        resolveAssetUrl(filename, baseUrl, "uploads/custom-order")
      );
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Customer assigned to custom order successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("assignCustomerToOrder error:", error);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const getQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "customOrderId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid custom order id",
      });
    }

    const quotation = await Quotations.aggregate([
      {
        $match: {
          customOrderId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "metals",
          localField: "quotationInfo.metalInfo.metalType",
          foreignField: "_id",
          as: "metalDetails",
        },
      },
      {
        $project: {
          quotationInfo: {
            $map: {
              input: "$quotationInfo",
              as: "item",
              in: {
                title: "$$item.title",
                quotationId: "$$item.quotationId",
                status: "$$item.status",
                approvedByUser: "$$item.approvedByUser",
                approvedByAdmin: "$$item.approvedByAdmin",
                canChangeStatus: {
                  $cond: {
                    if: {
                      $and: ["$$item.approvedByUser", "$$item.approvedByAdmin"],
                    },
                    then: false,
                    else: true,
                  },
                },
                metalInfo: {
                  metalType: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$metalDetails",
                          as: "metal",
                          cond: {
                            $eq: ["$$metal._id", "$$item.metalInfo.metalType"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                  metalWeight: "$$item.metalInfo.metalWeight",
                  metalPrice: "$$item.metalInfo.metalPrice",
                },
                diamond: "$$item.diamond",
                totalPrice: "$$item.totalPrice",
                remarks: "$$item.remarks",
              },
            },
          },
        },
      },
    ]);

    if (!quotation.length) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Quotation not found",
      });
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Quotation fetched successfully",
      data: quotation[0].quotationInfo || [],
    });
  } catch (error) {
    console.log("getQuotation error:", error);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const updateQuotationStatus = async (req, res) => {
  try {
    const { customOrderId, quotationId, status } = req.body;

    console.log("[updateQuotationStatus] Request received", {
      customOrderId,
      quotationId,
      status,
    });

    const quotationDoc = await Quotations.findOne({ customOrderId });

    if (!quotationDoc) {
      console.log("[updateQuotationStatus] Quotation document not found", {
        customOrderId,
      });

      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Quotation document not found",
      });
    }

    const selectedQuotation = quotationDoc.quotationInfo.find(
      (item) => item.quotationId === quotationId
    );

    if (!selectedQuotation) {
      console.log("[updateQuotationStatus] Quotation item not found", {
        customOrderId,
        quotationId,
      });

      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Quotation item not found",
      });
    }

    if (selectedQuotation.approvedByAdmin && selectedQuotation.approvedByUser) {
      console.log(
        "[updateQuotationStatus] Status change blocked after final approval",
        {
          customOrderId,
          quotationId,
          currentStatus: selectedQuotation.status,
        }
      );

      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "This quotation status can't be changed after approval",
      });
    }

    if (status === Constant.QUOTATION_STATUS.APPROVED) {
      quotationDoc.quotationInfo = quotationDoc.quotationInfo.map((item) => {
        if (item.quotationId === quotationId) {
          const updatedItem = {
            ...item.toObject(),
            approvedByAdmin: true,
          };

          if (item.approvedByUser) {
            updatedItem.status = Constant.QUOTATION_STATUS.APPROVED;

            console.log(
              "[updateQuotationStatus] Both admin and user approved quotation, order can be placed",
              {
                customOrderId,
                quotationId,
              }
            );
          } else {
            updatedItem.status = Constant.QUOTATION_STATUS.ACCEPT;
          }

          return updatedItem;
        }

        return {
          ...item.toObject(),
          status: Constant.QUOTATION_STATUS.REJECT,
          approvedByAdmin: false,
        };
      });
    } else if (status === Constant.QUOTATION_STATUS.REJECT) {
      quotationDoc.quotationInfo = quotationDoc.quotationInfo.map((item) => {
        if (item.quotationId === quotationId) {
          return {
            ...item.toObject(),
            status: Constant.QUOTATION_STATUS.REJECT,
            approvedByAdmin: false,
          };
        }

        return item.toObject();
      });
    } else if (status === Constant.QUOTATION_STATUS.ACCEPT) {
      quotationDoc.quotationInfo = quotationDoc.quotationInfo.map((item) => {
        if (item.quotationId === quotationId) {
          return {
            ...item.toObject(),
            status: Constant.QUOTATION_STATUS.ACCEPT,
          };
        }

        return item.toObject();
      });
    } else {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid status",
      });
    }

    await quotationDoc.save();

    console.log(
      "[updateQuotationStatus] Quotation status updated successfully",
      {
        customOrderId,
        quotationId,
        status,
      }
    );

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Quotation status updated successfully",
    });
  } catch (error) {
    console.error("[updateQuotationStatus] Error occurred", {
      message: error?.message,
      stack: error?.stack,
      customOrderId: req.body?.customOrderId,
      quotationId: req.body?.quotationId,
      status: req.body?.status,
    });

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    });
  }
};

export const updateCustomOrderStatus = async (req, res) => {
  try {
    const { status, customOrderId } = req.body;

    if (!status || !customOrderId) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "status and customOrderId are required",
      });
    }

    const customOrder = await CustomJewellery.findById(customOrderId);
    if (!customOrder) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Custom order not found",
      });
    }
    //can not update order status until one quatation is approved from both side 
    const quotation = await Quotations.findOne({ customOrderId });
    if (!quotation) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: "Quotation not found",
      });
    }

    const approvedQuotation = quotation.quotationInfo.find(
      (item) => item.approvedByAdmin && item.approvedByUser
    );

    if (!approvedQuotation) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Cannot update custom order status until one quotation is approved from both side",
      });
    }

    const resolvedStatus = Constant.ORDER_STATUS[status.toUpperCase()] ||
      Constant.ORDER_STATUS.ALL_TYPES.find(
        (s) => s.toLowerCase() === status.toLowerCase()
      ) || status;

    if (!Constant.ORDER_STATUS.ALL_TYPES.includes(resolvedStatus)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Invalid status",
      });
    }

    const oldStatus = customOrder.orderStatus || Constant.ORDER_STATUS.PENDING;

    const ALLOWED_TRANSITIONS = {
      "Received": ["Approved", "Rejected", "Failed"], // at received status i can change to approved,Rejected,Failed
      "Pending": ["Approved", "Rejected", "Failed", "Cancelled"],
      "Approved": ["In Production", "Rejected", "Failed", "Cancelled"],
      "In Production": ["Ready to Ship", "Rejected", "Failed"],
      "Ready to Ship": ["Shipped", "Rejected", "Failed"],
      "Shipped": ["Delivered", "Rejected", "Failed"],
      "Delivered": ["Rejected"],
      "Return Request": ["Item Received", "Returned Rejected", "Rejected", "Failed"],
      "Item Received": ["QA Done", "Rejected", "Failed"],
      "QA Done": ["Returned Approved", "Returned Rejected", "Rejected", "Failed"],
      "Returned Approved": ["Refunded", "Rejected", "Failed"],
      "Failed": ["Pending", "Rejected"],
      "Cancelled": ["Cancelled Approved", "Cancelled Rejected", "Rejected", "Failed"],
      "Cancelled Approved": ["Refunded", "Rejected"],
      "Cancelled Rejected": ["Approved", "Rejected", "Failed"],
      "Refunded": ["Rejected"]
    };

    const SWITCH_ENFORCE_SEQUENCE = true;
    if (SWITCH_ENFORCE_SEQUENCE && oldStatus !== resolvedStatus) {
      const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];
      if (!allowed.includes(resolvedStatus)) {
        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: `Cannot transition status from ${oldStatus} to ${resolvedStatus}.`,
        });
      }
    }

    const SWITCH_RESTRICT_CANCEL_REJECT_STATES = true;
    const ALLOWED_CANCEL_STATES = ["Pending", "Approved", "Cancelled Rejected"];
    const ALLOWED_REJECT_STATES = ["Pending", "Approved", "In Production"];

    if (SWITCH_RESTRICT_CANCEL_REJECT_STATES) {
      if (resolvedStatus === Constant.ORDER_STATUS.CANCELLED && !ALLOWED_CANCEL_STATES.includes(oldStatus)) {
        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: `Order cancellation is not allowed when order status is ${oldStatus}.`,
        });
      }
      // if (resolvedStatus === Constant.ORDER_STATUS.REJECTED && !ALLOWED_REJECT_STATES.includes(oldStatus)) {
      //   return res.status(STATUS_CODE.OK).json({
      //     errorCode: STATUS_CODE.BAD_REQUEST,
      //     message: `Order rejection is not allowed when order status is ${oldStatus}.`,
      //   });
      // }
    }

    const TERMINAL_STATES = [
      Constant.ORDER_STATUS.FAILED,
      Constant.ORDER_STATUS.REJECTED,
      Constant.ORDER_STATUS.RETURNED_REJECTED,
      Constant.ORDER_STATUS.REFUNDED,
      Constant.ORDER_STATUS.CANCELLED_APPROVED
    ];
    if (TERMINAL_STATES.includes(oldStatus)) {
      return res.status(STATUS_CODE.OK).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: `Cannot update status. Order is in a terminal state: ${oldStatus}.`,
      });
    }

    customOrder.orderStatus = resolvedStatus;
    await customOrder.save();

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Custom order status updated successfully",
      data: {
        _id: customOrder._id,
        orderStatus: customOrder.orderStatus,
        oldStatus
      }
    });
  } catch (error) {
    console.log("updateCustomOrderStatus error:", error);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    })
  }
}

export const cancelCustomOrderRequest = async (req, res) => {
  try {
    // cancel Order Request Customer
    const userId = req.user.userId;
    const { id } = req.params;

    const customOrder = await CustomJewellery.findOne({ _id: id, userInfo: userId });
    if (!customOrder) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.ORDER.NOT_FOUND
      });
    }

    const ALLOWED_CANCEL_STATES = ["Pending", "Approved"];
    if (!ALLOWED_CANCEL_STATES.includes(customOrder.orderStatus)) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: `Order cannot be cancelled in its current state (${customOrder.orderStatus}).`
      });
    }

    customOrder.orderStatus = Constant.ORDER_STATUS.CANCELLED;
    await customOrder.save();

    const baseUrl = BaseURL(req);
    const customOrderObj = customOrder.toObject();
    if (customOrderObj.attachments) {
      customOrderObj.attachments = (customOrderObj.attachments || []).map((filename) =>
        resolveAssetUrl(filename, baseUrl, "uploads/custom-order")
      );
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Order successfully cancelled.",
      data: customOrderObj
    });

  } catch (error) {
    console.log("cancelCustomOrder error:", error);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || "Internal server error",
    })
  }
}

export const returnCustomOrderRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const customOrder = await CustomJewellery.findOne({ _id: id, userInfo: userId });
    if (!customOrder) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        errorCode: STATUS_CODE.NOT_FOUND,
        message: MESSAGES.ORDER.NOT_FOUND
      });
    }

    if (customOrder.orderStatus !== Constant.ORDER_STATUS.DELIVERED) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        errorCode: STATUS_CODE.BAD_REQUEST,
        message: "Only delivered orders can be returned."
      });
    }

    customOrder.orderStatus = Constant.ORDER_STATUS.RETURN_REQUEST;
    if (reason) {
      customOrder.remarks = `${customOrder.remarks || ""}\n[Return Request Reason]: ${reason}`.trim();
    }
    await customOrder.save();

    const baseUrl = BaseURL(req);
    const customOrderObj = customOrder.toObject();
    if (customOrderObj.attachments) {
      customOrderObj.attachments = (customOrderObj.attachments || []).map((filename) =>
        resolveAssetUrl(filename, baseUrl, "uploads/custom-order")
      );
    }

    const requestId = customOrder._id?.toString()?.slice(-8)?.toUpperCase() || "N/A";
    const customerEmail = customOrder.email?.trim();
    if (customerEmail) {
      sendEmail(
        customerEmail,
        `Aura Jewels Custom Order Return Request - #${requestId}`,
        `<p>Dear Customer,</p><p>We have received your return request for custom order #${requestId}.</p><p>Reason: ${reason || "N/A"}</p><p>Our team will review your request and get back to you shortly.</p><p>Regards,<br/>Aura Jewels</p>`
      ).catch((err) => console.error("Return request customer email error:", err));
    }

    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Return request submitted successfully.",
      data: customOrderObj
    });
  } catch (error) {
    console.error("returnCustomOrderRequest error:", error);
    return res.status(STATUS_CODE.INTERNAL_ERROR).json({
      errorCode: STATUS_CODE.INTERNAL_ERROR,
      message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
    });
  }
};

// POST /custom/:id/payment-link (admin) — set the quote (optional `amount`) and
// generate a Razorpay payment link for a bespoke order. Confirmed by the
// payment_link.paid webhook, which flips the custom order to paid.
export const requestCustomPaymentLink = async (req, res) => {
  try {
    const result = await create_custom_payment_link_db(req.params.id, req.body?.amount);
    return res.status(STATUS_CODE.OK).json({
      errorCode: STATUS_CODE.OK,
      message: "Payment link created",
      data: result,
    });
  } catch (error) {
    return res.status(STATUS_CODE.BAD_REQUEST).json({
      errorCode: STATUS_CODE.BAD_REQUEST,
      message: error?.message || "Could not create payment link",
    });
  }
};
