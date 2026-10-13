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

export default function CurrencyModal({
  open,
  setOpen,
  GetCurrencyList,
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
      currencyName: rowData?.currency || "",
      caption: rowData?.caption || "",
      sign: rowData?.sign || "",
      amount: rowData?.amount || "",
      default: rowData?.default || false,
    },
    validationSchema: Yup.object({
      currencyName: Yup.string().required("Currency Name is required"),
      sign: Yup.string().required("Sign is required"),
      caption: Yup.string().required("Caption is required"),
      amount: Yup.string().required("Amount is required"),
      default: Yup.boolean(),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("currency", val.currencyName);
      formdata.append("caption", val.caption);
      formdata.append("sign", val.sign);
      formdata.append("amount", val.amount);
      formdata.append("default", val.default);

      let url = `${API_URL?.CREATE_CURRENCY}/`;
      if (rowData?.id) {
        url = `${API_URL?.UPDATE_CURRENCY}/${rowData?.id}`;
      }
      callApi(url, rowData?.id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            resetForm();
            setRowData({});
            GetCurrencyList();
            setOpen(false);
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
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 z-40" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[40%] z-50 bg-white p-2 rounded-s-2xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[40%] h-full bg-white z-50 p-6 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-lg font-semibold flex-1">
                {rowData?.id ? "Edit" : "Add"} Currency
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
                    Currency Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="currencyName"
                    value={values.currencyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Currency Name"
                  />
                  {touched.currencyName && errors.currencyName && (
                    <p className="text-sm text-red-500">
                      {errors.currencyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Caption</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="caption"
                    value={values.caption}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter caption"
                  />
                  {touched.caption && errors.caption && (
                    <p className="text-sm text-red-500">{errors.caption}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Sign</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="sign"
                    value={values.sign}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Sign"
                  />
                  {touched.sign && errors.sign && (
                    <p className="text-sm text-red-500">{errors.sign}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Amount</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="amount"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter amount"
                  />
                  {touched.amount && errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>

                <div className="pt-2">
                  <input
                    type="checkbox"
                    name="default"
                    className="hand"
                    onChange={(e) => {
                      setFieldValue("default", e.target.checked);
                    }}
                    checked={values?.default}
                  />
                  <label className="text-sm ml-2 font-medium">Default</label>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
