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
import { STATUS_CODE } from "@/lib/Constant";

export default function VolumeDiscModal({
  open,
  setOpen,
  GetVolumeDiscList,
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
      fromAmount: rowData?.fromAmount || "",
      toAmount: rowData?.toAmount || "",
      discount: rowData?.discount || "",
    },
    validationSchema: Yup.object({
      fromAmount: Yup.string().required("From Amount is required"),
      toAmount: Yup.string().required("To Amount is required"),
      discount: Yup.string().required("Discount is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("fromAmount", val.fromAmount);
      formdata.append("toAmount", val.toAmount);
      formdata.append("discount", val.discount);

      let url = `${API_URL?.CREATE_VOLUME_DISC}/`;
      if (rowData?.id) {
        url = `${API_URL?.UPDATE_VOLUME_DISC}/${rowData?.id}`;
      }
      callApi(url, rowData?.id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetVolumeDiscList();
            resetForm();
            setOpen(false);
            setRowData({});
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
        });
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit}>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
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
                {rowData?.id ? "Edit" : "Add"} Volume Discount
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData?.id ? "Update" : "Save"}
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
            <div className="border-b"></div>

            {/* Form Inputs */}
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium ">
                    From Amount<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="fromAmount"
                    value={values.fromAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter From Amount"
                  />
                  {touched.fromAmount && errors.fromAmount && (
                    <p className="text-sm text-red-500">{errors.fromAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    To Amount<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="toAmount"
                    value={values.toAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter From Amount"
                  />
                  {touched.toAmount && errors.toAmount && (
                    <p className="text-sm text-red-500">{errors.toAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Discount(%)<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="discount"
                    value={values.discount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Discount"
                  />
                  {touched.discount && errors.discount && (
                    <p className="text-sm text-red-500">{errors.discount}</p>
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
