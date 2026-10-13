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

export default function ParaTypeModal({
  open,
  setOpen,
  GetParaTypeList,
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
      paraTypeName: rowData?.name || "",
      type: rowData?.type || "",
      description: rowData?.description || "",
    },
    validationSchema: Yup.object({
      paraTypeName: Yup.string().required("Para Type name is required"),
      type: Yup.string().required("Type is required"),
      description: Yup.string().required("Description is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      console.log("vla--->", val);
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("paraTypeName", val.paraTypeName);
      formdata.append("type", val.type);
      formdata.append("description", val.description);

      let url = `${API_URL?.CREATE_PARA_TYPE}/`;
      if (rowData?.id) {
        url = `${API_URL?.UPDATE_PARA_TYPE}/${rowData?.id}`;
      }
      callApi(url, rowData?.id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetParaTypeList();
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
                {rowData?.id ? "Edit" : "Add"} Para Type
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
                    Paratype Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="paraTypeName"
                    value={values.paraTypeName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Para Type name"
                  />
                  {touched.paraTypeName && errors.paraTypeName && (
                    <p className="text-sm text-red-500">
                      {errors.paraTypeName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Description
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Description"
                  />
                  {touched.description && errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

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
                    <option value="">--- Select Type ---</option>
                    <option value="JEWELLERY">JEWELLERY</option>
                    <option value="DIAMOND">DIAMOND</option>
                  </select>
                  {touched.type && errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
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
