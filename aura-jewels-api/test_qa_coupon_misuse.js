/**
 * QA Test: Coupon Usage Guard Lifecycle
 *
 * Covers:
 *   1. Coupon perUserLimit reached → change_order_payment_status_db throws
 *   2. Coupon perUserLimit reached → update_order_status_db throws
 *   3. Coupon firstOrderOnly validation when a prior paid order exists
 *
 * Run:  node test_qa_coupon_misuse.js
 */

import mongoose from "mongoose";
import Order from "./models/order.model.js";
import OrderItem from "./models/orderItem.model.js";
import Coupon from "./models/coupon.model.js";
import CouponUsage from "./models/couponUsage.model.js";
import {
    update_order_status_db,
    change_order_payment_status_db
} from "./services/order.services.js";
import { validate_and_apply_coupon } from "./services/coupon.services.js";
import Constant from "./constants/user.constant.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/aura_jewels_db";

const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => { console.error(`  ❌ ${msg}`); process.exitCode = 1; };
const assert = (cond, msg) => (cond ? pass(msg) : fail(msg));

async function setupCoupon(extra = {}) {
    const code = `TEST-${Date.now()}`;
    const coupon = await Coupon.create({
        code,
        name: "Test Coupon",
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priceRange: { from: 0 },
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        status: "active",
        ...extra
    });
    return coupon;
}

