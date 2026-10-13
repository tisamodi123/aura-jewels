/**
 * QA Test: Order Cancellation & Refund Payment Status Lifecycle
 *
 * Covers:
 *   1. Full-order customer cancel → cancelledAt set, paymentStatus remains "paid"
 *   2. Item-level customer cancel → item.cancelledAt, order.paymentStatus remains "paid"
 *      → all items cancelled → order.status = "Cancelled", order.cancelledAt set
 *   3. Admin refund (wallet) → RefundTransaction.refundStatus = "completed"
 *   4. Admin refund (bank)   → RefundTransaction.refundStatus = "completed"
 *   5. paymentStatus enum restricts to pending/paid/failed (rejects refund pending)
 *
 * Run:  node test_qa_cancellation.js
 */

import mongoose from "mongoose";
import Order from "./models/order.model.js";
import OrderItem from "./models/orderItem.model.js";
import RefundTransaction from "./models/refundTransaction.model.js";
import {
    update_order_status_db,
    cancel_order_item_customer_db,
    change_order_item_status_db,
    request_return_item_customer_db,
} from "./services/order.services.js";
import Constant from "./constants/user.constant.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/aura_jewels_db";

const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => { console.error(`  ❌ ${msg}`); process.exitCode = 1; };
const assert = (cond, msg) => (cond ? pass(msg) : fail(msg));

async function freshOrder(extra = {}) {
    const item = await OrderItem.create({
        productId: new mongoose.Types.ObjectId(),
        status: Constant.ORDER_STATUS.APPROVED,
        price: 5000,
        qty: 1,
        productDetails: { productTitle: "Test Ring", qty: 1 },
        lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
    });
    const order = await Order.create({
        user: new mongoose.Types.ObjectId(),
        orderId: `TST-${Date.now()}`,
        total: 5000,
        paymentStatus: "paid",
        status: Constant.ORDER_STATUS.APPROVED,
        items: [item._id],
        shippingAddress: {
            firstName: "QA", lastName: "Bot",
            address: "123 Test St", city: "Mumbai",
            state: "MH", country: "India",
            zipCode: "400001", email: "qa@test.com", phone: "9999999999",
        },
        lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
        ...extra,
    });
    return { order, item };
}

async function freshOrderWithMultipleItems(itemConfigs, extra = {}) {
    const items = [];
    let total = 0;
    for (const conf of itemConfigs) {
        const item = await OrderItem.create({
            productId: new mongoose.Types.ObjectId(),
            status: Constant.ORDER_STATUS.APPROVED,
            price: conf.price || 5000,
            qty: 1,
            productDetails: { productTitle: "Test Ring", qty: 1 },
            lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
        });
        items.push(item);
        total += conf.price || 5000;
    }
    const order = await Order.create({
        user: new mongoose.Types.ObjectId(),
        orderId: `TST-${Date.now()}`,
        total: total,
        paymentStatus: "paid",
        status: Constant.ORDER_STATUS.APPROVED,
        items: items.map(it => it._id),
        shippingAddress: {
            firstName: "QA", lastName: "Bot",
            address: "123 Test St", city: "Mumbai",
            state: "MH", country: "India",
            zipCode: "400001", email: "qa@test.com", phone: "9999999999",
        },
        lastDayToCancel: new Date(Date.now() + (Constant.MAX_CANCELLATION_DAYS || 1) * 24 * 60 * 60 * 1000),
        ...extra,
    });
    return { order, items };
}

