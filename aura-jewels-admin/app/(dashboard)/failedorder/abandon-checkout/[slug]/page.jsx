"use client";
import QuillEditor from "@/components/textEditor";
import { Button } from "@/components/ui/button";
import { PREFIX } from "@/lib/APIUrl";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { HiOutlinePaperClip } from "react-icons/hi";
// import ProductTable from "../_components/productTable";
// import ProductCategoryTable from "./_components/productCategoryTable";

export default function CheckoutDetailPage() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentCategory: "",
    description: "",
    image: null,
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle description editor change
  const handleDescriptionChange = (html) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div>
      <div>
        <div className="w-[70%] mx-auto">
          {/* Collection Top Header */}
          <div
            className="flex items-center mb-6 justify-between"
            title="create-top-header"
          >
            <div className="flex items-center gap-3">
              <span
                className="cursor-pointer"
                onClick={() => router.push("/orders/abandon-checkout")}
              >
                <Image
                  src={`${PREFIX}/leftArrows.svg`}
                  height={20}
                  width={20}
                  alt="backArrow"
                />
              </span>
              <span className="font-semibold"> #384822999929</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="border border-[#E4E8EE] text-[#656B7B] text-sm cursor-pointer bg-white px-3 py-1.5 rounded-lg">
                Print
              </span>
            </div>
          </div>
          {/* Checkout Form Section */}
          <div title="checkout-form-section">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4 border border-[#E4E8EE] px-4 py-5 rounded-md">
                <div className="mb-4">
                  <span className="bg-[#087B5D] text-[0.8rem] p-2 rounded-md text-white">
                    Abandoned Checkout Recovered
                  </span>
                </div>
                <div className="text-[0.80rem] ">
                  Abandoned checkout was recovered Jan 17, 2023. You can view
                  the order
                </div>
              </div>
              {/* Recover Email Section */}
              <div className="mb-4 border border-[#E4E8EE] px-4 py-5 rounded-md">
                <div className="mb-6">
                  <span className="bg-[#4370C5] text-[0.8rem] p-2 rounded-md text-white">
                    Email Your Customer This Link To Recover Their Cart
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-[0.80rem] p-2 rounded-md text-[#656B7B] bg-[#F5F8FC]">
                    https://www.littleswitzerland.com/12459327/checkouts/ac/68434867e575d8d66fec6v7170bf511e/recover?ke
                  </span>
                </div>
                <div>
                  <span className="text-[0.80rem] border border-[#E4E8EE] p-2 cursor-pointer rounded-md text-[#656B7B]">
                    Send cart recovery email
                  </span>
                </div>
              </div>
              {/* Checkout Details */}
              <div className="mb-4 border border-[#E4E8EE] px-4 py-5 rounded-md">
                <div className="mb-6 border-b-[1px] pb-2 border-[#E4E8EE]">
                  <span className="font-semibold text-[0.8rem] p-2 ">
                    Checkout Details
                  </span>
                </div>
                <div className="mb-6 border-b-[1px] pb-2 border-[#E4E8EE] flex  justify-between items-center text-[0.80rem]">
                  <div className="text-[0.80rem] flex gap-4">
                    <div>
                      <Image
                        src={`${PREFIX}/ring.png`}
                        height={50}
                        width={50}
                        className="border rounded-md"
                        alt="ring-image"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">Maverick</div>
                      <div>SKU : 777777852</div>
                    </div>
                  </div>
                  <div>$2708 X 1</div>
                  <div>$2780</div>
                </div>
                <div className="text-[0.80rem]  gap-4">
                  <div className="paid-box-div mb-2">
                    <p>Subtotal</p>

                    <p className="text-right "> $2000.00</p>
                  </div>
                  <div className="paid-box-div mb-2">
                    <p>Shipping</p>

                    <p className="text-right">- $2000.00</p>
                  </div>
                  <div className="paid-box-div mb-2">
                    <p>Estimated Tax</p>

                    <p className="text-right"> $2000.00</p>
                  </div>
                  <div className="paid-box-div border-b-[1px] pb-3">
                    <p>Total</p>

                    <p className="text-right"> $2000.00</p>
                  </div>
                  <div className="selected-last pt-4">
                    <p className="font-bold">To be Paid by customer</p>
                    <p className="text-right font-bold">$2000.00</p>
                  </div>
                </div>
              </div>

              {/* Customer Details  */}
              <div className="flex justify-between gap-4 ">
                {/* Customer Details */}
                <div className=" border p-6 rounded-md flex-1">
                  <div className="text-sm font-semibold mb-3">
                    Customer Details
                  </div>
                  <div>
                    <p className="text-[0.80rem] font-medium mb-1">
                      Rohan Jadhav
                    </p>
                    <p className="text-[0.80rem] t-gray">
                      {" "}
                      rohanjahdav@mail.com
                    </p>
                    <p className="text-[0.80rem] t-gray"> + 91 9349392929</p>
                  </div>
                </div>
                {/* Shipping Address */}
                <div className=" border p-6 rounded-md flex-1">
                  <div className="text-sm font-semibold mb-3">
                    Shipping Address
                  </div>
                  <div>
                    <p className="text-[0.80rem] font-medium mb-1">
                      Rohan Jadhav
                    </p>
                    <p className="text-[0.80rem] t-gray">
                      N/506 , Suman Sagar , Vesu
                    </p>
                  </div>
                </div>
                {/*Shipping Status */}
                <div className=" border p-6 rounded-md flex-1">
                  <div className="text-sm font-semibold mb-3">
                    Shipping Status
                  </div>
                  <div>
                    <p className="text-[0.80rem] font-medium mb-1">
                      Tracking Info
                    </p>
                    <p className="text-[0.80rem] flex items-center gap-1 t-gray">
                      <span>IESDK3234234DC000</span>
                      <span
                        className="-translate-y-0.5 cursor-pointer"
                        // onClick={() => handleCopy("IESDK3234234DC000")}
                      >
                        <HiOutlinePaperClip />
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
