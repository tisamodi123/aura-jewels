import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrderConfirmation({ setState }) {
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
                <span>Order Confirmation</span>
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
                        <span className="text-sm  font-semibold">
                          Thank You For Your Purchase!
                        </span>
                        <span className="text-[0.80rem] text-[#61748F]">
                          We're getting your order ready to be shipped. We will
                          notify you when it has been sent.
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
                  {/* Order Summary */}
                  <div className="px-3">
                    <div className="text-[0.98rem] border-b-[1px] pb-2  border-[#E4E8EE] font-[500]">
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
                                Rs. 25.00
                              </div>
                            </div>
                          </div>
                          {/* IN Store Item Label */}
                          <div className="mt-2">
                            <span className="text-[0.78rem]  text-[#61748F]">
                              In Store Items
                            </span>
                            <div className="flex items-center  pb-2 justify-between mt-2">
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
                                    Holiday Bundle × 1
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    PROD5 (-Rs. 5.00)
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-[0.87rem] font-[500]">
                                  Rs. 65.00
                                </span>
                                <span className="text-[0.76rem] text-[#61748F]  ml-2 font-[500]  decoration-[1px] decoration-[#61748F] line-through ">
                                  Rs. 68.00
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* 2 Products */}
                          <div className="ml-[18%]">
                            <div className="flex items-center pb-2 justify-between mt-2">
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
                                    1 × Example Pants
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    PROD5 (-Rs. 5.00)
                                  </span>
                                </div>
                              </div>
                              <div></div>
                            </div>
                          </div>
                          <div className="ml-[18%]">
                            <div className="flex items-center  pb-2 justify-between mt-2">
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
                                    1 × Example Pants
                                  </span>
                                  <span className="text-[0.78rem] text-[#61748F]">
                                    PROD5 (-Rs. 5.00)
                                  </span>
                                </div>
                              </div>
                              <div></div>
                            </div>
                          </div>
                        </div>
                        {/* ----Section-2---- */}
                        <div className="flex-1 pl-3 ">
                          {/* Total calculation */}
                          <div className="border-b-[1px] pb-4 border-[#E4E8EE]">
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
                            <div className="flex items-center justify-between">
                              <div className="text-[0.78rem]  text-[#61748F]">
                                Total
                              </div>
                              <div className="text-[0.87rem] font-[500]">
                                Rs. 25.00
                              </div>
                            </div>
                          </div>
                          {/* Shiping And Billing Address */}
                          <div>
                            <div className="text-sm py-3 font-[500]">
                              Customer Information
                            </div>
                            <div className="text-[0.78rem] flex justify-between">
                              <div className="border-r-[1px] flex-1 border-[#E4E8EE]">
                                <div className="font-[500] mb-2">
                                  Shipping Address
                                </div>
                                <div className="text-[#61748F]">
                                  Steve Shipper , Shipping Companyx123 Shipping
                                  Street Shippington KY 40003 United States
                                </div>
                              </div>
                              <div className="border-r-[1px] flex-1 pl-2 border-[#E4E8EE]">
                                <div className="font-[500] mb-2">
                                  Billing Address
                                </div>
                                <div className="text-[#61748F]">
                                  Bob Biller My Company 123 Billing Street
                                  Billtown KY K2P0B0 United States
                                </div>
                              </div>
                              <div className="flex-1 pl-2">
                                <div className="font-[500] mb-2">
                                  Shipping Method
                                </div>
                                <div className="text-[#61748F]">
                                  Generic Shipping
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
      </div>
    </>
  );
}
