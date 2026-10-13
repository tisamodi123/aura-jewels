"use client";
import React, { useState } from "react";
import ReviewTable from "./ReviewTable";
import AddNewReview from "./AddNewReview";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";


const ReviewSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionData, setSessionData] = useState([]);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = getToken();
            const data = await callApi(`${API_URL?.GET_HOME_REVIEW_SECTION}`, "GET", null, token);
            console.log('data ->>>', data)
            if (data?.errorCode === STATUS_CODE.OK) {
                setSessionData(Array.isArray(data?.data) ? data?.data : []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddReview = async (newReview) => {
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append("CustName", newReview?.name);
            formData.append("Title", newReview?.title);
            formData.append("Review", newReview?.review);
            formData.append("Rate", newReview?.rating);
            formData.append("City", newReview?.location);
            formData.append("date", newReview?.date);
            const data = await callApi(`${API_URL?.ADD_HOME_REVIEW_SECTION}`, "POST", formData, token);
            console.log('data ->>>', data)
            if (data?.errorCode === STATUS_CODE.OK) {
                // fetchData() will refresh the list
            }
        } catch (error) {
            console.log('Error get from add review --->>', error)
        }
        fetchData();
    };

    const handleEditReview = async (updatedReview) => {
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append("ReviewId", updatedReview?.id);
            formData.append("CustName", updatedReview?.CustName);
            formData.append("Title", updatedReview?.Title);
            formData.append("Review", updatedReview?.Review);
            formData.append("Rate", updatedReview?.Rate);
            formData.append("City", updatedReview?.City);
            formData.append("date", updatedReview?.date);

            const data = await callApi(`${API_URL?.ADD_HOME_REVIEW_SECTION}`, "POST", formData, token);
            if (data?.errorCode === STATUS_CODE.OK) {
                // fetchData() will refresh the list
            }
        } catch (error) {
            console.log('Error update review --->>', error)
        }
        fetchData();
    };

    const handleDeleteReview = async (id) => {
        try {
            const token = getToken();
            const data = await callApi(`${API_URL?.DELETE_HOME_REVIEW_SECTION}${id}`, "DELETE", null, token);
            if (data?.errorCode === STATUS_CODE.OK) {
                // fetchData() will refresh the list
            }
        } catch (error) {
            console.log('Error deleting review --->>', error)
        }
        fetchData();
    };
    const handleUpdateStatus = (id) => {
        Swal.fire({
            title: "Change Status",
            text: "Are You Sure Want To Change Status?",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "No",
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed === true) {
                try {
                    const token = getToken();
                    const data = await callApi(`${API_URL?.UPDATE_REVIEW_STATUS}${id}`, "PUT", null, token);
                    if (data?.errorCode === STATUS_CODE.OK) {
                        toast.success(data?.message || "Status updated successfully");
                    } else {
                        toast.error(data?.message || "Failed to update status");
                    }
                } catch (error) {
                    console.log('Error updating status --->>', error)
                }
                fetchData();
            }
        });
    };

    return (
        <>
            <div>
                <div className=" p-2 mb-3 flex items-center justify-between">
                    <div className="font-semibold text-xl">Review Section</div>
                    <div className="flex gap-2 items-center">
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="hand h-[36px] px-5 flex items-center rounded-md justify-center font-normal bg-black text-[0.80rem] cursor-pointer text-white"
                        >
                            + Add New
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
                    <ReviewTable
                        tableData={sessionData}
                        fetchData={fetchData}
                        isLoading={isLoading}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </div>
            </div>
            <AddNewReview
                open={isOpen}
                setOpen={setIsOpen}
                onAdd={handleAddReview}
            />
        </>
    );
};

export default ReviewSection;