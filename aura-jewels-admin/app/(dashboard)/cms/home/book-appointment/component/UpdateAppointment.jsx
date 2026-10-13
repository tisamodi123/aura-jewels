"use client";
import React, { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { getToken } from "@/lib/auth";
import { API_URL, PREFIX, ASSET_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function UpdateAppointment({ open, setOpen, data, refetchFn }) {
    const token = getToken();
    const [title, setTitle] = useState(data.title || "");
    const [description, setDescription] = useState(data.description || "");
    const [buttontext1, setButtonText1] = useState(data.buttontext1 || "");
    const [buttonlink1, setButtonTextLink1] = useState(
        data.buttonlink1 || ""
    );
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(data.image || null);

    const fileInputRef = useRef(null);

    console.log("edited data", data);

    const [imageError, setImageError] = useState("");

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setImageError("Only image files are allowed");
                setImage(null);
                setImagePreview(data.image || null);
                if (fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setImageError("Image size must be less than 5MB");
                setImage(null);
                setImagePreview(data.image || null);
                if (fileInputRef.current) fileInputRef.current.value = null;
                return;
            }
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                if (img.width !== 4000 || img.height !== 2233) {
                    setImageError("Image must be 4000x2233px");
                    setImage(null);
                    setImagePreview(data.image || null);
                    if (fileInputRef.current) fileInputRef.current.value = null;
                } else {
                    setImageError("");
                    setImage(file);
                    setImagePreview(objectUrl);
                }
            };
            img.src = objectUrl;
        }
    };

    const updateSession = async () => {
        const formData = new FormData();

        // Append form fields
        formData.append("title", title);
        formData.append("description", description);
        formData.append("buttontext1", buttontext1);
        formData.append("buttonlink1", buttonlink1);
        if (image) {
            formData.append("image", image);
        }

        try {
            const result = await callApi(`${API_URL.UPDATE_SESSION}/${data.id}`, "PUT", formData, token);

            if (result?.errorCode == STATUS_CODE.OK) {
                toast.success(result.message || "Updated Successfully");
                setOpen(false);
                refetchFn();
            }
            return result;
        } catch (error) {
            console.error("Error updating session:", error.message);
            toast.error(error.message || "Failed to update session");
        }
    };

    const ResetHandler = () => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setButtonText1(data.buttontext1 || "");
        setButtonTextLink1(data.buttonlink1 || "");
        setImage(null);
        setImagePreview(data.image || null);
        setImageError("");
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
                                Edit Appointment
                            </Dialog.Title>

                            <div className="flex gap-2">
                                <div
                                    onClick={ResetHandler}
                                    className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                                >
                                    Reset
                                </div>
                                <div
                                    onClick={() => !imageError && updateSession()}
                                    className={`cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem] ${imageError ? "bg-gray-400 cursor-not-allowed" : "bg-[#087B5D]"}`}
                                >
                                    Save
                                </div>
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="mt-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-[0.80rem] font-semibold mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter Title"
                                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[0.80rem] font-semibold mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter Description"
                                    rows={3}
                                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Button Text & Link */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[0.80rem] font-semibold mb-2">
                                        Button Text
                                    </label>
                                    <input
                                        type="text"
                                        value={buttontext1}
                                        onChange={(e) => setButtonText1(e.target.value)}
                                        placeholder="Enter Button Text"
                                        className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[0.80rem] font-semibold mb-2">
                                        Button Link
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            value={buttonlink1}
                                            onChange={(e) => setButtonTextLink1(e.target.value)}
                                            placeholder="Enter Button Link"
                                            className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-12"
                                        />
                                        {buttonlink1 && (
                                            <a
                                                href={buttonlink1.startsWith('http') ? buttonlink1 : `https://${buttonlink1}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute right-3 text-blue-500 text-[0.75rem] font-medium hover:underline"
                                            >
                                                Open
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-[0.80rem] font-semibold mb-2">
                                    Image
                                </label>
                                <div className="flex gap-4 items-start">
                                    <div
                                        onClick={() => fileInputRef.current.click()}
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
                                                Upload (4000px x 2233px, Max 5MB)
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        ref={fileInputRef}
                                        id="image-upload"
                                        accept="image/*"
                                    />
                                </div>
                                {imageError && (
                                    <div className="text-red-500 text-[0.7rem] mt-1 italic">
                                        {imageError}
                                    </div>
                                )}
                                {imagePreview && (
                                    <div className="mt-6 w-40 aspect-[980/560] border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={
                                                (imagePreview.startsWith('data:') || imagePreview.startsWith('blob:'))
                                                    ? imagePreview
                                                    : imagePreview.startsWith('http')
                                                        ? imagePreview
                                                        : (ASSET_URL + imagePreview)
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.target.src = PREFIX + "/noImage.png";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dialog.Content>
                </form>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
