"use client";

import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function AddItemCode({ open, setOpen, setRefresh, itemCodearray, sessionData }) {



  const id = sessionData?.[0]?.id;
  const [itemCodes, setItemCodes] = useState([{ id: 1, value: "" }]);
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();


  useEffect(() => {

    if (itemCodearray && typeof itemCodearray === 'string' && itemCodearray.trim() !== "") {

      const itemCodeList = itemCodearray.split(",").map((code, index) => ({
        id: Date.now() + index,
        value: code.trim()
      }));
      setItemCodes(itemCodeList.length > 0 ? itemCodeList : [{ id: 1, value: "" }]);
    } else if (Array.isArray(itemCodearray) && itemCodearray.length > 0) {

      const itemCodeList = itemCodearray.map((code, index) => ({
        id: Date.now() + index,
        value: typeof code === 'string' ? code.trim() : String(code).trim()
      }));
      setItemCodes(itemCodeList);
    } else {

      setItemCodes([{ id: 1, value: "" }]);
    }
  }, [itemCodearray]);

  const handleAddItemCode = () => {
    setItemCodes([...itemCodes, { id: Date.now(), value: "" }]);
  };

  const handleRemoveItemCode = (id) => {
    if (itemCodes.length > 1) {
      setItemCodes(itemCodes.filter(item => item.id !== id));
    } else {
      setItemCodes([{ id: 1, value: "" }]);
    }
  };

  const handleItemCodeChange = (id, value) => {
    setItemCodes(itemCodes.map(item =>
      item.id === id ? { ...item, value: value } : item
    ));
  };

  const validateForm = () => {
    const filledItemCodes = itemCodes.filter(item => item.value.trim() !== "");

    if (filledItemCodes.length === 0) {
      toast.error("At least one item code is required");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const itemCodeString = itemCodes
      .filter(item => item.value.trim() !== "")
      .map(item => item.value.trim())
      .join(",");

    const formData = new FormData();
    formData.append("sesstionName", 'sesstion_4');
    formData.append("itemcode", itemCodeString);

    try {
      const result = await callApi(`${API_URL.UPDATE_SESSION}/${id}`, "PUT", formData, token);

      if (result.errorCode === STATUS_CODE.OK) {
        console.log('result add item --->', result)
        toast.success(result.message || "Session updated successfully");
        handleReset();
        setRefresh(Math.random());
        setOpen(false);


      } else {
        toast.error(result.message || "Failed to update session");
      }
    } catch (error) {
      console.log("Error updating session:", error.message);
      toast.error("Failed to update session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItemCodes([{ id: 1, value: "" }]);
    setSessionName("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#00000066] z-[9999]" />

        {/* Close Button */}
        <Dialog.Close asChild>
          <button
            type="button"
            className="absolute cursor-pointer top-4 right-[40%] z-[10000] bg-white p-2 rounded-tl-sm rounded-bl-sm hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </Dialog.Close>

        <Dialog.Content className="fixed top-0 right-0 w-[40%] h-full bg-white z-[9999] flex flex-col focus:outline-none">
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4">
            <Dialog.Title className="text-[0.96rem] font-semibold">
              Manage Item Codes
            </Dialog.Title>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Item Codes Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[0.80rem] font-semibold">
                  Item Codes <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={handleAddItemCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#087B5D] text-white rounded-md hover:bg-[#076850] transition-colors text-[0.75rem] font-normal"
                >
                  <Plus size={14} />
                  Add Item Code
                </button>
              </div>

              {/* Item Code Fields */}
              <div className="space-y-3">
                {itemCodes.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.75rem] text-gray-500 min-w-[20px]">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleItemCodeChange(item.id, e.target.value)}
                          placeholder="Enter item code"
                          className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItemCode(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove item code"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Info Text */}
              <p className="text-[0.70rem] text-gray-500 mt-3">
                <span className="font-semibold">Total Item Codes:</span> {itemCodes.filter(item => item.value.trim() !== "").length}
              </p>
            </div>
          </div>

          {/* Footer with Action Buttons */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="bg-[#DC646A] cursor-pointer text-white rounded-md px-5 py-2 text-[0.80rem] hover:bg-[#c85158] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-[#087B5D] cursor-pointer text-white rounded-md px-5 py-2 text-[0.80rem] hover:bg-[#076850] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
