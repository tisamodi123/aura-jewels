"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddNewReview({ open, setOpen, onAdd }) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [rating, setRating] = useState("");
    const [title, setTitle] = useState("");
    const [review, setReview] = useState("");
    const [date, setDate] = useState(null);

    const [errors, setErrors] = useState({});

    const createReview = async () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Name is required";
        if (!location.trim()) newErrors.location = "Location is required";
        if (!rating) newErrors.rating = "Rating is required";
        if (!title.trim()) newErrors.title = "Title is required";
        if (!date) newErrors.date = "Date is required";
        if (!review.trim()) newErrors.review = "Review is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }

        const newReview = {
            name,
            location,
            rating: Number(rating),
            title,
            review,
            date: date ? format(date, "yyyy-MM-dd") : "",
        };

        onAdd(newReview);
        toast.success("Review Added successfully!");
        setOpen(false);
        ResetHandler();
    };

    const ResetHandler = () => {
         setName("");
         setLocation("");
         setRating("");
         setTitle("");
         setReview("");
         setDate(null);
         setErrors({});
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <form>
                    <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

                    {/* Close Button Positioned Outside */}
                    <Dialog.Close asChild>
                        <button
                            type="button"
                            className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
                            onClick={() => {
                                setErrors({});
                            }}
                        >
                            <X size={20} />
                        </button>
                    </Dialog.Close>

                    <Dialog.Content className="fixed top-0 right-0 w-[50%] h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-4">
                            <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                                Add New Review
                            </Dialog.Title>

                            <div className="flex gap-2">
                                <div
                                    onClick={ResetHandler}
                                    className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                                >
                                    Reset
                                </div>
                                <div
                                    onClick={createReview}
                                    className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                                >
                                    Save
                                </div>
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div>
                            {/* Name */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (errors.name) setErrors({ ...errors, name: "" });
                                        }}
                                        placeholder="Enter Name"
                                        className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            errors.name ? "border-red-500" : "border-[#E4E8EE]"
                                        }`}
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.name}</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Location & Rating */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label
                                        htmlFor="location"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={location}
                                        onChange={(e) => {
                                            setLocation(e.target.value);
                                            if (errors.location) setErrors({ ...errors, location: "" });
                                        }}
                                        placeholder="Enter Location"
                                        className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            errors.location ? "border-red-500" : "border-[#E4E8EE]"
                                        }`}
                                    />
                                    {errors.location && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.location}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor="rating"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Rating <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="rating"
                                        min="1"
                                        max="5"
                                        step="0.5"
                                        value={rating}
                                        onChange={(e) => {
                                            setRating(e.target.value);
                                            if (errors.rating) setErrors({ ...errors, rating: "" });
                                        }}
                                        placeholder="Enter Rating (1-5)"
                                        className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            errors.rating ? "border-red-500" : "border-[#E4E8EE]"
                                        }`}
                                    />
                                    {errors.rating && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.rating}</div>
                                    )}
                                </div>
                            </div>

                            {/* Title & Date */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label
                                        htmlFor="title"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (errors.title) setErrors({ ...errors, title: "" });
                                        }}
                                        placeholder="Enter Title"
                                        className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            errors.title ? "border-red-500" : "border-[#E4E8EE]"
                                        }`}
                                    />
                                    {errors.title && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.title}</div>
                                    )}
                                </div>
                                 <div className="flex-1">
                                    <label
                                        htmlFor="date"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="date"
                                            value={date ? format(date, "yyyy-MM-dd") : ""}
                                            onChange={(e) => {
                                                const selectedDate = e.target.value ? new Date(e.target.value) : null;
                                                setDate(selectedDate);
                                                if (errors.date) setErrors({ ...errors, date: "" });
                                            }}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className={cn(
                                                "w-full pl-10 pr-3 py-2 border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer",
                                                errors.date ? "border-red-500" : "border-[#E4E8EE]",
                                                !date && "text-muted-foreground"
                                            )}
                                        />
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#656B7B] pointer-events-none" />
                                    </div>
                                    {errors.date && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.date}</div>
                                    )}
                                </div>
                            </div>

                            {/* Review */}
                            <div className="flex gap-6 mb-6 mt-4 items-center">
                                <div className="flex-1">
                                    <label
                                        htmlFor="review"
                                        className="block text-[0.80rem] font-semibold mb-2"
                                    >
                                        Review <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="review"
                                        value={review}
                                        onChange={(e) => {
                                            setReview(e.target.value);
                                            if (errors.review) setErrors({ ...errors, review: "" });
                                        }}
                                        placeholder="Enter Review"
                                        rows={4}
                                        className={`w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                            errors.review ? "border-red-500" : "border-[#E4E8EE]"
                                        }`}
                                    />
                                    {errors.review && (
                                        <div className="text-red-500 text-[0.8rem] mt-1">{errors.review}</div>
                                    )}
                                </div>
                            </div>
                            
                        </div>
                    </Dialog.Content>
                </form>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
