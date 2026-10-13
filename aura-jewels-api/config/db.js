import mongoose from "mongoose";

export const connectDb = async () => {
    try {

        console.log("Connecting to database...");
        mongoose.connect(process.env.MONGOOSE_URL)
            .then(() => {
                console.log('Database connected successfully..!');
            }).catch((error) => {
                console.log(error.message);
            })
    } catch (error) {
        console.log(error.message);
    }
}