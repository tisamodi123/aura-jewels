"use client";

//** React imports */
import { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import { Download, MoveLeft, Paperclip } from "lucide-react";

//** Shadcn-ui imports */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { isValidData } from "@/lib/utils";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

//** Custom component imports */
import StoneGrpTable from "./stoneGrpTable";
import Breadcrumbs from "@/components/Breadcrumbs";
import SmallSpinner from "@/components/SmallSpinner";
import FullScreenLoader from "@/components/fullScreenloader";
import StoneGroupTable from "./stoneGroupTable";
import PreviousStoneGroupUploadFileTable from "./previousUpload";
import StoneGroupDefault from "./stoneGroupDefault";

const StoneGrpComp = () => {
  //** Get token */
  const token = getToken();

  //** Next hooks */
  const router = useRouter();

  //** State */
  const [activeTab, setActiveTab] = useState("list");
  const [files, setFiles] = useState("");
  const [isSuccess, setIsSuccess] = useState(0);
  const [isImport, setIsImport] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [uploadLoader, setUploadLoader] = useState(false);
  const [diaType, setDiaType] = useState("Lab Grown");
  const [excelPop, setExcelPop] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [excelLink, setExcelLink] = useState("");

  const handleExport = async () => {
    try {
      setIsExportLoading(true);
      const result = await callApi(`${API_URL.EXPORT_STONE_GROUP}`, "POST", null, token);
      if (result?.errorCode === STATUS_CODE.OK) {
        setExcelLink(result?.url);
        setIsExportLoading(false);
        setExcelPop(true);
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
        setIsExportLoading(false);
      }
    } catch (error) {
      console.error("Error exporting:", error);
      setIsExportLoading(false);
      toast.error(M.common.somethingWentWrong);
    }
  };

  const handleDownloadExport = async () => {
    if (!excelLink) return;
    try {
      const response = await fetch(excelLink);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = excelLink.split("/").pop() || "stone_group_export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(excelLink, "_blank");
    } finally {
      setExcelPop(false);
    }
  };

  const handleImportEvent = (val) => {
    setIsImport(val);
  };

  const handleExcelChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFiles(file);
    }
    // Clear the native input value so the next pick fires onChange even
    // when the user reselects the same filename. Without this the picker
    // appears to do nothing after the first upload.
    event.target.value = "";
  };

  const hamdleResetFile = () => {
    setFiles("");
    setUploadLoader(false);
  };

  const handleFileUploadAPI = async () => {
    try {
      setUploadLoader(true);
      if (!files) {
        toast.error(M.validation.required);
        return;
      }

      const formData = new FormData();
      formData.append("excel", files);
      formData.append("diamondType", diaType);

      const result = await callApi(`${API_URL.IMPORT_STONE_GROUP}`, "POST", formData, token);
      setUploadLoader(false);
      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result?.message);
        console.log(
          "stone group excel response--->",
          result.result.rejectedSheet
        );
        console.log("stone group  response--->", result);
        setDownloadLink(result.result.rejectedSheet);
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
    setIsSuccess(Math.random());
  };

  const handleDiamonType = (val) => {
    setDiaType(val);
  };

  return (
    <>
      {uploadLoader && <FullScreenLoader />}
      {/* <Breadcrumbs /> */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          {activeTab === "list" ? "Stone Group List" : "Settings"}
        </h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "list" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("list");
              setIsImport(false);
            }}
            className="hand"
          >
            Stone Group List
          </Button>
          <Button
            variant={activeTab === "defaults" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("defaults");
              setIsImport(false);
            }}
            className="hand"
          >
            Settings
          </Button>
        </div>
      </div>

      {activeTab === "defaults" ? (
        <div className="pt-4">
          <StoneGroupDefault />
        </div>
      ) : (
        <>
          <div className="rounded-md border border-gray-200 p-2 mb-1 mt-4 bg-white shadow-sm">
            <div className="flex justify-between">
              {/* <div className="flex gap-4">
                ...
              </div> */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="hand"
                  disabled={isExportLoading}
                  onClick={handleExport}
                >
                  {isExportLoading ? "Exporting..." : "Export"}
                </Button>
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
          {!isImport ? (
            <div className="pt-2">
              <StoneGroupTable diaType={diaType} setDiaType={setDiaType} />
            </div>
          ) : (
            <div className="pt-2">
              <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
                <Button onClick={() => setIsImport(false)} className="hand">
                  <MoveLeft />
                  Stone Group List
                </Button>
              </div>
              <div className="rounded-md border border-gray-200 p-4 mb-3 bg-white shadow-sm">
                {/* <div className="">Import StoneGroup</div> */}
                <div className="flex flex-col items-center justify-center py-2 gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      title="Download Sample file"
                      className="hand"
                    >
                      <Link
                        href={"/sample-file/stone_group_sample_file.xlsx"}
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
                  {/* Download Uploaded Excel */}
                  {downloadLink && (
                    <div className="">
                      <div>
                        <span>Download Error Excel File :</span>
                        <span className="ml-6">
                          <a
                            className="bg-black text-white px-3 py-2 rounded-md text-sm"
                            href={`${downloadLink}`}
                            download
                          >
                            Download
                          </a>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mr-9 mt-6 gap-4">
                  <Button
                    className="hand bg-black text-white"
                    onClick={handleFileUploadAPI}
                  >
                    Upload Excel File
                  </Button>
                  <Button
                    className={
                      files === ""
                        ? "cursor-not-allowed bg-gray-300 text-gray-500"
                        : "bg-white hover:bg-gray-100 hand"
                    }
                    variant="outline"
                    onClick={hamdleResetFile}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
                <PreviousStoneGroupUploadFileTable isSuccess={isSuccess} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Download Excel Popover */}
      <Dialog open={excelPop} onOpenChange={setExcelPop}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Export Successful</DialogTitle>
            <DialogDescription>
              Stone Group Excel file is ready to download.
            </DialogDescription>
          </DialogHeader>
          {excelLink && (
            <Button className="cursor-pointer bg-black text-white hover:bg-zinc-800 transition-colors w-full" onClick={handleDownloadExport}>
              Download Excel
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoneGrpComp;
