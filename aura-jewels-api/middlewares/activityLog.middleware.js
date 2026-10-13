import ActivityLog from "../models/activityLog.model.js";

export const activityLogger = (moduleName, actionType) => {
    return (req, res, next) => {
        const originalSend = res.send;

        res.send = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                ActivityLog.create({
                    userId: req.user.userId,
                    action: actionType,
                    module: moduleName,
                    method: req.method,
                    route: req.route?.path,
                    apiUrl: req.originalUrl,
                    targetId: req.params.id || null,
                    message: `${moduleName} ${actionType.toLowerCase()} successfully`,
                    userAgent: req.headers["user-agent"],
                    ipAddress: req.ip,
                }).catch((err) => {
                    console.error("Activity Log Error:", err.message);
                });
            }

            return originalSend.call(this, body);
        };

        next();
    };
};