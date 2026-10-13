"use client";
import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function SizeModal({ isOpen, onClose, rowData, refreshData }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callApi(API_URL.PARENT_CATEGORY_LIST, "GET", null, token);
        if (response?.errorCode === STATUS_CODE.OK) {
          const filtered = (response.data || []).filter(cat => cat.hasSize === true);
          setCategories(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    if (isOpen) fetchCategories();
  }, [token, isOpen]);

  const formik = useFormik({
    initialValues: {
      name: rowData?.name || "",
      code: rowData?.code || "",
      category: rowData?.category?._id || "",
      weight_multipler: rowData?.weight_multipler || 1,
      isDefault: rowData?.isDefault || false,
      sort : rowData?.sort || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      code: Yup.string().required("Code is required"),
      category: Yup.string().required("Category is required"),
      weight_multipler: Yup.number().required("Weight multiplier is required").min(0, "Must be positive"),
      sort: Yup.number().required("Sort is required").min(0, "Must be a positive number"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const url = rowData
          ? `${API_URL.UPDATE_SIZE}/${rowData._id}`
          : API_URL.CREATE_SIZE;
        const method = rowData ? "PUT" : "POST";

        const response = await callApi(url, method, values, token);

        if (response?.errorCode === STATUS_CODE.OK || response?.errorCode === STATUS_CODE.CREATED) {
          toast.success(rowData ? M.size.updated : M.size.created);
          refreshData();
          onClose();
        } else {
          toast.error(response?.message || M.common.somethingWentWrong);
        }
      } catch (error) {
        toast.error(M.common.somethingWentWrong);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <form onSubmit={formik.handleSubmit}>
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
                {rowData ? "Edit" : "Add"} Size
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData ? "Update" : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#7dcdb7] text-white rounded-md cursor-pointer"
                  >
                    ...Loading
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6 mt-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Category <span className="text-red-500">*</span></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">--- Select Category ---</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                  <p className="text-sm text-red-500">{formik.errors.category}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Size Name <span className="text-red-500">*</span></label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="text"
                  name="name"
                  placeholder="e.g. 5, 6, Small, Medium"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Size Code <span className="text-red-500">*</span></label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="text"
                  name="code"
                  placeholder="e.g. S, M, L or 5"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.code && formik.errors.code && (
                  <p className="text-sm text-red-500">{formik.errors.code}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Weight Multiplier <span className="text-red-500">*</span></label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="number"
                  name="weight_multipler"
                  step="0.01"
                  value={formik.values.weight_multipler}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.weight_multipler && formik.errors.weight_multipler && (
                  <p className="text-sm text-red-500">{formik.errors.weight_multipler}</p>
                )}
              </div>

               <div className="space-y-1">
                <label className="block text-sm font-medium">Sort <span className="text-red-500">*</span></label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="number"
                  name="sort"
                  step="0.01"
                  value={formik.values.sort}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.sort && formik.errors.sort && (
                  <p className="text-sm text-red-500">{formik.errors.sort}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  className="w-4 h-4 cursor-pointer"
                  checked={formik.values.isDefault}
                  onChange={(e) => formik.setFieldValue("isDefault", e.target.checked)}
                />
                <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                  Set as Default
                </label>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
