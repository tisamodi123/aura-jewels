const BaseURL = function (req) {
    if (process.env.PUBLIC_BASE_URL) {
        return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
    }
    const protocol = req?.headers?.['x-forwarded-proto'] || req?.protocol || "http";
    const host = req?.headers?.host || "localhost:2110";
    const prefix = process.env.APP_URL ? process.env.APP_URL.replace(/^\/?/, "/").replace(/\/$/, "") : "";
    return `${protocol}://${host}${prefix}`;
};
//
export default BaseURL;