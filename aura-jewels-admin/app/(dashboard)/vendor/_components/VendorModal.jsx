"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

export default function VendorModal({
  open,
  setOpen,
  GetVendorList,
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
      firstName: rowData?.firstName || "",
      lastName: rowData?.lastName || "",
      email: rowData?.email || "",
      phone: rowData?.phone ? String(rowData.phone) : "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().min(3).required("First Name is required"),
      lastName: Yup.string().min(3).required("Last Name is required"),
      phone: Yup.string()
        .required("Phone No is required")
        .test("len", "Phone Number is invalid", (val) => val && val.replace(/\D/g, "").length >= 10),
      email: Yup.string().email().required("Please Enter Email."),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("firstName", val.firstName);
      formdata.append("lastName", val.lastName);
      formdata.append("email", val.email);
      formdata.append("phone", val.phone ? Number(String(val.phone).replace(/\D/g, "")) : "");

      let url = `${API_URL?.CREATE_VENDOR}/`;
      if (rowData?.id) {
        url = `${API_URL?.UPDATE_VENDOR}/${rowData?.id}`;
      }
      callApi(url, rowData?.id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetVendorList();
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
                {rowData?.id ? "Edit" : "Add"} Vendor
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
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Para Type name"
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Para Type name"
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Para Type name"
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Phone</label>
                  <PhoneInput
                    enableSearch={true}
                    country={"in"}
                    value={values.phone}
                    onChange={(phone) => setFieldValue("phone", phone)}
                    placeholder="Enter phone"
                    inputStyle={{
                      width: "100%",
                      height: "38px",
                      fontSize: "0.80rem",
                      borderColor: "#D1D5DB",
                      borderRadius: "0.375rem",
                    }}
                    buttonStyle={{
                      borderColor: "#D1D5DB",
                      backgroundColor: "#ffffff",
                      borderTopLeftRadius: "0.375rem",
                      borderBottomLeftRadius: "0.375rem",
                    }}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
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
