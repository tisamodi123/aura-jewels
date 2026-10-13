"use client";

//** React imports */
import { useCallback, useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";

//** Third party imports */
import Modal from "react-modal";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import {
  CloudUpload,
  Download,
  FileUp,
  HomeIcon,
  MoveLeft,
  Paperclip,
} from "lucide-react";

//** Shadcnui component imports */
import { Button } from "@/components/ui/button";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";

//** Custom component imports */
import Breadcrumbs from "@/components/Breadcrumbs";
import SmallSpinner from "@/components/SmallSpinner";

import FullScreenLoader from "@/components/fullScreenloader";
import SellingPriceImportHistoryListTable from "./ImportHistoryListTable";
import DiamondMarginTable from "./SellingPriceListTable";

const SellingPrice = () => {
  //** Get Token */
  const token = getToken();

  //** State */
  const [files, setFiles] = useState("");
  const [isImport, setIsImport] = useState(false);

  const [diaType, setDiaType] = useState("Lab Grown");

  const [importLoad, setImportLoad] = useState(false);
  const [uploadLoader, setUploadLoader] = useState(false);

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [sellignPriceData, setSellignPriceData] = useState([]);

  const handleImportEvent = (val) => {
    setIsImport(val);
  };

  const handleDiamonType = (val) => {
    setDiaType(val);
  };

  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles(file);
      setOpenConfirmation(true);
    } else {
      toast.error(M.validation.required);
    }
  };

  const clickOnNo = () => {
    setFiles("");
    setOpenConfirmation(false);
    setUploadLoader(false);
  };

  const ClickOnYes = async () => {
    try {
      setUploadLoader(true);
      if (!files) {
        toast.error(M.validation.required);
        return;
      }
      setImportLoad(true);
      const formData = new FormData();
      formData.append("file", files);
      formData.append("diamondType", diaType);

      const result = await callApi(`${API_URL.UPLOAD_SELLING_PRICE_FILE}`, "POST", formData, token);
      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result?.message);
        setUploadLoader(false);
        setOpenConfirmation(false);
        setFiles("");
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
      }
    } catch (error) {
      toast.error(M.common.somethingWentWrong);
    } finally {
      setUploadLoader(false);
      setImportLoad(false);
    }
  };

  return (
    <>
      {uploadLoader && <FullScreenLoader />}
      <div className="text-lg font-semibold mb-3">Diamond Margin</div>
      {!isImport ? (
        <div>
          <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
            <div className="flex justify-between">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className={`hand ${diaType === "Lab Grown" ? "bg-black text-white" : ""
                    }`}
                  onClick={() => handleDiamonType("Lab Grown")}
                >
                  Lab
                </Button>
                {/* <Button
                  variant="outline"
                  className={`hand ${diaType === "Natural" ? "bg-black text-white" : ""
                    }`}
                  onClick={() => handleDiamonType("Natural")}
                >
                  Natural
                </Button> */}
              </div>
              <div className="">
                <Button
                  variant="outline"
                  className="hand"
                  onClick={() => handleImportEvent(true)}
                >
                  Import
                </Button>
              </div>
            </div>
          </div>
          <DiamondMarginTable diaType={diaType} />
        </div>
      ) : (
        <div>
          <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
            <Button onClick={() => setIsImport(false)} className="hand">
              <MoveLeft />
              Diamond Margin List
            </Button>
          </div>
          <div className="rounded-md border border-gray-200 p-4 mb-3 bg-white shadow-sm">
            <div className="">Import Diamond Margin</div>
            <div className="flex items-center justify-center py-2 gap-4">
              <Button
                variant="outline"
                title="Download Sample file"
                className="hand"
              >
                <Link
                  href={"/sample-file/dimondMargin-import-sample.xlsx"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download />
                  Sample File
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
                  className="w-[134px] h-[38px] transition-all duration-300 px-2 py-1 rounded-md shadow-none cursor-pointer"
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
                          Attach File
                        </>
                      ) : (
                        <>
                          <Paperclip size={20} />
                          Attach File
                        </>
                      )
                    ) : (
                      files?.name
                    )}
                  </label>
                </Button>
              </div>
            </div>
            <div className="flex justify-end mr-9 gap-4">
              <Button className="hand bg-black text-white" onClick={ClickOnYes}>
                Upload Excel File
              </Button>
              <Button
                className={
                  files === ""
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-white hover:bg-gray-100 hand"
                }
                variant="outline"
                onClick={clickOnNo}
              >
                Reset
              </Button>
            </div>
          </div>
          <SellingPriceImportHistoryListTable diaType={diaType} />
        </div>
      )}
      {/* <Modal
                isOpen={openConfirmation}
                onRequestClose={clickOnNo}
                contentLabel="Confirm File Upload"
                ariaHideApp={false}
                style={{
                    content: {
                        top: "50%",
                        left: "50%",
                        right: "auto",
                        bottom: "auto",
                        marginRight: "-50%",
                        transform: "translate(-50%, -50%)",
                        width: "50%",
                        maxWidth: "500px",
                        padding: "0px",
                        borderRadius: "7px",
                        zIndex: 1000,
                        textAlign: "center",
                    },
                    overlay: {
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        zIndex: 1000,
                    },
                }}
            >
                <div className="modal-header my-0 py-0">
                    <h4 className="modal-title my-0 py-0">Confirm File Upload</h4>
                </div>

                <div className="modal-body">
                    <p>Are you sure you want to upload this file? This action cannot be undo.</p>
                </div>

                <div className="modal-footer gap-2.5">
                    <Button variant="outline" className='font-bold hand' onClick={clickOnNo} >No</Button>
                    <Button variant="secondary" className="bg-black font-bold text-white hand" onClick={ClickOnYes}>
                        Yes
                    </Button>
                </div>
            </Modal> */}
    </>
  );
};

export default SellingPrice;
