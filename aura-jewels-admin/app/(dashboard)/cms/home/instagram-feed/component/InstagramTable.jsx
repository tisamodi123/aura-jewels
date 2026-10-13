'use client'
import React, { useEffect, useState } from 'react'
import InstagramSession from './InstagramSession'
import AddInstaFeed from './AddInstaFeed'
import { getToken } from '@/lib/auth'
import { API_URL } from '@/lib/APIUrl'
import { callApi } from '@/lib/callApi'
import { STATUS_CODE } from '@/lib/Constant'

const InstagramTable = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [sessionData, setSessionData] = useState([])
    const [editData, setEditData] = useState(null)
    const token = getToken()


    const fetchData = async () => {
        try {
            setIsLoading(true);

            const formdata = new FormData();
            formdata.append("sesstionName", "instagram_reel");

            const result = await callApi(API_URL?.GET_SECTION_LIST, "POST", formdata, token);
            console.log("API result:", result);

            if (result?.errorCode == STATUS_CODE.OK) {
                setSessionData(result.data);
            }
        } catch (error) {
            console.log("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleEdit = (data) => {
        setEditData(data);
        setIsOpen(true);
    };

    const handleOpenModal = () => {
        setEditData(null);
        setIsOpen(true);
    };

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <div>
            <div>
                <div className=" p-2 mb-3 flex items-center justify-between">
                    <div className="font-semibold text-xl">Instagram Feed</div>
                    <div className="flex gap-2 items-center">
                        <div
                            onClick={handleOpenModal}
                            className="hand h-[36px] px-5 flex items-center rounded-md justify-center cursor-pointer font-normal bg-black text-[0.80rem] text-white"
                        >
                            + Add New
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
                    <InstagramSession
                        data={sessionData}
                        fetchData={fetchData}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                    />
                </div>
            </div>

            <AddInstaFeed
                open={isOpen}
                setOpen={(val) => {
                    setIsOpen(val);
                    if (!val) setEditData(null);
                }}
                fetchData={fetchData}
                editData={editData}
            />
        </div>
    )
}

export default InstagramTable