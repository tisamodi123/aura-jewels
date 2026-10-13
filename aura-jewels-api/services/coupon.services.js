import Coupon from "../models/coupon.model.js";
import CouponUsage from "../models/couponUsage.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import Constant from "../constants/user.constant.js";
// Check unique coupon code
export const check_unique_coupon_code = async (code) => {
    try {
        return await Coupon.findOne({ code: code.toUpperCase().trim(), isDeleted: 0 }).lean();
    } catch (error) {
        console.error("check_unique_coupon_code error:", error);
        throw error;
    }
};

// Blank string / null → 0; otherwise a number. FormData sends "" for an empty
// numeric field, which would otherwise fail the Mongoose Number cast.
const numOrZero = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

// Create a new coupon
export const create_coupon_db = async (payload) => {
    try {
        const couponData = {
            code: payload.code ? payload.code.toUpperCase().trim() : undefined,
            name: payload.name,
            description: payload.description,
            image: payload.image,
            imageMobile: payload.imageMobile,
            startDate: payload.startDate,
            endDate: payload.endDate,
            priceRange: payload.priceRange,
            discountType: payload.discountType,
            appliedOn: payload.appliedOn,
            discountValue: payload.discountValue,
            makingChargePercent: numOrZero(payload.makingChargePercent),
            diamondPercent: numOrZero(payload.diamondPercent),
            maxDiscountAmount: payload.maxDiscountAmount,
            usageLimit: payload.usageLimit,
            perUserLimit: payload.perUserLimit,
            firstOrderOnly: payload.firstOrderOnly,
            couponType: payload.couponType,
            assignees: payload.assignees,
            status: payload.status,
            isActive: payload.isActive
        };

        // Remove undefined fields
        Object.keys(couponData).forEach(key => couponData[key] === undefined && delete couponData[key]);

        return await Coupon.create(couponData);
    } catch (error) {
        console.error("create_coupon_db error:", error);
        throw error;
    }
};

// Update an existing coupon
export const update_coupon_db = async (id, payload) => {
    try {
        const updateData = {};
        const fields = [
            "name", "description", "image", "imageMobile", "startDate", "endDate",
            "priceRange", "discountType", "appliedOn", "discountValue", "makingChargePercent",
            "diamondPercent", "maxDiscountAmount",
            "usageLimit", "perUserLimit", "firstOrderOnly",
            "couponType", "assignees", "status", "isActive"
        ];

        if (payload.code) {
            updateData.code = payload.code.toUpperCase().trim();
        }

        fields.forEach(field => {
            if (payload[field] !== undefined) {
                updateData[field] = payload[field];
            }
        });

        // Coerce the combined-coupon percentages ("" from FormData → 0).
        if (payload.makingChargePercent !== undefined) updateData.makingChargePercent = numOrZero(payload.makingChargePercent);
        if (payload.diamondPercent !== undefined) updateData.diamondPercent = numOrZero(payload.diamondPercent);

        return await Coupon.findOneAndUpdate(
            { _id: id, isDeleted: 0 },
            { $set: updateData },
            { returnDocument: "after" }
        ).lean();
    } catch (error) {
        console.error("update_coupon_db error:", error);
        throw error;
    }
};

// Get coupons list (Admin view with pagination and filters)
export const get_coupons_db = async (filter = {}, skip = 0, limit = 10) => {
    try {
        const query = { isDeleted: 0, ...filter };
        const list = await Coupon.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("assignees", "name email")
            .lean();

        const total = await Coupon.countDocuments(query);
        return { total, list };
    } catch (error) {
        console.error("get_coupons_db error:", error);
        throw error;
    }
};

// Get coupon details (Public & Admin detail lookup)
export const get_coupon_detail_db = async (filter = {}) => {
    try {
        return await Coupon.findOne({ isDeleted: 0, ...filter })
            .populate("assignees", "name email")
            .lean();
    } catch (error) {
        console.error("get_coupon_detail_db error:", error);
        throw error;
    }
};

// Soft delete coupon
export const delete_coupon_db = async (id) => {
    try {
        return await Coupon.findOneAndUpdate(
            { _id: id, isDeleted: 0 },
            { isDeleted: 1 },
            { returnDocument: "after" }
        ).lean();
    } catch (error) {
        console.error("delete_coupon_db error:", error);
        throw error;
    }
};

