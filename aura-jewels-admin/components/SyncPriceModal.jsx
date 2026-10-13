"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, RefreshCcw } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function SyncPriceModal({ 
  open, 
  setOpen, 
  onSuccess, 
  apiUrl = API_URL?.SYNC_PRODUCT_PRICE, 
  selectedIds = [], 
  productId = null,
  title = "Sync Product Prices",
  description = ""
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
      password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required(`Password is required to ${title.toLowerCase()}`),
    }),
    onSubmit: async (val) => {
      setIsLoading(true);
      const payload = {
        ...val,
      };
      if (productId) {
        payload.selectedProductIds = [productId];
      } else if (selectedIds && selectedIds.length > 0) {
        payload.selectedProductIds = selectedIds;
      }
      callApi(`${apiUrl}`, "POST", payload, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            setOpen(false);
            resetForm();
            if (onSuccess) {
              onSuccess();
            }
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
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-70 z-[9999]" />

          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white z-[9999] p-6 rounded-lg shadow-xl focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                <RefreshCcw size={20} className="text-[#087B5D]" />
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {description || (productId 
                ? "This action will recalculate the price for this product based on the current metal and charge rates. Please enter your password to authorize."
                : (selectedIds && selectedIds.length > 0 
                  ? `This action will recalculate prices for the ${selectedIds.length} selected product${selectedIds.length > 1 ? "s" : ""} based on the current metal and charge rates. Please enter your password to authorize.`
                  : "This action will recalculate all product prices based on the current metal and charge rates. Please enter your password to authorize this action."))
              }
            </p>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Password<span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-[#087B5D] hover:bg-[#06614a] rounded-md transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCcw size={16} className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Authorization & Sync"
                )}
              </button>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
