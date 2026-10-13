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
import { DIAMOND_TYPES, STATUS_CODE } from "@/lib/Constant";
import FilePicker from "@/components/FilePicker";

export default function ParameterModal({
  open,
  setOpen,
  GetParameterList,
  rowData,
  paraTypeId,
  setIsPrevImg,
  isPrevImg,
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
      parameterName: rowData?.name || "",
      code: rowData?.code || "",
      description: rowData?.description || "",
      sort: rowData?.sort || "",
      diamondType: rowData?.diamondType || "",
      acceptableValues: rowData?.synonyms?.join(",") || "",
      // API returns the saved file as `image` (full URL). Keep the legacy
      // `image1` fallback for older payloads that may still expose it.
      image1: rowData?.image || rowData?.image1 || "",
      isPrevImg: isPrevImg,
    },
    validationSchema: Yup.object({
      parameterName: Yup.string().required("Name is required"),
      code: Yup.string().required("Code is required"),
      // description: Yup.string().required("Description is required"),
      sort: Yup.string().required("Sort is required"),
      acceptableValues: Yup.string(),
      isPrevImg: Yup.boolean(),
      // image1: Yup.mixed().when("isPrevImg", {
      //   is: (value) => value == true,
      //   then: () =>
      //     Yup.mixed()
      //       .required("First Name is required")
      //       .test(
      //         "image1",
      //         "Unsupported file format",
      //         (file) => file && SUPPORTED_FORMATS.includes(file.type)
      //       ),
      //   otherwise: () => Yup.mixed().notRequired(),
      // }),
      // image1: Yup.mixed()
      //   .nullable()
      //   .test(
      //     "image1",
      //     "Unsupported file format",
      //     (file) => file && SUPPORTED_FORMATS.includes(file.type)
      //   ),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("type", paraTypeId);
      formdata.append("name", val.parameterName);
      if (val.diamondType) {
        formdata.append("diamondType", val.diamondType)
      }
      formdata.append("code", val.code);
      formdata.append("sort", val.sort);
      formdata.append("description", val.description);
      formdata.append("synonyms", val.acceptableValues);
      // Only attach `image1` when the user actually picked a new file.
      // Sending an existing URL string here would send a plain text field
      // (not a multer file), and the service-side guard keeps the saved
      // image intact when no new file arrives.
      if (val.image1 instanceof File) {
        formdata.append("image1", val.image1);
      }

      let url = `${API_URL?.CREATE_PARAMETER}/`;
      if (rowData?.id || rowData?._id) {
        url = `${API_URL?.UPDATE_PARAMETER}/${rowData?.id || rowData?._id}`;
      }
      callApi(url, rowData?.id || rowData?._id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetParameterList();
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
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Tailwind 4 removed `bg-opacity-*` utilities — express the
              translucency with /40 alpha so the page behind stays visible. */}
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[9999]" />

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
                {rowData?.id ? "Edit" : "Add"} Parameter
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
                  <label className="block text-sm font-medium">
                    Parameter Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="parameterName"
                    value={values.parameterName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Parameter Name"
                  />
                  {touched.parameterName && errors.parameterName && (
                    <p className="text-sm text-red-500">
                      {errors.parameterName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Code <span className="text-red-500">*</span>
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
                    <p className="text-sm text-red-500">
                      {errors.code}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    Diamond type
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    name="diamondType"
                    value={values.diamondType}
                    onChange={handleChange}
                  >
                    <option value={''} >Select Type</option>
                    {DIAMOND_TYPES.ALL_TYPES.map((value) => {
                      return (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                  {touched.diamondType && errors.diamondType && (
                    <p className="text-sm text-red-500">
                      {errors.diamondType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Description
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Parameter Name"
                  />
                  {touched.description && errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Sort<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="sort"
                    value={values.sort}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Sort"
                  />
                  {touched.sort && errors.sort && (
                    <p className="text-sm text-red-500">{errors.sort}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Synonyms</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="acceptableValues"
                    value={values.acceptableValues}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Synonyms"
                  />
                  {touched.acceptableValues && errors.acceptableValues && (
                    <p className="text-sm text-red-500">
                      {errors.acceptableValues}
                    </p>
                  )}
                </div>

                {isPrevImg && (
                  <div className="pt-2">
                    {/* `resetKey` makes the picker drop its blob preview whenever
                        the modal opens for a different row (or closes), so
                        editing one parameter no longer flashes the previously
                        selected file. `existingUrl` shows the saved image
                        until the user picks a new file. */}
                    <FilePicker
                      label="Image"
                      value={
                        values.image1 instanceof File ? values.image1 : ""
                      }
                      existingUrl={
                        typeof values.image1 === "string" ? values.image1 : ""
                      }
                      onChange={(next) => setFieldValue("image1", next)}
                      accept="image/*"
                      hint="PNG, JPG, WEBP, or SVG"
                      resetKey={`${open}-${rowData?._id || rowData?.id || "new"}`}
                    />
                    {touched.image1 && errors.image1 && (
                      <p className="text-sm text-red-500">{errors.image1}</p>
                    )}
                  </div>
                )}
                {/* <div>
                  <div className="mb-2">Is Menu </div>
                  <Switch
                    checked={ismenu == 1 ? true : false}
                    onCheckedChange={(value) => setismenu(value)}
                  />
                </div> */}
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
