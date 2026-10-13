"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function AddNewModal({ open, setOpen, fetchData }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [mobileImageError, setMobileImageError] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const token = getToken();
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);

  // Validation Schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title must be less than 100 characters"),
    buttonTextLink1: Yup.string()
      .required("Link is required")
      .url("Please enter a valid URL"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      title: "",
      buttonTextLink1: "",
    },
    validationSchema,
    onSubmit: (values) => {
      createSession(values);
    },
  });

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setDesktopImageError("Only image files are allowed");
        setDesktopImagePreview(null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDesktopImageError("Image size must be less than 5MB");
        setDesktopImagePreview(null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 370 || img.height !== 410) {
          setDesktopImageError("Image must be 370x410px");
          setDesktopImagePreview(null);
          setDesktopImage(null);
          if (desktopImageRef.current) desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl); // Only revoke on error
        } else {
          setDesktopImageError("");
          setDesktopImagePreview(objectUrl);
          setDesktopImage(file);
        }
      };

      img.onerror = () => {
        setDesktopImageError("Failed to load image");
        setDesktopImagePreview(null);
        setDesktopImage(null);
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
        setMobileImageError("Only image files are allowed");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMobileImageError("Image size must be less than 5MB");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 370 || img.height !== 410) {
          setMobileImageError("Image must be 370x410px");
          setMobileImagePreview(null);
          setMobileImage(null);
          if (mobileImageRef.current) mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl); // Only revoke on error
        } else {
          setMobileImageError("");
          setMobileImagePreview(objectUrl);
          setMobileImage(file);
        }
      };

      img.onerror = () => {
        setMobileImageError("Failed to load image");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  const handleRemoveDesktopImage = () => {
    setDesktopImagePreview(null);
    setDesktopImage(null);
    setDesktopImageError("");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
  };

  const handleRemoveMobileImage = () => {
    setMobileImagePreview(null);
    setMobileImage(null);
    setMobileImageError("");
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  // Validate all fields and show first error in toast
  const validateAllFields = () => {
    const errors = [];

    // Validate formik fields
    formik.validateForm().then((formikErrors) => {
      Object.keys(formikErrors).forEach((key) => {
        errors.push(formikErrors[key]);
      });
    });

    // Validate image fields
    if (!deskTopImage) {
      errors.push("Please upload desktop image");
    }
    if (!mobileImage) {
      errors.push("Please upload mobile image");
    }
    if (desktopImageError) {
      errors.push(desktopImageError);
    }
    if (mobileImageError) {
      errors.push(mobileImageError);
    }

    // Show first error in toast
    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }

    return true;
  };

  const createSession = async (values) => {
    // Validate all fields before submission
    if (!validateAllFields()) {
      return;
    }

    const formData = new FormData();
    formData.append("buttonlink1", values.buttonTextLink1);
    formData.append("mobile_img", mobileImage);
    formData.append("sesstionName", "shop_by_category");
    formData.append("title", values.title);
    formData.append("image", deskTopImage);

    try {
      const result = await callApi(`${API_URL.CREATE_SESSION}`, "POST", formData, token);

      if (result.errorCode == STATUS_CODE.OK) {
        toast.success(result.message);
        setOpen(false);
        fetchData();
        ResetHandler();
      }
      return result;
    } catch (error) {
      console.error("Error creating session:", error.message);
      toast.error("Failed To Create Session");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  const ResetHandler = () => {
    setDesktopImageError("");
    setMobileImageError("");
    setDesktopImagePreview(null);
    setMobileImagePreview(null);
    setMobileImage(null);
    setDesktopImage(null);
    formik.resetForm();
    if (desktopImageRef.current) desktopImageRef.current.value = null;
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                Add New Slider
              </Dialog.Title>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={ResetHandler}
                  className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="title"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
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
                    className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${formik.touched.title && formik.errors.title
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {formik.errors.title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="buttonTextLink1"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Link
                  </label>
                  <input
                    type="text"
                    id="buttonTextLink1"
                    value={formik.values.buttonTextLink1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    name="buttonTextLink1"
                    placeholder="Enter Link"
                    className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1 && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {formik.errors.buttonTextLink1}
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1 relative">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 1 (Desktop View - 1920x768px)
                  </label>

                  {desktopImagePreview ? (
                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={desktopImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemoveDesktopImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => desktopImageRef.current.click()}
                      className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${!deskTopImage && formik.submitCount > 0
                        ? "border-red-500"
                        : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Drag or Upload Image
                        </div>
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
                  {desktopImageError && (
                    <div className="text-red-500 absolute text-[0.8rem] mt-1">
                      {desktopImageError}
                    </div>
                  )}
                  {!deskTopImage && formik.submitCount > 0 && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      Desktop image is required
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex-1 relative">
                    <label className="block text-[0.80rem] font-semibold mb-2">
                      Image 2 (Mobile View - 768x800px)
                    </label>

                    {mobileImagePreview ? (
                      <div className="relative w-full h-32 border rounded-md overflow-hidden">
                        <img
                          src={mobileImagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                          onClick={handleRemoveMobileImage}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => mobileImageRef.current.click()}
                        className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${!mobileImage && formik.submitCount > 0
                          ? "border-red-500"
                          : ""
                          }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={`${PREFIX}/cloudComputing.svg`}
                            height={20}
                            width={20}
                            alt="uploadicon"
                          />
                          <div className="text-[#656B7B] text-[0.80rem]">
                            Drag or Upload Image
                          </div>
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
                    {mobileImageError && (
                      <div className="text-red-500 absolute text-[0.8rem] mt-1">
                        {mobileImageError}
                      </div>
                    )}
                    {!mobileImage && formik.submitCount > 0 && (
                      <div className="text-red-500 text-[0.75rem] mt-1">
                        Mobile image is required
                      </div>
                    )}
                  </div>
                </div>
              </div> */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 1 (Desktop View - 370x410px, Max 5MB)
                  </label>

                  {desktopImagePreview ? (
                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={desktopImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemoveDesktopImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => desktopImageRef.current.click()}
                      className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${(!deskTopImage && formik.submitCount > 0) || desktopImageError
                        ? "border-red-500"
                        : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Drag or Upload Image
                        </div>
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
                  {desktopImageError && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {desktopImageError}
                    </div>
                  )}
                  {!deskTopImage && !desktopImageError && formik.submitCount > 0 && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      Desktop image is required
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 2 (Mobile View - 370x410px, Max 5MB)
                  </label>
                  {console.log('mobileImagePreview --->>', mobileImagePreview)}
                  {mobileImagePreview ? (
                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={mobileImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemoveMobileImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => mobileImageRef.current.click()}
                      className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${(!mobileImage && formik.submitCount > 0) || mobileImageError
                        ? "border-red-500"
                        : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Drag or Upload Image
                        </div>
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
                  {mobileImageError && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {mobileImageError}
                    </div>
                  )}
                  {!mobileImage && !mobileImageError && formik.submitCount > 0 && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      Mobile image is required
                    </div>
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