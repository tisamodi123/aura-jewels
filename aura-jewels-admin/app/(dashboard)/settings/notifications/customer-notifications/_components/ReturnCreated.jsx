import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ReturnCreated({ setState }) {
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
                <span>Return Created</span>
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
                  {/* Complete Return section */}
                  <div className="px-3 pt-5 pb-7">
                    <div className="flex justify-between items-center">
                      <div className="flex w-[80%] flex-col">
                        <span className="text-sm  font-semibold">
                          Complete your return
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          We’ve sent you a return shipping label, or you will
                          receive one soon. Once you receive your return
                          shipping label, get your returned items and follow the
                          instructions to complete your return.
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Instructions */}
                  <div className="px-3  pb-7">
                    <div className="flex justify-between items-end">
                      <div className="flex w-[80%] flex-col">
                        <span className="text-sm pb-2 font-semibold">
                          Instructions
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          1. Pack the items you're returning
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          2. Print your return shipping label. If you haven’t
                          received it yet, we’ll send it to you soon.
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          3. Attach the label to the package. Cover or remove
                          any old shipping labels.
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          4. Give the package to USPS.
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          5. Track your return using your tracking number to
                          make sure we get it.
                        </span>
                      </div>
                      <Button className="h-8">
                        <span className="text-[0.76rem]">View Your Order</span>
                      </Button>
                    </div>
                  </div>
                  {/* Items to return */}
                  <div className="px-3">
                    <div className="text-sm border-b-[1px] pb-2  border-[#E4E8EE] font-[500]">
                      Items To Return
                    </div>
                    <div className="w-full mt-4 pb-4">
                      <div className="flex w-full">
                        <div className="flex-1 ">
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
                                -Rs. 25.00
                              </div>
                            </div>
                          </div>
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
                                -Rs. 25.00
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                            <div className="text-sm">Subtotal</div>
                            <div className="text-[0.87rem] w-[30%] text-right  font-[500]">
                              Rs. 87.00
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
