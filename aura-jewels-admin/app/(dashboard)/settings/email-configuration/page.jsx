"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRightIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";

export default function RoleAndPermission() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState("");
  console.log(state, "<---");
  return (
    <>
      <div className="max-w-4xl mx-auto  bg-white rounded-lg  px-6 mb-6 shadow-sm">
        <div className="">
          <div className=" pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">
              Email Configuration
            </h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[90%] pb-4">
                Email configuration is the process of setting up an email
                account on a server, email client, or application to send,
                receive, and manage emails efficiently. Proper email
                configuration ensures secure communication, reliable delivery,
                and compliance with industry standards.
              </p>
            </div>
          </div>
        </div>
        {/* Email & Sender Input */}
        <div className="mt-6">
          <div className="flex items-center gap-6 justify-between">
            {/* Email Adress */}
            <div className="flex-1">
              <label
                htmlFor="emailAddress"
                className="block text-[0.80rem] font-semibold  mb-2"
              >
                Email Address
              </label>
              <input
                type="text"
                id="emailAddress"
                name="emailAddress"
                placeholder="Enter Email Address"
                className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Sender Name */}
            <div className="flex-1">
              <label
                htmlFor="senderName"
                className="block  text-[0.80rem] font-semibold mb-2"
              >
                Sender Name
              </label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                placeholder="Enter Sender Name"
                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {/* Server & Port Input */}
        <div className="mt-6">
          <div className="flex items-center gap-6 justify-between">
            {/* Outgoing Server */}
            <div className="flex-1">
              <label
                htmlFor="outgoinSever"
                className="block text-[0.80rem] font-semibold  mb-2"
              >
                Outgoing Server Name
              </label>
              <input
                type="text"
                id="outgoinSever"
                name="outgoinSever"
                placeholder="Enter Outgoing Server Name"
                className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Port Input */}
            <div className="flex-1">
              <label
                htmlFor="port"
                className="block  text-[0.80rem] font-semibold mb-2"
              >
                Port
              </label>
              <input
                type="text"
                id="port"
                name="port"
                placeholder="Enter Port"
                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {/* SSL  Dropdown */}
        <div className="flex gap-6 mb-6 mt-6 pb-6 items-center">
          <div className="flex-1">
            <label
              htmlFor="productCategory"
              className="block text-[0.80rem] font-semibold mb-2"
            >
              SSL/TLS
            </label>
            <Select>
              <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                <SelectValue placeholder="Select " className="text-[#656B7B]" />
                <ChevronDown className="h-4 w-4 text-[#656B7B]" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem className=" hover:bg-gray-100" value="apple">
                    Category1
                  </SelectItem>
                  <SelectItem value="banana">Category2</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1"></div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className=" h-[36px] px-5  font-normal border cursor-pointer border-[#E4E8EE]  bg-black text-[0.80rem] text-[#ffff]">
          Save
        </Button>
      </div>
    </>
  );
}
