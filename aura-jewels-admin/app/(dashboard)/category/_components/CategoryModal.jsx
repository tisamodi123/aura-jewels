"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import QuillEditor from "@/components/textEditor";
import { callApi } from "@/lib/callApi";
import FilePicker from "@/components/FilePicker";
import InterProductBannersEditor from "@/components/InterProductBannersEditor";
import MenuSideCardsEditor from "@/components/MenuSideCardsEditor";
import { STATUS_CODE } from "@/lib/Constant";

export default function CategoryModal({
  open,
  setOpen,
  GetCategoryList,
  rowData,
  setRowData,
  categoryList,
  // Full list of top-level (parent=null) categories supplied by the page.
  // We use this — not the paginated `categoryList` — so the parent dropdown
  // shows every possible parent regardless of the current table page.
  parentCategoryList,
}) {
  const token = getToken();
  const [formData, setFormData] = useState({
    categoryName: "",
    categorySlug: "",
    parentCategory: "",
    image: null,
    // colImage1: null,
    // colImage2: null,
    // colImage3: null,
  });
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  // const [colImage1Preview, setColImage1Preview] = useState(null);
  // const [colImage2Preview, setColImage2Preview] = useState(null);
  // const [colImage3Preview, setColImage3Preview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  // const [colImage1Removed, setColImage1Removed] = useState(false);
  // const [colImage2Removed, setColImage2Removed] = useState(false);
  // const [colImage3Removed, setColImage3Removed] = useState(false);

  // Sync the side-state previews to whichever row is being edited. We
  // run on EVERY rowData change (not gated on `_id`) so the preview
  // resets to null when admin opens "Add" after editing another row, and
  // re-renders the saved image when re-opening Edit.
  useEffect(() => {
    setImagePreview(rowData?.image || null);
    setDescription(rowData?.description || "");
    setImageRemoved(false);
    // Clear any in-flight File from a prior modal session so the preview
    // is driven purely by either the API URL or the user's new pick.
    setFormData((prev) => ({ ...prev, image: null }));
  }, [rowData]);

  // Active tag list for the "Featured tags" multi-select. Loaded once at
  // mount — admins changing tags need to refresh, but that's rare enough.
  const [availableTags, setAvailableTags] = useState([]);
  useEffect(() => {
    callApi(API_URL.GET_TAGS, "GET", null, token)
      .then((res) => {
        if (res?.errorCode === STATUS_CODE.OK && Array.isArray(res.data)) {
          setAvailableTags(res.data);
        }
      })
      .catch(() => { });
  }, [token]);
  console.log("rowData?.featuredCategory", rowData?.featuredCategory);
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
      categoryName: rowData?.categoryName || "",
      slug: rowData?.slug || "",
      parentCategoryId: rowData?.parentCategoryId?._id || "",
      image: rowData?.image || null,
      // size: rowData?.size || "",
      sort: rowData?.sort || 0,
      featuredCategory: rowData?.featuredCategory ?? false,
      hasSize: rowData?.hasSize ?? false,
      sizeLabel: rowData?.sizeLabel || rowData?.sizeLable || "",
      isMenu: rowData?.isMenu ?? false,
      // pageBanner is the list-page hero. The two image fields can each
      // be a File (newly picked) or a string (existing path from the API).
      pageBannerImage: rowData?.pageBanner?.image || "",
      pageBannerImageMobile: rowData?.pageBanner?.imageMobile || "",
      pageBannerHeading: rowData?.pageBanner?.heading || "",
      pageBannerSubText: rowData?.pageBanner?.subText || "",
      // Editor-managed arrays — see InterProductBannersEditor /
      // MenuSideCardsEditor for shape.
      interProductBanners: Array.isArray(rowData?.interProductBanners)
        ? rowData.interProductBanners
        : [],
      menuSideCards: Array.isArray(rowData?.menuSideCards)
        ? rowData.menuSideCards
        : [],
      // Multi-selected tag _ids for the "Featured" column in the mega
      // menu. Server returns them as { _id, name } objects on edit.
      tags: Array.isArray(rowData?.tags)
        ? rowData.tags.map((t) => (typeof t === "object" ? t._id : t))
        : [],
    },
    validationSchema: Yup.object({
      categoryName: Yup.string().required("Category Name is required"),
      slug: Yup.string().required("Slug is required"),
      parentCategoryId: Yup.string(),
      sort: Yup.number().min(0, "Sort order cannot be negative"),
      sizeLabel: Yup.string().when("hasSize", {
        is: true,
        then: (schema) => schema.required("Size Label is required"),
        otherwise: (schema) => schema.optional(),
      }),
    }),
    enableReinitialize: true,
    onSubmit: async (val) => {
      setIsLoading(true);
      // const myHeaders = new Headers();
      // myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();
      formdata.append("categoryName", val.categoryName);
      formdata.append("slug", val.slug);

      // Handle image logic
      if (imageRemoved) {
        formdata.append("image", "");
      } else if (formData.image) {
        formdata.append("image", formData.image);
      }

      // if (colImage1Removed) {
      //   formdata.append("col_image1", "");
      // } else if (formData.colImage1) {
      //   formdata.append("col_image1", formData.colImage1);
      // }

      // if (colImage2Removed) {
      //   formdata.append("col_image2", "");
      // } else if (formData.colImage2) {
      //   formdata.append("col_image2", formData.colImage2);
      // }

      // if (colImage3Removed) {
      //   formdata.append("col_image3", "");
      // } else if (formData.colImage3) {
      //   formdata.append("col_image3", formData.colImage3);
      // }


      if (val.parentCategoryId) {
        formdata.append("parentCategoryId", val.parentCategoryId);
      }
      formdata.append("size", val.size);
      formdata.append("sort", val.sort);
      formdata.append("featuredCategory", val.featuredCategory ? 1 : 0);
      formdata.append("hasSize", val.hasSize ? 1 : 0);
      if (val.hasSize) {
        formdata.append("sizeLabel", val.sizeLabel ?? "");
        formdata.append("sizeLable", val.sizeLabel ?? "");
      }
      formdata.append("isMenu", val.isMenu ? 1 : 0);

      // Page banner: send the File when it's a new upload (multer reads
      // these by fieldname), otherwise send the existing path so the
      // service preserves it. Text fields always go through.
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

      // Strip `_id` (and any other Mongoose subdoc bookkeeping) off
      // each row before re-submitting. Older detail responses sometimes
      // leaked a serialized ObjectId Buffer onto each entry, and sending
      // it back as `{_id: {buffer: {...}}}` makes Mongoose's CastError
      // reject the whole update. Mongoose will generate new subdoc _ids
      // on insert anyway, so dropping it is safe.
      const stripSubdocMeta = (rows) =>
        (Array.isArray(rows) ? rows : []).map(({ _id, __v, ...rest }) => rest);
      formdata.append(
        "interProductBanners",
        JSON.stringify(stripSubdocMeta(val.interProductBanners)),
      );
      formdata.append(
        "menuSideCards",
        JSON.stringify(stripSubdocMeta(val.menuSideCards)),
      );
      formdata.append("tags", JSON.stringify(val.tags || []));

      const plainText = description.replace(/<[^>]*>/g, "");
      formdata.append("description", plainText);

      let url = `${API_URL?.CREATE_CATEGORY}/`;
      if (rowData?._id) {
        url = `${API_URL?.UPDATE_CATEGORY}/${rowData?._id}`;
      }
      callApi(url, rowData?._id ? "PUT" : "POST", formdata, token)
        .then((result) => {
          setIsLoading(false);
          if (result?.errorCode == STATUS_CODE.OK) {
            toast.success(result?.message);
            GetCategoryList();
            setOpen(false);
            resetForm();
            setFormData({
              categoryName: "",
              slug: "",
              parentCategoryId: "",
              image: null,
              // size: "",
              sort: 0,
              featuredCategory: false,
              hasSize: false,
              sizeLabel: "",
              sizeLable: "",
              isMenu: false,
              // colImage1: null,
              // colImage2: null,
              // colImage3: null,
            });
            setDescription("");
            setImagePreview(null);
            // setColImage1Preview(null);
            // setColImage2Preview(null);
            // setColImage3Preview(null);
            setImageRemoved(false);
            // setColImage1Removed(false);
            // setColImage2Removed(false);
            // setColImage3Removed(false);
          } else {
            toast.error(result?.message);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          toast.error("Something went wrong");
        });
    },
  });
  console.log('values?.featuredCategory', values?.featuredCategory)
  // Handle image upload for new files
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, image: file }));
        setImageRemoved(false);

        // Create preview for new upload
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  // Remove image handler
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setImageRemoved(true);
  };

  // const handleColImage1Upload = (e) => {
  //   const file = e.target.files[0];
  //   if (file && file.type.startsWith("image/")) {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(file);
  //     img.onload = () => {
  //       if (img.width === 320 && img.height === 860) {
  //         setFormData((prev) => ({ ...prev, colImage1: file }));
  //         setColImage1Removed(false);
  //         const previewUrl = URL.createObjectURL(file);
  //         setColImage1Preview(previewUrl);
  //       } else {
  //         toast.error("Image dimensions must be 320 x 860 pixels");
  //         e.target.value = ""; // Clear selection
  //       }
  //       URL.revokeObjectURL(img.src);
  //     };
  //   } else if (file) {
  //     toast.error("Please select a valid image file");
  //   }
  // };

  // const handleRemoveColImage1 = () => {
  //   setFormData((prev) => ({ ...prev, colImage1: null }));
  //   setColImage1Preview(null);
  //   setColImage1Removed(true);
  // };

  // const handleColImage2Upload = (e) => {
  //   const file = e.target.files[0];
  //   if (file && file.type.startsWith("image/")) {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(file);
  //     img.onload = () => {
  //       if (img.width === 640 && img.height === 430) {
  //         setFormData((prev) => ({ ...prev, colImage2: file }));
  //         setColImage2Removed(false);
  //         const previewUrl = URL.createObjectURL(file);
  //         setColImage2Preview(previewUrl);
  //       } else {
  //         toast.error("Image dimensions must be 640 x 430 pixels");
  //         e.target.value = ""; // Clear selection
  //       }
  //       URL.revokeObjectURL(img.src);
  //     };
  //   } else if (file) {
  //     toast.error("Please select a valid image file");
  //   }
  // };

  // const handleRemoveColImage2 = () => {
  //   setFormData((prev) => ({ ...prev, colImage2: null }));
  //   setColImage2Preview(null);
  //   setColImage2Removed(true);
  // };

  // const handleColImage3Upload = (e) => {
  //   const file = e.target.files[0];
  //   if (file && file.type.startsWith("image/")) {
  //     const img = new Image();
  //     img.src = URL.createObjectURL(file);
  //     img.onload = () => {
  //       if (img.width === 1440 && img.height === 400) {
  //         setFormData((prev) => ({ ...prev, colImage3: file }));
  //         setColImage3Removed(false);
  //         const previewUrl = URL.createObjectURL(file);
  //         setColImage3Preview(previewUrl);
  //       } else {
  //         toast.error("Image dimensions must be 1440 x 400 pixels");
  //         e.target.value = ""; // Clear selection
  //       }
  //       URL.revokeObjectURL(img.src);
  //     };
  //   } else if (file) {
  //     toast.error("Please select a valid image file");
  //   }
  // };

  // const handleRemoveColImage3 = () => {
  //   setFormData((prev) => ({ ...prev, colImage3: null }));
  //   setColImage3Preview(null);
  //   setColImage3Removed(true);
  // };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // [imagePreview, colImage1Preview, colImage2Preview, colImage3Preview].forEach((preview) => {
      [imagePreview].forEach((preview) => {
        if (preview && preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreview]);
  // }, [imagePreview, colImage1Preview, colImage2Preview, colImage3Preview]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <form onSubmit={handleSubmit}>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-70 z-[9999]" />

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
                {rowData?._id ? "Edit" : "Add"} Category
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData?._id ? "Update" : "Save"}
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
                    Category Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="text"
                    name="categoryName"
                    value={values.categoryName}
                    onChange={(e) => {
                      handleChange(e);
                      const generatedSlug = e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[@/]+/g, '-')        // Replace @ and / with -
                        .replace(/\s+/g, '-')          // Replace spaces with -
                        .replace(/[^\w-]+/g, '-')      // Replace other special chars with -
                        .replace(/--+/g, '-')          // Replace multiple - with single -
                        .replace(/^-+|-+$/g, '');
                      setFieldValue("slug", generatedSlug);
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter Category Name"
                  />
                  {touched.categoryName && errors.categoryName && (
                    <p className="text-sm text-red-500">
                      {errors.categoryName}
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
                        .trim()
                        .replace(/[@/]+/g, '-')        // Replace @ and / with -
                        .replace(/\s+/g, '-')          // Replace spaces with -
                        .replace(/[^\w-]+/g, '-')      // Replace other special chars with -
                        .replace(/--+/g, '-')          // Replace multiple - with single -
                        .replace(/^-+|-+$/g, '');
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
                    Parent Category
                  </label>
                  {/* Only top-level cats (parentCategoryId is null) are
                      listed — we cap the hierarchy at 2 levels. The
                      `parentCategoryList` prop is the full list from the
                      dedicated endpoint; we still guard with the same
                      filter in case the caller passes mixed data. The
                      currently-edited row is excluded so a category
                      can't be its own parent. */}
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    name="parentCategoryId"
                    value={values.parentCategoryId}
                    onChange={handleChange}
                  >
                    <option value="">--- None (Top-level) ---</option>
                    {(Array.isArray(parentCategoryList) && parentCategoryList.length > 0
                      ? parentCategoryList
                      : categoryList
                    )
                      .filter(
                        (v) => !v?.parentCategoryId && v?._id !== rowData?._id,
                      )
                      .map((value) => (
                        <option key={value?._id} value={value?._id}>
                          {value?.categoryName}
                        </option>
                      ))}
                  </select>
                  {touched.parentCategoryId && errors.parentCategoryId && (
                    <p className="text-sm text-red-500">
                      {errors.parentCategoryId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Sort Order</label>
                    <input
                      className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                      type="number"
                      name="sort"
                      min="0"
                      value={values.sort}
                      onChange={handleChange}
                      placeholder="Enter Sort Order"
                    />
                    {touched.sort && errors.sort && (
                      <p className="text-sm text-red-500">{errors.sort}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="modalFeaturedCategory"
                      name="featuredCategory"
                      checked={values.featuredCategory || false}
                      onChange={(e) => {
                        console.log("e.target.checked ===>", e.target.checked);
                        setFieldValue("featuredCategory", e.target.checked);
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="modalFeaturedCategory"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Featured Category
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="modalHasSize"
                      name="hasSize"
                      checked={values.hasSize || false}
                      onChange={(e) => {
                        setFieldValue("hasSize", e.target.checked);
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="modalHasSize"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Ask For Size
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="modalIsMenu"
                      name="isMenu"
                      checked={values.isMenu || false}
                      onChange={(e) => {
                        setFieldValue("isMenu", e.target.checked);
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="modalIsMenu"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Show in Menu
                    </label>
                  </div>
                </div>

                {values.hasSize && (
                  <div className="pt-4">
                    <label className="block text-sm font-medium">Size Label</label>
                    <input
                      className="w-full p-1 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                      type="text"
                      id="sizeLabel"
                      name="sizeLabel"
                      value={values.sizeLabel || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.sizeLabel && errors.sizeLabel && (
                      <p className="text-sm text-red-500">{errors.sizeLabel}</p>
                    )}
                  </div>
                )}

                {/* List Page Banner — shown above the product grid on the
                    customer-side /category/<slug> page. Optional. */}
                <div className="border-t mt-6 pt-5 space-y-4">
                  <div className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
                    List Page Banner
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilePicker
                      label="Banner (Desktop - 1585×300px)"
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

                {/* Inter-product banners — editorial cards admins can drop
                    between rows on the list page. Optional. */}
                <div className="border-t mt-6 pt-5">
                  <InterProductBannersEditor
                    value={values.interProductBanners}
                    onChange={(arr) => setFieldValue("interProductBanners", arr)}
                  />
                </div>

                {/* Mega-menu right-side cards. Only relevant for top-level
                    categories with isMenu=true; harmless on subcategories. */}
                <div className="border-t mt-6 pt-5">
                  <MenuSideCardsEditor
                    value={values.menuSideCards}
                    onChange={(arr) => setFieldValue("menuSideCards", arr)}
                  />
                </div>

                {/* Featured tags — populates the "Featured" column in
                    this category's mega menu dropdown. Multi-select from
                    the active Tag master list. Suspended/removed tags
                    drop out automatically at storefront render time. */}
                <div className="border-t mt-6 pt-5">
                  <div className="text-sm font-semibold uppercase tracking-wider text-zinc-700 mb-3">
                    Featured Tags
                  </div>
                  {availableTags.length === 0 ? (
                    <div className="text-xs text-zinc-500 border border-dashed rounded-md py-3 text-center">
                      No active tags yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((t) => {
                        const id = String(t._id);
                        const selected = (values.tags || []).map(String).includes(id);
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => {
                              const current = (values.tags || []).map(String);
                              const next = selected
                                ? current.filter((x) => x !== id)
                                : [...current, id];
                              setFieldValue("tags", next);
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected
                              ? "bg-black text-white border-black"
                              : "bg-white border-zinc-300 text-zinc-700 hover:border-zinc-500"
                              }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* <div className="border-t pt-4 mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Size Category
                  </label>
                  <div className="flex items-center gap-4 h-10">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="modalRingSize"
                        name="size"
                        value="RingSize"
                        checked={values.size === "RingSize"}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor="modalRingSize"
                        className="text-sm cursor-pointer"
                      >
                        Ring
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="modalBraceletSize"
                        name="size"
                        value="BraceletSize"
                        checked={values.size === "BraceletSize"}
                        onChange={handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor="modalBraceletSize"
                        className="text-sm cursor-pointer"
                      >
                        Bracelet
                      </label>
                    </div>
                  </div>
                </div> */}

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <div>
                    <QuillEditor
                      value={description}
                      onChange={setDescription}
                    />
                  </div>
                </div>

                {/* Banner Image Upload with Preview */}
                {/* <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Category Banner (395 x 535)
                  </label>

                  {!colImage3Preview ? (
                    <div className="text-center border px-4 py-8 rounded-lg relative border-[#E4E8EE]">
                      <p className="text-sm text-[#656B7B] mb-4">
                        Drag or drop an image to upload
                      </p>
                      <label htmlFor="colImage3Upload" className="inline-block">
                        <span className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#656B7B] bg-white hover:bg-gray-50 cursor-pointer">
                          Add Banner
                        </span>
                        <input
                          id="colImage3Upload"
                          name="colImage3"
                          type="file"
                          accept="image/*"
                          onChange={handleColImage3Upload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border border-[#E4E8EE] rounded-lg p-4 relative">
                      <div className="flex gap-4 items-start">
                        <div className="relative w-full max-w-[200px] h-20 border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={colImage3Preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#656B7B] mb-2">
                            {formData?.colImage3 ? (
                              <>
                                <span className="font-semibold">Filename:</span>{" "}
                                {formData?.colImage3?.name}
                              </>
                            ) : (
                              <span className="font-semibold">
                                Current Banner
                              </span>
                            )}
                          </p>
                          {formData?.colImage3 && (
                            <p className="text-sm text-[#656B7B] mb-4">
                              <span className="font-semibold">Size:</span>{" "}
                              {(formData?.colImage3?.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveColImage3}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                          >
                            <X size={14} />
                            Remove Banner
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Image Upload with Preview */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Category Image
                  </label>

                  {!imagePreview ? (
                    <div className="text-center border px-4 py-8 rounded-lg relative border-[#E4E8EE]">
                      <p className="text-sm text-[#656B7B] mb-4">
                        Drag or drop an image to upload
                      </p>
                      <label htmlFor="imageUpload" className="inline-block">
                        <span className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#656B7B] bg-white hover:bg-gray-50 cursor-pointer">
                          Add Image
                        </span>
                        <input
                          id="imageUpload"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="border border-[#E4E8EE] rounded-lg p-4 relative">
                      <div className="flex gap-4 items-start">
                        <div className="relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#656B7B] mb-2">
                            {formData?.image ? (
                              <>
                                <span className="font-semibold">Filename:</span>{" "}
                                {formData?.image?.name}
                              </>
                            ) : (
                              <span className="font-semibold">
                                Current Image
                              </span>
                            )}
                          </p>
                          {formData?.image && (
                            <p className="text-sm text-[#656B7B] mb-4">
                              <span className="font-semibold">Size:</span>{" "}
                              {(formData?.image?.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                          >
                            <X size={14} />
                            Remove Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Image 1 */}
                  {/* <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Product List Image 1 <span className="text-gray-400 text-[10px] font-normal">(320 x 860)</span>
                    </label>

                    {!colImage1Preview ? (
                      <div className="text-center border px-4 py-8 rounded-lg relative border-[#E4E8EE]">
                        <p className="text-xs text-[#656B7B] mb-4">
                          Upload Image 1 (320 x 860)
                        </p>
                        <label htmlFor="colImage1Upload" className="inline-block">
                          <span className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-[#656B7B] bg-white hover:bg-gray-50 cursor-pointer">
                            Add
                          </span>
                          <input
                            id="colImage1Upload"
                            name="colImage1"
                            type="file"
                            accept="image/*"
                            onChange={handleColImage1Upload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="border border-[#E4E8EE] rounded-lg p-2 relative">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative w-full h-24 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={colImage1Preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveColImage1}
                            className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                          >
                            <X size={10} />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div> */}

                  {/* Category Image 2 */}
                  {/* <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Product List Image 2 <span className="text-gray-400 text-[10px] font-normal">(640 x 430)</span>
                    </label>

                    {!colImage2Preview ? (
                      <div className="text-center border px-4 py-8 rounded-lg relative border-[#E4E8EE]">
                        <p className="text-xs text-[#656B7B] mb-4">
                          Upload Image 2 (640 x 430)
                        </p>
                        <label htmlFor="colImage2Upload" className="inline-block">
                          <span className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-[#656B7B] bg-white hover:bg-gray-50 cursor-pointer">
                            Add
                          </span>
                          <input
                            id="colImage2Upload"
                            name="colImage2"
                            type="file"
                            accept="image/*"
                            onChange={handleColImage2Upload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="border border-[#E4E8EE] rounded-lg p-2 relative">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative w-full h-24 border border-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={colImage2Preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveColImage2}
                            className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1"
                          >
                            <X size={10} />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
