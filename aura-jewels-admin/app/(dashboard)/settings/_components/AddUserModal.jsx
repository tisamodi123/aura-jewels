"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { API_URL, PREFIX } from "@/lib/APIUrl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import QuillEditor from "@/components/textEditor";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { ROLES } from "@/lib/Constant";

export default function AddUserModal({ open, setOpen, GetStaffList }) {
  const [role, setRole] = useState("");
  // const [roleList, setRoleList] = useState([]);
  const token = getToken();
  // phone holds the full international digits as PhoneInput emits
  // ("919876543210"); countryCode is the plus-prefixed dial ("+91").
  // We split them on submit so the backend stores the local number.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addStaffHandler = () => {
    const allDigits = String(formData.phone || "").replace(/\D/g, "");
    const dialDigits = String(formData.countryCode || "").replace(/\D/g, "");
    const localDigits = dialDigits && allDigits.startsWith(dialDigits)
      ? allDigits.slice(dialDigits.length)
      : allDigits;

    const formdata = new FormData();
    formdata.append("name", formData.name);
    formdata.append("phone", localDigits ? Number(localDigits) : "");
    formdata.append("countryCode", `+${dialDigits || "91"}`);
    formdata.append("email", formData.email);
    formdata.append("role", role);
    // formdata.append("designation", formData.designation);
    // formdata.append("password", formData.password);

    callApi(`${API_URL?.ADD_STAFF}`, "POST", formdata, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK || result?.errorCode == STATUS_CODE.CREATED) {
          toast.success(result?.message);
          GetStaffList();
          setOpen(false);
        } else {
          // Surface the real API reason (e.g. "User already exists") instead of
          // a generic message that hides what actually went wrong.
          toast.error(result?.message || M.staff.createFailed || M.common.createFailed);
        }
      })
      .catch((err) => {
        toast.error(M.staff.createFailed || M.common.createFailed);
      });
  };

  // useEffect(() => {
  //   GetRoleList();
  // }, []);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] custom-scrollbar h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none cursor-pointer ">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Add Staff
              </Dialog.Title>

              <div onClick={addStaffHandler} className="flex gap-2">
                <div className="bg-[#087B5D] text-white rounded-md px-4 py-2 text-[0.8rem]">
                  Save
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              {/*Name input  */}
              {/* <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="firstName"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter First Name"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="lastName"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter Last Name"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div> */}
              <label
                htmlFor="name"
                className="block text-[0.80rem] font-semibold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Name"
                className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {/*Email/Phone Number input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="emailAddress"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="text"
                    id="emailAddress"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Email Address"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Phone Number
                  </label>
                   <PhoneInput
                    enableSearch={true}
                    country={"in"}
                    value={formData.phone}
                    onChange={(phone, country) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone,
                        countryCode: country?.dialCode ? `+${country.dialCode}` : prev.countryCode,
                      }))
                    }
                    placeholder="Enter Phone Number"
                    inputStyle={{
                      width: "100%",
                      height: "38px",
                      fontSize: "0.80rem",
                      borderColor: "#E4E8EE",
                      borderRadius: "0.375rem",
                    }}
                    buttonStyle={{
                      borderColor: "#E4E8EE",
                      backgroundColor: "#ffffff",
                      borderTopLeftRadius: "0.375rem",
                      borderBottomLeftRadius: "0.375rem",
                    }}
                  />
                </div>
              </div>
              {/*Role / Password input  */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="role"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Role
                  </label>
                  <Select onValueChange={(value) => setRole(value)}>
                    <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                      <SelectValue
                        placeholder="Select Role"
                        className="text-[#656B7B]"
                      />
                      {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[10001]">
                      <SelectGroup>
                        {ROLES.STAFF_ROLES.map((item) => {
                          return (
                            <SelectItem
                              key={item}
                              className="hover:bg-gray-100"
                              value={item}
                            >
                              {item.replace("_", " ").toUpperCase()}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="flex-1">
                  <label
                    htmlFor="password"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div> */}
              </div>
              {/*Designation input  */}
              {/* <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="designation"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Enter Designation"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1"></div>
              </div> */}
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