// Validate and Apply coupon (Common service method for apply check).
// `components` = { making, diamond } — the cart's TOTAL making-charge and TOTAL
// diamond value (post-offer). Only needed for a "combined" coupon; ignored for
// percentage/absolute.
export const validate_and_apply_coupon = async (code, userId, orderAmount, components = null, options = {}) => {
    try {
        // preview=true: a guest cart is only ESTIMATING the discount. Per-user /
        // first-order caps can't be evaluated without a userId, so we skip the
        // "login required" gate and compute the discount anyway — the real check
        // runs at order placement, which forces login. assigneeOnly and the
        // global usage/validity/min-spend rules are ALWAYS enforced, even here.
        const { preview = false } = options;
        if (!code) {
            throw new Error("Coupon code is required");
        }

        const coupon = await Coupon.findOne({
            code: code.toUpperCase().trim(),
            isActive: true,
            status: "active",
            isDeleted: 0
        });

        if (!coupon) {
            throw new Error("Invalid or expired coupon");
        }``

        // Validity dates validation
        const now = new Date();
        if (now < coupon.startDate) {
            throw new Error("This coupon is not active yet");
        }
        const adjustedEndDate = new Date(coupon.endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        if (now > adjustedEndDate) {
            throw new Error("This coupon has expired");
        }

        // Price range boundaries validation
        if (orderAmount < coupon.priceRange.from) {
            throw new Error(`Minimum purchase amount of ${coupon.priceRange.from} is required to apply this coupon`);
        }
        if (coupon.priceRange.to && orderAmount > coupon.priceRange.to) {
            throw new Error(`Maximum purchase limit for this coupon is ${coupon.priceRange.to}`);
        }

        // assigneeOnly type checks
        if (coupon.couponType === "assigneeOnly") {
            if (!userId) {
                throw new Error("Authentication required to use this coupon");
            }
            const isAssigned = coupon.assignees.some(id => id.toString() === userId.toString());
            if (!isAssigned) {
                throw new Error("You are not eligible to apply this coupon");
            }
        }

        // ---- Usage limits -------------------------------------------------
        // Total redemption cap.
        if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
            throw new Error("This coupon has reached its usage limit");
        }
        // Per-user + first-order rules need a known user.
        if (userId) {
            if (coupon.perUserLimit && coupon.perUserLimit > 0) {
                const usedByUser = await CouponUsage.countDocuments({ couponId: coupon._id, userId, status: "applied" });
                // const activeOrdersCount = await Order.countDocuments({
                //     user: userId,
                //     "coupon.couponId": coupon._id,
                //     paymentStatus: { $ne: "paid" },
                //     status: { $nin: COUPON_RELEASING_STATUSES },
                //     isDelete: false
                // });
                // if (usedByUser + activeOrdersCount >= coupon.perUserLimit) {
                if (usedByUser >= coupon.perUserLimit) {
                    throw new Error("You have already used this coupon the maximum number of times");
                }
            }
            if (coupon.firstOrderOnly) {
                // Count only genuinely PLACED orders (paid), not failed/abandoned
                // checkouts — otherwise a customer whose first payment failed is
                // permanently locked out of a first-order coupon.
                const priorOrders = await Order.countDocuments({
                    user: userId,
                    paymentStatus: Constant.PAYMENT_STATUS.PAID,
                    isDelete: false
                });
                // if (usedByUser >= coupon.perUserLimit) {
                // const activeOrders = await Order.countDocuments({
                //     user: userId,
                //     paymentStatus: { $ne: "failed" },
                //     status: { $nin: COUPON_RELEASING_STATUSES },
                //     isDelete: false
                // });
                // if (priorOrders + activeOrders > 0) {

                if (priorOrders > 0) {
                    throw new Error("This coupon is valid on your first order only");
                }
            }
        } else if (!preview && (coupon.perUserLimit || coupon.firstOrderOnly)) {
            // Enforced for real (non-preview) guest attempts; a preview estimates
            // the discount and defers this to the authenticated checkout.
            throw new Error("Please login to use this coupon");
        }

        // Calculate discount amount.
        //
        // Two dimensions, mirroring product offers:
        //   appliedOn  = total | diamond | making charge | combined  (WHAT it targets)
        //   discountType = percentage | absolute                     (HOW: % or flat ₹)
        // "combined" is its own mode: a separate % on making + diamond.
        //
        // Back-compat: older coupons have no `appliedOn`. A legacy
        // discountType==="combined" maps to appliedOn "combined"; everything else
        // defaults to "total" — so existing coupons behave exactly as before.
        const dType = coupon.discountType?.toLowerCase();
        const appliedOn = (coupon.appliedOn
            || (dType === "combined" ? Constant.COUPON_APPLIED_ON.COMBINED : Constant.COUPON_APPLIED_ON.TOTAL)
        ).toLowerCase();

        const making = Number(components?.making) || 0;
        const diamond = Number(components?.diamond) || 0;
        let discount = 0;

        if (appliedOn === Constant.COUPON_APPLIED_ON.COMBINED) {
            // Separate % on the cart's total making charge and total diamond value.
            discount = (making * (Number(coupon.makingChargePercent) || 0)) / 100
                + (diamond * (Number(coupon.diamondPercent) || 0)) / 100;
        } else {
            // The value the discount is computed against.
            const base = appliedOn === Constant.COUPON_APPLIED_ON.DIAMOND ? diamond
                : appliedOn === Constant.COUPON_APPLIED_ON.MAKING_CHARGE ? making
                    : orderAmount; // "total"
            discount = dType === "percentage"
                ? (base * (Number(coupon.discountValue) || 0)) / 100
                : (Number(coupon.discountValue) || 0); // flat / absolute
            // A component-targeted discount can never exceed that component's value.
            if (appliedOn !== Constant.COUPON_APPLIED_ON.TOTAL && discount > base) {
                discount = base;
            }
        }

        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }

        // Discount cannot be more than the actual order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }
        discount = parseFloat(discount.toFixed(2));

        return {
            couponId: coupon._id,
            code: coupon.code,
            couponType: coupon.couponType,
            discountType: coupon.discountType,
            appliedOn,
            discountValue: coupon.discountValue,
            maxDiscountAmount: coupon.maxDiscountAmount,
            discountAmount: discount,
            finalAmount: parseFloat((orderAmount - discount).toFixed(2))
        };
    } catch (error) {
        console.error("validate_and_apply_coupon error:", error);
        throw error;
    }
};

