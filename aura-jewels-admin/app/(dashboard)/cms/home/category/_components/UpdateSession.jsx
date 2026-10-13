"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { useRef, useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  buttonTextLink1: Yup.string().required("Link is required"),
  desktopImage: Yup.mixed().required("Desktop image is required"),
  mobileImage: Yup.mixed().required("Mobile image is required"),
});

export default function UpdateSession({ open, setOpen, data = {}, refetchFn }) {
  const token = getToken();
  const [desktopImagePreview, setDesktopImagePreview] = useState(data?.image || null);
  const [mobileImagePreview, setMobileImagePreview] = useState(data?.mobile_img || null);
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      title: data.title || "",
      buttonTextLink1: data.buttonlink1 || "",
      desktopImage: data?.image || null,
      mobileImage: data?.mobile_img || null
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("buttonlink1", values.buttonTextLink1);
      formData.append("sesstionName", "shop_by_category");
      formData.append("title", values.title);
      formData.append("mobile_img", values.mobileImage);
      formData.append("image", values.desktopImage);

      try {
        const result = await callApi(`${API_URL.UPDATE_SESSION}/${data.id}`, "PUT", formData, token);
        if (result?.errorCode == STATUS_CODE.OK) {
          toast.success(result.message || "Updated Successfully");
          setOpen(false);
          refetchFn();
        }
      } catch (error) {
        toast.error("Update failed");
      }
    },
  });

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        formik.setFieldTouched("desktopImage", true, false);
        formik.setFieldValue("desktopImage", null, false);
        formik.setFieldError("desktopImage", "Only image files are allowed");
        setDesktopImagePreview(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        formik.setFieldTouched("desktopImage", true, false);
        formik.setFieldValue("desktopImage", null, false);
        formik.setFieldError("desktopImage", "Image size must be less than 5MB");
        setDesktopImagePreview(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }

      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 370 || img.height !== 410) {
          formik.setFieldTouched("desktopImage", true, false);
          formik.setFieldValue("desktopImage", null, false);
          formik.setFieldError("desktopImage", "Image must be 370x410px");
          setDesktopImagePreview(null);
          if (desktopImageRef.current) desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          formik.setFieldTouched("desktopImage", true, false);
          formik.setFieldValue("desktopImage", file, false);
          formik.setFieldError("desktopImage", undefined);
          setDesktopImagePreview(objectUrl);
        }
      };

      img.onerror = () => {
        formik.setFieldTouched("desktopImage", true, false);
        formik.setFieldError("desktopImage", "Invalid image file");
        setDesktopImagePreview(null);
        formik.setFieldValue("desktopImage", null, false);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  const handleMobileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        formik.setFieldTouched("mobileImage", true, false);
        formik.setFieldValue("mobileImage", null, false);
        formik.setFieldError("mobileImage", "Only image files are allowed");
        setMobileImagePreview(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        formik.setFieldTouched("mobileImage", true, false);
        formik.setFieldValue("mobileImage", null, false);
        formik.setFieldError("mobileImage", "Image size must be less than 5MB");
        setMobileImagePreview(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }

      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 370 || img.height !== 410) {
          formik.setFieldTouched("mobileImage", true, false);
          formik.setFieldValue("mobileImage", null, false);
          formik.setFieldError("mobileImage", "Image must be 370x410px");
          setMobileImagePreview(null);
          if (mobileImageRef.current) mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          formik.setFieldTouched("mobileImage", true, false);
          formik.setFieldValue("mobileImage", file, false);
          formik.setFieldError("mobileImage", undefined);
          setMobileImagePreview(objectUrl);
        }
      };

      img.onerror = () => {
        formik.setFieldTouched("mobileImage", true, false);
        formik.setFieldError("mobileImage", "Invalid image file");
        setMobileImagePreview(null);
        formik.setFieldValue("mobileImage", null, false);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (desktopImagePreview && desktopImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(desktopImagePreview);
      }
      if (mobileImagePreview && mobileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(mobileImagePreview);
      }
    };
  }, [desktopImagePreview, mobileImagePreview]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data" onSubmit={formik.handleSubmit}>
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Edit Slider
              </Dialog.Title>
              <button
                type="reset"
                onClick={() => {
                  formik.handleReset();
                  setDesktopImagePreview(data?.image || null);
                  setMobileImagePreview(data?.mobile_img || null);
                }}
                className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem] ml-2"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem] ml-2"
              >
                Save
              </button>
            </div>
            {/* Title input */}
            <div className="mb-6 mt-4">
              <label className="block text-[0.80rem] font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Title"
                className={`w-full px-3 py-2 border ${formik.touched.title && formik.errors.title ? "border-red-500" : "border-[#E4E8EE]"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[0.80rem]`}
              />
              {formik.touched.title && formik.errors.title && (
                <div className="text-red-500 text-[0.8rem] mt-1">{formik.errors.title}</div>
              )}
            </div>
            {/* Link input */}
            <div className="mb-6 mt-4">
              <label className="block text-[0.80rem] font-semibold mb-2">
                Link
              </label>
              <input
                type="text"
                id="buttonTextLink1"
                name="buttonTextLink1"
                value={formik.values.buttonTextLink1}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Link"
                className={`w-full px-3 py-2 border ${formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1 ? "border-red-500" : "border-[#E4E8EE]"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[0.80rem]`}
              />
              {formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1 && (
                <div className="text-red-500 text-[0.8rem] mt-1">{formik.errors.buttonTextLink1}</div>
              )}
            </div>
            {/* Image fields */}
            <div className="flex gap-6 mb-6 mt-4">
              {/* Desktop image */}
              <div className="flex-1">
                <label className="block text-[0.80rem] font-semibold mb-2">
                  Image 1 (Desktop View - 370x410px, Max 5MB)
                </label>
                {desktopImagePreview ? (
                  <div className="relative w-full h-32 border rounded-md overflow-hidden">
                    <img src={desktopImagePreview} alt="Preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      onClick={() => {
                        if (desktopImagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(desktopImagePreview);
                        }
                        setDesktopImagePreview(null);
                        if (desktopImageRef.current) desktopImageRef.current.value = null;
                        formik.setFieldValue("desktopImage", null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => desktopImageRef.current.click()}
                    className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${formik.touched.desktopImage && formik.errors.desktopImage ? "border-red-500" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img src={`${PREFIX}/cloudComputing.svg`} height={20} width={20} alt="uploadicon" />
                      <div className="text-[#656B7B] text-[0.80rem]">Drag or Upload Image</div>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={desktopImageRef}
                  onChange={handleDesktopChange}
                  className="hidden"
                />
                {formik.touched.desktopImage && formik.errors.desktopImage && (
                  <div className="text-red-500 text-[0.8rem] mt-1">{formik.errors.desktopImage}</div>
                )}
              </div>
              {/* Mobile image */}
              <div className="flex-1">
                <label className="block text-[0.80rem] font-semibold mb-2">
                  Image 2 (Mobile View - 370x410px, Max 5MB)
                </label>
                {mobileImagePreview ? (
                  <div className="relative w-full h-32 border rounded-md overflow-hidden">
                    <img src={mobileImagePreview} alt="Preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      onClick={() => {
                        if (mobileImagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(mobileImagePreview);
                        }
                        setMobileImagePreview(null);
                        if (mobileImageRef.current) mobileImageRef.current.value = null;
                        formik.setFieldValue("mobileImage", null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => mobileImageRef.current.click()}
                    className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${formik.touched.mobileImage && formik.errors.mobileImage ? "border-red-500" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img src={`${PREFIX}/cloudComputing.svg`} height={20} width={20} alt="uploadicon" />
                      <div className="text-[#656B7B] text-[0.80rem]">Drag or Upload Image</div>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={mobileImageRef}
                  onChange={handleMobileChange}
                  className="hidden"
                />
                {formik.touched.mobileImage && formik.errors.mobileImage && (
                  <div className="text-red-500 text-[0.8rem] mt-1">{formik.errors.mobileImage}</div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
