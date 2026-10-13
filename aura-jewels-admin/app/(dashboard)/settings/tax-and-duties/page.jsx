"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";

import TaxTable from "./_components/TaxTable";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function TaxAndDuteisPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState("");
  const [isSuccess, setIsSuccess] = useState(0);
  const [isImport, setIsImport] = useState(false);
  const [diaType, setDiaType] = useState("Natural");
  const [uploadLoader, setUploadLoader] = useState(false);
  const token = getToken();

  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles(file);
    } else {
      toast.error(M.validation.required);
    }
  };

  const handleFileUploadAPI = async () => {
    try {
      setUploadLoader(true);
      if (!files) {
        toast.error(M.validation.required);
        return;
      }
      const result = await callApi(`${API_URL.UPLOAD_JEWELLERY_FILE}`, "POST", formData, token);
      setUploadLoader(false);
      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result?.message);
        handleResetStateData();
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
      }
    } catch (error) {
      setUploadLoader(false);
      toast.error(M.common.somethingWentWrong);
    } finally {
      setUploadLoader(false);
    }
    setUploadLoader(false);
  };

  const handleResetStateData = () => {
    setFiles("");
    setIsSuccess(Math.random);
  };

  return (
    <>
      {/* Shiping Delivery Content */}

      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">
              Tax And Duties
            </h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[90%] pb-4">
                Taxes and duties are financial charges imposed by governments on
                individuals, businesses, and imported/exported goods to generate
                revenue for public services and infrastructure.
              </p>
            </div>
          </div>
          {/* Tax Table */}
          <div className="px-6 py-4">
            <TaxTable />
          </div>
        </div>
      </div>
    </>
  );
}
