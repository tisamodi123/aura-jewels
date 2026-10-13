"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import SectionTable2 from "./_components/SectionTable2";
import AddNewModal from "./_components/AddNew";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

export default function page() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);
  const token = getToken();
  //   Fetch Table Data
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const formdata = new FormData();
      formdata.append("sesstionName", "sesstion_2");

      const result = await callApi(API_URL?.GET_SECTION_LIST, "POST", formdata, token);
      console.log("API result:", result);

      if (result?.errorCode == STATUS_CODE.OK) {
        setSessionData([...result.data]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
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
        {" "}
        <div className=" p-2 mb-3 flex items-center justify-between">
          <div className="font-semibold text-xl">Category Title</div>
          {sessionData.length == 0 && (
            <div className="flex gap-2 items-center">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="hand h-[36px] px-5 flex items-center rounded-md justify-center font-normal bg-black text-[0.80rem] text-white"
              >
                + Add New
              </div>
            </div>
          )}
        </div>
        <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
          <SectionTable2
            tableData={sessionData}
            fetchData={fetchData}
            isLoading={isLoading}
          />
        </div>
      </div>
      <AddNewModal open={isOpen} setOpen={setIsOpen} fetchData={fetchData} />
    </>
  );
}
