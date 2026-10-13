"use client";
import React, { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { getToken } from "@/lib/auth";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function AddInstaFeed({ open, setOpen, fetchData, editData }) {
    const [desktopImageError, setDesktopImageError] = useState("");
    const [mobileImageError, setMobileImageError] = useState("");
    const [videoError, setVideoError] = useState("");
    const [desktopImagePreview, setDesktopImagePreview] = useState(null);
    const [mobileImagePreview, setMobileImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [mobileImage, setMobileImage] = useState(null);
    const [deskTopImage, setDesktopImage] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const token = getToken();
    const desktopImageRef = useRef(null);
    const mobileImageRef = useRef(null);
    const videoRef = useRef(null);
    console.log('editData ->', editData)
    // Validation Schema
    const validationSchema = Yup.object({
        contentType: Yup.string().required("Content Type is required"),
        buttonTextLink1: Yup.string()
            .required("Link is required"),
        scriptContent: Yup.string().when("contentType", {
            is: (val) => val === "Script",
            then: (schema) => schema.required("Description is required"),
            otherwise: (schema) => schema.nullable().notRequired(),
        }),
        imageFile: Yup.mixed().when("contentType", {
            is: (val) => val === "Image" && !editData,
            then: (schema) => schema.required("Image is required").nullable(),
            otherwise: (schema) => schema.nullable().notRequired(),
        }),
        videoFile: Yup.mixed().when("contentType", {
            is: (val) => val === "Video" && !editData,
            then: (schema) => schema.required("Video is required").nullable(),
            otherwise: (schema) => schema.nullable().notRequired(),
        }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            contentType: "Image",
            buttonTextLink1: "",
            scriptContent: "",
            imageFile: null,
            videoFile: null,
        },
        validationSchema,
        onSubmit: (values) => {
            handleSubmitForm(values);
        },
    });


    useEffect(() => {
        if (editData && open) {
            const normalizedType = editData.type
                ? editData.type.charAt(0).toUpperCase() + editData.type.slice(1).toLowerCase()
                : "Image";

            formik.setValues({
                contentType: normalizedType,
                buttonTextLink1: editData.buttonlink1 || editData.buttontext1 || "",
                scriptContent: editData.description || editData.scriptText || "",
                imageFile: null,
                videoFile: null,
            });

            if (editData.image) {
                setDesktopImagePreview(editData.image);
            }
            if (editData.video) {
                setVideoPreview(editData.video);
                setVideoFile({ name: "Existing Video" });
            }
        } else if (!open) {
            ResetHandler();
        }
    }, [editData, open]);

    const handleSubmitForm = async (values) => {
        console.log("Submitting Form values:", values);
        const formDataToSend = new FormData();
        formDataToSend.append("sesstionName", "instagram_reel");
        formDataToSend.append("buttonlink1", values.buttonTextLink1);
        // Normalize type to lowercase for backend compatibility
        const normalizedType = values.contentType.toLowerCase();
        formDataToSend.append("type", normalizedType);

        // if (editData) {
        //     formDataToSend.append("id", editData.id);
        // }

        if (values.contentType === "Image") {
            if (values.imageFile) {
                formDataToSend.append("image", values.imageFile);
            }
        } else if (values.contentType === "Video") {
            if (values.videoFile && values.videoFile.name !== "Existing Video") {
                formDataToSend.append("video", values.videoFile);
            }
        } else if (values.contentType === "Script") {
            formDataToSend.append("scriptText", values.scriptContent);
        }

        console.log("FormData to send:");
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const url = editData ? `${API_URL.UPDATE_SESSION}/${editData.id}` : API_URL.CREATE_SESSION;
        const method = editData ? "PUT" : "POST";

        console.log(`Fetching: ${method} ${url}`);

        try {
            const result = await callApi(url, method, formDataToSend, token);

            if (result.errorCode == STATUS_CODE.OK) {
                toast.success(result.message);
                setOpen(false);
                fetchData();
                ResetHandler();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(`Error ${editData ? 'updating' : 'creating'} session:`, error);
            toast.error(`Failed To ${editData ? 'Update' : 'Create'} Session`);
        }
    };

    const handleDesktopChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setDesktopImageError("Only image files are allowed");
                setDesktopImagePreview(null);
                setDesktopImage(null);
                formik.setFieldValue("imageFile", null);
                if (desktopImageRef.current) desktopImageRef.current.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setDesktopImageError("Image size must be less than 5MB");
                setDesktopImagePreview(null);
                setDesktopImage(null);
                formik.setFieldValue("imageFile", null);
                if (desktopImageRef.current) desktopImageRef.current.value = null;
                return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                setDesktopImageError("");
                setDesktopImagePreview(objectUrl);
                setDesktopImage(file);
                formik.setFieldValue("imageFile", file);
            };

            img.onerror = () => {
                setDesktopImageError("Failed to load image");
                setDesktopImagePreview(null);
                setDesktopImage(null);
                formik.setFieldValue("imageFile", null);
                if (desktopImageRef.current) desktopImageRef.current.value = null;
                URL.revokeObjectURL(objectUrl);
            };

            img.src = objectUrl;
        }
    };
    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                setVideoError("Only video files are allowed");
                setVideoPreview(null);
                setVideoFile(null);
                formik.setFieldValue("videoFile", null);
                if (videoRef.current) videoRef.current.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setVideoError("Video size must be less than 5MB");
                setVideoPreview(null);
                setVideoFile(null);
                formik.setFieldValue("videoFile", null);
                if (videoRef.current) videoRef.current.value = null;
                return;
            }
            setVideoError("");
            setVideoFile(file);
            formik.setFieldValue("videoFile", file);
            const objectUrl = URL.createObjectURL(file);
            setVideoPreview(objectUrl);
        }
    };

    const handleRemoveDesktopImage = () => {
        setDesktopImagePreview(null);
        setDesktopImage(null);
        setDesktopImageError("");
        formik.setFieldValue("imageFile", null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
    };


    const handleRemoveVideo = () => {
        setVideoPreview(null);
        setVideoFile(null);
        setVideoError("");
        formik.setFieldValue("videoFile", null);
        if (videoRef.current) videoRef.current.value = null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(formik.errors).length > 0) {
            console.log("Validation errors:", formik.errors);
        }
        formik.handleSubmit();
    };

    const ResetHandler = () => {
        setDesktopImageError("");
        setMobileImageError("");
        setVideoError("");
        setDesktopImagePreview(null);
        setMobileImagePreview(null);
        setVideoPreview(null);
        setMobileImage(null);
        setDesktopImage(null);
        setVideoFile(null);
        formik.resetForm();
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
                            className="absolute top-4 right-[30%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </Dialog.Close>

                    <Dialog.Content className="fixed top-0 right-0 w-[30%] h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none shadow-2xl transition-all duration-300">
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <Dialog.Title className="text-[1.1rem] font-bold text-[#344054]">
                                {editData ? "Edit Instagram Feed" : "Add Instagram Feed"}
                            </Dialog.Title>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={ResetHandler}
                                    className="bg-red-100 hover:bg-red-200 text-[#DC646A] font-semibold rounded-md px-5 py-2.5 text-[0.85rem] transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#087B5D] hover:bg-[#06644b] text-white font-semibold rounded-md px-5 py-2.5 text-[0.85rem] shadow-sm transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label
                                    htmlFor="contentType"
                                    className="block text-[0.85rem] font-semibold text-[#344054] mb-2"
                                >
                                    Content Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="contentType"
                                    name="contentType"
                                    value={formik.values.contentType}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-2.5 bg-white border border-[#E4E8EE] rounded-lg text-[0.85rem] focus:ring-1 focus:ring-[#000] focus:border-transparent outline-none transition-all ${formik.touched.contentType && formik.errors.contentType ? "border-red-500" : ""
                                        }`}
                                >
                                    <option value="Image">Image</option>
                                    <option value="Video">Video</option>
                                    <option value="Script">Script</option>
                                </select>
                            </div>

                            {formik.values.contentType === "Image" && (
                                <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <label className="block text-[0.85rem] font-semibold text-[#344054]">
                                            Image
                                            {/* <span className="text-[0.7rem] text-red-500">(370x410px)</span> */}
                                        </label>
                                        {desktopImagePreview ? (
                                            <div className="relative group rounded-lg overflow-hidden border-2 border-[#E4E8EE] h-40">
                                                <img src={desktopImagePreview} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveDesktopImage}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => desktopImageRef.current.click()}
                                                className={`flex flex-col items-center justify-center h-40 border-1 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formik.touched.contentType && formik.errors.imageFile ? "border-red-500" : "border-[#E4E8EE]"
                                                    }`}
                                            >
                                                <img src={`${PREFIX}/cloudComputing.svg`} className="w-8 h-8 mb-2 opacity-60" />
                                                <span className="text-[0.8rem] text-gray-500">Attach file</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" ref={desktopImageRef} onChange={handleDesktopChange} className="hidden" />
                                        {desktopImageError && (
                                            <p className="text-red-500 text-[0.75rem]">{desktopImageError}</p>
                                        )}
                                        {formik.errors.imageFile && formik.submitCount > 0 && (
                                            <p className="text-red-500 text-[0.75rem]">{formik.errors.imageFile}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formik.values.contentType === "Video" && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                                    <label className="block text-[0.85rem] font-semibold text-[#344054]">
                                        Desktop Video
                                        {/* <span className="text-[0.7rem] text-red-500">(Size : Max - 2MB) *</span> */}
                                    </label>
                                    <div className={`flex items-center gap-4 p-4 border rounded-lg bg-gray-50 ${formik.touched.contentType && formik.errors.videoFile ? "border-red-500" : "border-[#E4E8EE]"}`}>
                                        <button
                                            type="button"
                                            onClick={() => videoRef.current.click()}
                                            className="bg-gray-500 hover:bg-gray-600 cursor-pointer text-white px-5 py-2 rounded text-[0.85rem] font-semibold transition-colors"
                                        >
                                            Attach file
                                        </button>
                                        <span className="text-[0.85rem] text-gray-500 truncate max-w-[200px]">
                                            {videoFile ? videoFile.name : "No file chosen"}
                                        </span>
                                        {videoFile && (
                                            <button type="button" onClick={handleRemoveVideo} className="text-red-500 ml-auto">
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" accept="video/*" ref={videoRef} onChange={handleVideoChange} className="hidden" />
                                    {videoError && (
                                        <p className="text-red-500 text-[0.75rem]">{videoError}</p>
                                    )}
                                    {formik.errors.videoFile && formik.submitCount > 0 && (
                                        <p className="text-red-500 text-[0.75rem]">{formik.errors.videoFile}</p>
                                    )}
                                </div>
                            )}

                            {formik.values.contentType === "Script" && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                                    <label
                                        htmlFor="scriptContent"
                                        className="block text-[0.85rem] font-semibold text-[#344054]"
                                    >
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="scriptContent"
                                        name="scriptContent"
                                        rows={4}
                                        value={formik.values.scriptContent}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter script or description..."
                                        className={`w-full px-4 py-3 bg-white border border-[#E4E8EE] rounded-lg text-[0.85rem] focus:ring-1 focus:ring-[#000] outline-none ${formik.touched.scriptContent && formik.errors.scriptContent ? "border-red-500" : ""
                                            }`}
                                    />
                                    {formik.touched.scriptContent && formik.errors.scriptContent && (
                                        <p className="text-red-500 text-[0.75rem]">{formik.errors.scriptContent}</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="buttonTextLink1"
                                    className="block text-[0.85rem] font-semibold text-[#344054] mb-2"
                                >
                                    Button Link <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="buttonTextLink1"
                                    name="buttonTextLink1"
                                    value={formik.values.buttonTextLink1}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter Link"
                                    className={`w-full px-4 py-2.5 border border-[#E4E8EE] rounded-lg text-[0.85rem] focus:ring-1 focus:ring-[#000] outline-none ${formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1 ? "border-red-500" : ""
                                        }`}
                                />
                                {formik.touched.buttonTextLink1 && formik.errors.buttonTextLink1 && (
                                    <p className="text-red-500 text-[0.75rem] mt-1">{formik.errors.buttonTextLink1}</p>
                                )}
                            </div>
                        </div>
                    </Dialog.Content>
                </form>
            </Dialog.Portal>
        </Dialog.Root>
    );
}