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

export default function OtherChargeModal({
  open,
  setOpen,
  GetOtherChargeList,
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
      otherChargeCode: rowData?.chargeCode || "",
      amount: rowData?.amount || "",
      remark: rowData?.remark || "",
    },
    validationSchema: Yup.object({
      otherChargeCode: Yup.string().required("Labour Charge is required"),
      amount: Yup.string().required("Amount is required"),
      remark: Yup.string().required("remark is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("chargeCode", val.otherChargeCode);
      formdata.append("amount", val.amount);
      formdata.append("remark", val.remark);

      let url = `${API_URL?.CREATE_OTHER_CHARGE}/`;
      if (rowData?.id) {
        url = `${API_URL?.UPDATE_OTHER_CHARGE}/${rowData?.id}`;
      }
      callApi(url, rowData?.id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetOtherChargeList();
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
                {rowData?.id ? "Edit" : "Add"} Other Labour Charge
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
                    Other Labour Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="otherChargeCode"
                    value={values.otherChargeCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Labour Code"
                  />
                  {touched.otherChargeCode && errors.otherChargeCode && (
                    <p className="text-sm text-red-500">
                      {errors.otherChargeCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Amount<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="amount"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Amount"
                  />
                  {touched.amount && errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Remark</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="remark"
                    value={values.remark}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Remark"
                  />
                  {touched.remark && errors.remark && (
                    <p className="text-sm text-red-500">{errors.remark}</p>
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