// Re-check that a coupon can still be redeemed, at confirmation time. Only the
// usage caps and firstOrderOnly (if applicable) are re-evaluated — the total redemption
// limit, the per-user limit, and firstOrderOnly (excluding the current order itself if it exists).
// Returns { ok, reason }.
// export const coupon_redeemable_at_finalize_db = async ({ couponId, userId, excludeOrderId = null }) => {
export const coupon_redeemable_at_finalize_db = async ({ couponId, userId }) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return { ok: false, reason: "coupon no longer exists" };
    if (coupon.usageLimit && coupon.usageLimit > 0 && (coupon.usedCount || 0) >= coupon.usageLimit) {
        return { ok: false, reason: "coupon usage limit reached" };
    }
    if (userId && coupon.perUserLimit && coupon.perUserLimit > 0) {
        const usedByUser = await CouponUsage.countDocuments({ couponId, userId, status: "applied" });
        if (usedByUser >= coupon.perUserLimit) {
            return { ok: false, reason: "per-user coupon limit reached" };
        }
    }
    // if (userId && coupon.firstOrderOnly) {
    //     const priorOrdersQuery = {
    //         user: userId,
    //         paymentStatus: Constant.PAYMENT_STATUS.PAID,
    //         isDelete: false
    //     };
    //     if (excludeOrderId) {
    //         priorOrdersQuery._id = { $ne: excludeOrderId };
    //     }
    //     const priorOrders = await Order.countDocuments(priorOrdersQuery);
    //     if (priorOrders > 0) {
    //         return { ok: false, reason: "first-order coupon limit reached" };
    //     }
    // }
    return { ok: true, reason: "" };
};

// Records a redemption + bumps usedCount atomically. Call inside order placement
// AFTER validation. Returns the CouponUsage doc.
export const redeem_coupon_db = async ({ couponId, userId, orderId, code, discountAmount }, session = null) => {
    const opts = session ? { session } : {};
    const usage = await CouponUsage.create([{
        couponId, userId, orderId, code,
        discountAmount: discountAmount || 0,
        status: "applied"
    }], opts);
    await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } }, opts);
    return Array.isArray(usage) ? usage[0] : usage;
};

// Order statuses in which the customer keeps NOTHING (fully cancelled, returned,
// rejected, failed, or refunded) — the coupon's usage slot must be freed. A
// PARTIAL cancel/return never reaches these at the ORDER level (only when every
// item is terminal), so the coupon correctly stays applied while any item still
// stands; the per-line couponDiscountShare handles the partial math.
export const COUPON_RELEASING_STATUSES = [
    Constant.ORDER_STATUS.CANCELLED_APPROVED,
    Constant.ORDER_STATUS.RETURNED_APPROVED,
    Constant.ORDER_STATUS.REJECTED,
    Constant.ORDER_STATUS.FAILED,
    Constant.ORDER_STATUS.REFUNDED,
];

// Free a redeemed coupon's usage slot when the ORDER has reached a releasing
// terminal state. Idempotent (reverse_coupon_usage_db only touches "applied"
// rows) and never throws, so it is safe to call from EVERY status-transition
// path — order-level, item-level, and payment-status — without double-counting.
export const release_coupon_if_order_terminal = async (orderId, orderStatus, session = null) => {
    if (!orderId || !COUPON_RELEASING_STATUSES.includes(orderStatus)) return;
    try {
        await reverse_coupon_usage_db(orderId, session);
    } catch (err) {
        console.error(`coupon release failed for order ${orderId}:`, err?.message);
    }
};

