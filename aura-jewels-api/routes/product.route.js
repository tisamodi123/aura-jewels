import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { authorize } from "../utils/checkPermission.js";
import Action from "../constants/permissionAction.constant.js";
import { activityLogger } from "../middlewares/activityLog.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
  exportProductSchema,
  syncPriceSchema,
  productStatusUpdateSchema,
  updateCollectionInJewellerySchema,
} from "../validators/adminProduct.validator.js";
import {
  addProduct,
  calcutationProduct,
  delete_product,
  export_product,
  get_category_list_for_product,
  get_category_with_children,
  get_collection_list_for_product,
  get_labourCode_list_product,
  get_otherCharge_list_product,
  get_metal_list_product,
  get_product_detail,
  get_product_list,
  get_product_list_v2,
  get_shape_list,
  get_subCategory_list_usingId,
  get_tags_list_for_product,
  update_product,
  update_product_status,
  update_collection_in_jewellery,
  get_product_association,
  update_product_association,
  calculationProductOptimised,
  get_ring_sizes,
  generateProductReport,
} from "../controllers/product.controller.js";

const route = express.Router();

route.post(
  "/addProduct",
  [
    verifyToken, authorize(Action.PRODUCT_CREATE),
    validate(createProductSchema),
    activityLogger("product", "CREATE"),
  ],
  addProduct
);

route.post(
  "/getProductList",
  [verifyToken, authorize(Action.PRODUCT_LIST), validate(listProductsSchema)],
  get_product_list
);

route.post(
  "/getProductListV2",
  [verifyToken, authorize(Action.PRODUCT_LIST), validate(listProductsSchema)],
  get_product_list_v2
);

route.post("/getProductAssociation", [verifyToken, authorize(Action.PRODUCT_LIST)], get_product_association);
route.post(
  "/updateProductAssociation",
  [verifyToken, authorize(Action.PRODUCT_UPDATE)],
  update_product_association
);

route.get(
  "/getProductDetails/:id",
  [verifyToken, authorize(Action.PRODUCT_DETAIL), validate(idParamSchema, "params")],
  get_product_detail
);

route.put(
  "/updateProduct/:id",
  [
    verifyToken, authorize(Action.PRODUCT_UPDATE),
    validate(idParamSchema, "params"),
    validate(updateProductSchema),
    activityLogger("product", "UPDATE"),
  ],
  update_product
);

route.patch(
  "/updateProductStatus/:id",
  [
    verifyToken, authorize(Action.PRODUCT_UPDATE_STATUS),
    validate(idParamSchema, "params"),
    validate(productStatusUpdateSchema),
    activityLogger("product", "UPDATE_STATUS"),
  ],
  update_product_status
);

// Add / remove a single product from a collection (admin collection picker).
// Replaces the admin's old `collections/updateCollectionInJewelry` (404).
route.post(
  "/updateCollectionInJewelry",
  [
    verifyToken, authorize(Action.PRODUCT_UPDATE),
    validate(updateCollectionInJewellerySchema),
    activityLogger("product", "UPDATE"),
  ],
  update_collection_in_jewellery
);

route.delete(
  "/deleteProduct/:id",
  [
    verifyToken, authorize(Action.PRODUCT_DELETE),
    validate(idParamSchema, "params"),
    activityLogger("product", "DELETE"),
  ],
  delete_product
);

route.post(
  "/exportProduct",
  [verifyToken, authorize(Action.PRODUCT_EXPORT), validate(exportProductSchema)],
  export_product
);

route.post("/generateReport",[verifyToken,authorize(Action.PRODUCT_REPORT)],generateProductReport)
// Rewrites finalPrice on every matched product and re-syncs live offers, so it
// needs the product WRITE permission — it was gated on the read one.
route.post(
  "/syncPrice",
  [verifyToken, authorize(Action.PRODUCT_UPDATE), validate(syncPriceSchema)],
  calcutationProduct
);

route.get("/getCategoryList", get_category_list_for_product);
route.get("/getCategoryWithSubcategory", get_category_with_children);
route.get(
  "/getSubCategoryList/:id",
  [validate(idParamSchema, "params")],
  get_subCategory_list_usingId
);
route.get("/getCollectionList", get_collection_list_for_product);
route.get("/getTagsList", get_tags_list_for_product);
route.get("/getMetalList", get_metal_list_product);
route.get("/getLabourCodeList", get_labourCode_list_product);
route.get("/getOtherChargeList", get_otherCharge_list_product);
route.get("/getShapeList", get_shape_list);
route.get("/getRingSizes", get_ring_sizes);

export default route;
