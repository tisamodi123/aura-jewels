"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function UpdateSession({ open, setOpen, data, refetchFn }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [mobileImageError, setMobileImageError] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const token = getToken();
  const [title, setTitle] = useState(data.title || "");
  const [subtitle, setsubTitle] = useState(data.subTitle || "");
  const [buttonText1, setButtonText1] = useState(data.buttontext1 || "");
  const [buttonText2, setButtonText2] = useState(data.buttontext2 || "");
  const [buttonTextLink1, setButtonTextLink1] = useState(
    data.buttonlink1 || ""
  );
  const [buttonTextLink2, setButtonTextLink2] = useState(
    data.buttonlink2 || ""
  );
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);
  console.log("edited data", data);

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
        if (img.width !== 1920 || img.height !== 768) {
          setDesktopImageError("Image must be 1920x768px");
          setDesktopImagePreview(null); // Clear preview if invalid
          if (desktopImageRef.current) desktopImageRef.current.value = null; // Reset file input
          URL.revokeObjectURL(objectUrl);
        } else {
          setDesktopImageError("");
          setDesktopImagePreview(objectUrl); // Set preview only if valid
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
        if (img.width !== 768 || img.height !== 800) {
          setMobileImageError("Image must be 768x800px");
          setMobileImagePreview(null);
          if (mobileImageRef.current) mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
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
    setDesktopImageError("");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
  };

  const handleRemoveMobileImage = () => {
    setMobileImagePreview(null);
    setMobileImageError("");
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  const updateSession = async (mobileImgFile) => {
    const formData = new FormData();

    // Append form fields

    formData.append("title", title);
    formData.append("subTitle", subtitle);

    try {
      const result = await callApi(`${API_URL.UPDATE_SESSION}/${data.id}`, "PUT", formData, token);

      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result.message || "Updated Successfully");
        setOpen(false);
        refetchFn();
      }
      return result;
    } catch (error) {
      console.error("Error creating session:", error.message);
    }
  };

  const ResetHandler = () => {
    setDesktopImageError("");
    setMobileImageError("");
    setDesktopImagePreview(null);
    setMobileImagePreview(null);
    setMobileImage(null);
    setDesktopImage(null);
    setTitle("");
    setsubTitle("");
    setButtonText1("");
    setButtonText2("");
    setButtonTextLink1("");
    setButtonTextLink2("");
  };
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Edit Slider
              </Dialog.Title>

              <div className="flex gap-2">
                <div
                  onClick={ResetHandler}
                  className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Reset
                </div>
                <div
                  onClick={updateSession}
                  className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Save
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              {/* Title - Subtitle */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Sub Title
                  </label>
                  <input
                    type="text"
                    id="clarity"
                    value={subtitle}
                    onChange={(e) => setsubTitle(e.target.value)}
                    name="clarity"
                    placeholder="Enter Sub Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
