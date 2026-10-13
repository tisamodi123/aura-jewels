"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

export default function AddNewModal({ open, setOpen, fetchData, selectedCategory, categories }) {
    const [formData, setFormData] = useState({
        title: "",
    });

    const [submitted, setSubmitted] = useState(false);

    const token = getToken();
    const [status, setStatus] = useState("ACTIVE");
    const [categoryId, setCategoryId] = useState(selectedCategory || "");

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

    const createSection = async () => {
        setSubmitted(true);
        if (!categoryId) {
            toast.error("Category is required");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("sectionName", "popular-designs");
        formDataToSend.append("status", status);
        formDataToSend.append("title", formData.title);

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
            } else {
                toast.error(result.message);
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
        setFormData({
            title: "",
        });
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
                                Add New (Popular Designs)
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

                        <div className="mt-4">
                            {/* Category Selection */}
                            <div className="flex gap-6 mb-6 items-center">
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
                                        {categories?.map((cat) => (
                                            <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                                {cat.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex gap-6 mb-6 items-center">
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