async function test_fullOrderCustomerCancel() {
    console.log("\n[Test 1] Full-order customer cancel");
    const { order, item } = await freshOrder();

    order.status = Constant.ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    await order.save();
    await OrderItem.updateMany(
        { _id: { $in: order.items } },
        { status: Constant.ORDER_STATUS.CANCELLED, cancelledAt: new Date() }
    );

    const r = await Order.findById(order._id);
    const ri = await OrderItem.findById(item._id);
    assert(r.status === Constant.ORDER_STATUS.CANCELLED, `order.status = Cancelled`);
    assert(r.paymentStatus === "paid", `order.paymentStatus remains "paid"`);
    assert(!!r.cancelledAt, `order.cancelledAt is set`);
    assert(ri.status === Constant.ORDER_STATUS.CANCELLED, `item.status = Cancelled`);
    assert(!!ri.cancelledAt, `item.cancelledAt is set`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
}

async function test_itemCancelPropagation() {
    console.log("\n[Test 2] Item-level cancel → order propagation");
    const { order, item } = await freshOrder();
    const userId = order.user.toString();

    const updatedItem = await cancel_order_item_customer_db(item._id.toString(), userId);
    const r = await Order.findById(order._id);

    assert(updatedItem.status === Constant.ORDER_STATUS.CANCELLED, `item.status = Cancelled`);
    assert(!!updatedItem.cancelledAt, `item.cancelledAt is set`);
    assert(r.status === Constant.ORDER_STATUS.CANCELLED, `order.status propagated to Cancelled`);
    assert(!!r.cancelledAt, `order.cancelledAt is set`);
    assert(r.paymentStatus === "paid", `order.paymentStatus remains "paid"`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
}

async function test_adminWalletRefund() {
    console.log("\n[Test 3] Admin cancel + wallet refund lifecycle");
    const { order } = await freshOrder();

    try {
        await update_order_status_db(
            order._id,
            Constant.ORDER_STATUS.CANCELLED,
            new mongoose.Types.ObjectId(),
            { refundType: "wallet", refundAmount: 5000, refundRemarks: "QA wallet refund" }
        );
    } catch { /* wallet credit may fail; status still written */ }

    const r = await Order.findById(order._id);
    assert(r.paymentStatus === "paid", `order.paymentStatus remains "paid"`);
    assert(!!r.cancelledAt, `order.cancelledAt is set`);

    const tx = await RefundTransaction.findOne({ orderId: order._id });
    assert(tx.refundStatus === Constant.REFUND_STATUS.SUCCESS, `RefundTransaction status is completed (Got: ${tx.refundStatus})`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
}

async function test_adminBankRefund() {
    console.log("\n[Test 4] Admin cancel + bank refund");
    const { order } = await freshOrder();

    await update_order_status_db(
        order._id,
        Constant.ORDER_STATUS.CANCELLED,
        new mongoose.Types.ObjectId(),
        {
            refundType: "bank",
            refundAmount: 5000,
            accountHolderName: "QA Bot",
            bankName: "Test Bank",
            accountNumber: "0000001234",
            ifscCode: "TEST0001",
            refundRemarks: "Bank refund"
        }
    );
    const r = await Order.findById(order._id);
    assert(r.paymentStatus === "paid", `order.paymentStatus remains "paid"`);

    const tx = await RefundTransaction.findOne({ orderId: order._id });
    assert(tx.refundStatus === Constant.REFUND_STATUS.SUCCESS, `RefundTransaction status is completed (Got: ${tx.refundStatus})`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
}

async function test_paymentStatusEnum() {
    console.log("\n[Test 5] paymentStatus enum strictly restricts to pending/paid/failed");
    const { order } = await freshOrder();
    for (const s of ["pending", "paid", "failed"]) {
        order.paymentStatus = s;
        const saved = await order.save();
        assert(saved.paymentStatus === s, `paymentStatus = "${s}"`);
    }

    order.paymentStatus = "refund pending";
    try {
        await order.save();
        fail("order.save should have thrown validation error for 'refund pending'");
    } catch (err) {
        pass("paymentStatus correctly rejected invalid refund state");
    }

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
}

async function test_cancellationChargeAndAutoRefund() {
    console.log("\n[Test 6] Customer cancel (charge calculation) + Admin Auto-Refund");
    const { order, item } = await freshOrder({ createdAt: new Date(Date.now() - 60 * 3600000) }); // 60 hours (2.5 days) ago

    // 1. Customer initiates item cancellation requesting a bank refund
    const userId = order.user.toString();
    const refundRequest = {
        refundType: "bank",
        accountHolderName: "Smit Khalasi",
        bankName: "SBI",
        accountNumber: "1234567890",
        ifscCode: "SBIN0001234",
        reason: "Ordered by mistake"
    };

    const updatedItem = await cancel_order_item_customer_db(item._id.toString(), userId, refundRequest);
    const rOrderCustomer = await Order.findById(order._id);
    const rItemCustomer = await OrderItem.findById(item._id);

    // Assert customer cancellation details in legacy refundDetails
    assert(rItemCustomer.status === Constant.ORDER_STATUS.CANCELLED, "Item cancelled status set");
    assert(rItemCustomer.refundDetails?.refundType === "bank", "Refund type is bank");
    assert(rItemCustomer.refundDetails?.amount === 0, `Refund amount is 0% (Expected: 0, Got: ${rItemCustomer.refundDetails?.amount})`);
    assert(rItemCustomer.refundDetails?.chargeAmount === 5000, `Cancellation charge is 100% (Expected: 5000, Got: ${rItemCustomer.refundDetails?.chargeAmount})`);
    assert(rItemCustomer.refundDetails?.refundStatus === Constant.REFUND_STATUS.PENDING, `refundStatus is pending initially (Got: ${rItemCustomer.refundDetails?.refundStatus})`);

    // Assert customer cancellation details in RefundTransaction
    const tx1 = await RefundTransaction.findOne({ orderId: order._id });
    assert(!!tx1, "RefundTransaction created");
    assert(tx1.refundType === "bank", "Refund type is bank");
    assert(tx1.totalRefundAmount === 0, `Refund amount is 0% (Expected: 0, Got: ${tx1.totalRefundAmount})`);
    assert(tx1.chargeAmount === 5000, `Cancellation charge is 100% (Expected: 5000, Got: ${tx1.chargeAmount})`);

    // Sibling rollup aggregated to parent order
    assert(rOrderCustomer.status === Constant.ORDER_STATUS.CANCELLED, "Parent order status is Cancelled");
    assert(rOrderCustomer.refundDetails?.refundType === "bank", "Parent order refundType is bank");
    assert(rOrderCustomer.refundDetails?.amount === 0, `Parent order refund amount is 0 (Expected: 0, Got: ${rOrderCustomer.refundDetails?.amount})`);

    // 2. Admin approves the cancellation by changing status to CANCELLED_APPROVED
    await update_order_status_db(order._id, Constant.ORDER_STATUS.CANCELLED_APPROVED, new mongoose.Types.ObjectId());

    const finalOrder = await Order.findById(order._id);
    assert(finalOrder.status === Constant.ORDER_STATUS.CANCELLED_APPROVED, "Parent order is Cancelled Approved");
    assert(finalOrder.paymentStatus === "paid", "Parent order paymentStatus remains paid");
    assert(finalOrder.refundDetails?.amount === 0, "Parent order refund amount stands at 0");
    const finalItem = await OrderItem.findById(item._id);
    assert(finalItem.refundDetails?.refundStatus === Constant.REFUND_STATUS.SUCCESS, `Item refundStatus transitions to completed (Got: ${finalItem.refundDetails?.refundStatus})`);

    const finalTx = await RefundTransaction.findOne({ orderId: order._id });
    assert(finalTx.refundStatus === Constant.REFUND_STATUS.SUCCESS, `RefundTransaction refundStatus transitions to completed (Got: ${finalTx.refundStatus})`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    if (finalTx) await RefundTransaction.deleteOne({ _id: finalTx._id });
}

async function test_timeWiseCancellationCharges() {
    console.log("\n[Test 7] Time-wise cancellation charges");

    // Case A: 12 hours ago (should be 5% charge)
    {
        const { order, item } = await freshOrder({ createdAt: new Date(Date.now() - 12 * 3600000) });
        const updatedItem = await cancel_order_item_customer_db(item._id.toString(), order.user.toString(), { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 5, `12 hours ago: charge percentage is 5%`);
        assert(updatedItem.refundDetails?.chargeAmount === 250, `12 hours ago: charge amount is 250`);
        assert(updatedItem.refundDetails?.amount === 4750, `12 hours ago: refund amount is 4750`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 5, `12 hours ago: tx charge percentage is 5%`);
        assert(tx.chargeAmount === 250, `12 hours ago: tx charge amount is 250`);
        assert(tx.totalRefundAmount === 4750, `12 hours ago: tx refund amount is 4750`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case B: 36 hours ago (should be 10% charge)
    {
        const { order, item } = await freshOrder({ createdAt: new Date(Date.now() - 36 * 3600000) });
        const updatedItem = await cancel_order_item_customer_db(item._id.toString(), order.user.toString(), { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 10, `36 hours ago: charge percentage is 10%`);
        assert(updatedItem.refundDetails?.chargeAmount === 500, `36 hours ago: charge amount is 500`);
        assert(updatedItem.refundDetails?.amount === 4500, `36 hours ago: refund amount is 4500`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 10, `36 hours ago: tx charge percentage is 10%`);
        assert(tx.chargeAmount === 500, `36 hours ago: tx charge amount is 500`);
        assert(tx.totalRefundAmount === 4500, `36 hours ago: tx refund amount is 4500`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case C: 60 hours ago (should be 100% charge)
    {
        const { order, item } = await freshOrder({ createdAt: new Date(Date.now() - 60 * 3600000) });
        const updatedItem = await cancel_order_item_customer_db(item._id.toString(), order.user.toString(), { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 100, `60 hours ago: charge percentage is 100%`);
        assert(updatedItem.refundDetails?.chargeAmount === 5000, `60 hours ago: charge amount is 5000`);
        assert(updatedItem.refundDetails?.amount === 0, `60 hours ago: refund amount is 0`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 100, `60 hours ago: tx charge percentage is 100%`);
        assert(tx.chargeAmount === 5000, `60 hours ago: tx charge amount is 5000`);
        assert(tx.totalRefundAmount === 0, `60 hours ago: tx refund amount is 0`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }
}

async function test_unpaidOrderNoRefundDetails() {
    console.log("\n[Test 8] Unpaid order (pending/failed paymentStatus) has no refundDetails");

    // Case A: paymentStatus: "pending"
    {
        const { order, item } = await freshOrder({ paymentStatus: "pending" });
        const updatedItem = await cancel_order_item_customer_db(item._id.toString(), order.user.toString(), { refundType: "bank" });

        assert(updatedItem.refundDetails?.refundType === "none", `Unpaid item: refundType is none`);
        assert(updatedItem.refundDetails?.amount === 0, `Unpaid item: refund amount is 0`);
        assert(updatedItem.refundDetails?.chargePercentage === 0, `Unpaid item: charge percentage is 0`);
        assert(updatedItem.refundDetails?.chargeAmount === 0, `Unpaid item: charge amount is 0`);

        const parentOrder = await Order.findById(order._id);
        assert(parentOrder.refundDetails?.refundType === "none", `Unpaid order: refundType is none`);
        assert(parentOrder.refundDetails?.amount === 0, `Unpaid order: refund amount is 0`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.refundType === "none", `Unpaid tx: refundType is none`);
        assert(tx.totalRefundAmount === 0, `Unpaid tx: refund amount is 0`);
        assert(tx.chargePercentage === 0, `Unpaid tx: charge percentage is 0`);
        assert(tx.chargeAmount === 0, `Unpaid tx: charge amount is 0`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case B: paymentStatus: "failed"
    {
        const { order, item } = await freshOrder({ paymentStatus: "failed" });
        const updatedItem = await cancel_order_item_customer_db(item._id.toString(), order.user.toString(), { refundType: "bank" });

        assert(updatedItem.refundDetails?.refundType === "none", `Unpaid failed item: refundType is none`);
        assert(updatedItem.refundDetails?.amount === 0, `Unpaid failed item: refund amount is 0`);
        assert(updatedItem.refundDetails?.chargePercentage === 0, `Unpaid failed item: charge percentage is 0`);
        assert(updatedItem.refundDetails?.chargeAmount === 0, `Unpaid failed item: charge amount is 0`);

        const parentOrder = await Order.findById(order._id);
        assert(parentOrder.refundDetails?.refundType === "none", `Unpaid failed order: refundType is none`);
        assert(parentOrder.refundDetails?.amount === 0, `Unpaid failed order: refund amount is 0`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.refundType === "none", `Unpaid failed tx: refundType is none`);
        assert(tx.totalRefundAmount === 0, `Unpaid failed tx: refund amount is 0`);
        assert(tx.chargePercentage === 0, `Unpaid failed tx: charge percentage is 0`);
        assert(tx.chargeAmount === 0, `Unpaid failed tx: charge amount is 0`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case C: paymentStatus: "pending" -> approving cancellation request with "Refunded" status
    {
        const { order, item } = await freshOrder({ paymentStatus: "pending" });

        // Item starts as Cancel Request (status: "Cancelled")
        item.status = Constant.ORDER_STATUS.CANCELLED;
        await item.save();

        // Approve using change_order_item_status_db with status "Refunded"
        const { orderItem: updatedItem } = await change_order_item_status_db({
            orderId: order._id.toString(),
            orderdetailId: item._id.toString(),
            resolvedStatus: Constant.ORDER_STATUS.REFUNDED,
            userId: order.user.toString()
        });

        assert(updatedItem.status === Constant.ORDER_STATUS.CANCELLED_APPROVED, `Unpaid item transitioned to Cancelled Approved instead of Refunded. Got: ${updatedItem.status}`);

        const parentOrder = await Order.findById(order._id);
        assert(parentOrder.status === Constant.ORDER_STATUS.CANCELLED_APPROVED, `Unpaid parent order transitioned to Cancelled Approved. Got: ${parentOrder.status}`);
        assert(parentOrder.paymentStatus === Constant.PAYMENT_STATUS.PENDING, `Unpaid parent order payment status remains pending. Got: ${parentOrder.paymentStatus}`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        await RefundTransaction.deleteMany({ orderId: order._id });
    }
}

async function test_returnRequestRefundLifecycle() {
    console.log("\n[Test 9] Return Request + Wallet Refund Lifecycle");
    const { order, item } = await freshOrder({ paymentStatus: "paid" });
    
    // 1. Deliver the order/item 18 hours ago (should be 5% return charge)
    item.status = Constant.ORDER_STATUS.DELIVERED;
    item.deliveredAt = new Date(Date.now() - 18 * 3600000);
    await item.save();
    order.status = Constant.ORDER_STATUS.DELIVERED;
    order.deliveredAt = new Date(Date.now() - 18 * 3600000);
    await order.save();

    // 2. Request a return with wallet refund
    await request_return_item_customer_db(item._id.toString(), order.user.toString(), "Defective item", {
        refundDetails: {
            refundType: "wallet",
            reason: "Defective item"
        }
    });

    const returnedItem = await OrderItem.findById(item._id);
    assert(returnedItem.status === Constant.ORDER_STATUS.RETURN_REQUEST, `Expected Return Request, got: ${returnedItem.status}`);
    assert(returnedItem.refundDetails?.chargePercentage === 10, `Expected return charge percentage to be 10, got: ${returnedItem.refundDetails?.chargePercentage}`);
    assert(returnedItem.refundDetails?.chargeAmount === 500, `Expected return charge amount to be 500, got: ${returnedItem.refundDetails?.chargeAmount}`);
    assert(returnedItem.refundDetails?.amount === 4500, `Expected refund amount to be 4500, got: ${returnedItem.refundDetails?.amount}`);

    // 3. Move to Item Received
    const { orderItem: receivedItem } = await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.ITEM_RECEIVED,
        userId: order.user.toString()
    });
    assert(receivedItem.status === Constant.ORDER_STATUS.ITEM_RECEIVED, `Expected Item Received, got: ${receivedItem.status}`);

    // 4. Move to QA Done
    const { orderItem: qaDoneItem } = await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.QA_DONE,
        userId: order.user.toString()
    });
    assert(qaDoneItem.status === Constant.ORDER_STATUS.QA_DONE, `Expected QA Done, got: ${qaDoneItem.status}`);

    // 5. Move to Returned Approved (Accept)
    // Pass refundAmount: 5000 (original total) to simulate admin UI sending original total.
    // It should be capped at 4500 because of the 10% return charge.
    const { orderItem: approvedItem } = await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.RETURNED_APPROVED,
        userId: order.user.toString(),
        refundDetailsBody: {
            refundAmount: 5000,
            refundType: "wallet"
        }
    });

    // Verify it automatically transitions to Refunded because it is wallet refund and successfully processed
    assert(approvedItem.status === Constant.ORDER_STATUS.REFUNDED, `Expected auto-transition to Refunded, got: ${approvedItem.status}`);

    // Verify RefundTransaction and refundDetails are marked Success with correct capped refund amount (4500) and charge (500)
    const updatedTx = await RefundTransaction.findOne({ orderId: order._id });
    assert(updatedTx.refundStatus === Constant.REFUND_STATUS.SUCCESS, `Expected RefundTransaction to be Success, got: ${updatedTx.refundStatus}`);
    assert(updatedTx.totalRefundAmount === 4500, `Expected tx refund amount to be 4500, got: ${updatedTx.totalRefundAmount}`);
    assert(updatedTx.chargePercentage === 10, `Expected tx charge percentage to be 10, got: ${updatedTx.chargePercentage}`);
    assert(updatedTx.chargeAmount === 500, `Expected tx charge amount to be 500, got: ${updatedTx.chargeAmount}`);
    
    assert(approvedItem.refundDetails.refundStatus === Constant.REFUND_STATUS.SUCCESS, `Expected refundDetails.refundStatus to be Success, got: ${approvedItem.refundDetails.refundStatus}`);
    assert(approvedItem.refundDetails.amount === 4500, `Expected refundDetails.amount to be 4500, got: ${approvedItem.refundDetails.amount}`);
    assert(approvedItem.refundDetails.chargePercentage === 10, `Expected refundDetails.chargePercentage to be 10, got: ${approvedItem.refundDetails.chargePercentage}`);
    assert(approvedItem.refundDetails.chargeAmount === 500, `Expected refundDetails.chargeAmount to be 500, got: ${approvedItem.refundDetails.chargeAmount}`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    await RefundTransaction.deleteMany({ orderId: order._id });
    console.log("  ✅ Return request refund lifecycle passed successfully");
}

async function test_adminRejectAndRefundAtAnyStatus() {
    console.log("\n[Test 10] Admin Reject + Refund from any status (Delivered)");
    const { order, item } = await freshOrder({ paymentStatus: "paid" });

    // 1. Deliver the order/item
    item.status = Constant.ORDER_STATUS.DELIVERED;
    await item.save();
    order.status = Constant.ORDER_STATUS.DELIVERED;
    await order.save();

    // 2. Reject directly from Delivered state
    const { orderItem: rejectedItem } = await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.REJECTED,
        refundDetailsBody: {
            refundType: "wallet"
        },
        userId: order.user.toString()
    });

    assert(rejectedItem.status === Constant.ORDER_STATUS.REJECTED, `Expected Rejected, got: ${rejectedItem.status}`);

    // Verify RefundTransaction and refundDetails are marked Success and default to full item price
    const updatedTx = await RefundTransaction.findOne({ orderId: order._id });
    assert(updatedTx, "Expected RefundTransaction to be created");
    assert(updatedTx.refundStatus === Constant.REFUND_STATUS.SUCCESS, `Expected RefundTransaction to be Success, got: ${updatedTx.refundStatus}`);
    assert(updatedTx.totalRefundAmount > 0, `Expected positive refund amount, got: ${updatedTx.totalRefundAmount}`);
    
    assert(rejectedItem.refundDetails.refundStatus === Constant.REFUND_STATUS.SUCCESS, `Expected refundDetails.refundStatus to be Success, got: ${rejectedItem.refundDetails.refundStatus}`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    await RefundTransaction.deleteMany({ orderId: order._id });
    console.log("  ✅ Admin reject and refund from any status passed successfully");
}

async function test_maxDaysCancellationAndReturnWindow() {
    console.log("\n[Test 11] Customer Cancel & Return Window Limit (7 days)");
    const { order, item } = await freshOrder({ paymentStatus: "paid" });

    // Force windows to be -1 days so that even a fresh order exceeds it
    const originalMaxCancel = Constant.MAX_CANCELLATION_DAYS;
    const originalMaxReturn = Constant.MAX_RETURN_DAYS;
    Constant.MAX_CANCELLATION_DAYS = -1;
    Constant.MAX_RETURN_DAYS = -1;

    // 1. Verify cancel throws window error
    let cancelError = null;
    try {
        await cancel_order_item_customer_db(item._id.toString(), order.user.toString());
    } catch (e) {
        cancelError = e.message;
    }
    assert(cancelError && cancelError.includes("cannot be cancelled after"), `Expected cancel window error, got: ${cancelError}`);
    console.log("  ✅ Cancel window limit verified: error thrown as expected");

    // 2. Deliver the item first to test return
    item.status = Constant.ORDER_STATUS.DELIVERED;
    await item.save();

    // Verify return throws window error
    let returnError = null;
    try {
        await request_return_item_customer_db(item._id.toString(), order.user.toString(), "Defective item");
    } catch (e) {
        returnError = e.message;
    }
    assert(returnError && returnError.includes("cannot be returned after"), `Expected return window error, got: ${returnError}`);
    console.log("  ✅ Return window limit verified: error thrown as expected");

    // Restore constants
    Constant.MAX_CANCELLATION_DAYS = originalMaxCancel;
    Constant.MAX_RETURN_DAYS = originalMaxReturn;

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    console.log("  ✅ Customer cancel & return window limit tests passed successfully");
}

async function test_returnRequestCharges() {
    console.log("\n[Test 13] Time-wise return charges");

    // Case A: delivered 6 hours ago (should be 5% charge)
    {
        const { order, item } = await freshOrder({ paymentStatus: "paid" });
        
        // 1. Deliver the order/item
        item.status = Constant.ORDER_STATUS.DELIVERED;
        item.deliveredAt = new Date(Date.now() - 6 * 3600000);
        await item.save();
        order.status = Constant.ORDER_STATUS.DELIVERED;
        order.deliveredAt = new Date(Date.now() - 6 * 3600000);
        await order.save();

        const { orderItem: updatedItem } = await request_return_item_customer_db(item._id.toString(), order.user.toString(), "Defective item", { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 5, `6 hours ago: return charge percentage is 5%`);
        assert(updatedItem.refundDetails?.chargeAmount === 250, `6 hours ago: return charge amount is 250`);
        assert(updatedItem.refundDetails?.amount === 4750, `6 hours ago: refund amount is 4750`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 5, `6 hours ago: tx charge percentage is 5%`);
        assert(tx.chargeAmount === 250, `6 hours ago: tx charge amount is 250`);
        assert(tx.totalRefundAmount === 4750, `6 hours ago: tx refund amount is 4750`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case B: delivered 18 hours ago (should be 10% charge)
    {
        const { order, item } = await freshOrder({ paymentStatus: "paid" });
        
        // 1. Deliver the order/item
        item.status = Constant.ORDER_STATUS.DELIVERED;
        item.deliveredAt = new Date(Date.now() - 18 * 3600000);
        await item.save();
        order.status = Constant.ORDER_STATUS.DELIVERED;
        order.deliveredAt = new Date(Date.now() - 18 * 3600000);
        await order.save();

        const { orderItem: updatedItem } = await request_return_item_customer_db(item._id.toString(), order.user.toString(), "Defective item", { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 10, `18 hours ago: return charge percentage is 10%`);
        assert(updatedItem.refundDetails?.chargeAmount === 500, `18 hours ago: return charge amount is 500`);
        assert(updatedItem.refundDetails?.amount === 4500, `18 hours ago: refund amount is 4500`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 10, `18 hours ago: tx charge percentage is 10%`);
        assert(tx.chargeAmount === 500, `18 hours ago: tx charge amount is 500`);
        assert(tx.totalRefundAmount === 4500, `18 hours ago: tx refund amount is 4500`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }

    // Case C: delivered 36 hours ago (should be 15% charge)
    {
        const { order, item } = await freshOrder({ paymentStatus: "paid" });
        
        // 1. Deliver the order/item
        item.status = Constant.ORDER_STATUS.DELIVERED;
        item.deliveredAt = new Date(Date.now() - 36 * 3600000);
        await item.save();
        order.status = Constant.ORDER_STATUS.DELIVERED;
        order.deliveredAt = new Date(Date.now() - 36 * 3600000);
        await order.save();

        const { orderItem: updatedItem } = await request_return_item_customer_db(item._id.toString(), order.user.toString(), "Defective item", { refundType: "bank" });
        
        assert(updatedItem.refundDetails?.chargePercentage === 15, `36 hours ago: return charge percentage is 15%`);
        assert(updatedItem.refundDetails?.chargeAmount === 750, `36 hours ago: return charge amount is 750`);
        assert(updatedItem.refundDetails?.amount === 4250, `36 hours ago: refund amount is 4250`);

        const tx = await RefundTransaction.findOne({ orderId: order._id });
        assert(!!tx, "RefundTransaction created");
        assert(tx.chargePercentage === 15, `36 hours ago: tx charge percentage is 15%`);
        assert(tx.chargeAmount === 750, `36 hours ago: tx charge amount is 750`);
        assert(tx.totalRefundAmount === 4250, `36 hours ago: tx refund amount is 4250`);

        await Order.deleteOne({ _id: order._id });
        await OrderItem.deleteMany({ _id: { $in: order.items } });
        if (tx) await RefundTransaction.deleteOne({ _id: tx._id });
    }
}

async function test_preventDoubleRefundOnOrderStatusUpdate() {
    console.log("\n[Test 14] Prevent double refund on order status update");
    // Create an order with 2 items of 5000 each (total 10000)
    const { order, items } = await freshOrderWithMultipleItems([
        { price: 5000 },
        { price: 5000 }
    ], { paymentStatus: "paid" });

    const item1 = items[0];
    const item2 = items[1];

    // Deliver the items and order so they can be returned
    item1.status = Constant.ORDER_STATUS.DELIVERED;
    item1.deliveredAt = new Date(Date.now() - 18 * 3600000);
    await item1.save();
    item2.status = Constant.ORDER_STATUS.DELIVERED;
    item2.deliveredAt = new Date(Date.now() - 18 * 3600000);
    await item2.save();

    order.status = Constant.ORDER_STATUS.DELIVERED;
    order.deliveredAt = new Date(Date.now() - 18 * 3600000);
    await order.save();

    // 1. Process item-level return & wallet refund for Item 1
    // 18 hours ago = 10% charge (500), refund amount = 4500
    await request_return_item_customer_db(item1._id.toString(), order.user.toString(), "Defective Item 1", {
        refundDetails: { refundType: "wallet" }
    });

    await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item1._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.ITEM_RECEIVED,
        userId: order.user.toString()
    });

    await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item1._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.QA_DONE,
        userId: order.user.toString()
    });

    await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item1._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.RETURNED_APPROVED,
        userId: order.user.toString(),
        refundDetailsBody: { refundAmount: 5000, refundType: "wallet" }
    });

    // Verify Item 1 is Refunded
    const updatedItem1 = await OrderItem.findById(item1._id);
    assert(updatedItem1.status === Constant.ORDER_STATUS.REFUNDED, "Item 1 is Refunded");
    
    // Now request return for Item 2
    await request_return_item_customer_db(item2._id.toString(), order.user.toString(), "Defective Item 2", {
        refundDetails: { refundType: "wallet" }
    });

    // Instead of item-level approval, update the ENTIRE order status to Returned Approved
    // (This simulates accepting all remaining items)
    // The total order refund should only refund Item 2 (4500), NOT Item 1 again.
    const initialWalletTxes = await mongoose.model("WalletTransaction").find({ userId: order.user, type: "credit" });
    const initialCredited = initialWalletTxes.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    assert(initialCredited === 4500, `Item 1 refund was credited to wallet once (Amount: ${initialCredited})`);

    // Manually set order status to Return Request to allow order-level transition sequence
    order.status = Constant.ORDER_STATUS.RETURN_REQUEST;
    await order.save();

    await update_order_status_db(order._id.toString(), Constant.ORDER_STATUS.ITEM_RECEIVED, order.user.toString());
    await update_order_status_db(order._id.toString(), Constant.ORDER_STATUS.QA_DONE, order.user.toString());

    // Call update_order_status_db to approve return at order level
    await update_order_status_db(order._id.toString(), Constant.ORDER_STATUS.RETURNED_APPROVED, order.user.toString(), {
        refundType: "wallet"
    });

    // Verify final wallet transactions for the user
    // (If double refund happened, it would have refunded Item 1 again, or refunded both items total 9000 again)
    const finalWalletTxes = await mongoose.model("WalletTransaction").find({ userId: order.user, type: "credit" });
    // Item 1 refund was 4500. Item 2 refund should be 4500. Total credited should be exactly 9000.
    const totalCredited = finalWalletTxes.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    assert(totalCredited === 9000, `Expected total credited to be exactly 9000, got: ${totalCredited}`);

    // Clean up
    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    await RefundTransaction.deleteMany({ orderId: order._id });
    await mongoose.model("WalletTransaction").deleteMany({ userId: order.user });
}

async function test_lastDayCalculation() {
    console.log("\n[Test 12] Calculate lastDayToCancel on placement and lastDayToReturn on delivery");
    const { order, item } = await freshOrder({ paymentStatus: "paid" });

    // 1. Verify lastDayToCancel is calculated at placement
    const cancelDiff = new Date(order.lastDayToCancel).getTime() - new Date(order.createdAt).getTime();
    const cancelDays = Math.round(cancelDiff / (1000 * 60 * 60 * 24));
    assert(cancelDays === Constant.MAX_CANCELLATION_DAYS, `Expected cancelDays to be ${Constant.MAX_CANCELLATION_DAYS}, got: ${cancelDays}`);

    // Reload item to get fresh DB value
    const freshItem = await OrderItem.findById(item._id);
    const itemCancelDiff = new Date(freshItem.lastDayToCancel).getTime() - new Date(freshItem.createdAt).getTime();
    const itemCancelDays = Math.round(itemCancelDiff / (1000 * 60 * 60 * 24));
    assert(itemCancelDays === Constant.MAX_CANCELLATION_DAYS, `Expected item lastDayToCancel to match limit`);

    // 2. Transition status to Delivered
    item.status = Constant.ORDER_STATUS.SHIPPED;
    await item.save();
    order.status = Constant.ORDER_STATUS.SHIPPED;
    await order.save();

    const { orderItem: deliveredItem } = await change_order_item_status_db({
        orderId: order._id.toString(),
        orderdetailId: item._id.toString(),
        resolvedStatus: Constant.ORDER_STATUS.DELIVERED,
        userId: order.user.toString()
    });

    // Refresh parent order
    const updatedOrder = await Order.findById(order._id);

    // Verify lastDayToReturn is calculated on delivery
    const returnDiff = new Date(updatedOrder.lastDayToReturn).getTime() - new Date(updatedOrder.deliveredAt).getTime();
    const returnDays = Math.round(returnDiff / (1000 * 60 * 60 * 24));
    assert(returnDays === Constant.MAX_RETURN_DAYS, `Expected returnDays to be ${Constant.MAX_RETURN_DAYS}, got: ${returnDays}`);

    const itemReturnDiff = new Date(deliveredItem.lastDayToReturn).getTime() - new Date(deliveredItem.deliveredAt).getTime();
    const itemReturnDays = Math.round(itemReturnDiff / (1000 * 60 * 60 * 24));
    assert(itemReturnDays === Constant.MAX_RETURN_DAYS, `Expected item lastDayToReturn to match limit`);

    await Order.deleteOne({ _id: order._id });
    await OrderItem.deleteMany({ _id: { $in: order.items } });
    console.log("  ✅ Cancellation and Return deadline calculations passed successfully");
}

async function run() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB:", MONGO_URL);
    const origMaxCancel = Constant.MAX_CANCELLATION_DAYS;
    const origMaxReturn = Constant.MAX_RETURN_DAYS;
    Constant.MAX_CANCELLATION_DAYS = 5;
    Constant.MAX_RETURN_DAYS = 5;
    try {
        await test_fullOrderCustomerCancel();
        await test_itemCancelPropagation();
        await test_adminWalletRefund();
        await test_adminBankRefund();
        await test_paymentStatusEnum();
        await test_cancellationChargeAndAutoRefund();
        await test_timeWiseCancellationCharges();
        await test_unpaidOrderNoRefundDetails();
        await test_returnRequestRefundLifecycle();
        await test_returnRequestCharges();
        await test_adminRejectAndRefundAtAnyStatus();
        await test_preventDoubleRefundOnOrderStatusUpdate();
        
        // Restore to original user configured values for the window-specific test
        Constant.MAX_CANCELLATION_DAYS = origMaxCancel;
        Constant.MAX_RETURN_DAYS = origMaxReturn;
        await test_maxDaysCancellationAndReturnWindow();
        await test_lastDayCalculation();

        console.log("\n─────────────────────────────────────────");
        console.log(process.exitCode === 1 ? "❌ Some tests FAILED." : "🎉 All tests PASSED.");
    } finally {
        Constant.MAX_CANCELLATION_DAYS = origMaxCancel;
        Constant.MAX_RETURN_DAYS = origMaxReturn;
        await mongoose.disconnect();
    }
}

run().catch((err) => { console.error("Fatal error:", err); process.exit(1); });
