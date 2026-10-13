"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function TagModal({ isOpen, onClose, rowData, refreshData }) {
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();

  // Tag schema stores `acceptableValues` as a plain string[] on the
  // server. We render them as removable chips with a single text input —
  // simpler than a list editor, matches how Tags are entered elsewhere.
  const [newValue, setNewValue] = useState("");

  const formik = useFormik({
    initialValues: {
      name: rowData?.name || "",
      description: rowData?.description || "",
      acceptableValues: Array.isArray(rowData?.acceptableValues)
        ? rowData.acceptableValues
        : [],
      sort: rowData?.sort ?? 0,
      isMenu: rowData?.isMenu ?? false,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      sort: Yup.number().min(0, "Sort must be 0 or greater"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload = {
          name: values.name.trim(),
          description: values.description || "",
          acceptableValues: values.acceptableValues || [],
          sort: Number(values.sort) || 0,
          isMenu: !!values.isMenu,
        };

        const url = rowData
          ? `${API_URL.UPDATE_TAG}/${rowData._id}`
          : API_URL.CREATE_TAG;
        const method = rowData ? "PUT" : "POST";

        const response = await callApi(url, method, payload, token);

        if (
          response?.errorCode === STATUS_CODE.OK ||
          response?.errorCode === STATUS_CODE.CREATED
        ) {
          toast.success(rowData ? M.tag.updated : M.tag.created);
          refreshData();
          onClose();
        } else {
          toast.error(response?.message || M.common.somethingWentWrong);
        }
      } catch (error) {
        toast.error(M.common.somethingWentWrong);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const addAcceptableValue = () => {
    const v = newValue.trim();
    if (!v) return;
    const current = formik.values.acceptableValues || [];
    if (current.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setNewValue("");
      return;
    }
    formik.setFieldValue("acceptableValues", [...current, v]);
    setNewValue("");
  };

  const removeAcceptableValue = (idx) => {
    const next = (formik.values.acceptableValues || []).slice();
    next.splice(idx, 1);
    formik.setFieldValue("acceptableValues", next);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <form onSubmit={formik.handleSubmit}>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-70 z-[9999]" />

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-[40%] z-[9999] bg-white p-2 rounded-s-2xl cursor-pointer"
            >
              <X size={20} />
            </button>
          </Dialog.Close>

          <Dialog.Content className="fixed top-0 right-0 w-[40%] h-full bg-white z-[9999] p-6 overflow-y-auto focus:outline-none">
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-lg font-semibold flex-1">
                {rowData ? "Edit" : "Add"} Tag
              </Dialog.Title>

              <div className="flex gap-2">
                {!isLoading ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer"
                  >
                    {rowData ? "Update" : "Save"}
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

            <div className="space-y-6 mt-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="text"
                  name="name"
                  placeholder="e.g. Bestseller, New Arrival"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500">{formik.errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none min-h-[80px]"
                  name="description"
                  placeholder="Short description shown in the admin only"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              {/* Acceptable values — chip list. The server stores these
                  as a plain string[]; we render them as removable pills
                  and append via the small input + Add button. */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Acceptable Values
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                    placeholder="Type a value and press Add"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAcceptableValue();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addAcceptableValue}
                    className="px-3 py-2 bg-black text-white rounded-md text-sm flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                {(formik.values.acceptableValues || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formik.values.acceptableValues.map((v, i) => (
                      <span
                        key={`${v}-${i}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => removeAcceptableValue(i)}
                          className="text-zinc-500 hover:text-red-600"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    No values yet — optional helper list for admins entering
                    products.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium">
                    Sort Order
                  </label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                    type="number"
                    name="sort"
                    min="0"
                    value={formik.values.sort}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.sort && formik.errors.sort && (
                    <p className="text-sm text-red-500">{formik.errors.sort}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-7">
                  <input
                    type="checkbox"
                    id="tagIsMenu"
                    name="isMenu"
                    className="w-4 h-4 cursor-pointer"
                    checked={formik.values.isMenu}
                    onChange={(e) =>
                      formik.setFieldValue("isMenu", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="tagIsMenu"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Show in Mega Menu
                  </label>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
