import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { STATUS_CODE } from "../constants/statusCode.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function import_product(req, res) {
    try {
        req.body["product"] = true;
        const child = fork(path.resolve(__dirname, "childProcessScript.js"));
        child.send({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
            userId: req.user.userId,
            files: req.files
        });
        child.on("message", async (message) => {
            if (message.error) {
                return res.status(STATUS_CODE.OK).json({
                    errorCode: STATUS_CODE.OK,
                    message: message.error
                });
            }
            if (message.response) {
                return res.status(STATUS_CODE.OK).json(message.response);
            }
            return res.status(STATUS_CODE.OK).json(message);
        });
        child.on("error", (error) => {
            console.error("Error in child process:", error);
            return res.status(STATUS_CODE.INTERNAL_ERROR).json({
                errorCode: STATUS_CODE.INTERNAL_ERROR,
                message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
            });
        });
    } catch (error) {
        console.error("import_product error:", error);
        return res.status(STATUS_CODE.INTERNAL_ERROR).json({
            errorCode: STATUS_CODE.INTERNAL_ERROR,
            message: error?.message || MESSAGES.COMMON.INTERNAL_ERROR
        });
    }
}
