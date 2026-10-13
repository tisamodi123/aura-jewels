"use client";

import QuillEditor from "@/components/textEditor";
import { Button } from "@/components/ui/button";
import { PREFIX } from "@/lib/APIUrl";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function ShippingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState("");
  const [description, setDescription] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [desktopImageError, setDesktopImageError] = useState("");
  const [isSuccess, setIsSuccess] = useState(0);
  const [isImport, setIsImport] = useState(false);
  const [diaType, setDiaType] = useState("Natural");
  const [uploadLoader, setUploadLoader] = useState(false);
  const token = getToken();
  const desktopImageRef = useRef(null);
  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles(file);
    } else {
      toast.error(M.validation.required);
    }
  };

  const handleFileUploadAPI = async () => {
    try {
      setUploadLoader(true);
      if (!files) {
        toast.error(M.validation.required);
        return;
      }
      const result = await callApi(`${API_URL.UPLOAD_JEWELLERY_FILE}`, "POST", formData, token);
      setUploadLoader(false);
      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result?.message);
        handleResetStateData();
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
      }
    } catch (error) {
      setUploadLoader(false);
      toast.error(M.common.somethingWentWrong);
    } finally {
      setUploadLoader(false);
    }
    setUploadLoader(false);
  };

  const handleResetStateData = () => {
    setFiles("");
    setIsSuccess(Math.random);
  };

  const handleRemoveDesktopImage = () => {
    setDesktopImagePreview(null);
    setDesktopImageError("");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
  };

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 1920 || img.height !== 768) {
          setDesktopImageError("Image must be 1920x768px");
          setDesktopImagePreview(null); // Clear preview if invalid
          desktopImageRef.current.value = null; // Reset file input
        } else {
          setDesktopImageError("");
          setDesktopImagePreview(objectUrl); // Set preview only if valid
          setDesktopImage(file);
        }
      };

      img.src = objectUrl;
    }
  };

  return (
    <>
      {/* Shiping Delivery Content */}

      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">
              Ringsize Guideline
            </h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[97%] pb-4">
                For the best fit, measure your finger at the end of the day when
                it's largest. Use a well-fitting ring to measure the inner
                diameter, or wrap a strip of paper around your finger and
                measure the length. If you're between sizes, choose the larger
                one for comfort.
              </p>
            </div>
          </div>
          {/* Description Box */}
          <div className="px-6 pt-6">
            <label
              htmlFor="description"
              className="block text-[0.80rem] font-semibold mb-2"
            >
              Description
            </label>
            <div>
              <QuillEditor value={description} onChange={setDescription} />
            </div>
          </div>
          {/* Upload Image Box */}
          <div className="mb-6 pb-4 px-6">
            <div>
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1 relative">
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
                    <div className="text-red-500 absolute text-[0.8rem]">
                      {desktopImageError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Save</Button>
      </div>
    </>
  );
}
