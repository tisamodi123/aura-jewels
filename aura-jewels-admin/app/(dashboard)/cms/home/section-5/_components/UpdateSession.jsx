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

  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);

  console.log(mobileImage, deskTopImage);

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      toast.error("Please select a valid video file.");
    }
  };

  const updateSession = async (mobileImgFile) => {
    const formData = new FormData();

    // Append form fields
    formData.append("buttonlink1", buttonTextLink1);
    formData.append("sesstionName", "sesstion_5");
    formData.append("buttontext1", buttonText1);
    formData.append("title", title);
    formData.append("subTitle", subtitle);
    formData.append("video", videoFile);

    try {
      const result = await callApi(`${API_URL.UPDATE_SESSION}/${data.id}`, "PUT", formData, token);

      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result.message || "Updated Successfully");
        refetchFn();
        setOpen(false);
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
                Add New Slider
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
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Link 1
                  </label>
                  <input
                    type="text"
                    id="clarity"
                    name="clarity"
                    value={buttonTextLink1}
                    onChange={(e) => setButtonTextLink1(e.target.value)}
                    placeholder="Enter Button Link"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Video Upload */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1 relative">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Upload Video
                  </label>

                  <div
                    onClick={() => videoRef.current.click()}
                    className="flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={`${PREFIX}/cloudComputing.svg`}
                        height={20}
                        width={20}
                        alt="uploadicon"
                      />
                      <div className="text-[#656B7B] text-[0.80rem]">
                        {videoFile ? (
                          <span className="flex items-center gap-1">
                            <span> {videoFile.name}</span>
                            <span onClick={() => setVideoFile(null)}>
                              <X size={12} />
                            </span>
                          </span>
                        ) : (
                          "Click to Upload Video"
                        )}
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="video/*"
                    ref={videoRef}
                    onChange={handleVideoChange}
                    className="hidden"
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
