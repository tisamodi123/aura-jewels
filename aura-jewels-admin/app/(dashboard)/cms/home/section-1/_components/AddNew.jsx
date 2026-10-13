"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { getToken } from "@/lib/auth";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function AddNewModal({ open, setOpen, fetchData }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [mobileImageError, setMobileImageError] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText1: "",
    buttonTextLink1: "",
    buttonText2: "",
    buttonTextLink2: "",
  });
  const token = getToken();
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setDesktopImageError("Only image files are allowed");
        setDesktopImagePreview(null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDesktopImageError("Image size must be less than 5MB");
        setDesktopImagePreview(null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 1920 || img.height !== 768) {
          setDesktopImageError("Image must be 1920x768px");
          setDesktopImagePreview(null);
          setDesktopImage(null);
          if (desktopImageRef.current) desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setDesktopImageError("");
          setDesktopImagePreview(objectUrl);
          setDesktopImage(file);
        }
      };

      img.onerror = () => {
        setDesktopImageError("Failed to load image");
        setDesktopImagePreview(null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  const handleMobileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMobileImageError("Only image files are allowed");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMobileImageError("Image size must be less than 5MB");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 768 || img.height !== 740) {
          setMobileImageError("Image must be 768x740px");
          setMobileImagePreview(null);
          setMobileImage(null);
          if (mobileImageRef.current) mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setMobileImageError("");
          setMobileImagePreview(objectUrl);
          setMobileImage(file);
        }
      };

      img.onerror = () => {
        setMobileImageError("Failed to load image");
        setMobileImagePreview(null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  const handleRemoveDesktopImage = () => {
    setDesktopImagePreview(null);
    setDesktopImage(null);
    setDesktopImageError("");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
  };

  const handleRemoveMobileImage = () => {
    setMobileImagePreview(null);
    setMobileImage(null);
    setMobileImageError("");
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  const createSession = async () => {
    if (desktopImageError || mobileImageError) {
      toast.error("Please fix image dimension errors");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("buttonlink1", formData.buttonTextLink1);
    formDataToSend.append("buttonlink2", formData.buttonTextLink2);
    formDataToSend.append("mobile_img", mobileImage);
    formDataToSend.append("sesstionName", "sesstion_1");
    formDataToSend.append("buttontext1", formData.buttonText1);
    formDataToSend.append("buttontext2", formData.buttonText2);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("subTitle", formData.subtitle);
    formDataToSend.append("image", deskTopImage);

    try {
      const result = await callApi(`${API_URL.CREATE_SESSION}`, "POST", formDataToSend, token);

      if (result.errorCode == STATUS_CODE.OK) {
        toast.success(result.message);
        setOpen(false);
        fetchData();
        ResetHandler();
      }
      return result;
    } catch (error) {
      console.log("Error creating session:", error.message);
      toast.error("Failed To Create Session");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSession();
  };

  const ResetHandler = () => {
    setDesktopImageError("");
    setMobileImageError("");
    setDesktopImagePreview(null);
    setMobileImagePreview(null);
    setMobileImage(null);
    setDesktopImage(null);
    setFormData({
      title: "",
      subtitle: "",
      buttonText1: "",
      buttonTextLink1: "",
      buttonText2: "",
      buttonTextLink2: "",
    });
    if (desktopImageRef.current) desktopImageRef.current.value = null;
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-[#00000066] bg-opacity-40 z-[9999]" />

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[50%] z-[9999] bg-white p-2 rounded-tl-sm rounded-bl-sm cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[50%] h-full bg-white z-[9999] px-6 py-4 overflow-y-auto focus:outline-none">
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-[0.96rem] font-semibold flex-1">
                Add New Slider
              </Dialog.Title>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={ResetHandler}
                  className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Save
                </button>
              </div>
            </div>

            <div>
              {/* Title - Subtitle */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="title"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="subtitle"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Sub Title
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Enter Sub Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* First Button Text/Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="buttonText1"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text 1
                  </label>
                  <input
                    type="text"
                    id="buttonText1"
                    name="buttonText1"
                    value={formData.buttonText1}
                    onChange={handleInputChange}
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="buttonTextLink1"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Link 1
                  </label>
                  <input
                    type="text"
                    id="buttonTextLink1"
                    name="buttonTextLink1"
                    value={formData.buttonTextLink1}
                    onChange={handleInputChange}
                    placeholder="Enter Button Link"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Second Button Text/Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="buttonText2"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text 2
                  </label>
                  <input
                    type="text"
                    id="buttonText2"
                    name="buttonText2"
                    value={formData.buttonText2}
                    onChange={handleInputChange}
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="buttonTextLink2"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Link 2
                  </label>
                  <input
                    type="text"
                    id="buttonTextLink2"
                    name="buttonTextLink2"
                    value={formData.buttonTextLink2}
                    onChange={handleInputChange}
                    placeholder="Enter Button Link"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem] border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* DeskTop and Mobile Image */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 1 (Desktop View - 1920x768px, Max 5MB)
                  </label>
                  {desktopImagePreview ? (
                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={desktopImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemoveDesktopImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => desktopImageRef.current.click()}
                      className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${desktopImageError ? "border-red-500" : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Drag or Upload Image
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={desktopImageRef}
                    onChange={handleDesktopChange}
                    className="hidden"
                  />
                  {desktopImageError && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {desktopImageError}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 2 (Mobile View - 768x740px, Max 5MB)
                  </label>

                  {mobileImagePreview ? (
                    <div className="relative w-full h-32 border rounded-md overflow-hidden">
                      <img
                        src={mobileImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        onClick={handleRemoveMobileImage}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => mobileImageRef.current.click()}
                      className={`flex border border-dashed rounded-md justify-center items-center h-32 cursor-pointer ${mobileImageError ? "border-red-500" : ""
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Drag or Upload Image
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={mobileImageRef}
                    onChange={handleMobileChange}
                    className="hidden"
                  />
                  {mobileImageError && (
                    <div className="text-red-500 text-[0.75rem] mt-1">
                      {mobileImageError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
