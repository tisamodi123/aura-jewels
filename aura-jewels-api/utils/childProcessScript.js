import mongoose from "mongoose";
import dotenv from "dotenv";
// import { import_excel_diamond } from "../controllers/diamondImport.controller.js"; // importApiDiamond
// import Vendor from "../models/vendor.model.js";
import Constant from "../constants/user.constant.js";
import { import_products_service } from "../controllers/importProduct.controller.js";
// import { dcstrURL } from "../utils/decrypt.data.js";

dotenv.config({ path: './.env' });

(async () => {
    try {

        await mongoose.connect(process.env.MONGOOSE_URL, {
            connectTimeoutMS: 30000,
        });

        console.log('MongoDB connected for child process..!');

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB in child process');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error in child process:', err);
        });

        process.on('message', async (req) => {
            try {
                // if (req.body.product) {

                const response = await import_products_service(req);
                process.send(response);
                // } else {
                // const vendor = await Vendor.findOne({ _id: req.body.vendorId, status: Constant.STATUS.ACTIVE })
                // if (vendor) {
                // const response = await import_excel_diamond(req);
                // process.send(response);
                // } else {
                //     process.send({
                //         errorCode: 200,
                //         message: `No any data inserted because vendor is suspended or not found..!`,
                //     })
                // }
                // }
            } catch (error) {
                process.send({ error: error.message });
            }
        });
    } catch (error) {
        console.log('Mongodb connection error in child process', error);
    }
})();