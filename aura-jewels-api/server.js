// MUST be the first import. ES modules are evaluated in import order, so any
// module that reads process.env at module scope — e.g. cart.services.js building
// its aggregation pipeline with appendMediaUrls() — would otherwise see an empty
// environment. That baked an empty CDN prefix into the cart and wishlist image
// URLs, so they came back as relative paths ("LR/LR15248/...") and rendered as
// broken images, while the product detail page (which builds its pipeline per
// request, after config had run) looked fine.
import "dotenv/config";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import dotenv from "dotenv";
import express from "express";
import { uploadsRoot } from "./utils/uploadPaths.js";
import sizesModel from "./models/sizes.model.js";
import mongoose from "mongoose";

// Kept for the explicit path; `dotenv/config` above has already populated
// process.env by the time any other module was evaluated.
dotenv.config({ path: "./.env" });
// import Constant from "./constants/user.constant.js";
// import { verifyToken } from "./utils/verifyToken.js";

(async () => {
  await connectDb();
  app.listen(process.env.PORT, () => {
    // const sizes = [];
    // for (let i = 1; i <= 15; i++) {
    //   sizes.push({
    //     name: `${i}`,
    //     category: new mongoose.Types.ObjectId("69fd896f42a906de28dc4137"), // Assuming all sizes belong to the same category for this example
    //     code: `IN-${i}`,
    //     isDefault: i === 12, // Setting 12 as default
    //     weight_multipler: parseFloat((0.8 + i * 0.016).toFixed(3)),
    //     status: "ACTIVE",
    //     isDeleted: 0,
    //     createdBy: new mongoose.Types.ObjectId("69e20e089d16505333d2d654"),
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //     sort: i, // Setting sort order
    //   });
    // }
    // sizesModel.insertMany(sizes);
    console.log(`Express app is running on port ${process.env.PORT}`);
  });
})();

const basePath = process.env.APP_URL || "";

app.use(`${basePath}uploads`, express.static(uploadsRoot));
