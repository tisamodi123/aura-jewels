"use client";
import QuillEditor from "@/components/textEditor";
import { Button } from "@/components/ui/button";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
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
import React, { useEffect, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function UpdateCustomerPage() {
  // phoneNumber is the FULL international number digits (e.g. "916354611460")
  // — the format `react-phone-input-2` works with. countryCode is the
  // saved dial code with the plus, e.g. "+91". Both come from the API
  // and the country-code chunk lets PhoneInput render the matching flag
  // without falling back to its auto-detect heuristic (which mis-reads
  // "63..." as Philippines on a 10-digit Indian number).
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
  });
  const [language, setLanguage] = useState("");
  const [countryList, setCountryList] = useState([]);
  const token = getToken();
  const [isSms, setIsSms] = useState(false);
  const [isMail, setIsMail] = useState(false);
  const { id } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeList, setAssigneeList] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [addressErrors, setAddressErrors] = useState({});
  const router = useRouter();

  // Handle input changes
  const handleChange = (index, field, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][field] = value;
    setAddresses(updatedAddresses);

    if (addressErrors[index]?.[field]) {
      setAddressErrors((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          [field]: "",
        },
      }));
    }
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        address: "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        isdefault: false,
      },
    ]);
  };

  const handleRemoveField = (index) => {
    setAddresses((prev) => prev.filter((item, ind) => ind != index));
    setAddressErrors((prev) => {
      const newErr = { ...prev };
      delete newErr[index];
      return newErr;
    });
  };

  const handleDefaultCheckboxChange = (index) => {
    const wasChecked = addresses[index].isdefault;

    const updated = addresses.map((item, i) => ({
      ...item,
      isdefault: wasChecked ? false : i === index, // ✅ toggle if same, else select
    }));

    setAddresses(updated);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validation function for customer overview & address fields
  const validateCustomerAndAddress = () => {
    if (!formData.firstName || !formData.firstName.trim()) {
      toast.error("First Name is required");
      return false;
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      toast.error("Last Name is required");
      return false;
    }
    if (!formData.email || !formData.email.trim()) {
      toast.error("Email Address is required");
      return false;
    }

    const errorsObj = {};
    let hasError = false;

    // Validate each address block that is present or partially filled
    addresses.forEach((item, index) => {
      const countryStr = String(item.country || "").trim();
      const stateStr = String(item.state || "").trim();
      const cityStr = String(item.city || "").trim();
      const pincodeStr = String(item.pincode || "").trim();
      const addressStr = String(item.address || "").trim();

      const isPartiallyFilled = countryStr || stateStr || cityStr || pincodeStr || addressStr;
      const isOnlyOneAddress = addresses.length === 1;

      if (isPartiallyFilled || isOnlyOneAddress) {
        const fieldErrors = {};
        if (!countryStr) {
          fieldErrors.country = "Country is required";
          hasError = true;
        }
        if (!stateStr) {
          fieldErrors.state = "State is required";
          hasError = true;
        }
        if (!cityStr) {
          fieldErrors.city = "City is required";
          hasError = true;
        }
        if (!pincodeStr) {
          fieldErrors.pincode = "Pincode is required";
          hasError = true;
        }
        if (!addressStr) {
          fieldErrors.address = "Address is required";
          hasError = true;
        }

        if (Object.keys(fieldErrors).length > 0) {
          errorsObj[index] = fieldErrors;
        }
      }
    });

    setAddressErrors(errorsObj);

    if (hasError) {
      toast.error("Please select and fill in all required address fields.");
      return false;
    }

    return true;
  };

  // Get Customer By Id
  const GetCustomerById = (c_id) => {
    callApi(`${API_URL?.GET_CUSTOMER_BY_ID}/${c_id}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          const localPhone = result?.data?.number ? String(result.data.number) : "";
          const dial = (result?.data?.countryCode || "+91").replace(/[^\d]/g, "") || "91";
          setFormData({
            firstName: result?.data?.firstName,
            lastName: result?.data?.lastName,
            email: result?.data?.email,
            phoneNumber: localPhone ? `${dial}${localPhone}` : "",
            countryCode: `+${dial}`,
          });
          setAddresses(result?.data?.address || []);
          setLanguage(result?.data?.language);
          setSelectedAssignee(result?.data?.assigneeId?._id || result?.data?.assigneeId || "");
        }
      })
      .catch((err) => {
        toast.error(M.common.fetchFailed);
      });
  };

  // Update API integraation
  const UpdateCustomerHandler = () => {
    if (!validateCustomerAndAddress()) return;

    const activeAddresses = addresses.filter((item) => {
      const countryStr = String(item.country || "").trim();
      const stateStr = String(item.state || "").trim();
      const cityStr = String(item.city || "").trim();
      const pincodeStr = String(item.pincode || "").trim();
      const addressStr = String(item.address || "").trim();
      return countryStr || stateStr || cityStr || pincodeStr || addressStr;
    });

    const allDigits = String(formData.phoneNumber || "").replace(/\D/g, "");
    const dialDigits = String(formData.countryCode || "").replace(/\D/g, "");
    const localDigits = dialDigits && allDigits.startsWith(dialDigits)
      ? allDigits.slice(dialDigits.length)
      : allDigits;

    const formdata = new FormData();
    formdata.append("firstName", formData.firstName);
    formdata.append("lastName", formData.lastName);
    formdata.append("number", localDigits ? Number(localDigits) : "");
    formdata.append("countryCode", `+${dialDigits || "91"}`);
    formdata.append("email", formData.email);
    formdata.append("assigneeId", selectedAssignee);
    if (activeAddresses.length > 0) {
      const modifyAddress = activeAddresses.map((item) => ({
        ...item,
        pincode: Number(item.pincode),
        isdefault: Number(item.isdefault).toString(),
      }));

      formdata.append("address", JSON.stringify(modifyAddress));
    }

    callApi(`${API_URL?.UPDATE_CUSTOMER}/${id}`, "PUT", formdata, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          toast.success(result?.message);
          router.back();
        } else {
          toast.error(result?.message);
        }
      })
      .catch((err) => {
        toast.error(M.common.updateFailed);
      });
  };

  // For Country List

  const GetCountryList = () => {
    callApi(`${API_URL?.GET_COUNTRY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCountryList(result?.data);
        }
      })
      .catch((err) => {
        toast.error(M.common.fetchFailed);
      });
  };

  // Assiugnee list get
  const GetAssignees = () => {
    callApi(`${API_URL?.GET_ASSIGNEE_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode === STATUS_CODE.OK) {
          setAssigneeList(result?.data);
        }
      })
      .catch(() => {
        toast.error(M.common.fetchFailed);
      });
  };

  //   useEffect for set customer data
  useEffect(() => {
    GetCustomerById(id);
    GetCountryList();
    GetAssignees();
  }, [id]);

  return (
    <div>
      <div>
        <div className="w-[100%] mx-auto">
          {/* Add Customer */}
          <div
            className="flex items-center mb-6 justify-between"
            title="create-top-header"
          >
            <div className="flex items-center gap-3">
              <span
                className="cursor-pointer"
                onClick={() => router.push("/customer-master")}
              >
                <Image
                  src={`${PREFIX}/leftArrows.svg`}
                  height={20}
                  width={20}
                  alt="backArrow"
                />
              </span>
              <span className="font-semibold">Edit Customer</span>
            </div>
          </div>
          {/* Customer Form Section */}
          <div className="mb-6" title="category-form-section">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="font-[500] text-sm border-b-[1px] border-[#E4E8EE] pb-4 mb-4">
                Customer Overview
              </div>
              <form>
                <div className="flex items-center gap-6 mb-6">
                  {/* First Name */}
                  <div className="flex-1">
                    <label
                      htmlFor="firstNasme"
                      className="block text-[0.80rem] font-semibold  mb-2"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstNasme"
                      name="firstName"
                      placeholder="Enter First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex-1">
                    <label
                      htmlFor="lastName"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {/* Langauge */}
                  {/* <div className="flex-1">
                    <label
                      htmlFor="language"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Language
                    </label>
                    <Select
                      value={language}
                      onValueChange={(value) => setLanguage(value)}
                    >
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                        <SelectValue
                          placeholder="Select Language"
                          className="text-[#656B7B]"
                        />
                        <ChevronDown className="h-4 w-4 text-[#656B7B]" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectGroup>
                          <SelectItem
                            className=" hover:bg-gray-100"
                            value="english"
                          >
                            English
                          </SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                          <SelectItem value="gujarati">Gujarati</SelectItem>
                          <SelectItem value="marathi">Marathi</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="flex-1">
                    <label
                      htmlFor="assignee"
                      className="block text-[0.80rem] font-semibold mb-2"
                    >
                      Assignee
                    </label>

                    <Select
                      value={selectedAssignee}
                      onValueChange={(value) => setSelectedAssignee(value)}
                    >
                      <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE]">
                        <SelectValue placeholder="Select Assignee" />
                      </SelectTrigger>

                      <SelectContent className="bg-white">
                        <SelectGroup>
                          {assigneeList.map((user) => (
                            <SelectItem
                              key={user._id}
                              value={user._id}
                              className="hover:bg-gray-100"
                            >
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>


                </div>
                <div className="flex items-center gap-6 mb-6">
                  {/* Email Address */}
                  <div className="flex-1">
                    <label
                      htmlFor="Email Address"
                      className="block text-[0.80rem] font-semibold  mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="text"
                      id="Email Address"
                      name="email"
                      placeholder="Enter Email Address"
                      disabled
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 cursor-not-allowed bg-gray-200  placeholder:text-[#88898d] text-gray-600 border text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="flex-1">
                    <label
                      htmlFor="phoneNumber"
                      className="block  text-[0.80rem] font-semibold mb-2"
                    >
                      Phone Number
                    </label>
                    <PhoneInput
                      enableSearch={true}
                      country={"in"}
                      value={formData.phoneNumber}
                      onChange={(phone, country) =>
                        setFormData((prev) => ({
                          ...prev,
                          phoneNumber: phone,
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
              </form>
            </div>
          </div>
          {/*Default Addrerss Section */}
          <div title="address-form-section">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="font-[500] text-sm border-b-[1px] border-[#E4E8EE] pb-4 mb-4">
                Customer Address
              </div>
              <form>
                <div title="checkboxes" className="mb-6">
                  <div className="flex items-center mb-2 gap-2">
                    <div className="text-[0.84rem] text-[#656B7B]">
                      The primary address of this customer
                    </div>
                  </div>
                </div>
                {addresses.map((item, index) => {
                  return (
                    <div className="mb-4" key={index}>
                      <div className="text-md flex items-center gap-3 font-semibold mb-2">
                        <span>Address {index + 1}</span>
                        <span
                          onClick={() => handleRemoveField(index)}
                          className="rounded-full h-5 w-5 hover:bg-red-400 hover:text-white border  flex justify-center items-center cursor-pointer"
                        >
                          <X size={13} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={item.isdefault}
                          onCheckedChange={() =>
                            handleDefaultCheckboxChange(index)
                          }
                        />
                        <span className="text-[0.80rem] font-[500]">
                          isDefault
                        </span>
                      </div>
                      {/* State-Country Pincode */}
                      <div className="flex items-center gap-6 mb-6">
                        {/* Country Dropdown */}
                        <div className="flex-1">
                          <label
                            htmlFor="contry"
                            className="block text-[0.80rem] font-semibold mb-2"
                          >
                            Country <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={item.country}
                            onValueChange={(value) => {
                              handleChange(index, "country", value);
                            }}
                          >
                            <SelectTrigger className={`w-full bg-[#FFFFFF] cursor-pointer text-[0.80rem] text-[#656B7B] border justify-between focus:outline-none focus:ring-0 ${
                              addressErrors[index]?.country ? "border-red-500 focus:border-red-500" : "border-[#E4E8EE]"
                            }`}>
                              <SelectValue
                                placeholder="Select Country"
                                className="text-[#656B7B]"
                              />
                            </SelectTrigger>
                            <SelectContent className="bg-white max-h-48 overflow-y-auto">
                              <SelectGroup>
                                {countryList.map((country, cIndex) => (
                                  <SelectItem
                                    key={country.id || country._id || cIndex}
                                    className="hover:bg-gray-100"
                                    value={String(country.name || country.id || country._id || cIndex)}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {addressErrors[index]?.country && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors[index].country}</p>
                          )}
                        </div>
                        {/* State Input */}
                        <div className="flex-1">
                          <label
                            htmlFor="state"
                            className="block text-[0.80rem] font-semibold mb-2"
                          >
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            placeholder="Enter State"
                            value={item.state}
                            onChange={(e) =>
                              handleChange(index, "state", e.target.value)
                            }
                            className={`w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 ${
                              addressErrors[index]?.state ? "border-red-500 focus:ring-red-500" : "border-[#E4E8EE] focus:ring-blue-500"
                            }`}
                          />
                          {addressErrors[index]?.state && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors[index].state}</p>
                          )}
                        </div>
                      </div>
                      {/* City-Pincode Inputs */}
                      <div className="flex items-center gap-6 mb-6">
                        {/* City Input */}
                        <div className="flex-1">
                          <label
                            htmlFor="city"
                            className="block text-[0.80rem] font-semibold mb-2"
                          >
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            placeholder="Enter City"
                            value={item.city}
                            onChange={(e) =>
                              handleChange(index, "city", e.target.value)
                            }
                            className={`w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 ${
                              addressErrors[index]?.city ? "border-red-500 focus:ring-red-500" : "border-[#E4E8EE] focus:ring-blue-500"
                            }`}
                          />
                          {addressErrors[index]?.city && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors[index].city}</p>
                          )}
                        </div>

                        {/* Pincode Input */}
                        <div className="flex-1">
                          <label
                            htmlFor="pincode"
                            className="block text-[0.80rem] font-semibold mb-2"
                          >
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            value={item.pincode}
                            onChange={(e) =>
                              handleChange(index, "pincode", e.target.value)
                            }
                            placeholder="Enter Pincode"
                            className={`w-full px-3 py-2 placeholder:text-[#656B7B] border text-[0.80rem] rounded-md focus:outline-none focus:ring-1 ${
                              addressErrors[index]?.pincode ? "border-red-500 focus:ring-red-500" : "border-[#E4E8EE] focus:ring-blue-500"
                            }`}
                          />
                          {addressErrors[index]?.pincode && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors[index].pincode}</p>
                          )}
                        </div>
                      </div>
                      {/* Address TextArea */}
                      <div>
                        <div className="flex-1">
                          <label
                            htmlFor="address"
                            className="block text-[0.80rem] font-semibold mb-2"
                          >
                            Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={item.address}
                            onChange={(e) =>
                              handleChange(index, "address", e.target.value)
                            }
                            placeholder="Write Your Address..."
                            className={`w-full min-h-36 border text-[0.80rem] p-3 outline-none rounded-md ${
                              addressErrors[index]?.address ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#E4E8EE]"
                            }`}
                          ></textarea>
                          {addressErrors[index]?.address && (
                            <p className="text-red-500 text-xs mt-1">{addressErrors[index].address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Add Address Trigger */}
                <div className="w-full mt-4">
                  <div
                    onClick={addAddress}
                    className=" text-left border rounded-md border-[#E4E8EE] py-2 px-4 cursor-pointer text-[0.80rem] w-full text-[#656B7B]"
                  >
                    + Add Address
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div
            onClick={UpdateCustomerHandler}
            className="flex justify-end mt-6"
          >
            <Button className="bg-black text-white cursor-pointer">Update Customer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
