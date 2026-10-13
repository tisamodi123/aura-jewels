"use client";

import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import PolicyBox from "./_components/PolicyBox";

export default function Policies() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState("");
  console.log(state, "<---");
  return (
    <>
      {!state ? (
        <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
          <div className="">
            <div className=" px-6 pt-6 ">
              <h2 className="text-[0.98rem] font-semibold mb-2">Policies</h2>
              <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
                <p className="text-[#656B7B] text-[0.80rem] w-[80%] pb-4">
                  Policies are formalized rules, guidelines, and procedures
                  established by organizations, businesses, and governments to
                  regulate behavior, ensure compliance, and maintain order.
                </p>
              </div>
            </div>
            <div className="px-6 mt-6 pb-6">
              <div className="border  rounded-md ">
                <div className="">
                  <div className="text-[0.80rem] ">
                    <div
                      onClick={() => setState("returnRefundPolicy")}
                      className="border-b-[1px]  cursor-pointer border-[#E4E8EE]"
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div>Return and refund policy</div>
                        <div className="flex items-center gap-2">
                          <div className="border border-[#E4E8EE] px-2 text-[0.70rem] text-[#656B7B] py-1 rounded-md">
                            No Policy Set
                          </div>
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setState("privacyPolicy")}
                      className="border-b-[1px] cursor-pointer border-[#E4E8EE]"
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div>Privacy Policy</div>
                        <div className="flex items-center gap-2">
                          <div className="border border-[#E4E8EE] px-2 text-[0.70rem] text-[#656B7B] py-1 rounded-md">
                            No Policy Set
                          </div>
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setState("termOfServices")}
                      className="border-b-[1px] cursor-pointer border-[#E4E8EE]"
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div>Terms of Services</div>
                        <div className="flex items-center gap-2">
                          <div className="border border-[#E4E8EE] px-2 text-[0.70rem] text-[#656B7B] py-1 rounded-md">
                            No Policy Set
                          </div>
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setState("shippingPolicy")}
                      className="border-b-[1px] cursor-pointer border-[#E4E8EE]"
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div>Shipping policy</div>
                        <div className="flex items-center gap-2">
                          <div className="border border-[#E4E8EE] px-2 text-[0.70rem] text-[#656B7B] py-1 rounded-md">
                            No Policy Set
                          </div>
                          <div>
                            <ChevronRightIcon color="#656B7B" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setState("contactInformation")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center p-3  justify-between">
                        <div>Contact information</div>
                        <div className="flex items-center gap-2">
                          <div className="border  bg-[#F19C91] text-white px-2 text-[0.70rem] py-1 rounded-md">
                            Required
                          </div>
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
        <PolicyBox title={state} setState={setState} />
      )}
    </>
  );
}
