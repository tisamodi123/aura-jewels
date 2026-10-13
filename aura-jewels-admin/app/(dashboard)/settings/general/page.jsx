"use client";

import { PREFIX } from "@/lib/APIUrl";
import { ChevronDown, ChevronRight, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BillingModalAddress from "../_components/BillingAddressModal";

export default function GeneralPage() {
  const [prefix, setPrefix] = useState("#");
  const [suffix, setSuffix] = useState("--");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-6 bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className="border-b-[1px] border-[#E4E8EE] mb-6">
            <h2 className="text-[0.98rem] font-semibold mb-2">Order ID</h2>
            <p className="text-[#656B7B] text-[0.80rem] pb-4">
              This identifier is prominently displayed on the order page,
              customer-related pages, and included in customer order
              notifications to serve as a unique reference for the order,
              ensuring clarity and seamless tracking throughout the purchasing
              and fulfillment process.
            </p>
          </div>
          {/* Size-Cut Grade Input */}
          <div className="flex gap-6 mb-6 items-center">
            <div className="flex-1">
              <label
                htmlFor="applicableGender"
                className="block text-[0.80rem] font-semibold mb-2"
              >
                Prefix
              </label>
              <input
                type="text"
                id="size"
                name="size"
                placeholder="#"
                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="applicableGender"
                className="block text-[0.80rem] font-semibold mb-2"
              >
                Suffix
              </label>
              <input
                type="text"
                id="cutGrade"
                name="cutGrade"
                placeholder="--"
                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <p className="text-[0.80rem] text-[#656B7B] mt-1">
            Your order ID will appear as {prefix}1001, {prefix}1002, {prefix}
            1003 ...
          </p>
        </div>
      </div>
      {/* Events */}
      {/* <div className="max-w-4xl mx-auto px-6 py-6 mb-6 bg-white rounded-lg shadow-sm">
        <div className="">
          <div className="border-b-[1px] border-[#E4E8EE] mb-6">
            <h2 className="text-[0.98rem] font-semibold mb-2">Events</h2>
          </div>
          <div
            onClick={() => router.push("/settings/general/store-activity-log")}
            className="flex cursor-pointer items-center justify-between border border-[#E4E8EE] rounded-md mb-3 py-2 px-3"
          >
            <span className="text-sm">Store Activity Log</span>
            <span>
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div> */}
      {/* Billing Address */}
      {/* <div className="max-w-4xl mx-auto px-6 py-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <Image
                src={`${PREFIX}/location2.svg`}
                alt="locationIcon"
                height={18}
                width={18}
              />
            </div>
            <div className="text-[0.80rem]">
              <div>Billing Address</div>
              <div className="text-[#656B7B] ">
                Mumbai, Maharashtra, India
              </div>
            </div>
          </div>
          <div
            onClick={() => setIsOpen(true)}
            className="border border-[#E4E8EE] rounded-full p-2  cursor-pointer hover:bg-[#F5F6F8]"
          >
            <Image
              src={`${PREFIX}/editIcon.svg`}
              alt="Edit Icon"
              height={16}
              width={16}
            />
          </div>
        </div>
      </div> */}
      <BillingModalAddress open={isOpen} setOpen={setIsOpen} />
    </>
  );
}
