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
import { METAL_PRICE_TYPE, STATUS_CODE } from "@/lib/Constant";

export default function MetalPriceModal({
  open,
  setOpen,
  GetMetalPriceList,
  rowData,
  setRowData,
  // parameterList,
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
    initialValues: METAL_PRICE_TYPE.ALL_TYPE.reduce((acc, type) => {
      acc[type] = rowData?.[type] || "";
      return acc;
    }, {}),
    validationSchema: Yup.object(
      METAL_PRICE_TYPE.ALL_TYPE.reduce((acc, type) => {
        acc[type] = Yup.number().required(`${type} price is required`);
        return acc;
      }, {})
    ),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();

      METAL_PRICE_TYPE.ALL_TYPE.forEach((type) => {
        formdata.append(type, values[type]);
      });
      // formdata.append("metal", val.metal);
      // formdata.append("amount", val.amount);

      let url = `${API_URL?.CREATE_METAL_PRICE}/`;
      if (rowData?.id || rowData?._id) {
        url = `${API_URL?.UPDATE_METAL_PRICE}/${rowData?.id || rowData?._id}`;
      }
      callApi(url, rowData?.id || rowData?._id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetMetalPriceList();
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
                {rowData?.id || rowData?._id ? "Edit" : "Add"} Metal Prices (Per 10 Gram)
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData?.id || rowData?._id ? "Update" : "Save"}
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
                {/* <div>
                  <label className="block text-sm font-medium ">
                    Metal<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    name="metal"
                    value={values.metal}
                    onChange={handleChange}
                  >
                    <option value="">--- Select Metal ---</option>
                    {parameterList?.map((value, index) => {
                      return (
                        <option key={`vendorlist-${index}`} value={value?.id}>
                          {value?.paraMtrName}
                        </option>
                      );
                    })}
                  </select>
                  {touched.metal && errors.metal && (
                    <p className="text-sm text-red-500">{errors.metal}</p>
                  )}
                </div> */}
                {METAL_PRICE_TYPE.ALL_TYPE.map((type) => (
                  <div key={type}>
                    <label className="block text-sm font-medium">
                      {type.toUpperCase()} <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name={type}
                      value={values[type]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder={`Enter ${type} price`}
                    />

                    {touched[type] && errors[type] && (
                      <p className="text-sm text-red-500">{errors[type]}</p>
                    )}
                  </div>
                ))}
                {/* <div>
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
                    placeholder="Enter Para Type name"
                  />
                  {touched.amount && errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div> */}
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
