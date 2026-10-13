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

export default function UpdateSection({ open, setOpen, data, refetchFn }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [mobileImageError, setMobileImageError] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(data.image || null);
  const [mobileImagePreview, setMobileImagePreview] = useState(data.mobile_img || null);
  const [mobileImage, setMobileImage] = useState(null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const token = getToken();
  const [status, setStatus] = useState(data?.status || "ACTIVE");
  const [title, setTitle] = useState(data.title || "");
  const [subtitle, setsubTitle] = useState(data.subTitle || "");
  const [description, setDescription] = useState(data.description || "");
  const [textposition, setTextposition] = useState(data.textposition || "");
  const [buttonText1, setButtonText1] = useState(data.buttontext1 || "");
  const [buttonText2, setButtonText2] = useState(data.buttontext2 || "");
  const [buttonTextLink1, setButtonTextLink1] = useState(data.buttonlink1 || "");
  const [buttonTextLink2, setButtonTextLink2] = useState(data.buttonlink2 || "");
  const [redirect1, setRedirect1] = useState(data.redirect1 || { type: "none" });
  const [mediaType, setMediaType] = useState(data.video ? "video" : "image");
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(data.video || null);
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);
  const videoRef = useRef(null);
  const desktopBlobUrlRef = useRef(null);
  const mobileBlobUrlRef = useRef(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (desktopBlobUrlRef.current) {
        URL.revokeObjectURL(desktopBlobUrlRef.current);
      }
      if (mobileBlobUrlRef.current) {
        URL.revokeObjectURL(mobileBlobUrlRef.current);
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
        desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDesktopImageError("Image size must be less than 5MB");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        desktopImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 1585 || img.height !== 350) {
          setDesktopImageError("Image must be 1585×350px");
          setDesktopImagePreview(data.image || null);
          setDesktopImage(null);
          desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setDesktopImageError("");
          // Revoke previous blob URL before creating new one
          if (desktopBlobUrlRef.current) {
            URL.revokeObjectURL(desktopBlobUrlRef.current);
          }
          desktopBlobUrlRef.current = objectUrl;
          setDesktopImagePreview(objectUrl);
          setDesktopImage(file);
        }
      };

      img.src = objectUrl;
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);
      setVideo(file);
    }
  };

  const handleRemoveVideo = () => {
    setVideoPreview(null);
    setVideo(null);
    if (videoRef.current) videoRef.current.value = null;
  };

  const handleMobileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMobileImageError("Only image files are allowed");
        setMobileImagePreview(data.mobile_img || null);
        setMobileImage(null);
        mobileImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMobileImageError("Image size must be less than 5MB");
        setMobileImagePreview(data.mobile_img || null);
        setMobileImage(null);
        mobileImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 375 || img.height !== 280) {
          setMobileImageError("Image must be 375x280px");
          setMobileImagePreview(data.mobile_img || null);
          setMobileImage(null);
          mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setMobileImageError("");
          // Revoke previous blob URL before creating new one
          if (mobileBlobUrlRef.current) {
            URL.revokeObjectURL(mobileBlobUrlRef.current);
          }
          mobileBlobUrlRef.current = objectUrl;
          setMobileImagePreview(objectUrl);
          setMobileImage(file);
        }
      };

      img.src = objectUrl;
    }
  };

  const UpdateSection = async () => {
    const formData = new FormData();

    formData.append("buttonlink1", buttonTextLink1);
    formData.append("redirect1", JSON.stringify(redirect1 || { type: "none" }));
    formData.append("buttonlink2", buttonTextLink2);
    formData.append("sectionName", "hero-banner");
    formData.append("status", status);
    formData.append("buttontext1", buttonText1);
    formData.append("buttontext2", buttonText2);
    formData.append("title", title);
    formData.append("subTitle", subtitle);
    formData.append("description", description);
    formData.append("textposition", textposition);

    if (mobileImage) formData.append("mobile_img", mobileImage);

    if (mediaType === "image" && deskTopImage) {
      formData.append("image", deskTopImage);
    } else if (mediaType === "video" && video) {
      formData.append("video", video);
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
    setMobileImageError("");

    // Revoke blob URLs when resetting
    if (desktopBlobUrlRef.current) {
      URL.revokeObjectURL(desktopBlobUrlRef.current);
      desktopBlobUrlRef.current = null;
    }
    if (mobileBlobUrlRef.current) {
      URL.revokeObjectURL(mobileBlobUrlRef.current);
      mobileBlobUrlRef.current = null;
    }

    setDesktopImagePreview(data.image || null);
    setMobileImagePreview(data.mobile_img || null);
    setMobileImage(null);
    setDesktopImage(null);
    setTitle(data.title || "");
    setsubTitle(data.subTitle || "");
    setDescription(data.description || "");
    setTextposition(data.textposition || "");
    setButtonText1(data.buttontext1 || "");
    setButtonText2(data.buttontext2 || "");
    setButtonTextLink1(data.buttonlink1 || "");
    setButtonTextLink2(data.buttonlink2 || "");
    setMediaType(data.video ? "video" : "image");
    setVideoPreview(data.video || null);
    setVideo(null);
    if (desktopImageRef.current) desktopImageRef.current.value = null;
    if (mobileImageRef.current) mobileImageRef.current.value = null;
    if (videoRef.current) videoRef.current.value = null;
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
                Edit (Hero Banner)
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
              {/* First Button Text/Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text 1
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={buttonText1}
                    onChange={(e) => setButtonText1(e.target.value)}
                    name="title"
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Button Link 1
                  </label>
                  <RedirectPicker value={redirect1} onChange={setRedirect1} label="" />
                </div>
              </div>

              {/* Description and Text Position */}
              <div className="flex gap-6 mb-6 mt-4 items-start">
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
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="textposition"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Text Position
                  </label>
                  <select
                    id="textposition"
                    name="textposition"
                    value={textposition}
                    onChange={(e) => setTextposition(e.target.value)}
                    className="w-full px-3 py-2 border text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Button Position</option>
                    <option value="top-left">Top-Left</option>
                    <option value="top-center">Top-Center</option>
                    <option value="top-right">Top-Right</option>
                    <option value="center-left">Center-Left</option>
                    <option value="center-center">Center-Center</option>
                    <option value="center-right">Center-Right</option>
                    <option value="buttom-left">Buttom-Left</option>
                    <option value="buttom-center">Buttom-Center</option>
                    <option value="buttom-right">Buttom-Right</option>
                  </select>
                </div>
              </div>

              {/* Media Type Selection */}
              <div className="flex gap-6 mb-4 mt-4 items-center">
                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Desktop Media Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-[0.80rem]">
                      <input
                        type="radio"
                        name="mediaType"
                        value="image"
                        checked={mediaType === "image"}
                        onChange={() => setMediaType("image")}
                      />
                      Image
                    </label>
                    <label className="flex items-center gap-2 text-[0.80rem]">
                      <input
                        type="radio"
                        name="mediaType"
                        value="video"
                        checked={mediaType === "video"}
                        onChange={() => setMediaType("video")}
                      />
                      Video
                    </label>
                  </div>
                </div>
              </div>

              {/* DeskTop and Mobile Image */}
              <div className="flex gap-6 mb-6 mt-4 items-start">
                <div className="flex-1 relative">
                  {mediaType === "image" ? (
                    <>
                      <label className="block text-[0.80rem] font-semibold mb-2">
                        Image 1 (Desktop View - 1585×350px, Max 5MB)
                      </label>

                      <div className="flex gap-4 items-start">
                        <div
                          onClick={() => desktopImageRef.current.click()}
                          className="flex border border-dashed rounded-md justify-center items-center h-32 w-full cursor-pointer flex-shrink-0"
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
                        <div className="w-full mt-6 h-32 border rounded-md overflow-hidden">
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
                  ) : (
                    <>
                      <label className="block text-[0.80rem] font-semibold mb-2">
                        Video (Desktop View)
                      </label>

                      <div className="flex gap-4 items-start">
                        <div
                          onClick={() => videoRef.current.click()}
                          className="flex border border-dashed rounded-md justify-center items-center h-32 w-full cursor-pointer flex-shrink-0"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={`${PREFIX}/cloudComputing.svg`}
                              height={20}
                              width={20}
                              alt="uploadicon"
                            />
                            <div className="text-[#656B7B] text-[0.80rem]">
                              Upload Video
                            </div>
                          </div>
                        </div>
                      </div>

                      {videoPreview && (
                        <div className="w-full mt-6 h-32 border rounded-md overflow-hidden bg-black relative">
                          <video
                            src={videoPreview}
                            className="object-contain w-full h-full"
                            controls
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded z-10"
                            onClick={handleRemoveVideo}
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="video/*"
                        ref={videoRef}
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                <div className="flex-1 relative">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 2 (Mobile View - 375x280px, Max 5MB)
                  </label>

                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => mobileImageRef.current.click()}
                      className="flex w-full border border-dashed rounded-md justify-center items-center h-32  cursor-pointer flex-shrink-0"
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
                  {mobileImageError && (
                    <div className="text-red-500  absolute text-[0.8rem] mt-1">
                      {mobileImageError}
                    </div>
                  )}
                  {mobileImagePreview && (
                    <div className="w-full h-32 mt-6 border rounded-md overflow-hidden">
                      <img
                        src={mobileImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={mobileImageRef}
                    onChange={handleMobileChange}
                    className="hidden"
                  />
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
