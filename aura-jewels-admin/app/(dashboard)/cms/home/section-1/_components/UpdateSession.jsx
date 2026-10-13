"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import { getToken } from "@/lib/auth";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";

export default function UpdateSession({ open, setOpen, data, refetchFn }) {
  const [desktopImageError, setDesktopImageError] = useState("");
  const [mobileImageError, setMobileImageError] = useState("");
  const [desktopImagePreview, setDesktopImagePreview] = useState(data.image || null);
  const [mobileImagePreview, setMobileImagePreview] = useState(data.mobile_img || null);
  const [mobileImage, setMobileImage] = useState(null);
  const [deskTopImage, setDesktopImage] = useState(null);
  const token = getToken();
  const [title, setTitle] = useState(data.title || "");
  const [subtitle, setsubTitle] = useState(data.subTitle || "");
  const [buttonText1, setButtonText1] = useState(data.buttontext1 || "");
  const [buttonText2, setButtonText2] = useState(data.buttontext2 || "");
  const [buttonTextLink1, setButtonTextLink1] = useState(data.buttonlink1 || "");
  const [buttonTextLink2, setButtonTextLink2] = useState(data.buttonlink2 || "");
  const desktopImageRef = useRef(null);
  const mobileImageRef = useRef(null);
  const desktopBlobUrlRef = useRef(null);
  const mobileBlobUrlRef = useRef(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (desktopBlobUrlRef.current) {
        URL.revokeObjectURL(desktopBlobUrlRef.current);
      }
      if (mobileBlobUrlRef.current) {
        URL.revokeObjectURL(mobileBlobUrlRef.current);
      }
    };
  }, []);

  const handleDesktopChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setDesktopImageError("Only image files are allowed");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDesktopImageError("Image size must be less than 5MB");
        setDesktopImagePreview(data.image || null);
        setDesktopImage(null);
        if (desktopImageRef.current) desktopImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 1920 || img.height !== 768) {
          setDesktopImageError("Image must be 1920x768px");
          setDesktopImagePreview(data.image || null);
          setDesktopImage(null);
          desktopImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setDesktopImageError("");
          // Revoke previous blob URL before creating new one
          if (desktopBlobUrlRef.current) {
            URL.revokeObjectURL(desktopBlobUrlRef.current);
          }
          desktopBlobUrlRef.current = objectUrl;
          setDesktopImagePreview(objectUrl);
          setDesktopImage(file);
        }
      };

      img.src = objectUrl;
    }
  };

  const handleMobileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMobileImageError("Only image files are allowed");
        setMobileImagePreview(data.mobile_img || null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMobileImageError("Image size must be less than 5MB");
        setMobileImagePreview(data.mobile_img || null);
        setMobileImage(null);
        if (mobileImageRef.current) mobileImageRef.current.value = null;
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        if (img.width !== 768 || img.height !== 740) {
          setMobileImageError("Image must be 768x740px");
          setMobileImagePreview(data.mobile_img || null);
          setMobileImage(null);
          mobileImageRef.current.value = null;
          URL.revokeObjectURL(objectUrl);
        } else {
          setMobileImageError("");
          // Revoke previous blob URL before creating new one
          if (mobileBlobUrlRef.current) {
            URL.revokeObjectURL(mobileBlobUrlRef.current);
          }
          mobileBlobUrlRef.current = objectUrl;
          setMobileImagePreview(objectUrl);
          setMobileImage(file);
        }
      };

      img.src = objectUrl;
    }
  };

  const updateSession = async () => {
    const formData = new FormData();

    formData.append("buttonlink1", buttonTextLink1);
    formData.append("buttonlink2", buttonTextLink2);
    formData.append("sesstionName", "sesstion_1");
    formData.append("buttontext1", buttonText1);
    formData.append("buttontext2", buttonText2);
    formData.append("title", title);
    formData.append("subTitle", subtitle);

    if (mobileImage) formData.append("mobile_img", mobileImage);
    if (deskTopImage) formData.append("image", deskTopImage);

    try {
      const result = await callApi(`${API_URL.UPDATE_SESSION}/${data.id}`, "PUT", formData, token);

      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result.message || "Updated Successfully");
        refetchFn();
        setOpen(false);
      }
      return result;
    } catch (error) {
      console.log("Error updating session:", error.message);
    }
  };

  const ResetHandler = () => {
    setDesktopImageError("");
    setMobileImageError("");

    // Revoke blob URLs when resetting
    if (desktopBlobUrlRef.current) {
      URL.revokeObjectURL(desktopBlobUrlRef.current);
      desktopBlobUrlRef.current = null;
    }
    if (mobileBlobUrlRef.current) {
      URL.revokeObjectURL(mobileBlobUrlRef.current);
      mobileBlobUrlRef.current = null;
    }

    setDesktopImagePreview(data.image || null);
    setMobileImagePreview(data.mobile_img || null);
    setMobileImage(null);
    setDesktopImage(null);
    setTitle(data.title || "");
    setsubTitle(data.subTitle || "");
    setButtonText1(data.buttontext1 || "");
    setButtonText2(data.buttontext2 || "");
    setButtonTextLink1(data.buttonlink1 || "");
    setButtonTextLink2(data.buttonlink2 || "");
    if (desktopImageRef.current) desktopImageRef.current.value = null;
    if (mobileImageRef.current) mobileImageRef.current.value = null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 z-[9999] bg-[#00000066] bg-opacity-40 " />

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
                Edit Slider
              </Dialog.Title>

              <div className="flex gap-2">
                <div
                  onClick={ResetHandler}
                  className="bg-[#DC646A] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Reset
                </div>
                <div
                  onClick={updateSession}
                  className="bg-[#087B5D] cursor-pointer text-white rounded-md px-4 py-2 text-[0.8rem]"
                >
                  Save
                </div>
              </div>
            </div>

            <div>
              {/* Title - Subtitle */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Sub Title
                  </label>
                  <input
                    type="text"
                    id="clarity"
                    value={subtitle}
                    onChange={(e) => setsubTitle(e.target.value)}
                    name="clarity"
                    placeholder="Enter Sub Title"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* First Button Text/Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text 1
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={buttonText1}
                    onChange={(e) => setButtonText1(e.target.value)}
                    name="title"
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Link 1
                  </label>
                  <input
                    type="text"
                    id="clarity"
                    name="clarity"
                    value={buttonTextLink1}
                    onChange={(e) => setButtonTextLink1(e.target.value)}
                    placeholder="Enter Button Link"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Second Button Text/Link */}
              <div className="flex gap-6 mb-6 mt-4 items-center">
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Text 2
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={buttonText2}
                    onChange={(e) => setButtonText2(e.target.value)}
                    placeholder="Enter Button Text"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="applicableGender"
                    className="block text-[0.80rem] font-semibold mb-2"
                  >
                    Button Link 2
                  </label>
                  <input
                    type="text"
                    id="clarity"
                    name="clarity"
                    value={buttonTextLink2}
                    onChange={(e) => setButtonTextLink2(e.target.value)}
                    placeholder="Enter Button Link"
                    className="w-full px-3 py-2 border placeholder:text-[#656B7B] text-[0.80rem]  border-[#E4E8EE] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* DeskTop and Mobile Image */}
              <div className="flex gap-6 mb-6 mt-4 items-start">
                <div className="flex-1 relative">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 1 (Desktop View - 1920x768px, Max 5MB)
                  </label>

                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => desktopImageRef.current.click()}
                      className="flex border border-dashed rounded-md justify-center items-center h-32 w-full cursor-pointer flex-shrink-0"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Upload
                        </div>
                      </div>
                    </div>
                  </div>
                  {desktopImageError && (
                    <div className="text-red-500 absolute text-[0.8rem] mt-1">
                      {desktopImageError}
                    </div>
                  )}

                  {desktopImagePreview && (
                    <div className="w-full mt-6 h-32 border rounded-md overflow-hidden">
                      <img
                        src={desktopImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={desktopImageRef}
                    onChange={handleDesktopChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 relative">
                  <label className="block text-[0.80rem] font-semibold mb-2">
                    Image 2 (Mobile View - 768x740px, Max 5MB)
                  </label>

                  <div className="flex gap-4 items-start">
                    <div
                      onClick={() => mobileImageRef.current.click()}
                      className="flex w-full border border-dashed rounded-md justify-center items-center h-32  cursor-pointer flex-shrink-0"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={`${PREFIX}/cloudComputing.svg`}
                          height={20}
                          width={20}
                          alt="uploadicon"
                        />
                        <div className="text-[#656B7B] text-[0.80rem]">
                          Upload
                        </div>
                      </div>
                    </div>
                  </div>
                  {mobileImageError && (
                    <div className="text-red-500  absolute text-[0.8rem] mt-1">
                      {mobileImageError}
                    </div>
                  )}
                  {mobileImagePreview && (
                    <div className="w-full h-32 mt-6 border rounded-md overflow-hidden">
                      <img
                        src={mobileImagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={mobileImageRef}
                    onChange={handleMobileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
