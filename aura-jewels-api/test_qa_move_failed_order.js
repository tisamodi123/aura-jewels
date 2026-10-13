/**
 * QA Test: Move Failed Order to Cart with Merge and Normalization Logic
 *
 * Covers:
 *   1. Merges failed order items into empty cart.
 *   2. Overrides details (qty, engraving) when matching items exist.
 *   3. Appends new items alongside existing distinct cart items.
 *   4. Restricts moving non-failed orders.
 *   5. Restricts moving orders belonging to other users.
 *   6. Normalizes default options (e.g. Lab Grown/EF/VVS-VS default center stone) to `null`,
 *      preventing duplicate cart items when standard addToCart is called.
 *
 * Run: node test_qa_move_failed_order.js
 */

import mongoose from "mongoose";
import Order from "./models/order.model.js";
import OrderItem from "./models/orderItem.model.js";
import Cart from "./models/cart.model.js";
import ProductMaster from "./models/product.model.js";
import ProductStone from "./models/productStone.model.js";
import StoneGroup from "./models/stoneGroup.model.js";
import Constant from "./constants/user.constant.js";
import { move_failed_order_to_cart_db } from "./services/cart.services.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/aura_jewels_db";

const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => { console.error(`  ❌ ${msg}`); process.exitCode = 1; };
const assert = (cond, msg) => (cond ? pass(msg) : fail(msg));

async function run() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB:", MONGO_URL);

    const userId = new mongoose.Types.ObjectId();
    const otherUserId = new mongoose.Types.ObjectId();

    // 1. Create a dummy product with default center stone details
    const product = await ProductMaster.create({
        productTitle: "Test Ring",
        itemCode: `TR-${Date.now()}`,
        finalPrice: 10000,
        status: Constant.PRODUCT_STATUS.AVAILABLE,
        isDeleted: 0
    });

    const stoneGroup = await StoneGroup.create({
        type: "Lab Grown",
        name: "Test Lab Grown Group"
    });

    const centerStone = await ProductStone.create({
        productId: product._id,
        type: "CENTER",
        color: "EF",
        clarity: "VVS-VS",
        stoneGroup: stoneGroup._id,
        lgdPrice: 5000,
        naturalPrice: 0,
        status: Constant.STATUS.ACTIVE
    });

    try {
        console.log("\n[Test 1] move_failed_order_to_cart: merges items into empty cart with correct details");
        // Create order item with default selections populated (simulating order checkout snapshot)
        const orderItem = await OrderItem.create({
            productId: product._id,
            status: Constant.ORDER_STATUS.FAILED,
            price: 10000,
            qty: 2,
            origin: "Lab Grown",
            color: "EF",
            clarity: "VVS-VS",
            diamondDetails: [
                {
                    type: "CENTER",
                    color: "EF",
                    clarity: "VVS-VS",
                    stoneGroup: {
                        type: "Lab Grown"
                    }
                }
            ],
            productDetails: {
                productTitle: "Test Ring",
                qty: 2,
                engraving: 1,
                engravingText: "Love Forever"
            }
        });

        const failedOrder = await Order.create({
            user: userId,
            orderId: `TST-F-${Date.now()}`,
            total: 20000,
            items: [orderItem._id],
            paymentStatus: Constant.PAYMENT_STATUS.FAILED,
            status: Constant.ORDER_STATUS.FAILED
        });

        await move_failed_order_to_cart_db(failedOrder._id, userId);

        const cartList = await Cart.find({ userId, isDeleted: 0 });
        assert(cartList.length === 1, "Exactly one item moved to cart");
        assert(cartList[0].qty === 2, "Quantity is preserved");
        assert(cartList[0].engraving === 1, "Engraving is preserved");
        assert(cartList[0].engravingText === "Love Forever", "Engraving text is preserved");
        // Verify default options are normalized to null
        assert(cartList[0].origin === null, "Default origin normalized to null");
        assert(cartList[0].color === null, "Default color normalized to null");
        assert(cartList[0].clarity === null, "Default clarity normalized to null");


        console.log("\n[Test 2] move_failed_order_to_cart: overrides existing cart items with identical selection");
        // Change quantity in order item and re-run move to verify override
        await OrderItem.updateOne({ _id: orderItem._id }, { $set: { "productDetails.qty": 3, "productDetails.engravingText": "Updated Love" } });
        await move_failed_order_to_cart_db(failedOrder._id, userId);

        const cartList2 = await Cart.find({ userId, isDeleted: 0 });
        assert(cartList2.length === 1, "No duplicate created");
        assert(cartList2[0].qty === 3, "Quantity updated to 3");
        assert(cartList2[0].engravingText === "Updated Love", "Engraving text overridden");


        console.log("\n[Test 3] move_failed_order_to_cart: keeps non-matching items in cart (cart + order items)");
        // Add a distinct item to the cart first (different size)
        const distinctCartItem = await Cart.create({
            userId,
            jeweleryId: product._id,
            sizeId: new mongoose.Types.ObjectId(), // distinct size
            qty: 1,
            isDeleted: 0
        });

        await move_failed_order_to_cart_db(failedOrder._id, userId);
        const cartList3 = await Cart.find({ userId, isDeleted: 0 });
        assert(cartList3.length === 2, "Both items exist in cart (cart + order items)");


        console.log("\n[Test 4] move_failed_order_to_cart: prevents moving orders of other users");
        let errorThrown = null;
        try {
            await move_failed_order_to_cart_db(failedOrder._id, otherUserId);
        } catch (e) {
            errorThrown = e.message;
        }
        assert(errorThrown && errorThrown.includes("Unauthorized"), "Successfully blocked other user");


        console.log("\n[Test 5] move_failed_order_to_cart: prevents moving non-failed orders");
        const paidOrder = await Order.create({
            user: userId,
            orderId: `TST-P-${Date.now()}`,
            total: 20000,
            items: [orderItem._id],
            paymentStatus: Constant.PAYMENT_STATUS.PAID,
            status: Constant.ORDER_STATUS.PENDING
        });

        errorThrown = null;
        try {
            await move_failed_order_to_cart_db(paidOrder._id, userId);
        } catch (e) {
            errorThrown = e.message;
        }
        assert(errorThrown && errorThrown.includes("Only failed orders"), "Successfully blocked non-failed order");


        // Clean up
        await Order.deleteMany({ _id: { $in: [failedOrder._id, paidOrder._id] } });
        await OrderItem.deleteMany({ _id: orderItem._id });
        await Cart.deleteMany({ userId });

    } finally {
        await ProductMaster.deleteOne({ _id: product._id });
        await ProductStone.deleteOne({ _id: centerStone._id });
        await StoneGroup.deleteOne({ _id: stoneGroup._id });
        await mongoose.disconnect();
    }
}

run().catch((err) => { console.error("Fatal error:", err); process.exit(1); });