// Reverses every "applied" usage for an order (on cancel/return) and decrements
// usedCount. Idempotent — reversed rows are skipped.
export const reverse_coupon_usage_db = async (orderId, session = null) => {
    if (!orderId) return;
    const opts = session ? { session } : {};
    const applied = await CouponUsage.find({ orderId, status: "applied" }, null, opts);
    for (const u of applied) {
        await CouponUsage.updateOne({ _id: u._id }, { status: "reversed" }, opts);
        await Coupon.updateOne({ _id: u.couponId, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, opts);
    }
};

// Re-apply coupon usage when transitioning from a releasing/terminal state back
// to an active state, or when payment is marked successful. Throws if the coupon
// limits are exceeded so the transition is blocked.
// export const reapply_coupon_if_order_active = async (orderId, session = null) => {
//     if (!orderId) return;
//     const opts = session ? { session } : {};
//     // Find the parent order to inspect its coupon definition and user
//     const order = await Order.findById(orderId).lean();
//     if (!order || !order.coupon?.couponId) return;
//     const couponId = order.coupon.couponId;
//     const userId = order.user;
//     // Check if there is currently an active (applied) usage for this order
//     const appliedUsage = await CouponUsage.findOne({ orderId, status: "applied" }, null, opts);
//     if (appliedUsage) {
//         // Already active and consuming a slot — nothing to do
//         return;
//     }
//     // Since there's no active usage, we must validate that a slot is available
//     const check = await coupon_redeemable_at_finalize_db({ couponId, userId, excludeOrderId: orderId });
//     if (!check.ok) {
//         throw new Error(`Coupon limit exceeded: ${check.reason || "coupon no longer valid"}`);
//     }
//     // Check for an existing reversed usage to reactivate, or create a new one
//     const reversedUsage = await CouponUsage.findOne({ orderId, status: "reversed" }, null, opts);
//     if (reversedUsage) {
//         await CouponUsage.updateOne({ _id: reversedUsage._id }, { status: "applied" }, opts);
//     } else {
//         await CouponUsage.create([{
//             couponId, userId, orderId,
//             code: order.coupon.code,
//             discountAmount: order.coupon.discountAmount || 0,
//             status: "applied"
//         }], opts);
//     }
//     // Increment coupon used count
//     await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } }, opts);
// };

// Thin wrapper kept for the cart apply path — now delegates to the single
// canonical validator (so usage limits / first-order rules apply everywhere).
export const applyCouponOnCart = async ({ code, userId, orderAmount, components = null, preview = false /*, cartItems */ }) => {
    const result = await validate_and_apply_coupon(code, userId, orderAmount, components, { preview });
    return {
        couponId: result.couponId,
        code: result.code,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount
    };
};

// Fetch storefront banners coupon list (Only Public type coupons)
export const get_public_coupon_banners_db = async () => {
    try {
        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return await Coupon.find({
            couponType: "public",
            isActive: true,
            status: "active",
            isDeleted: 0,
            startDate: { $lte: now },
            endDate: { $gte: startOfToday }
        })
            .select("code name description image imageMobile discountType discountValue maxDiscountAmount priceRange endDate")
            .sort({ createdAt: -1 })
            .lean();
    } catch (error) {
        console.error("get_public_coupon_banners_db error:", error);
        throw error;
    }
};

// Fetch all applicable coupons grouped by type for a given user
// - public     : all active public coupons
// - private    : all active private coupons
// - assigneeOnly: only active coupons where userId is in assignees list
export const get_applicable_coupons_db = async (userId) => {
    try {
        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const baseFilter = {
            isActive: true,
            status: "active",
            isDeleted: 0,
            startDate: { $lte: now },
            endDate: { $gte: startOfToday }
        };

        const SELECT_FIELDS = "code name description image imageMobile discountType discountValue maxDiscountAmount priceRange couponType startDate endDate";

        const [publicCoupons, privateCoupons, assigneeOnlyCoupons] = await Promise.all([
            Coupon.find({ ...baseFilter, couponType: "public" })
                .select(SELECT_FIELDS)
                .sort({ createdAt: -1 })
                .lean(),

            Coupon.find({ ...baseFilter, couponType: "private" })
                .select(SELECT_FIELDS)
                .sort({ createdAt: -1 })
                .lean(),

            // Only fetch assigneeOnly coupons if user is logged in
            userId
                ? Coupon.find({
                    ...baseFilter,
                    couponType: "assigneeOnly",
                    assignees: new mongoose.Types.ObjectId(userId)
                })
                    .select(SELECT_FIELDS)
                    .sort({ createdAt: -1 })
                    .lean()
                : Promise.resolve([])
        ]);

        return { public: publicCoupons, private: privateCoupons, assigneeOnly: assigneeOnlyCoupons };
    } catch (error) {
        console.error("get_applicable_coupons_db error:", error);
        throw error;
    }
};
