"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { PREFIX } from "@/lib/APIUrl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import QuillEditor from "@/components/textEditor";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";

export default function BillingModalAddress({ open, setOpen }) {
  const [description, setDescription] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerEndDate, setOfferEndDate] = useState("");
  const [state, setState] = useState("general");
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-40" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-50 bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] custom-scrollbar h-full bg-white z-50 px-6 py-4 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Billing Address
              </Dialog.Title>

              <div className="flex gap-2">
                <div className="bg-[#087B5D] text-white rounded-md px-4 py-2 text-[0.8rem]">
                  Save
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              {/* Business Name / country input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="businesName"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Bussiness Name
                  </label>
                  <input
                    type="text"
                    id="businesName"
                    name="businesName"
                    placeholder="Enter Bussiness Name"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="shape"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Country/Region
                  </label>
                  <Select>
                    <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                      <SelectValue
                        placeholder="Select Country/Region"
                        className="text-[#656B7B]"
                      />
                      <ChevronDown className="h-4 w-4 text-[#656B7B]" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem
                          className=" hover:bg-gray-100"
                          value="apple"
                        >
                          India
                        </SelectItem>
                        <SelectItem value="banana">America</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Address */}
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-[0.80rem] font-semibold mb-2"
                >
                  Address
                </label>
                <div className="text-[0.80rem] px-4 py-2 rounded-md border">
                  Aura Jewels Luxury Retail, 402, Business Bay
                </div>
              </div>
              {/* Appartment input */}
              <div>
                <div className="flex gap-6 mb-6 mt-4 items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="businesName"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Appartment, Suite, Etc
                    </label>
                    <input
                      type="text"
                      id="businesName"
                      name="businesName"
                      placeholder="Enter Appartment, Suite, Etc"
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                {/* City Name  */}
                <div className="flex gap-6 mb-6 items-center">
                  <div className="flex-1">
                    <label
                      htmlFor="type"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="cityName"
                      name="cityName"
                      placeholder="Enter City"
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="shape"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      State
                    </label>
                    <Select>
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                        <SelectValue
                          placeholder="Select State"
                          className="text-[#656B7B]"
                        />
                        <ChevronDown className="h-4 w-4 text-[#656B7B]" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem
                            className=" hover:bg-gray-100"
                            value="apple"
                          >
                            Gujarat
                          </SelectItem>
                          <SelectItem value="banana">Maharashtra</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Address */}
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    PIN Code
                  </label>
                  <div className="text-[0.80rem] px-4 py-2 rounded-md border">
                    395009
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
