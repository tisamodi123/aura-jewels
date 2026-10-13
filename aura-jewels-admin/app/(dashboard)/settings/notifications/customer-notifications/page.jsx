"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Link from "next/link";
import OrderConfirmation from "./_components/OrderConfirmation";
import { useState } from "react";
import ShippingConfirmation from "./_components/ShippingConfirmation";
import OrderCancelled from "./_components/OrderCancelled";
import OrderRefund from "./_components/OrderRefund";
import PaymentError from "./_components/PaymentError";
import ReturnCreated from "./_components/ReturnCreated";
import ReturnReqRecieved from "./_components/ReturnReqRecieved";
import ReturnReqApproved from "./_components/ReturnReqApproved";
import ReturnReqDeclined from "./_components/ReturnReqDeclined";

export default function CustomerNotificationPage() {
  const [state, setState] = useState("");
  console.log("--->", state);
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
                <span>Customer Notifications</span>
              </h2>
            </div>
            {/* First Notification Box */}
            <div className="px-6 mt-6 pb-6">
              <div className="border px-4  rounded-md ">
                {/* Order Confirmation */}
                <div onClick={() => setState("orderConfirmation")} className="">
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Order Confirmation</span>
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
                {/* Shipping Confirmation */}
                <div onClick={() => setState("shippingConfirmation")}>
                  <div className="text-[0.80rem]  ">
                    <div className="border-b-[1px] py-3  cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Shipping Confirmation</span>
                          <span className="text-[#656B7B]">
                            Sent when you mark an order as fulfilled
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
                {/* Order Cancelled */}
                <div onClick={() => setState("orderCancelled")}>
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Order Cancelled</span>
                          <span className="text-[#656B7B]">
                            Sent if a customer cancels their order
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
                {/* Order Refund */}
                <div onClick={() => setState("orderRefund")}>
                  <div className="text-[0.80rem] ">
                    <div className=" cursor-pointer">
                      <div className="flex items-center py-3   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Order Refuncd</span>
                          <span className="text-[#656B7B]">
                            Sent if an order is refunded
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
            {/* Second Notification Box */}
            <div className="px-6 pb-6">
              <div className="border px-4  rounded-md ">
                {/* Payment Error */}
                <div onClick={() => setState("paymentError")}>
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Payment Error</span>
                          <span className="text-[#656B7B]">
                            Sent if a customer's payment can't be processed
                            during checkout
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
                {/* Delivered */}
                <div>
                  <div className="text-[0.80rem]  ">
                    <div className=" py-3  cursor-pointer">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Delivered</span>
                          <span className="text-[#656B7B]">
                            Sent if an order with a tracking number is delivered
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <Switch className="h-4 w-8 [&>span]:h-3 [&>span]:w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Third Notification Box */}
            <div className="px-6 pb-6">
              <div className="border px-4  rounded-md ">
                {/* Return Created */}
                <div onClick={() => setState("returnCreated")}>
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">Return Created</span>
                          <span className="text-[#656B7B]">
                            Sent when you create a return, including any return
                            label or tracking information
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
                {/* Return Requested Received */}
                <div onClick={() => setState("returnReqReceived")}>
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">
                            Return Requested Received
                          </span>
                          <span className="text-[#656B7B]">
                            Sent to confirm a customer’s self-serve return
                            request was received
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
                {/* Return request approved */}
                <div onClick={() => setState("returnReqApproved")}>
                  <div className="text-[0.80rem] ">
                    <div className="border-b-[1px] py-3 cursor-pointer border-[#E4E8EE]">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">
                            Return request approved
                          </span>
                          <span className="text-[#656B7B]">
                            Sent when you approve a return request
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
                {/* Return request declined */}
                <div onClick={() => setState("returnReqDeclined")}>
                  <div className="text-[0.80rem] ">
                    <div className="py-3 cursor-pointer">
                      <div className="flex items-center   justify-between">
                        <div className="flex flex-col ">
                          <span className="mb-0.5">
                            Return request declined
                          </span>
                          <span className="text-[#656B7B]">
                            Sent when you decline a return request
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
          {state === "orderConfirmation" && (
            <OrderConfirmation setState={setState} />
          )}
          {state === "shippingConfirmation" && (
            <ShippingConfirmation setState={setState} />
          )}
          {state === "orderCancelled" && <OrderCancelled setState={setState} />}
          {state === "orderRefund" && <OrderRefund setState={setState} />}
          {state === "paymentError" && <PaymentError setState={setState} />}
          {state === "returnCreated" && <ReturnCreated setState={setState} />}
          {state === "returnReqReceived" && (
            <ReturnReqRecieved setState={setState} />
          )}
          {state === "returnReqApproved" && (
            <ReturnReqApproved setState={setState} />
          )}
          {state === "returnReqDeclined" && (
            <ReturnReqDeclined setState={setState} />
          )}
        </div>
      )}
    </>
  );
}
