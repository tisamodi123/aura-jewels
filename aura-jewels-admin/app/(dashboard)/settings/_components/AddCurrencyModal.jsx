"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function AddCurrencyModal({ open, setOpen, GetCurrencyData }) {
  const [role, setRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const token = getToken();
  const [formData, setFormData] = useState({
    currency: "",
    caption: "",
    sign: "",
    amount: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log(formData);

  // Add API integraation

  const addCurrencyHandler = () => {
    const formdata = new FormData();
    formdata.append("currency", formData.currency);
    formdata.append("caption", formData.caption);
    formdata.append("sign", formData.sign);
    formdata.append("amount", formData.amount);
    
    callApi(`${API_URL?.CREATE_CURRENCY}`, "POST", formdata, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          toast.success(result?.message);
          GetCurrencyData();
          setOpen(false);
        } else {
          toast.error(M.common.createFailed);
        }
      })
      .catch((err) => {
        toast.error(M.common.createFailed);
      });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] custom-scrollbar h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Add Currency
              </Dialog.Title>

              <div
                onClick={addCurrencyHandler}
                className="flex gap-2 cursor-pointer"
              >
                <div className="bg-[#087B5D] text-white rounded-md px-4 py-2 text-[0.8rem]">
                  Save
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              {/*Name input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="currency"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Currency
                  </label>
                  <input
                    type="text"
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    placeholder="Enter Currency"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="caption"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Caption
                  </label>
                  <input
                    type="text"
                    id="caption"
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    placeholder="Enter Caption"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/*Email/Phone Number input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="sign"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Sign
                  </label>
                  <input
                    type="text"
                    id="sign"
                    name="sign"
                    value={formData.sign}
                    onChange={handleInputChange}
                    placeholder="Enter Sign"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="amount"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Amount
                  </label>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter Amount"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
