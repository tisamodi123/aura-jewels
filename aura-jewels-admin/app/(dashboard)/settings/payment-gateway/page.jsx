"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import Image from "next/image";
import React, { useState } from "react";

export default function UserPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="max-w-4xl mx-auto  bg-white  px-6 py-6 rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" mb-4 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">
              Payment Gateway
            </h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[90%] pb-4">
                Payment gateways are essential for e-commerce platforms,
                subscription services, mobile applications, and online
                businesses, enabling them to accept payments via credit/debit
                cards, digital wallets, bank transfers, and other payment
                methods.
              </p>
            </div>
          </div>
          {/* Payment Options */}
          <div>
            <div title="paypal">
              <div className="flex items-center mb-4 justify-between border border-[#E4E8EE] rounded-md px-4 py-2">
                <div className="flex gap-4 items-center">
                  <div>
                    <Image
                      src={`${PREFIX}/paypal.svg`}
                      alt="paypallogo"
                      height={44}
                      width={44}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-md font-semibold">Pay Pal</span>
                    <span className="text-[0.80rem] text-[#656B7B]">
                      Secret Key : sk_text_dfkd5edfksdfk5weaxck00dfasdck
                    </span>
                  </div>
                </div>
                <div>
                  <Switch />
                </div>
              </div>
            </div>
            <div title="razorpay">
              <div className="flex items-center mb-4 justify-between border border-[#E4E8EE] rounded-md px-4 py-2">
                <div className="flex gap-4 items-center">
                  <div>
                    <Image
                      src={`${PREFIX}/razorpay.svg`}
                      alt="paypallogo"
                      height={48}
                      width={48}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-md font-semibold">Pay Pal</span>
                    <span className="text-[0.80rem] text-[#656B7B]">
                      Secret Key : sk_text_dfkd5edfksdfk5weaxck00dfasdck
                    </span>
                  </div>
                </div>
                <div>
                  <Switch />
                </div>
              </div>
            </div>
            <div title="cashOnDelivery">
              <div className="flex items-center justify-between border border-[#E4E8EE] rounded-md px-4 py-2">
                <div className="flex gap-4 items-center">
                  <div>
                    <Image
                      src={`${PREFIX}/cashondelivery.svg`}
                      alt="paypallogo"
                      height={44}
                      width={44}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-md font-semibold">Pay Pal</span>
                    <span className="text-[0.80rem] text-[#656B7B]">
                      Secret Key : sk_text_dfkd5edfksdfk5weaxck00dfasdck
                    </span>
                  </div>
                </div>
                <div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
