"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { METAL_PRICE_TYPE, STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function MetalMasterModal({
  open,
  setOpen,
  GetMetalList,
  rowData,
  setRowData,
}) {
  const token = getToken();
  const [isLoading, setIsLoading] = useState(false);

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
      name: rowData?.name || "",
      price_type: rowData?.price_type || "gold",
      type: rowData?.type || "",
      stamp: rowData?.stamp || "",
      purity: rowData?.purity || 1,
      color: rowData?.color || "",
      price_per_gram: rowData?.price_per_gram || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      price_type: Yup.string().oneOf(METAL_PRICE_TYPE.ALL_TYPE).required("Price type is required"),
      purity: Yup.number().min(0).required("Purity is required"),
      type: Yup.string(),
      stamp: Yup.string(),
      color: Yup.string(),
      price_per_gram: Yup.number().min(0).required("Price per gram is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      let url = `${API_URL?.CREATE_METAL}`;
      let method = "POST";

      if (rowData?._id) {
        url = `${API_URL?.UPDATE_METAL}/${rowData?._id}`;
        method = "PUT";
      }

      callApi(url, method, val, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetMetalList();
            setOpen(false);
            resetForm();
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          toast.error(M.common.somethingWentWrong);
        });
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit}>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-70 z-[9999]" />

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[40%] z-[9999] bg-white p-2 rounded-s-2xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[40%] h-full bg-white z-[9999] p-6 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-lg font-semibold flex-1">
                {rowData?._id ? "Edit" : "Add"} Metal
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData?._id ? "Update" : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#7dcdb7] text-white rounded-md cursor-pointer disabled:opacity-50"
                    disabled
                  >
                    Loading...
                  </button>
                )}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-6 mt-4">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Metal Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 18K Rose Gold"
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D] bg-white capitalize disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="price_type"
                    value={values.price_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={Boolean(rowData?._id)}
                  >
                    {METAL_PRICE_TYPE.ALL_TYPE.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {touched.price_type && errors.price_type && (
                    <p className="text-xs text-red-500 mt-1">{errors.price_type}</p>
                  )}
                </div>

                {/* Purity (Density) */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Purity (Density)<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                    type="number"
                    step="0.01"
                    name="purity"
                    value={values.purity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 0.75"
                  />
                  {touched.purity && errors.purity && (
                    <p className="text-xs text-red-500 mt-1">{errors.purity}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                      type="text"
                      name="type"
                      value={values.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Rose Gold"
                    />
                  </div>

                  {/* Stamp */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Stamp</label>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                      type="text"
                      name="stamp"
                      value={values.stamp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 18K"
                    />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium mb-1">Color (Hex/Name)</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                      type="text"
                      name="color"
                      value={values.color}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. #FFD700"
                    />
                    <input
                      type="color"
                      className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      value={values.color.startsWith("#") ? values.color : "#000000"}
                      onChange={(e) => setFieldValue("color", e.target.value)}
                    />
                  </div>
                </div>

                {/* Price Per Gram */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Metal Price (Per Gram)<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    type="number"
                    name="price_per_gram"
                    value={values.price_per_gram}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 15000"
                    disabled={Boolean(rowData?._id)}
                  />
                  {touched.price_per_gram && errors.price_per_gram && (
                    <p className="text-xs text-red-500 mt-1">{errors.price_per_gram}</p>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
