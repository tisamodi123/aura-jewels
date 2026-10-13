"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RedirectPicker from "@/components/redirect/RedirectPicker";

export default function AddNewModal({ open, setOpen, fetchData, selectedCategory }) {
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
        redirect1: { type: "none" },
        textposition: "",
        video: ''
    });
    const token = getToken();
    const [status, setStatus] = useState("ACTIVE");
    const desktopImageRef = useRef(null);
    const mobileImageRef = useRef(null);

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
                if (img.width !== 1585 || img.height !== 350) {
                    setDesktopImageError("Image must be 1585×350px");
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
                if (img.width !== 375 || img.height !== 280) {
                    setMobileImageError("Image must be 375x280px");
                    setMobileImagePreview(null);
                    setMobileImage(null);
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

    const createSection = async () => {
        if (!selectedCategory) {
            toast.error("Category is required");
            return;
        }
        if (desktopImageError || mobileImageError) {
            toast.error("Please fix image dimension errors");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("buttonlink1", formData.buttonTextLink1);
        formDataToSend.append("buttonlink2", formData.buttonTextLink2);
        formDataToSend.append("redirect1", JSON.stringify(formData.redirect1 || { type: "none" }));
        formDataToSend.append("mobile_img", mobileImage);
        formDataToSend.append("sectionName", "hero-banner");
        formDataToSend.append("status", status);
        formDataToSend.append("buttontext1", formData.buttonText1);
        formDataToSend.append("buttontext2", formData.buttonText2);
        formDataToSend.append("title", formData.title);
        formDataToSend.append("subTitle", formData.subtitle);

        if (mediaType === "image" && deskTopImage) {
            formDataToSend.append("image", deskTopImage);
        } else if (mediaType === "video" && video) {
            formDataToSend.append("video", video);
        }

        formDataToSend.append("description", formData.description);
        formDataToSend.append("textposition", formData.textposition);
        if (selectedCategory) {
            formDataToSend.append("CategoryId", selectedCategory);
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
                                Add New (Hero Banner)
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
                            {/* Title - Subtitle */}
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
                                <div className="flex-1">
                                    <label
                                        htmlFor="subtitle"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Sub Title
                                    </label>
                                    <input
                                        type="text"
                                        id="subtitle"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleInputChange}
                                        placeholder="Enter Sub Title"
                                        className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* First Button Text/Link */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label
                                        htmlFor="buttonText1"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Button Text 1
                                    </label>
                                    <input
                                        type="text"
                                        id="buttonText1"
                                        name="buttonText1"
                                        value={formData.buttonText1}
                                        onChange={handleInputChange}
                                        placeholder="Enter Button Text"
                                        className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[0.80rem] font-semibold mb-2">
                                        Button Link 1
                                    </label>
                                    <RedirectPicker
                                        value={formData.redirect1}
                                        onChange={(r) => setFormData((p) => ({ ...p, redirect1: r }))}
                                        label=""
                                    />
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
                                        value={formData.description}
                                        onChange={handleInputChange}
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
                                        value={formData.textposition}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Button Position</option>
                                        <option value="button-top-left">Top-Left</option>
                                        <option value="button-top-center">Top-Center</option>
                                        <option value="button-top-right">Top-Right</option>
                                        <option value="button-center-left">Center-Left</option>
                                        <option value="button-center-center">Center-Center</option>
                                        <option value="button-center-right">Center-Right</option>
                                        <option value="button-buttom-left">Buttom-Left</option>
                                        <option value="button-buttom-center">Buttom-Center</option>
                                        <option value="button-buttom-right">Buttom-Right</option>
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
                                <div className="flex-1">
                                    {mediaType === "image" ? (
                                        <>
                                            <label className="block text-[0.80rem] font-semibold mb-2">
                                                Image 1 (Desktop View - 1585×350px, Max 5MB)
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
                                                    className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${desktopImageError ? "border-red-500" : ""
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
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-[0.80rem] font-semibold mb-2">
                                                Video (Desktop View)
                                            </label>
                                            {videoPreview ? (
                                                <div className="relative w-full h-32 border rounded-md overflow-hidden bg-black">
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
                                            ) : (
                                                <div
                                                    onClick={() => videoRef.current.click()}
                                                    className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer`}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <img
                                                            src={`${PREFIX}/cloudComputing.svg`}
                                                            height={20}
                                                            width={20}
                                                            alt="uploadicon"
                                                        />
                                                        <div className="text-[#656B7B] text-[0.80rem]">
                                                            Drag or Upload Video
                                                        </div>
                                                    </div>
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

                                <div className="flex-1">
                                    <label className="block text-[0.80rem] font-semibold mb-2">
                                        Image 2 (Mobile View - 375x280px, Max 5MB)
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
                                            className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${mobileImageError ? "border-red-500" : ""
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
