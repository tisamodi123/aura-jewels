import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { PREFIX } from "@/lib/APIUrl";
import { ChevronRightIcon, MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PaymentError({ setState }) {
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
                <span>Payment Error</span>
              </h2>
            </div>
          </div>
          {/* First Notification Box */}
          <div className="px-6 mt-6 pb-6">
            <div>
              <div className="text-[0.76rem] mb-2 font-semibold">Preview</div>
              <div className="border border-[#E4E8EE] rounded-md">
                <div>
                  <div className="text-[#61748F] capitalize text-[0.80rem] border-b-[1px] border-[#E4E8EE] p-3">
                    Subject: [fine jewellery shop1] Payment couldn’t be
                    processed
                  </div>
                  {/* Fine Jewellery Section */}
                  <div className="px-3 pt-3">
                    <div className="flex items-center pb-3 justify-between">
                      <div className="font-normal text-md">
                        Fine Jewellery Shop1
                      </div>
                    </div>
                  </div>
                  {/* Thank you section */}
                  <div className="px-3 pt-5 pb-7">
                    <div className="flex justify-between items-center">
                      <div className="flex w-[90%] flex-col">
                        <span className="text-[0.98rem] capitalize mb-1 font-[500]">
                          Your payment couldn’t be processed
                        </span>
                        <span className="text-[0.80rem] capitalize mb-1 text-[#61748F]">
                          You added items to your shopping cart but the payment
                          couldn’t be processed. You haven’t been charged.
                        </span>
                        <span className="text-[0.80rem] capitalize text-[#61748F]">
                          You can still return to your cart to complete your
                          purchase.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex px-3 pb-4 items-center gap-2">
                    <Button className="h-8">
                      <span className="text-[0.76rem]">Return To Cart</span>
                    </Button>
                    <span className="text-[#61748F] text-sm">Or</span>
                    <Button className="h-8 bg-white hover:bg-gray-200 border border-[#E4E8EE]">
                      <span className="text-[0.76rem] text-[#61748F]">
                        Visit Our Store
                      </span>
                    </Button>
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
