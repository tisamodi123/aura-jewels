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
  const [title, setTitle] = useState("");
  const [subtitle, setsubTitle] = useState("");
  const [buttonText1, setButtonText1] = useState("");
  const [buttonText2, setButtonText2] = useState("");
  const [buttonTextLink1, setButtonTextLink1] = useState("");
  const [buttonTextLink2, setButtonTextLink2] = useState("");
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);
  console.log(mobileImage, deskTopImage);

  const createSession = async (mobileImgFile) => {
    const formData = new FormData();

    // Append form fields

    formData.append("sesstionName", "sesstion_4");
    formData.append("title", title);
    formData.append("subTitle", subtitle);

    try {
      const result = await callApi(`${API_URL.CREATE_SESSION}`, "POST", formData, token);

      if (result.errorCode == STATUS_CODE.OK) {
        toast.success(result.message);
        setOpen(false);
        fetchData();
      }
      return result;
    } catch (error) {
      console.log("Error creating session:", error.message);
      toast.error("Failed To Create Session");
    }
  };

  const ResetHandler = () => {
    setTitle("");
    setsubTitle("");
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
                  onClick={createSession}
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
              </div>
              <div className="flex gap-6 mb-6 mt-4 items-center">
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
