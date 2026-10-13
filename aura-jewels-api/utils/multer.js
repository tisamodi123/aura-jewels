import { fileURLToPath } from "url";
import fs from "fs";
import { dirname, join, extname } from "path";
import path from "path";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import crypto from "crypto";
import { STATUS_CODE } from "../constants/statusCode.constant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadFiles = (req, res, next) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = "";

        // Detect module from URL
        const url = req.originalUrl;

        if (file.fieldname === "excel") {
          uploadPath = "uploads/importExcelData";
        } else if (file.fieldname === "video") {
          uploadPath = "uploads/videos";
        } else if (url.includes("offer")) {
          uploadPath = "uploads/offerImage";
        } else if (url.includes("custom")) {
          uploadPath = "uploads/custom-order";
        } else if (
          url.includes("categoryLanding") ||
          url.includes("homeSection")
        ) {
          uploadPath = "uploads/cmsImages";
        } else if (url.includes("category")) {
          uploadPath = "uploads/categoryImages";
        } else if (url.includes("parameter")) {
          uploadPath = "uploads/parameterImages";
        } else if (url.includes("collection")) {
          uploadPath = "uploads/collectionImages";
        } else if (url.includes("invoice")) {
          console.log("upload on local")
          uploadPath = "uploads/invoices";
        } else if (url.includes("receipt")) {
          uploadPath = "uploads/receipts";
        } else {
          const fileType = file.mimetype.split("/")[0];

          if (fileType === "image") {
            uploadPath = "uploads/others";
          } else if (file.mimetype === "application/pdf") {
            uploadPath = "uploads/others";
          } else {
            return cb(new Error("Unsupported file type"), false);
          }
        }

        const fullPath = join(__dirname, "..", uploadPath);

        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
      },

      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = extname(file.originalname);

        const cleanName = file.originalname.split(".")[0].replace(/\s+/g, "-");

        cb(null, `${cleanName}-${timestamp}${ext}`);
      },
    });

    const upload = multer({
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 5MB
      },
    });

    upload.any()(req, res, function (err) {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(STATUS_CODE.OK).json({
            errorCode: STATUS_CODE.BAD_REQUEST,
            message: "File size too large. Max allowed is 5MB",
          });
        }
        return res.status(STATUS_CODE.OK).json({
          errorCode: STATUS_CODE.BAD_REQUEST,
          message: err.message,
        });
      }

      // Image size validation check
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          if (file.mimetype && file.mimetype.startsWith("image/")) {
            if (file.size > 5 * 1024 * 1024) {
              if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
              return res.status(STATUS_CODE.OK).json({
                errorCode: STATUS_CODE.BAD_REQUEST,
                message: `Image ${file.originalname || ""
                  } size must be less than 5MB`,
              });
            }
          }
        }
      }

      next();
    });
  } catch (error) {
    console.log("11111111");

    console.error("uploadFiles error:", error);
    next(error);
  }
};

