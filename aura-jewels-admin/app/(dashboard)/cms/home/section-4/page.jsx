"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import SectionTable from "./_components/SectionTable";
import AddItemCode from "./AddItemCode";
// import AddItemCode from "./_components/AddItemCode"; // Import the new component
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import ChildTable from "./_components/ChildTable";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);
  const token = getToken();
  const [itemCodearray, setItemCodeArray] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("sesstionName", "sesstion_4");

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div>
        <div className="p-2 mb-3 flex items-center justify-between">
          <div className="font-semibold text-xl">Most Love Products</div>
          <div className="flex gap-2 items-center">
            <div
              onClick={() => setIsOpen(true)}
              className="hand h-[36px] px-5 flex items-center rounded-md justify-center font-normal bg-black text-[0.80rem] text-white cursor-pointer"
            >
              + Add New
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
          <SectionTable
            key={refresh}
            tableData={sessionData}
            fetchData={fetchData}
            isLoading={isLoading}
          />

        </div>
        <div className="mt-5 bg-white border border-zinc-200 shadow-md rounded-md mb-5">
          <ChildTable key={refresh} setItemCodeArray={setItemCodeArray} />
        </div>
      </div>

      {/* AddItemCode Modal */}
      <AddItemCode sessionData={sessionData} setRefresh={setRefresh} itemCodearray={itemCodearray} open={isOpen} setOpen={setIsOpen} />
    </>
  );
}