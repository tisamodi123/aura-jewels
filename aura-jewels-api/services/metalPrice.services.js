// --------------------
// CHNAGES BY SMIT_K86
// --------------------
import MetalPrice from "../models/metalPrice.model.js";

export const get_single_metal_price_db = async (query) => {
  return await MetalPrice.findOne(query);
};

export const create_metal_price_db = async (data, userId) => {
  return await MetalPrice.create({
    ...data,
    createdBy: userId,
    status: "ACTIVE"
  });
};

export const get_metal_price_list_db = async (filter, skip, limit) => {
  const data = await MetalPrice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MetalPrice.countDocuments(filter);

  return { data, total };
};

export const update_metal_price_db = async (req) => {
  return await MetalPrice.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        gold: req.body.gold,
        silver: req.body.silver,
        platinum: req.body.platinum,
        updatedBy: req.user.userId
      }
    },
    { new: true }
  );
};

export const delete_metal_price_db = async (id) => {
  return await MetalPrice.findByIdAndUpdate(id, {
    $set: { isDeleted: 1 }
  });
};

export const get_active_metal_price_db = async () => {
  return await MetalPrice.findOne({
    status: "ACTIVE",
    isDeleted: 0
  });
};
export const update_metal_price_status_db = async (id, status) => {
  return await MetalPrice.findByIdAndUpdate(id, {
    $set: { status }
  });
};
export const suspend_active_metal_price_db = async () => {
  return await MetalPrice.updateMany(
    { status: "ACTIVE", isDeleted: 0 },
    { $set: { status: "SUSPENDED" } }
  );
};
// --------------------
// END OF LINE
// --------------------