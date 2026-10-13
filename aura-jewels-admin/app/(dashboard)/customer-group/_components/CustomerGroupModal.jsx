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
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function CustomerGroupModal({
  open,
  setOpen,
  GetGroupList,
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
    resetForm,
  } = useFormik({
    initialValues: {
      name: rowData?.name || "",
      description: rowData?.description || "",
      discountPercent: rowData?.discountPercent || 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string(),
      discountPercent: Yup.number()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("name", val.name);
      formdata.append("description", val.description);
      formdata.append("discountPercent", val.discountPercent);

      let url = `${API_URL?.CREATE_CUSTOMER_GROUP}`;
      let method = "POST";

      if (rowData?._id) {
        url = `${API_URL?.UPDATE_CUSTOMER_GROUP}/${rowData?._id}`;
        method = "PUT";
      }

      callApi(url, method, formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.CREATED || result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetGroupList();
            setOpen(false);
            resetForm();
          } else {
            toast.error(result?.message || M.common.somethingWentWrong);
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
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[9999]" />

          <Dialog.Content className="fixed top-0 right-0 w-[400px] h-full bg-white z-[9999] p-6 shadow-2xl overflow-y-auto focus:outline-none flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <Dialog.Title className="text-xl font-bold text-zinc-900">
                {rowData?._id ? "Edit" : "Create"} Customer Group
              </Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all ${touched.name && errors.name ? "border-red-500" : "border-zinc-300"
                    }`}
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Group Name"
                />
                {touched.name && errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all min-h-[100px]"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter Description"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">
                  Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none transition-all ${touched.discountPercent && errors.discountPercent ? "border-red-500" : "border-zinc-300"
                      }`}
                    type="number"
                    name="discountPercent"
                    value={values.discountPercent}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">%</span>
                </div>
                {touched.discountPercent && errors.discountPercent && (
                  <p className="text-xs text-red-500 font-medium">{errors.discountPercent}</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t pt-6 mt-6 flex gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors disabled:bg-zinc-400 cursor-pointer"
              >
                {isLoading ? "Saving..." : rowData?._id ? "Update" : "Create"}
              </button>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
