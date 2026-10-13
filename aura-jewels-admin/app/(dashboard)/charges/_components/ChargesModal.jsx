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
import { CHARGES_MODE, CHARGES_TYPE, STATUS_CODE } from "@/lib/Constant";

export default function ChargesModal({
  open,
  setOpen,
  GetChargeList,
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
      type: rowData?.type || "",
      name: rowData?.name || "",
      code: rowData?.code || "",
      amount_per_gm: rowData?.amount_per_gm || 0,
      min_amount: rowData?.min_amount || 0,
      charge_mode: rowData?.charge_mode || "dynamic",
      // remark: rowData?.remark || "",
    },
    validationSchema: Yup.object({
      type: Yup.string().required("Type is required"),
      name: Yup.string().required("Name is required"),
      code: Yup.string().required("Code is required"),
      amount_per_gm: Yup.number().min(0, "Amount cannot be negative"),
      min_amount: Yup.number().min(0, "Minimum Amount cannot be negative"),
      charge_mode: Yup.string().required("Charge Mode is required"),
      // remark: Yup.string().required("remark is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("type", val.type);
      formdata.append("name", val.name);
      formdata.append("code", val.code);
      formdata.append("amount_per_gm", val.amount_per_gm);
      formdata.append("min_amount", val.min_amount);
      formdata.append("charge_mode", val.charge_mode);
      // formdata.append("remark", val.remark);

      let url = `${API_URL?.CREATE_CHARGE}`;
      if (rowData?.id || rowData?._id) {
        url = `${API_URL?.UPDATE_CHARGE}/${rowData?.id || rowData?._id}`;
      }
      callApi(url, rowData?.id || rowData?._id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetChargeList();
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
                {rowData?.id || rowData?._id ? "Edit" : "Add"} Charge
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
                <div>
                  <label className="block text-sm font-medium ">
                    Type<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Field</option>
                    {CHARGES_TYPE.ALL_TYPE.map((value) => {
                      return (
                        <option key={value} value={value} className="capitalize">
                          {value}
                        </option>
                      );
                    })}
                  </select>
                  {touched.type && errors.type && (
                    <p className="text-sm text-red-500">
                      {errors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Charge Mode<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    name="charge_mode"
                    value={values.charge_mode}
                    onChange={(e) => {
                      const mode = e.target.value;
                      setFieldValue("charge_mode", mode);
                    }}
                  >
                    <option value="">Select Charge Mode</option>
                    {CHARGES_MODE.ALL_TYPE.map((value) => {
                      return (
                        <option key={value} value={value} className="capitalize">
                          {value}
                        </option>
                      );
                    })}
                  </select>
                  {touched.charge_mode && errors.charge_mode && (
                    <p className="text-sm text-red-500">
                      {errors.charge_mode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Name"
                  />
                  {touched.name && errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Code"
                  />
                  {touched.code && errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Amount Per Gram<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="amount_per_gm"
                    value={values.amount_per_gm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Amount"
                  />
                  {touched.amount_per_gm && errors.amount_per_gm && (
                    <p className="text-sm text-red-500">{errors.amount_per_gm}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    Minimum Amount<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="min_amount"
                    value={values.min_amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Minimum Amount"
                  />
                  {touched.min_amount && errors.min_amount && (
                    <p className="text-sm text-red-500">{errors.min_amount}</p>
                  )}
                </div>

                {/* <div>
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
                </div> */}
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
