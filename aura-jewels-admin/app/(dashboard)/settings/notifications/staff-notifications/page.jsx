"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NewOrder from "./_components/NewOrder";
import NewReturnReq from "./_components/NewReturnRequest";

export default function StaffNotificationPage() {
  const [state, setState] = useState("");
  return (
    <>
      {!state ? (
        <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
          <div className="">
            <div className=" px-6 pt-6 ">
              <h2 className="text-[0.98rem] flex items-center gap-2 font-semibold mb-4">
                <Link
                  href={`/settings/notifications`}
                  className="cursor-pointer"
                >
                  <MoveLeft />
                </Link>{" "}
                <span>Staff Notifications</span>
              </h2>
            </div>
            {/* First Notification Box */}
            <div className="px-6 mt-6 pb-6">
              <div className="border px-4  rounded-md ">
                {/* New Order */}
                <div onClick={() => setState("newOrder")} className="">
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">New Order</span>
                          <span className="text-[#656B7B]">
                            Sent when a customer places an order
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* New Return Request */}
                <div onClick={() => setState("newReturnRequest")} className="">
                  <div className="text-[0.80rem]  ">
                    <div className="py-3  cursor-pointer">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">New Return Request</span>
                          <span className="text-[#656B7B]">
                            Sent when a customer requests a return on an order
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {state === "newOrder" && <NewOrder setState={setState} />}
          {state === "newReturnRequest" && <NewReturnReq setState={setState} />}
        </div>
      )}
    </>
  );
}
