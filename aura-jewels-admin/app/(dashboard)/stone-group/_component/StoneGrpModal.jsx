"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, DIAMOND_TYPES, GEM_TYPES } from "@/lib/Constant";

const DIAMOND = DIAMOND_TYPES.DIAMOND;

// A carat bucket, written exactly as the rate sheet writes it. Ranges are the
// norm ("0.16-0.17", "1.00-1.49"); a bare number and a millimetre label are both
// accepted because the master already contains them.
const CARAT_HINT = 'e.g. "0.50-0.69", "1.00-1.49", "0.35" or "4.40 x 2.70 MM"';

export default function StoneGrpModal({
  open,
  setOpen,
  fetchStoneGrpData,
  rowData,
  setRowData,
  filterOptions = { colors: [], clarities: [], allShapes: [] },
}) {
  const token = getToken();
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = !!(rowData?.id || rowData?._id);
  const editId = rowData?.id || rowData?._id;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      stoneType: rowData?.stoneType || DIAMOND,
      type: rowData?.type || "",
      // The list endpoint flattens shape to its display name, so an edit cannot
      // pre-select the shape id. shapeId is only sent when the user changes it.
      shapeId: rowData?.shapeId || "",
      color: rowData?.color || "",
      clarity: rowData?.clarity || "",
      carat: rowData?.carat || "",
      lgdPrice: rowData?.lgdPrice ?? "",
      naturalPrice: rowData?.naturalPrice ?? "",
      status: rowData?.status || "ACTIVE",
    },
    validationSchema: Yup.object({
      stoneType: Yup.string().required("Stone type is required"),
      type: Yup.string().when("stoneType", {
        is: (v) => v !== DIAMOND,
        then: (s) => s.required("Gem type is required for a colour stone"),
        otherwise: (s) => s.notRequired(),
      }),
      shapeId: isEdit
        ? Yup.string().notRequired()
        : Yup.string().required("Shape is required"),
      color: Yup.string().trim().required("Colour is required"),
      clarity: Yup.string().when("stoneType", {
        is: DIAMOND,
        then: (s) => s.trim().required("Clarity is required for a diamond"),
        otherwise: (s) => s.notRequired(),
      }),
      carat: Yup.string().trim().required("Size / carat bucket is required"),
      lgdPrice: Yup.number().typeError("Must be a number").min(0, "Must be non-negative").nullable(),
      naturalPrice: Yup.number().typeError("Must be a number").min(0, "Must be non-negative").nullable(),
    }).test(
      "at-least-one-price",
      null,
      (obj) => {
        const hasLgd = obj.lgdPrice !== "" && obj.lgdPrice !== null && obj.lgdPrice !== undefined;
        const hasNatural = obj.naturalPrice !== "" && obj.naturalPrice !== null && obj.naturalPrice !== undefined;
        if (hasLgd || hasNatural) return true;
        // A row with neither price silently values every matching stone at 0.
        return new Yup.ValidationError(
          "Enter at least one of LGD Price or Natural Price",
          null,
          "lgdPrice"
        );
      }
    ),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const isDiamond = val.stoneType === DIAMOND;
      const payload = {
        stoneType: val.stoneType,
        color: val.color.trim().toUpperCase(),
        carat: val.carat.trim(),
        status: val.status,
      };
      if (isDiamond) {
        payload.clarity = val.clarity.trim().toUpperCase();
      } else {
        payload.type = val.type;
      }
      // Blank means "not offered in this origin" and must reach the API as an
      // empty value, not 0 — 0 would be a published rate of zero.
      if (val.lgdPrice !== "" && val.lgdPrice !== null) payload.lgdPrice = Number(val.lgdPrice);
      if (val.naturalPrice !== "" && val.naturalPrice !== null) payload.naturalPrice = Number(val.naturalPrice);
      // On edit, only send shape when the user actually picked one.
      if (val.shapeId) payload.shape = val.shapeId;

      const url = isEdit ? `${API_URL.UPDATE_STONE_GROUP}/${editId}` : API_URL.ADD_STONE_GROUP;

      try {
        const result = await callApi(url, isEdit ? "PUT" : "POST", payload, token);
        setIsLoading(false);

        if (result?.errorCode === STATUS_CODE.OK || result?.errorCode === 201) {
          toast.success(result?.message || (isEdit ? "Stone group updated." : "Stone group added."));
          fetchStoneGrpData();
          resetForm();
          setOpen(false);
          setRowData({});
        } else {
          // 409 = the natural key already exists. Surface the API's message.
          toast.error(result?.message || "Failed to save stone group.");
        }
      } catch (err) {
        setIsLoading(false);
        toast.error("Failed to save stone group.");
      }
    },
  });

  const isDiamond = values.stoneType === DIAMOND;

  const field = "w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#087B5D] disabled:bg-gray-100";
  const err = (name) =>
    touched[name] && errors[name] ? <p className="text-sm text-red-500 mt-1">{errors[name]}</p> : null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 z-[9999]" />

        <Dialog.Content className="fixed top-0 right-0 w-full sm:w-[46%] h-full bg-white z-[9999] p-6 overflow-y-auto focus:outline-none">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-lg font-semibold flex-1">
                {isEdit ? "Edit Stone Group" : "Add Stone Group"}
              </Dialog.Title>

              <div className="flex gap-2 items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] disabled:bg-[#7dcdb7] text-white rounded-md cursor-pointer"
                >
                  {isLoading ? "Saving..." : isEdit ? "Update" : "Add"}
                </button>
                <Dialog.Close asChild>
                  <button type="button" className="p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stone Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="stoneType"
                    value={values.stoneType}
                    onChange={(e) => {
                      setFieldValue("stoneType", e.target.value);
                      setFieldValue("type", "");
                      setFieldValue("clarity", "");
                    }}
                    onBlur={handleBlur}
                    className={field}
                  >
                    {DIAMOND_TYPES.ALL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  {err("stoneType")}
                </div>

                {isDiamond ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Clarity<span className="text-red-500">*</span>
                    </label>
                    <input
                      className={field}
                      name="clarity"
                      list="sg-clarities"
                      value={values.clarity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. VVS, VS, IF, VVS1"
                    />
                    <datalist id="sg-clarities">
                      {filterOptions.clarities?.map((c) => <option key={c} value={c} />)}
                    </datalist>
                    {err("clarity")}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Gem Type<span className="text-red-500">*</span>
                    </label>
                    <select name="type" value={values.type} onChange={handleChange} onBlur={handleBlur} className={field}>
                      <option value="">Select gem type</option>
                      {GEM_TYPES.ALL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                    {err("type")}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shape{!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <select name="shapeId" value={values.shapeId} onChange={handleChange} onBlur={handleBlur} className={field}>
                    <option value="">
                      {isEdit ? `Keep current (${rowData?.shape || "—"})` : "Select shape"}
                    </option>
                    {filterOptions.allShapes?.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  {err("shapeId")}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Colour<span className="text-red-500">*</span>
                  </label>
                  <input
                    className={field}
                    name="color"
                    list="sg-colors"
                    value={values.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. EF, GH, IJ, D"
                  />
                  <datalist id="sg-colors">
                    {filterOptions.colors?.map((c) => <option key={c} value={c} />)}
                  </datalist>
                  {err("color")}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Size / Carat Bucket<span className="text-red-500">*</span>
                </label>
                <input
                  className={field}
                  name="carat"
                  value={values.carat}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={CARAT_HINT}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ranges are inclusive of both ends. A stone prices against the bucket its size falls in.
                </p>
                {err("carat")}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">LGD Price (per ct)</label>
                  <input
                    className={field}
                    type="number"
                    step="0.01"
                    min="0"
                    name="lgdPrice"
                    value={values.lgdPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Leave blank if not offered"
                  />
                  {err("lgdPrice")}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Natural Price (per ct)</label>
                  <input
                    className={field}
                    type="number"
                    step="0.01"
                    min="0"
                    name="naturalPrice"
                    value={values.naturalPrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Leave blank if not offered"
                  />
                  {err("naturalPrice")}
                </div>
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={values.status} onChange={handleChange} onBlur={handleBlur} className={field}>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <p className="text-xs text-gray-500 border-t pt-4">
                Adding a group here does not change any product price on its own. Run the
                jewellery price sync afterwards so products that match this bucket pick up the rate.
              </p>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
