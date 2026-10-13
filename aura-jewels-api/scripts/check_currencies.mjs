import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
    const mongoUri = process.env.MONGOOSE_URL || "mongodb://localhost:27017/aurajewels-local";
    await mongoose.connect(mongoUri);
    const docs = await mongoose.connection.db.collection('currencies').find({}).toArray();
    console.log("CURRENCIES IN DATABASE:", JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
}

run().catch(console.error);
