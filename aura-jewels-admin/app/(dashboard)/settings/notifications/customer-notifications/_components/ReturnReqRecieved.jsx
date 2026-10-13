import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ReturnReqRecieved({ setState }) {
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
                <span>Return Request Received</span>
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
                    Subject: Complete your return for Order #9999
                  </div>
                  {/* Fine Jewellery Section */}
                  <div className="px-3 pt-3">
                    <div className="flex items-center pb-3 justify-between border-b-[1px] border-[#E4E8EE]">
                      <div className="font-normal text-md">
                        Fine Jewellery Shop1
                      </div>
                      <div className="text-[#61748F] text-[0.80rem]">
                        Order:#9999
                      </div>
                    </div>
                  </div>
                  {/* Thank you section */}
                  <div className="px-3 pt-5 pb-7">
                    <div className="flex justify-between items-center">
                      <div className="flex w-[80%] flex-col">
                        <span className="text-sm capitalize  font-semibold">
                          Your return request was sent
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          Your return request was sent and is being reviewed.
                          We'll email you once it's been completed.
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button className="h-8">
                          <span className="text-[0.76rem]">
                            View Your Order
                          </span>
                        </Button>
                        <span className="text-[#61748F] text-sm">Or</span>
                        <Button className="h-8 bg-white hover:bg-gray-200 border border-[#E4E8EE]">
                          <span className="text-[0.76rem] text-[#61748F]">
                            View Your Order
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Return Summary */}
                  <div className="px-3">
                    <div className="text-sm border-b-[1px] pb-2  border-[#E4E8EE] font-[500]">
                      Return Summary
                    </div>
                    <div className="w-full  pb-4">
                      <div className="flex w-full">
                        <div className="flex-1">
                          {/* Shiping Item Label */}
                          <div>
                            <div className="flex items-center border-b-[1px] border-[#E4E8EE] py-4 justify-between ">
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
                                -Rs. 25.00
                              </div>
                            </div>
                            <div className="flex items-center  py-4 justify-between">
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
                                -Rs. 25.00
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
