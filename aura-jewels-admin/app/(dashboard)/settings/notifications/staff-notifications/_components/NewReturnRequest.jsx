import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NewReturnReq({ setState }) {
  return (
    <>
      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6">
            <div className=" border-b-[1px]  border-[#E4E8EE] ">
              <h2 className="text-[0.98rem] flex items-center gap-2 font-semibold mb-4">
                <Link
                  href={`#`}
                  onClick={() => setState("")}
                  className="cursor-pointer"
                >
                  <MoveLeft />
                </Link>{" "}
                <span>New Return Request</span>
              </h2>
            </div>
          </div>
          {/* First Notification Box */}
          <div className="px-6 mt-6 pb-6">
            <div>
              <div className="text-[0.76rem] mb-2 font-semibold">Preview</div>
              <div className="border border-[#E4E8EE] rounded-md">
                <div>
                  <div className="text-[#61748F] text-[0.80rem] border-b-[1px] border-[#E4E8EE] p-3">
                    Subject : Return requested for order #9999
                  </div>

                  {/* Thank you section */}
                  <div className="px-3 pt-5 pb-7">
                    <div className="flex justify-between items-center">
                      <div className="flex w-[80%] flex-col">
                        <span className="text-sm  font-semibold">
                          Joe Doe requested a return for order #9999 on April 4
                          at 11:41 am.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button className="h-8">
                          <span className="text-[0.76rem]">View Request</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Request Summary */}
                  <div className="px-3">
                    <div className="text-sm border-b-[1px] pb-2  border-[#E4E8EE] font-[500]">
                      Request Summary
                    </div>
                    <div className="w-full mt-4 pb-4">
                      <div className="flex w-full">
                        <div className="flex-1  pr-3">
                          {/* Shiping Item Label */}
                          <div>
                            <div className="flex items-center border-b-[1px] border-[#E4E8EE] pb-4 justify-between mt-2">
                              <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-md bg-pink-200">
                                  <img
                                    src={`${PREFIX}/tshirt.jpg`}
                                    className="w-full h-full rounded-md object-cover"
                                    alt="productImage"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.78rem]">
                                    Example T-Shirt × 1
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    Lithograph - Height: 9" x Width: 12"
                                  </span>
                                </div>
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                ₹25.00 INR
                              </div>
                            </div>
                            <div className="flex items-center border-b-[1px] border-[#E4E8EE] pb-4 justify-between mt-2">
                              <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-md bg-pink-200">
                                  <img
                                    src={`${PREFIX}/tshirt.jpg`}
                                    className="w-full h-full rounded-md object-cover"
                                    alt="productImage"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.78rem]">
                                    Example T-Shirt × 1
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    Lithograph - Height: 9" x Width: 12"
                                  </span>
                                </div>
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                ₹25.00 INR
                              </div>
                            </div>
                            <div className="flex items-center  pb-4 justify-between mt-2">
                              <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-md bg-pink-200">
                                  <img
                                    src={`${PREFIX}/tshirt.jpg`}
                                    className="w-full h-full rounded-md object-cover"
                                    alt="productImage"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.78rem]">
                                    Example T-Shirt × 1
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    Lithograph - Height: 9" x Width: 12"
                                  </span>
                                </div>
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                ₹25.00 INR
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
          </div>
        </div>
      </div>
    </>
  );
}
