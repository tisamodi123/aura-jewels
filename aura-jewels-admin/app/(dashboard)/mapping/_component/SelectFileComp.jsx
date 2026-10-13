"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { Label } from "@/components/ui/label";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const SelectFileComp = ({
  setIsShowMapCom,
  setExcelHeadArr,
  setVendorId,
  setFileType,
}) => {
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const token = getToken();
  const [vendorList, setVendorList] = useState([]);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const SUPPORTED_FORMATS = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const GetVendorList = () => {
    callApi(`${API_URL?.VENDOR_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode === STATUS_CODE.OK) {
          setVendorList(result?.vendorList);
        }
      });
  };

  useEffect(() => {
    GetVendorList();
  }, []);

  const { values, errors, touched, handleChange, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        vendorId: "",
        file: "",
        jsonText: "",
      },
      validationSchema: Yup.object({
        vendorId: Yup.string().required("Please Select Vendor."),
        file: Yup.mixed()
          .test(
            "at-least-one",
            "Please select Excel file or enter JSON.",
            function (file) {
              const { jsonText } = this.parent;
              return !!file || (jsonText && jsonText.trim().length > 0);
            }
          )
          .test("file-format", "Unsupported file format.", function (file) {
            if (file) return SUPPORTED_FORMATS.includes(file.type);
            return true; // No file, that's okay if JSON provided
          }),
        jsonText: Yup.string(),
      }),
      enableReinitialize: true,
      onSubmit: async (val) => {
        setIsLoading(true);
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const formdata = new FormData();
        formdata.append("file", val.file);

        // Validate and stringify JSON, if present
        let jsonToSend = "";
        if (val.jsonText && val.jsonText.trim().length > 0) {
          try {
            // Parse first to catch errors, then stringify
            const parsedJson = JSON.parse(val.jsonText); // throws error if invalid
            jsonToSend = JSON.stringify(parsedJson);
          } catch (e) {
            setIsLoading(false);
            toast.error(M.validation.required);
            return;
          }
        }
        formdata.append("json", jsonToSend);

        setVendorId(val.vendorId);
        let url = `${API_URL?.GET_EXCEL_HEADER}/`;

        callApi(url, "POST", formdata, token)
          .then((result) => {
            setIsLoading(false);
            if (result?.errorCode === STATUS_CODE.OK) {
              setExcelHeadArr(result?.data);
              setIsShowMapCom(true);
            } else {
              toast.error(result?.message);
            }
          })
          .catch((err) => {
            setIsLoading(false);
            toast.error(M.common.somethingWentWrong);
          });
      },
    });

  // Mutual exclusivity: disable file input if JSON entered, disable JSON if file chosen
  const canSelectFile = !values.jsonText.trim();
  const canSelectJson = !values.file;

  const handleFileSelect = (e) => {
    const files = e.target.files?.[0];
    setFieldValue("file", files);
    if (files) {
      // Clear JSON when a file is selected
      setFieldValue("jsonText", "");
    }
  };

  const removeFile = () => {
    setFieldValue("file", "");
    setFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => {
    if (canSelectFile) fileInputRef.current?.click();
    setFileType("Excel");
  };

  // Handle JSON textarea changes to update Formik and enforce validation
  const handleJsonChange = (e) => {
    setFieldValue("jsonText", e.target.value);
    if (e.target.value.length > 0) {
      // Clear file if JSON is entered
      setFieldValue("file", "");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleJsonDialog = () => {
    setShowJsonDialog(true);
    setFileType("JSON");
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md p-3 mb-5">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols mt-2">
            {/* Vendor Select */}
            <div className="mb-4">
              <label
                htmlFor="vendor"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                <b>Vendor</b>
              </label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[25%] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                name="vendorId"
                onChange={handleChange}
                value={values.vendorId}
              >
                <option value="">--- Select Vendor ---</option>
                {vendorList?.map((value, index) =>
                  value?.status === "ACTIVE" ? (
                    <option key={`vendorlist-${index}`} value={value?.id}>
                      {value?.firstName} {value?.lastName}
                    </option>
                  ) : null
                )}
              </select>
              {touched.vendorId && errors.vendorId && (
                <p className="text-sm text-red-500">{errors.vendorId}</p>
              )}
            </div>

            {/* File and JSON Select */}
            <div className="pt-2">
              <Label className="text-sm font-medium">
                <b>Select Mapping File:</b>
              </Label>
              <div className="flex w-full mt-2 gap-8">
                {/* Excel file */}
                <div>
                  <label className="text-[0.9rem] font-bold">Excel</label>
                  <div
                    onClick={openFilePicker}
                    className={`flex items-center mt-2 gap-4 justify-center p-3 rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200 ${
                      !canSelectFile ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div>
                      <Upload size={20} />
                    </div>
                    <span className="text-[0.86rem]"> Upload Excel</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={!canSelectFile}
                    />
                  </div>
                  {values.file && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">{values.file.name}</span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* JSON */}
                <div>
                  <label className="text-[0.9rem] font-bold">JSON</label>
                  <div className="mt-2">
                    <div
                      onClick={canSelectJson ? handleJsonDialog : undefined}
                      className={`flex items-center gap-4 justify-center p-3 rounded-md cursor-pointer hover:bg-gray-300 bg-gray-200 ${
                        !canSelectJson ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div>
                        <Upload size={20} />
                      </div>
                      <span className="text-[0.86rem]"> Upload Json</span>
                    </div>
                  </div>

                  {values.jsonText && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">JSON Entered</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFieldValue("jsonText", "");
                          setFileType("");
                        }}
                        className="text-red-500"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Validation error message for file or json */}
              {touched.file && errors.file && (
                <p className="text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* Submit/reset buttons */}
            <div className="pt-2 mt-4">
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded hand"
                disabled={isLoading}
              >
                Import File
              </Button>
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hand"
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Dialog For JSON Input */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent>
          <DialogTitle>Enter JSON Data</DialogTitle>
          <textarea
            rows={10}
            className="w-full border rounded-md px-2 py-1 mt-2"
            value={values.jsonText}
            onChange={handleJsonChange}
            placeholder="Paste your JSON here"
          />
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setShowJsonDialog(false)}
              className="cursor-pointer"
              type="button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectFileComp;
