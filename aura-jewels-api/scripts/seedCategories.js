import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.model.js";
import { createSlug } from "../utils/createSlug.js";

dotenv.config({ path: "./.env" });

const categoryMap = {
  "RINGS": new Set([
    "Engagement",
    "Anniversary",
    "Solitaire",
    "Daily & Office Wear",
    "Contemporary",
    "Halo",
    "Toi et Moi",
    "Bands",
  ]),

  "EARRINGS": new Set([
    "Danglers",
    "Drops",
    "Studs",
    "Hoops",
    "Solitaire Studs",
    "Anniversary",
    "Halo",
    "Daily & Office Wear",
    "Contemporary",
    "Toi et Moi",
  ]),

  "PENDANTS": new Set([
    "Halo",
    "Drops",
    "Heart",
    "Daily & Office Wear",
    "Contemporary",
    "Solitaire",
    "Infinity",
    "Butterfly",
    "Kids",
    "Toi et Moi",
    "Alphabet",
    "Evil Eye",
    "Religious",
  ]),

  "NECKLACE": new Set([
    "Mangalsutra",
    "Toi et Moi",
    "Tennis",
    "Bridal",
    "Anniversary",
    "Contemporary",
    "Daily & Office Wear"
  ]),

  "FOR HIM": new Set([
    "Solitaire",
    "Daily & Office Wear",
    "Engagement",
    "Anniversary",
    "Contemporary",
    "Halo",
    "Bands"
  ]),

  "BRACELETS & BANGLES": new Set([
    "Tennis Bracelets",
    "Chain Bracelets",
    "Bangles",
    "Infinity Bracelets",
    "Kada",
  ]),
};

function formatCategoryName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word === '&' || word === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

async function run() {
  const uri = process.env.MONGOOSE_URL || "mongodb://localhost:27017/aura_jewels_db";
  console.log(`Connecting to database at ${uri}...`);
  await mongoose.connect(uri);
  console.log("Database connected.");
  try {
    // 1. Get current maximum sort value for top-level categories
    const topLevelCats = await Category.find({ parentCategoryId: null, isDeleted: 0 });
    let maxParentSort = topLevelCats.reduce((max, cat) => Math.max(max, cat.sort || 0), 0);

    for (const [parentRawName, subSet] of Object.entries(categoryMap)) {
      const parentName = formatCategoryName(parentRawName);
      const parentSlug = createSlug(parentName);

      // Check if parent category already exists case-insensitively
      let parentCategory = await Category.findOne({
        categoryName: { $regex: new RegExp(`^${parentName}$`, "i") },
        parentCategoryId: null,
        isDeleted: 0,
      });

      if (!parentCategory) {
        maxParentSort += 1;
        console.log(`Creating parent category: "${parentName}"`);
        parentCategory = await Category.create({
          categoryName: parentName,
          slug: parentSlug,
          parentCategoryId: null,
          description: `All types of ${parentName.toLowerCase()}`,
          sort: maxParentSort,
          metaTitle: `Buy ${parentName.toLowerCase()}`,
          metaKeyword: `${parentName.toLowerCase()}, jewellery`,
          metaDescription: `Best ${parentName.toLowerCase()} collection`,
          status: "ACTIVE",
          isDeleted: 0,
          isMenu: true,
          hasSize: false,
        });
      } else {
        console.log(`Parent category already exists: "${parentCategory.categoryName}"`);
      }

      // 2. Fetch current subcategories to find max sort for children under this parent
      const subCats = await Category.find({ parentCategoryId: parentCategory._id, isDeleted: 0 });
      let maxSubSort = subCats.reduce((max, cat) => Math.max(max, cat.sort || 0), 0);

      // Process subcategories
      for (const childName of subSet) {
        const childSlug = createSlug(childName);

        // Check if subcategory already exists under this parent case-insensitively
        let subCategory = await Category.findOne({
          categoryName: { $regex: new RegExp(`^${childName}$`, "i") },
          parentCategoryId: parentCategory._id,
          isDeleted: 0,
        });

        if (!subCategory) {
          maxSubSort += 1;
          console.log(`  -> Creating subcategory: "${childName}" under "${parentName}"`);
          await Category.create({
            categoryName: childName,
            slug: childSlug,
            parentCategoryId: parentCategory._id,
            description: `${childName} ${parentName.toLowerCase()}`,
            sort: maxSubSort,
            metaTitle: `Buy ${childName} ${parentName.toLowerCase()}`,
            metaKeyword: `${childName.toLowerCase()}, ${parentName.toLowerCase()}, jewellery`,
            metaDescription: `Best ${childName.toLowerCase()} ${parentName.toLowerCase()} collection`,
            status: "ACTIVE",
            isDeleted: 0,
            isMenu: true,
            hasSize: false,
          });
        } else {
          console.log(`  -> Subcategory already exists: "${subCategory.categoryName}" under "${parentName}"`);
        }
      }
    }

    console.log("Seeding finished successfully!");
  } catch (error) {
    console.error("Error during seeding categories:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

run();
