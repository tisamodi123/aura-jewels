"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RedirectPicker from "@/components/redirect/RedirectPicker";

export default function AddNewModal({ open, setOpen, fetchData, selectedCategory, categories }) {
    const [desktopImageError, setDesktopImageError] = useState("");
    const [mobileImageError, setMobileImageError] = useState("");
    const [desktopImagePreview, setDesktopImagePreview] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState(null);
    const [mobileImage, setMobileImage] = useState(null);
    const [deskTopImage, setDesktopImage] = useState(null);
    const [mediaType, setMediaType] = useState("image");
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const videoRef = useRef(null);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        buttonText1: "",
        buttonTextLink1: "",
        buttonText2: "",
        buttonTextLink2: "",
        textposition: "",
        video: ''
    });
    const token = getToken();
  const [status, setStatus] = useState("ACTIVE");
    const desktopImageRef = useRef(null);
    const mobileImageRef = useRef(null);
    const [categoryId, setCategoryId] = useState(selectedCategory || "");
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (open) {
            setCategoryId(selectedCategory || "");
            setSubmitted(false);
        }
    }, [open, selectedCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
                if (img.width !== 793 || img.height !== 600) {
                    setDesktopImageError("Image must be 793x600px");
                    setDesktopImagePreview(null);
                    setDesktopImage(null);
                    if (desktopImageRef.current) desktopImageRef.current.value = null;
                    URL.revokeObjectURL(objectUrl);
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

    const handleRemoveDesktopImage = () => {
        setDesktopImagePreview(null);
        setDesktopImage(null);
        setDesktopImageError("");
        if (desktopImageRef.current) desktopImageRef.current.value = null;
    };
    const createSection = async () => {
        setSubmitted(true);
        if (!categoryId) {
            toast.error("Category is required");
            return;
        }
        if (desktopImageError || mobileImageError) {
            toast.error("Please fix image dimension errors");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("sectionName", "double-promo-grid");
    formDataToSend.append("status", status);
        formDataToSend.append("title", formData.title);

        if (formData.buttonTextLink1) {
            formDataToSend.append("buttonlink1", formData.buttonTextLink1);
        }
        formDataToSend.append("redirect1", JSON.stringify(formData.redirect1 || { type: "none" }));
        if (mediaType === "image" && deskTopImage) {
            formDataToSend.append("image", deskTopImage);
        }
        if (categoryId) {
            formDataToSend.append("CategoryId", categoryId);
        }
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${token}`);

        try {
            const response = await fetch(`${API_URL.CREATE_LANDING_BANNER}`, {
                method: "POST",
                headers,
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create section");
            }

            const result = await response.json();
            if (result.errorCode == 200) {
                toast.success(result.message);
                setOpen(false);
                fetchData();
                ResetHandler();
            }
            return result;
        } catch (error) {
            console.log("Error creating section:", error.message);
            toast.error("Failed To Create Section");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createSection();
    };

    const ResetHandler = () => {
        setDesktopImageError("");
        setMobileImageError("");
        setDesktopImagePreview(null);
        setMobileImagePreview(null);
        setMobileImage(null);
        setDesktopImage(null);
        setVideoPreview(null);
        setVideo(null);
        setMediaType("image");
        setFormData({
            title: "",
            subtitle: "",
            description: "",
            buttonText1: "",
            buttonTextLink1: "",
            buttonText2: "",
            buttonTextLink2: "",
            textposition: "",
            video: ''
        });
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        if (videoRef.current) videoRef.current.value = null;
        setSubmitted(false);
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
                                Add New (Double Promo Grid)
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
                            {/* Category Selection */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label className={`block text-[0.80rem] font-semibold mb-2 ${submitted && !categoryId ? "text-red-500" : ""}`}>
                                        Category *
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className={`w-full px-3 py-2 border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${submitted && !categoryId ? "border-red-500 text-red-500" : "border-[#E4E8EE] text-black"
                                            }`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
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
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter Title"
                                        className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* URL (buttonlink1) */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label className="block text-[0.80rem] font-semibold mb-2">Link</label>
                                    <RedirectPicker value={formData.redirect1} onChange={(r) => setFormData((p) => ({ ...p, redirect1: r }))} label="" />
                                </div>
                            </div>


                            {/* DeskTop and Mobile Image */}
                            <div className="flex gap-6 mb-6 mt-4 items-start">
                                <div className="flex-1">

                                    <>
                                        <label className="block text-[0.80rem] font-semibold mb-2">
                                            Image 1 (793x600px, Max 5MB)
                                        </label>
                                        <div className="flex gap-4 items-start">
                                            <div
                                                onClick={() => desktopImageRef.current.click()}
                                                className={`flex border border-dashed rounded-md justify-center items-center w-[178px] h-32 cursor-pointer ${desktopImageError ? "border-red-500" : ""
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
                                                        Upload Image
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {desktopImageError && (
                                            <div className="text-red-500 text-[0.75rem] mt-1">
                                                {desktopImageError}
                                            </div>
                                        )}

                                        {desktopImagePreview && (
                                            <div className="w-[178px] mt-6 h-32 border rounded-md overflow-hidden">
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
