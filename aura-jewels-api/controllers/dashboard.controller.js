import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import ProductMaster from "../models/product.model.js";
import Constant from "../constants/user.constant.js";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

/**
 * Retrieve admin dashboard summary metrics.
 */
export const getDashboardData = async (req, res) => {
    try {
        // Fetch active customers
        const activeUsers = await User.find({
            role: Constant.ROLES.CUSTOMER,
            status: Constant.STATUS.ACTIVE,
            isDeleted: 0
        }).select("name email phone").lean();

        // Count metrics
        const totalorder = await Order.countDocuments({
            isDelete: false,
            paymentStatus: "paid",
            status: { $ne: Constant.ORDER_STATUS.FAILED }
        });
        const totalJewelery = await ProductMaster.countDocuments({
            isDeleted: 0,
            $or: [
                { parentItemCode: null },
                { parentItemCode: "" }
            ]
        });
        // Sum total sales from orders
        const salesAgg = await Order.aggregate([
            {
                $match: {
                    isDelete: false, status: {
                        $nin: [
                            Constant.ORDER_STATUS.CANCELLED_APPROVED,
                            Constant.ORDER_STATUS.FAILED,
                            Constant.ORDER_STATUS.REJECTED,
                            // Constant.ORDER_STATUS.RETURNED_APPROVED,
                            Constant.ORDER_STATUS.REFUNDED,
                        ]
                    }
                }
            },
            { $group: { _id: null, totalSales: { $sum: "$total" } } }
        ]);
        const totalordersales = salesAgg[0]?.totalSales || 0;

        // Verify Pending Customers
        const pendingverifycustomer = await User.countDocuments({
            role: Constant.ROLES.CUSTOMER,
            status: Constant.STATUS.PENDING,
            isDeleted: 0
        });

        // Total Customer Count
        const totalcustomer = await User.countDocuments({
            role: Constant.ROLES.CUSTOMER,
            isDeleted: 0
        });

        return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.OK,
            message: "Dashboard data fetched successfully",
            data: {
                ActiveUserList: activeUsers.map(u => ({ name: u.name || "N/A" })),
                totalorder,
                totalJewelery,
                totalordersales,
                pendingverifycustomer,
                totalcustomer
            }
        });
    } catch (error) {
        console.error("getDashboardData error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || "Internal server error"
        });
    }
};
