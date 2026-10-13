import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrderRefund({ setState }) {
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
                <span>Order Refund</span>
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
                    Subject: Order #99999 Confirmed
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
                        <span className="text-[0.98rem] capitalize mb-1 font-[500]">
                          Your order has been refunded
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          Total amount refunded: 
                          <b className="text-black">Rs. 85.00</b>. It may take
                          up to 10 days for this refund to appear in your
                          account.
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Order Summary */}
                  <div className="px-3">
                    <div className="text-sm border-b-[1px] pb-2  border-[#E4E8EE] font-[500]">
                      Order Summary
                    </div>
                    <div className="w-full mt-4 pb-4">
                      <div className="flex w-full">
                        <div className="flex-1 border-r-[1px] pr-3 border-[#E4E8EE] ">
                          {/* Shiping Item Label */}
                          <div>
                            <span className="text-[0.78rem]  text-[#61748F]">
                              Shipping Items
                            </span>
                            <div className="flex items-center border-b-[1px] border-[#E4E8EE] pb-4 justify-between mt-4">
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
                                Rs. 25.00
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
                                <span className="text-[0.87rem] font-[500]">
                                  Rs. 65.00
                                </span>
                                <span className="text-[0.76rem] text-[#61748F]  ml-2 font-[500]  decoration-[1px] decoration-[#61748F] line-through ">
                                  Rs. 68.00
                                </span>
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
                                Rs. 25.00
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* ----Section-2---- */}
                        <div className="flex-1 pl-3 ">
                          {/* Total calculation */}
                          <div className=" pb-4">
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Subtotal
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 87.98
                              </div>
                            </div>{" "}
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Order Discount
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                -Rs. 5.00
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Shipping
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                <span className="text-[0.76rem] text-[#61748F]  mr-2 font-[500]  decoration-[1px] decoration-[#61748F] line-through ">
                                  Rs. 68.00
                                </span>
                                <span className="text-[0.87rem] font-[500]">
                                  Free
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Taxes
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 0.00
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Total
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 25.00
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Total Paid
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 125.00
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Visa
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 239.58
                              </div>
                            </div>
                            <div className="flex items-center mb-2 justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Refund Bogus
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                - Rs. 39.58
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Refund Bogus
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                - Rs. 10.00
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