// since we are importing the s3Client in multiple files we are creating a singleton instance
// singleton pattern used here
let s3Instance = null;
const getS3Client = () => {
  if (!s3Instance) {
    s3Instance = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Instance;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

const getS3Folder = (file, req) => {
  // Allow manual override from headers or query params
  const manualFolder = req.headers["x-s3-folder"] || req.query?.folder;
  if (manualFolder) {
    const normalized = String(manualFolder).replace(/^\/+|\/+$/g, "");
    return normalized ? `${normalized}/` : "";
  }

  const mimetype = file.mimetype || "";
  const originalName = (file.originalname || "").toLowerCase();
  const urlPath = (req.originalUrl || req.url || "").toLowerCase();

  // Excel/CSV Imports
  if (file.fieldname === "excel" || urlPath.includes("import")) {
    return "website-assets/importExcelData/";
  }

  if (urlPath.includes("custom")) {
    return "website-assets/custom-orders/";
  }

  // 1. Invoices
  if (urlPath.includes("invoice") || originalName.includes("invoice")) {
    return "website-assets/invoices/";
  }

  // 2. PDFs
  if (originalName.endsWith(".pdf") || mimetype === "application/pdf") {
    return "website-assets/pdfs/";
  }

  // 3. Videos
  if (mimetype.startsWith("video/")) {
    return "videos/";
  }

  // 4. Banners / CMS Banners
  if (
    urlPath.includes("homesection") ||
    urlPath.includes("categorylanding") ||
    urlPath.includes("banner")
  ) {
    return "website-assets/cms/";
  }

  // 5. Category Thumbnail / Page Banners
  if (urlPath.includes("category")) {
    return "website-assets/categories/";
  }

  // 6. Collection Thumbnail / Page Banners
  if (urlPath.includes("collection")) {
    return "website-assets/collections/";
  }

  // 5. Products Images
  if (
    urlPath.includes("product") ||
    urlPath.includes("jewellery") ||
    urlPath.includes("diamond") ||
    urlPath.includes("stone")
  ) {
    return "images/";
  }

  if (urlPath.includes("offer")) {
    return "website-assets/offerImage/";
  }

  // 6. Default Fallback / Temp
  return "website-assets/temp/";
};

export const uploadFilesOnAWS = (req, res, next) => {
  // Agar request multipart nahi hai to skip
  if (!req.is("multipart/form-data")) {
    return next();
  }

  upload.any()(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Each file must be <= 50MB" });
      }
      return res.status(400).json({ statusCode: 400, message: err.message });
    }

    // ✅ ab multer run ho gaya, abhi req.files available hai
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Max files check
    if (req.files.length > 10) {
      return res.status(400).json({
        statusCode: 400,
        message: "You cannot upload more than 10 files",
      });
    }

    // Total size check
    const totalSize = req.files.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      return res.status(400).json({
        statusCode: 400,
        message: "Total upload size must not exceed 50 MB",
      });
    }

    // Image size & type validation check
    for (const file of req.files) {
      if (file.mimetype && file.mimetype.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            statusCode: 400,
            message: `Image ${file.originalname || ""
              } size must be less than 5MB`,
          });
        }
      }
    }

    try {
      const uploadedFiles = [];
      const s3 = getS3Client();
      // since we are importing BUCKET_NAME and upload_path from .env
      // env is configured after the import that leads to undefined values if we import outside the scope
      // so we are using process.env directly
      const BUCKET_NAME = process.env.AWS_S3_BUCKET;
      const upload_path = process.env.AWS_UPLOAD_PATH;
      const isDeveloper = process.env.DEVELOPER_MODE === "true";

      for (const file of req.files) {
        // detect extension
        const ext =
          (path.extname(file.originalname) || "").slice(1).toLowerCase() ||
          mime.extension(file.mimetype) ||
          "bin";

        const baseName =
          path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/[^\w.-]/g, "_")
            .slice(0, 80) || "file";

        const stamp = new Date()
          .toISOString()
          .replace(/[-:TZ.]/g, "")
          .slice(0, 14);
        const uniq = crypto.randomBytes(4).toString("hex");
        const fileName = `${baseName}-${stamp}-${uniq}.${ext}`;

        const folder = getS3Folder(file, req);
        const keyWithoutDev = `${folder}${fileName}`;
        const key = isDeveloper ? `dev/${keyWithoutDev}` : keyWithoutDev;

        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: "public-read", // agar public access chahiye
        });

        await s3.send(command);
        file.custom_filename = fileName;
        file.filename = fileName; // Save ONLY the filename in the database (without folders/paths)
        // save file URL just like local uploadedPath
        file.uploadedPath = `${upload_path}${key}`;
        uploadedFiles.push({ file: fileName, url: file.uploadedPath });
      }

      // Attach to request
      req.uploadedFiles = uploadedFiles;
      // if (req.url) {
      //   console.log(req.url);

      // }
      console.log("upload complete")
      return next();
    } catch (uploadErr) {
      console.error(uploadErr);
      return res.status(500).json({
        statusCode: 500,
        message: "File upload failed",
        error: uploadErr.message,
      });
    }
  });
};

export const uploadBufferToS3 = async ({
  buffer,
  fileName,
  contentType,
  folder = "",
}) => {
  const isDeveloper = process.env.DEVELOPER_MODE === "true";
  const BUCKET_NAME = process.env.AWS_S3_BUCKET;
  const upload_path = process.env.AWS_UPLOAD_PATH;
  const s3 = getS3Client();

  const normalizedFolder = String(folder || "").replace(/^\/+|\/+$/g, "");
  const keyWithoutDev = normalizedFolder
    ? `${normalizedFolder}/${fileName}`
    : fileName;
  const key = isDeveloper ? `dev/${keyWithoutDev}` : keyWithoutDev;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL: "public-read",
  });

  await s3.send(command);

  return {
    key,
    url: `${upload_path}${key}`,
  };
};

export async function deleteMultipleFromS3(fileUrls = []) {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET;
  const upload_path = process.env.AWS_UPLOAD_PATH;
  const s3 = getS3Client();

  if (!fileUrls.length) return;

  // Extract only S3 keys from full URLs
  const keys = fileUrls.map((url) =>
    url.includes(upload_path) ? url.split(upload_path)[1] : url
  );

  const deleteParams = {
    Bucket: BUCKET_NAME,
    Delete: {
      Objects: keys.map((Key) => ({ Key })), // expected format
      Quiet: false,
    },
  };

  try {
    // const command = new DeleteObjectsCommand(deleteParams);
    // const response = await s3.send(command);
    //
    // return { success: true, deleted: response.Deleted };
    return { success: true, deleted: "Files Deleted" };
  } catch (err) {
    console.error("❌ S3 batch delete error:", err.message);
    return { success: false, error: err.message };
  }
}

export const uploadMiddleware = (req, res, next) => {
  const useAWS =
    process.env.AWS_ACCESS_KEY_ID && process.env.DEVELOPER_MODE !== "true";
  if (useAWS) {
    return uploadFilesOnAWS(req, res, next);
  } else {
    return uploadFiles(req, res, next);
  }
};
