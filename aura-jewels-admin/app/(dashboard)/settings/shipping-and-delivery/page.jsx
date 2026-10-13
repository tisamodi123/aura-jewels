"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import RolePermissionModal from "../_components/RolePermissionModal";
import ShippingTable from "./_components/ShippingTable";
import DeliveryShipingModal from "../_components/DeliveryShipModal";
import Link from "next/link";
import { PREFIX } from "@/lib/APIUrl";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function ShippingPage() {
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
      {/* Import Section */}
      {isImport && (
        <div className="shadow-sm px-6 py-4 rounded-md bg-white">
          <div>
            <div className="border-b-[1px] border-[#E4E8EE] mb-4">
              <h2 className="text-[0.98rem] flex items-center gap-2 font-semibold mb-4">
                <Link
                  href={`#`}
                  onClick={() => setIsImport(false)}
                  className="cursor-pointer"
                >
                  <MoveLeft />
                </Link>{" "}
                <span> Shipping Charge Import</span>
              </h2>
            </div>
          </div>
          <div className="border h-36 rounded-md flex justify-center items-center relative">
            <div className="">
              <div className="flex items-center  justify-center py-2 gap-4">
                <Button
                  variant="outline"
                  title="Download Sample file"
                  className="hand rounded-lg"
                >
                  <Link
                    href={"/sample-file/diamond-import-sample.csv"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={PREFIX + "/cloudComputing.svg"}
                      alt="uploadIcon"
                      height={18}
                      width={18}
                    />
                    <span className="text-[#656B7B]">Sample File</span>
                  </Link>
                </Button>
                <div>
                  <input
                    type="file"
                    id="excel-upload"
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleExcelChange}
                  />
                  <Button
                    className="w-[134px] h-[38px] rounded-lg transition-all duration-300 px-2 py-1  shadow-none cursor-pointer"
                    disabled={uploadLoader}
                    variant="outline"
                  >
                    <label
                      className="w-full flex items-center gap-3 text-gray-500 cursor-pointer overflow-x-clip"
                      htmlFor="excel-upload"
                    >
                      {files === "" ? (
                        uploadLoader ? (
                          <>
                            <SmallSpinner size="20px" color="blue" />
                            <span className="text-[#656B7B]">Attach File</span>
                          </>
                        ) : (
                          <>
                            <Image
                              src={PREFIX + "/paperPin.svg"}
                              alt="attachedFileIcon"
                              height={14}
                              width={14}
                            />
                            <span className="text-[#656B7B]">Attach File</span>
                          </>
                        )
                      ) : (
                        files?.name
                      )}
                    </label>
                  </Button>
                </div>
              </div>
              <div className="flex justify-end absolute right-0 mr-9 gap-4">
                <Button
                  className="bg-[#3AAE48] cursor-pointer hover:bg-green-50 hover:border-[#3AAE48] hover:border hover:text-[#3AAE48] h-[34px] text-[0.80rem]"
                  onClick={handleFileUploadAPI}
                >
                  Upload
                </Button>
                <Button
                  className={
                    files === ""
                      ? "cursor-not-allowed bg-[#4B4B4B] text-white h-[34px] text-[0.80rem]"
                      : " bg-[#4B4B4B] text-white h-[34px] text-[0.80rem] hand"
                  }
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Shiping Delivery Content */}
      {!isImport && (
        <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
          <div className="">
            <div className=" px-6 pt-6 ">
              <h2 className="text-[0.98rem] font-semibold mb-2">
                Shipping & Delivery
              </h2>
              <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
                <p className="text-[#656B7B] text-[0.80rem] w-[70%] pb-4">
                  Shipping and delivery are key logistics processes that
                  transport goods from sellers to buyers. Efficient management
                  enhances customer satisfaction, reduces costs, and streamlines
                  operations across e-commerce, retail, and supply chains.
                </p>
                <div className="flex items-start  gap-4">
                  <Button
                    onClick={() => setIsImport(true)}
                    className="primaryWhiteButton"
                  >
                    Import
                  </Button>
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="hand h-[36px] px-5  font-normal bg-black text-[0.80rem] text-white"
                  >
                    Create New
                  </Button>
                </div>
              </div>
            </div>
            {/* Shipping Table */}
            <ShippingTable />
          </div>
        </div>
      )}
      <DeliveryShipingModal open={isOpen} setOpen={setIsOpen} />
    </>
  );
}
