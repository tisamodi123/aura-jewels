"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RedirectPicker from "@/components/redirect/RedirectPicker";

export default function UpdateSection({ open, setOpen, data, refetchFn, categories }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [categoryId, setCategoryId] = useState(data.CategoryId || data.categoryId || "");
  const [desktopImagePreview, setDesktopImagePreview] = useState(data.image || null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const token = getToken();
  const [status, setStatus] = useState(data?.status || "ACTIVE");
  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");
  const [subtitle, setsubTitle] = useState(data.subTitle || "");
  const [buttonText1, setButtonText1] = useState(data.buttontext1 || "");
  const [buttonTextLink1, setButtonTextLink1] = useState(data.buttonlink1 || "");
  const [redirect1, setRedirect1] = useState(data.redirect1 || { type: "none" });
  const [submitted, setSubmitted] = useState(false);
  const desktopImageRef = useRef(null);
  const desktopBlobUrlRef = useRef(null);

  // Cleanup blob URLs on unmount
  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (desktopBlobUrlRef.current) {
        URL.revokeObjectURL(desktopBlobUrlRef.current);
      }
    };
  }, []);

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setDesktopImageError("Only image files are allowed");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDesktopImageError("Image size must be less than 5MB");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 793 || img.height !== 400) {
          setDesktopImageError("Image must be 793×400px");
          setDesktopImagePreview(data.image || null);
          setDesktopImage(null);
          if (desktopImageRef.current) desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          // Revoke previous blob URL before creating new one
          if (desktopBlobUrlRef.current) {
            URL.revokeObjectURL(desktopBlobUrlRef.current);
          }
          desktopBlobUrlRef.current = objectUrl;
          setDesktopImageError("");
          setDesktopImagePreview(objectUrl);
          setDesktopImage(file);
        }
      };

      img.onerror = () => {
        setDesktopImageError("Failed to load image");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
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

  const UpdateSection = async () => {
    setSubmitted(true);
    if (desktopImageError) {
      toast.error("Please fix image dimension errors");
      return;
    }
    const formData = new FormData();

    formData.append("sectionName", "custom-cta");
    formData.append("status", status);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("buttontext1", buttonText1);
    formData.append("buttonlink1", buttonTextLink1);
    formData.append("redirect1", JSON.stringify(redirect1 || { type: "none" }));

    if (categoryId) {
      formData.append("CategoryId", categoryId);
    }

    if (deskTopImage) {
      formData.append("image", deskTopImage);
    }

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);

    try {
      const response = await fetch(`${API_URL.UPDATE_LANDING_BANNER}${data.id}`, {
        method: "PUT",
        headers,
        body: formData,
      });

      const result = await response.json();
      if (result?.errorCode == 200) {
        toast.success(result.message || "Updated Successfully");
        refetchFn();
        setOpen(false);
      }
      return result;
    } catch (error) {
      console.log("Error creating section:", error.message);
    }
  };

  const ResetHandler = () => {
    setDesktopImageError("");
    // Revoke blob URLs when resetting
    if (desktopBlobUrlRef.current) {
      URL.revokeObjectURL(desktopBlobUrlRef.current);
      desktopBlobUrlRef.current = null;
    }

    setTitle(data.title || "");
    setDescription(data.description || "");
    setButtonText1(data.buttontext1 || "");
    setButtonTextLink1(data.buttonlink1 || "");
    setDesktopImagePreview(data.image || null);
    setDesktopImage(null);
    setCategoryId(data.CategoryId || data.categoryId || "");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
    setSubmitted(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 z-[9999] bg-[#00000066] bg-opacity-40 " />

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
                Edit (Custom CTA (You Imagine We Create))
              </Dialog.Title>

              <div className="flex gap-2">
                <div
                  onClick={ResetHandler}
                  className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Reset
                </div>
                <div
                  onClick={UpdateSection}
                  className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Save
                </div>
              </div>
            </div>

            <div>
              {/* Category Selection */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label className={`block text-[0.80rem] font-semibold mb-2 ${submitted && !categoryId ? "text-red-500" : ""}`}>
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`w-full px-3 py-2 border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      submitted && !categoryId ? "border-red-500 text-red-500" : "border-[#E4E8EE] text-black"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="description"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter Description"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
                  />
                </div>
              </div>

              {/* Button Text */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="buttonText1"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text
                  </label>
                  <input
                    type="text"
                    id="buttonText1"
                    name="buttonText1"
                    value={buttonText1}
                    onChange={(e) => setButtonText1(e.target.value)}
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Button Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">Button Link</label>
                  <RedirectPicker value={redirect1} onChange={setRedirect1} label="" />
                </div>
              </div>
              {/* DeskTop Image */}
              <div className="flex gap-6 mb-6 mt-4 items-start">
                <div className="flex-1">
                  <>
                    <label className="block text-[0.80rem] font-semibold mb-2">
                      Image (Desktop View - 793×400px, Max 5MB)
                    </label>

                    <div className="flex gap-4 items-start">
                      <div
                        onClick={() => desktopImageRef.current.click()}
                        className={`flex border border-dashed rounded-md justify-center items-center w-[313px] h-32 cursor-pointer flex-shrink-0 ${desktopImageError ? "border-red-500" : ""}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={`${PREFIX}/cloudComputing.svg`}
                            height={20}
                            width={20}
                            alt="uploadicon"
                          />
                          <div className="text-[#656B7B] text-[0.80rem]">
                            Upload
                          </div>
                        </div>
                      </div>
                    </div>
                    {desktopImageError && (
                      <div className="text-red-500 absolute text-[0.8rem] mt-1">
                        {desktopImageError}
                      </div>
                    )}

                    {desktopImagePreview && (
                      <div className="w-[313px] mt-6 h-32 border rounded-md overflow-hidden">
                        <img
                          src={desktopImagePreview}
                          alt="Preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      ref={desktopImageRef}
                      onChange={handleDesktopChange}
                      className="hidden"
                    />
                  </>
                </div>
              </div>
            </div>
              {/* Status */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label htmlFor="status" className="block text-[0.80rem] font-semibold mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
          
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
