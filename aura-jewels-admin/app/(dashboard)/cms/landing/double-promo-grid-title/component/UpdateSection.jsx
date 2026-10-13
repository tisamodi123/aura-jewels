"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

export default function UpdateSection({ open, setOpen, data, refetchFn, categories }) {
  const [categoryId, setCategoryId] = useState(data.CategoryId || data.categoryId || "");
  const token = getToken();
  const [status, setStatus] = useState(data?.status || "ACTIVE");
  const [title, setTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.description || "");
  const [submitted, setSubmitted] = useState(false);

  const UpdateSection = async () => {
    setSubmitted(true);
    const formData = new FormData();

    formData.append("sectionName", "double-promo-grid-title");
    formData.append("status", status);
    formData.append("title", title);
    formData.append("description", description);

    if (categoryId) {
      formData.append("CategoryId", categoryId);
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
    setTitle(data.title || "");
    setDescription(data.description || "");
    setCategoryId(data.CategoryId || data.categoryId || "");
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
                Edit (Double Promo Grid Title)
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

              {/* Title & Description */}
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
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
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
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-24"
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
