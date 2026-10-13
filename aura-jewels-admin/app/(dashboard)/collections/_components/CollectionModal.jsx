"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useState, useEffect } from "react"; // Added useEffect
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import FilePicker from "@/components/FilePicker";
import InterProductBannersEditor from "@/components/InterProductBannersEditor";
import { M } from "@/lib/messages";

export default function CollectionModal({
  open,
  setOpen,
  GetCollectionList,
  rowData,
  setRowData,
}) {
  const token = getToken();

  const [isLoading, setIsLoading] = useState(false);
  const [imgPrev1, setImgPrev1] = useState("");

  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  // Add useEffect to handle image preview when rowData changes
  useEffect(() => {
    if (rowData?.image) {
      // If image is a URL string (existing image), set it as preview
      setImgPrev1(rowData.image);
    } else {
      // Reset preview when no image data
      setImgPrev1("");
    }
  }, [rowData]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      collectionName: rowData?.collectionName || "",
      slug: rowData?.slug || "",
      description: rowData?.description || "",
      image: rowData?.image || "",
      sort: rowData?.sort || 0,
      isMenu: rowData?.isMenu ?? false,
      pageBannerImage: rowData?.pageBanner?.image || "",
      pageBannerImageMobile: rowData?.pageBanner?.imageMobile || "",
      pageBannerHeading: rowData?.pageBanner?.heading || "",
      pageBannerSubText: rowData?.pageBanner?.subText || "",
      interProductBanners: Array.isArray(rowData?.interProductBanners)
        ? rowData.interProductBanners
        : [],
    },
    validationSchema: Yup.object({
      collectionName: Yup.string().required("Collection Name is required"),
      slug: Yup.string().required("Slug is required"),
      description: Yup.string().required("Description is required"),
      sort: Yup.number().min(0, "Sort order cannot be negative"),
      image: Yup.mixed()
        .nullable()
        .test("image", "Unsupported file format", (file) => {
          // Allow both file objects and existing image URLs
          if (!file) return true; // No file is valid (for existing images)
          if (typeof file === "string") return true; // Existing image URL is valid
          return SUPPORTED_FORMATS.includes(file.type); // New file must be supported format
        }),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      const formdata = new FormData();
      formdata.append("collectionName", val.collectionName);
      formdata.append("slug", val.slug);
      formdata.append("description", val.description);
      formdata.append("sort", val.sort || 0);
      formdata.append("status", rowData?.status || "ACTIVE");
      formdata.append("isMenu", val.isMenu ? 1 : 0);

      // Page banner (same shape as the Category modal — see comments there).
      if (val.pageBannerImage instanceof File) {
        formdata.append("pageBannerImage", val.pageBannerImage);
      } else {
        formdata.append("pageBanner.image", val.pageBannerImage || "");
      }
      if (val.pageBannerImageMobile instanceof File) {
        formdata.append("pageBannerImageMobile", val.pageBannerImageMobile);
      } else {
        formdata.append("pageBanner.imageMobile", val.pageBannerImageMobile || "");
      }
      formdata.append("pageBanner.heading", val.pageBannerHeading || "");
      formdata.append("pageBanner.subText", val.pageBannerSubText || "");
      // Drop subdoc `_id` before round-tripping — old detail responses
      // sometimes carried a serialized ObjectId Buffer per row, and
      // sending it back as `{_id: {buffer: {...}}}` would make Mongoose
      // reject the whole update with a CastError. New _ids are
      // auto-generated on insert.
      const stripSubdocMeta = (rows) =>
        (Array.isArray(rows) ? rows : []).map(({ _id, __v, ...rest }) => rest);
      formdata.append(
        "interProductBanners",
        JSON.stringify(stripSubdocMeta(val.interProductBanners)),
      );

      // Only append the image if it's a File object (new upload)
      if (val.image instanceof File) {
        formdata.append("image", val.image);
      } else if (rowData?.id && !val.image) {
        // If editing and no image, you might want to handle image removal
        formdata.append("image", "");
      }
      console.log("form data ====>", Object.fromEntries(formdata.entries()));

      let url = `${API_URL?.CREATE_COLLECTIONS}`;
      if (rowData?.id || rowData?._id) {
        url = `${API_URL?.UPDATE_COLLECTIONS}/${rowData?.id || rowData?._id}`;
      }
      callApi(url, (rowData?.id || rowData?._id) ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          console.log('result in update create collaction --->>', result)
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetCollectionList();
            setRowData({});
            resetForm();
            setImgPrev1("");
            setOpen(false);
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.error("Collection Modal Error:", err);
          toast.error(M.common.somethingWentWrong);
        });
    },
  });

  // Reset preview when modal closes
  useEffect(() => {
    if (!open) {
      setImgPrev1("");
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 z-[9999]" />

          {/* Close Button Positioned Outside */}
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[40%] z-[9999] bg-white p-2 rounded-s-2xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[40%] h-full bg-white z-[9999] p-6 overflow-y-auto focus:outline-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-lg font-semibold flex-1">
                {rowData?.id ? "Edit" : "Add"} Collection
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData?.id ? "Update" : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-6 py-2 bg-[#7dcdb7] text-white rounded-md cursor-pointer"
                  >
                    ...Loading
                  </button>
                )}
              </div>
            </div>
            <div className="border-b"></div>

            {/* Form Inputs */}
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium ">
                    Collection Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="collectionName"
                    value={values.collectionName}
                    onChange={(e) => {
                      handleChange(e);
                      // Auto-generate slug on name change
                      const generatedSlug = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");
                      setFieldValue("slug", generatedSlug);
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter Collection Name"
                  />
                  {touched.collectionName && errors.collectionName && (
                    <p className="text-sm text-red-500">
                      {errors.collectionName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Slug</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="slug"
                    value={values.slug}
                    onChange={(e) => {
                      const formattedValue = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-") // Replace spaces with hyphens
                        .replace(/[^a-z0-9-]/g, ""); // Remove special characters
                      setFieldValue("slug", formattedValue);
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter Slug"
                  />
                  {touched.slug && errors.slug && (
                    <p className="text-sm text-red-500">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Description
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Description"
                  />
                  {touched.description && errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium ">Sort Order</label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="sort"
                    min="0"
                    value={values.sort}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Sort Order"
                  />
                  {touched.sort && errors.sort && (
                    <p className="text-sm text-red-500">{errors.sort}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="collectionIsMenu"
                    name="isMenu"
                    checked={values.isMenu || false}
                    onChange={(e) => setFieldValue("isMenu", e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor="collectionIsMenu"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Show in Menu
                  </label>
                </div>

                {/* List Page Banner — top hero on /collection/<slug>. */}
                <div className="border-t mt-4 pt-4 space-y-3">
                  <div className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                    List Page Banner
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FilePicker
                      label="Banner (Desktop - 1585x300px)"
                      value={values.pageBannerImage instanceof File ? values.pageBannerImage : ""}
                      existingUrl={typeof values.pageBannerImage === "string" ? values.pageBannerImage : ""}
                      onChange={(v) => setFieldValue("pageBannerImage", v)}
                      accept="image/*"
                      resetKey={`${open}-${rowData?._id || "new"}-banner`}
                      expectedWidth={1585}
                      expectedHeight={300}
                    />
                    <FilePicker
                      label="Banner (Mobile, optional)"
                      value={values.pageBannerImageMobile instanceof File ? values.pageBannerImageMobile : ""}
                      existingUrl={typeof values.pageBannerImageMobile === "string" ? values.pageBannerImageMobile : ""}
                      onChange={(v) => setFieldValue("pageBannerImageMobile", v)}
                      accept="image/*"
                      hint="Mobile-only image (414x120px); desktop image used when empty"
                      resetKey={`${open}-${rowData?._id || "new"}-banner-mob`}
                      expectedWidth={414}
                      expectedHeight={120}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Heading</label>
                    <input
                      type="text"
                      value={values.pageBannerHeading}
                      onChange={(e) => setFieldValue("pageBannerHeading", e.target.value)}
                      placeholder="Optional heading text overlay"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sub-text</label>
                    <input
                      type="text"
                      value={values.pageBannerSubText}
                      onChange={(e) => setFieldValue("pageBannerSubText", e.target.value)}
                      placeholder="Optional sub-text under the heading"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Editorial cards admins can drop between rows on the
                    /collection/<slug> list page. Optional. */}
                <div className="border-t mt-4 pt-4">
                  <InterProductBannersEditor
                    value={values.interProductBanners}
                    onChange={(arr) => setFieldValue("interProductBanners", arr)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium ">
                    Image <span className="text-gray-400 font-normal">(Collections card — recommended 1000×1000px, 1:1 square)</span>
                  </label>
                  <input
                    className="hand w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="file"
                    name="image"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      setFieldValue("image", file);
                      setImgPrev1(URL.createObjectURL(file)); // Set preview for new file
                    }}
                  />
                  {imgPrev1 && (
                    <div className="pt-2">
                      <img
                        src={imgPrev1}
                        height={100}
                        width={100}
                        className="object-cover border rounded"
                        alt="Image Preview"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {rowData?.image ? "Current Image" : "New Image Preview"}
                      </p>
                    </div>
                  )}
                  {touched.image && errors.image && (
                    <p className="text-sm text-red-500">{errors.image}</p>
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