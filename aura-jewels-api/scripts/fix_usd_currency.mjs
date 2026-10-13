import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
    const mongoUri = process.env.MONGOOSE_URL || "mongodb://localhost:27017/aurajewels-local";
    await mongoose.connect(mongoUri);
    
    // Update USD currency document
    const result = await mongoose.connection.db.collection('currencies').updateOne(
        { code: "USD" },
        { 
            $set: { 
                symbol: "$", 
                exchangeRate: 1.0,
                updatedAt: new Date()
            } 
        }
    );
    
    console.log("Database update result:", result);
    
    // Verify updated currencies
    const docs = await mongoose.connection.db.collection('currencies').find({}).toArray();
    console.log("UPDATED CURRENCIES IN DATABASE:", JSON.stringify(docs, null, 2));
    
    await mongoose.disconnect();
}

run().catch(console.error);