async function createTestOrder(userId, coupon, paymentStatus, orderStatus) {
    const item = await OrderItem.create({
        productId: new mongoose.Types.ObjectId(),
        status: orderStatus,
        price: 5000,
        qty: 1,
        productDetails: { productTitle: "Test Ring", qty: 1 },
        lastDayToCancel: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    const order = await Order.create({
        user: userId,
        orderId: `TST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        total: 5000,
        paymentStatus,
        status: orderStatus,
        items: [item._id],
        coupon: {
            couponId: coupon._id,
            code: coupon.code,
            discountAmount: 500
        },
        shippingAddress: {
            firstName: "QA", lastName: "Bot",
            address: "123 Test St", city: "Mumbai",
            state: "MH", country: "India",
            zipCode: "400001", email: "qa@test.com", phone: "9999999999",
        },
        lastDayToCancel: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    return { order, item };
}

async function test_perUserLimitPaymentStatus() {
    console.log("\n[Test 1] Coupon perUserLimit = 1 check during change_order_payment_status_db");
    const userId = new mongoose.Types.ObjectId();
    const coupon = await setupCoupon({ perUserLimit: 1 });

    // 1. Create a Failed order using the coupon (no coupon usage record is active for it)
    const { order: failedOrder } = await createTestOrder(userId, coupon, "failed", Constant.ORDER_STATUS.FAILED);

    // 2. Create a Successful order using the coupon (which has active coupon usage)
    const { order: successOrder } = await createTestOrder(userId, coupon, "paid", Constant.ORDER_STATUS.APPROVED);
    
    // Simulate the coupon redemption for the successful order
    await CouponUsage.create({
        couponId: coupon._id,
        userId,
        orderId: successOrder._id,
        code: coupon.code,
        discountAmount: 500,
        status: "applied"
    });
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });

    // 3. Attempt to transition the Failed order to paid status
    let errorThrown = null;
    try {
        await change_order_payment_status_db(failedOrder._id, "paid");
    } catch (err) {
        errorThrown = err.message;
    }

    assert(errorThrown && errorThrown.includes("per-user coupon limit reached"), `Transition blocked as expected (Error: ${errorThrown})`);

    // Clean up
    await Order.deleteMany({ _id: { $in: [failedOrder._id, successOrder._id] } });
    await OrderItem.deleteMany({ _id: { $in: [...failedOrder.items, ...successOrder.items] } });
    await CouponUsage.deleteMany({ couponId: coupon._id });
    await Coupon.deleteOne({ _id: coupon._id });
}

async function test_perUserLimitOrderStatus() {
    console.log("\n[Test 2] Coupon perUserLimit = 1 check during update_order_status_db");
    const userId = new mongoose.Types.ObjectId();
    const coupon = await setupCoupon({ perUserLimit: 1 });

    // 1. Create a Failed order using the coupon
    const { order: failedOrder } = await createTestOrder(userId, coupon, "failed", Constant.ORDER_STATUS.FAILED);

    // 2. Create a Successful order using the coupon
    const { order: successOrder } = await createTestOrder(userId, coupon, "paid", Constant.ORDER_STATUS.APPROVED);
    
    await CouponUsage.create({
        couponId: coupon._id,
        userId,
        orderId: successOrder._id,
        code: coupon.code,
        discountAmount: 500,
        status: "applied"
    });
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });

    // 3. Attempt to transition the Failed order status to Pending (which is allowed and triggers coupon reapplication)
    let errorThrown = null;
    try {
        await update_order_status_db(failedOrder._id, Constant.ORDER_STATUS.PENDING, new mongoose.Types.ObjectId());
    } catch (err) {
        errorThrown = err.message;
    }

    assert(errorThrown && errorThrown.includes("per-user coupon limit reached"), `Status transition to Pending blocked (Error: ${errorThrown})`);

    // Clean up
    await Order.deleteMany({ _id: { $in: [failedOrder._id, successOrder._id] } });
    await OrderItem.deleteMany({ _id: { $in: [...failedOrder.items, ...successOrder.items] } });
    await CouponUsage.deleteMany({ couponId: coupon._id });
    await Coupon.deleteOne({ _id: coupon._id });
}

async function test_firstOrderOnlyValidation() {
    console.log("\n[Test 3] Coupon firstOrderOnly: true check when another paid order exists");
    const userId = new mongoose.Types.ObjectId();
    const coupon = await setupCoupon({ firstOrderOnly: true });

    // 1. Create a Failed order using the coupon
    const { order: failedOrder } = await createTestOrder(userId, coupon, "failed", Constant.ORDER_STATUS.FAILED);

    // 2. Create a completely unrelated paid order for the user (representing their actual first order)
    const otherItem = await OrderItem.create({
        productId: new mongoose.Types.ObjectId(),
        status: Constant.ORDER_STATUS.APPROVED,
        price: 3000,
        qty: 1,
        productDetails: { productTitle: "Other Ring", qty: 1 }
    });
    const firstPaidOrder = await Order.create({
        user: userId,
        orderId: `TST-${Date.now()}-FIRST`,
        total: 3000,
        paymentStatus: "paid",
        status: Constant.ORDER_STATUS.APPROVED,
        items: [otherItem._id],
        shippingAddress: {
            firstName: "QA", lastName: "Bot",
            address: "123 Test St", city: "Mumbai",
            state: "MH", country: "India",
            zipCode: "400001", email: "qa@test.com", phone: "9999999999",
        }
    });

    // 3. Attempt to transition the Failed order to paid
    let errorThrown = null;
    try {
        await change_order_payment_status_db(failedOrder._id, "paid");
    } catch (err) {
        errorThrown = err.message;
    }

    assert(errorThrown && errorThrown.includes("first-order coupon limit reached"), `Transition blocked for firstOrderOnly coupon (Error: ${errorThrown})`);

    // Clean up
    await Order.deleteMany({ _id: { $in: [failedOrder._id, firstPaidOrder._id] } });
    await OrderItem.deleteMany({ _id: { $in: [...failedOrder.items, otherItem._id] } });
    await Coupon.deleteOne({ _id: coupon._id });
}

async function test_sameDateCoupon() {
    console.log("\n[Test 4] Coupon validation: startDate and endDate can be equal");
    const sameDate = new Date("2026-08-01T00:00:00Z");
    
    let created = null;
    let err1 = null;
    try {
        created = await setupCoupon({
            startDate: sameDate,
            endDate: sameDate
        });
    } catch (err) {
        err1 = err;
    }
    assert(!err1 && created, "Successfully allowed startDate and endDate to be equal");

    if (created) {
        await Coupon.deleteOne({ _id: created._id });
    }

    let invalidCreated = null;
    let err2 = null;
    try {
        invalidCreated = await setupCoupon({
            startDate: new Date("2026-08-02T00:00:00Z"),
            endDate: new Date("2026-08-01T00:00:00Z")
        });
    } catch (err) {
        err2 = err.message;
    }
    assert(err2 && err2.includes("endDate must be greater than or equal to startDate"), `Successfully rejected when startDate > endDate (Error: ${err2})`);
}

async function test_validateAndApplyWithPendingOrder() {
    console.log("\n[Test 5] validate_and_apply_coupon: blocks when user already has an active pending order with the coupon");
    const userId = new mongoose.Types.ObjectId();
    const coupon = await setupCoupon({ perUserLimit: 1 });

    // 1. Create a Pending order using the coupon
    const { order: pendingOrder } = await createTestOrder(userId, coupon, "pending", Constant.ORDER_STATUS.PENDING);

    // 2. Try applying the coupon to a new cart/order
    let errorThrown = null;
    try {
        await validate_and_apply_coupon(coupon.code, userId, 5000);
    } catch (err) {
        errorThrown = err.message;
    }

    assert(errorThrown && errorThrown.includes("You have already used this coupon the maximum number of times"), `Validation blocked as expected (Error: ${errorThrown})`);

    // Clean up
    await Order.deleteMany({ _id: pendingOrder._id });
    await OrderItem.deleteMany({ _id: { $in: pendingOrder.items } });
    await Coupon.deleteOne({ _id: coupon._id });
}

async function test_validateAndApplyWithFailedOrder() {
    console.log("\n[Test 6] validate_and_apply_coupon: allows when user's previous order has failed payment");
    const userId = new mongoose.Types.ObjectId();
    const coupon = await setupCoupon({ perUserLimit: 1 });

    // 1. Create a Failed order using the coupon
    const { order: failedOrder } = await createTestOrder(userId, coupon, "failed", Constant.ORDER_STATUS.FAILED);

    // 2. Try applying the coupon to a new cart/order
    let errorThrown = null;
    let applyResult = null;
    try {
        applyResult = await validate_and_apply_coupon(coupon.code, userId, 5000);
    } catch (err) {
        errorThrown = err.message;
    }

    assert(!errorThrown && applyResult, `Successfully allowed coupon application on new order after failed payment (Result discount: ${applyResult?.discountAmount})`);

    // Clean up
    await Order.deleteMany({ _id: failedOrder._id });
    await OrderItem.deleteMany({ _id: { $in: failedOrder.items } });
    await Coupon.deleteOne({ _id: coupon._id });
}

async function run() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB:", MONGO_URL);
    try {
        await test_perUserLimitPaymentStatus();
        await test_perUserLimitOrderStatus();
        await test_firstOrderOnlyValidation();
        await test_sameDateCoupon();
        await test_validateAndApplyWithPendingOrder();
        await test_validateAndApplyWithFailedOrder();

        console.log("\n─────────────────────────────────────────");
        console.log(process.exitCode === 1 ? "❌ Some tests FAILED." : "🎉 All tests PASSED.");
    } finally {
        await mongoose.disconnect();
    }
}

run().catch((err) => { console.error("Fatal error:", err); process.exit(1); });
