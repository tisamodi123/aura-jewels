"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, X } from "lucide-react";
import { API_URL } from "@/lib/APIUrl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { ROLES } from "@/lib/Constant";

export default function EditStaffModal({ open, setOpen, GetStaffList, data }) {
  const [role, setRole] = useState("");
  // const [roleList, setRoleList] = useState([]);
  const token = getToken();
  // phone is the full international digits; countryCode is the
  // plus-prefixed dial. We compose them when seeding from `data` so
  // PhoneInput can pick the right country, then split them again on
  // submit so the User doc stores them independently.
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

  // Get Role List
  // const GetRoleList = () => {
  //   callApi(`${API_URL?.GET_ROLE}`, "POST", null, token)
  //     .then((result) => {
  //       if (result?.errorCode == STATUS_CODE.OK) {
  //         setRoleList(result?.data);
  //       }
  //     });
  // };

  // Add API integraation

  const updateStaffHandler = () => {
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
    // Never send role for a super_admin: the role dropdown is hidden for them
    // and the API validator only accepts [admin, sales, inventory], so posting
    // "super_admin" would 400. (super_admin role is immutable via this form.)
    if (data?.role !== ROLES.SUPER_ADMIN) {
      formdata.append("role", role);
    }
    // formdata.append("designation", formData.designation);
    // formdata.append("password", formData.password);

    callApi(`${API_URL?.UPDATE_STAFF}/${data.id || data._id}`, "PUT", formdata, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          toast.success(result?.message);
          GetStaffList();
          setOpen(false);
        } else {
          // Surface the real API reason instead of a generic message.
          toast.error(result?.message || M.common.updateFailed);
        }
      })
      .catch((err) => {
        toast.error(M.common.updateFailed);
      });
  };

  // useEffect(() => {
  //   GetRoleList();
  // }, []);

  useEffect(() => {
    if (!data) return;
    // Compose international form so PhoneInput renders the right flag.
    // Without this the bare local digits would trip the auto-detect
    // (e.g. "6354611460" reads as Philippines +63).
    const localPhone = data.phone ? String(data.phone) : "";
    const dial = (data.phoneCountryCode || data.countryCode || "+91").replace(/[^\d]/g, "") || "91";
    setFormData({
      name: data.name || "",
      email: data.email || "",
      phone: localPhone ? `${dial}${localPhone}` : "",
      countryCode: `+${dial}`,
    });
    setRole(data.role);
  }, [data]);
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

          <Dialog.Content className="fixed top-0 right-0 w-[50%] custom-scrollbar h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Update Staff
              </Dialog.Title>

              <div
                onClick={updateStaffHandler}
                className="flex gap-2 cursor-pointer"
              >
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
              <div className="flex-1">
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
                  placeholder="Enter Last Name"
                  className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
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
                    disabled
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Email Address"
                    className="w-full px-3 py-2 border  placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="phone"
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
                {
                  data?.role !== ROLES.SUPER_ADMIN && (

                    <div className="flex-1">
                      <label
                        htmlFor="role"
                        className="block text-[0.80rem] font-semibold mb-2"
                      >
                        Role
                      </label>
                      <Select
                        value={role}
                        onValueChange={(value) => setRole(value)}
                      >
                        <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                          <SelectValue
                            placeholder="Select Role"
                            className="text-[#656B7B]"
                          />
                          {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                        </SelectTrigger>
                        <SelectContent className="bg-white z-[10001]">
                          <SelectGroup>
                            {ROLES.STAFF_ROLES.map((item) => (
                              <SelectItem
                                key={item}
                                className="hover:bg-gray-100"
                                value={item}
                              >
                                {item.replace("_", " ").toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }
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
