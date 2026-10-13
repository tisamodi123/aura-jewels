"use client";
import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { callApi } from "@/lib/callApi";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function LabelModal({ isOpen, onClose, rowData, refreshData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [clarities, setClarities] = useState([]);
  const token = getToken();

  useEffect(() => {
    if (isOpen) {
      // Suggestions only — the fields are free text. These are the colours and
      // clarities the stone-group master actually carries, so a rule is easy to
      // key against a real grade without being restricted to it.
      const fetchGrades = async () => {
        try {
          const res = await callApi(API_URL.STONE_GROUP_DISTINCT_ATTRIBUTES, "GET", null, token);
          if (res?.errorCode === STATUS_CODE.OK) {
            setColors(res.data?.colors || []);
            setClarities(res.data?.clarities || []);
          }
        } catch (error) {
          console.error("Error fetching stone group grades:", error);
        }
      };
      fetchGrades();
    }
  }, [isOpen, token]);

  const formik = useFormik({
    initialValues: {
      stoneType: rowData?.stoneType || "CENTER",
      // Legacy rows may still carry a populated Parameter object; fall back to
      // its code so an un-migrated row can still be opened and re-saved.
      color: rowData?.color?.code ?? rowData?.color ?? "",
      clarity: rowData?.clarity?.code ?? rowData?.clarity ?? "",
      labelName: rowData?.labelName || "",
    },
    validationSchema: Yup.object({
      stoneType: Yup.string().oneOf(["CENTER", "SIDE"], "Invalid Stone Type").required("Stone Type is required"),
      color: Yup.string().trim().max(20, "Too long").required("Colour is required"),
      clarity: Yup.string().trim().max(20, "Too long").required("Clarity is required"),
      labelName: Yup.string().trim().max(60, "Too long").required("Label Name is required"),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload = {
          stoneType: values.stoneType,
          color: values.color.trim().toUpperCase(),
          clarity: values.clarity.trim().toUpperCase(),
          labelName: values.labelName.trim(),
        };

        const url = rowData
          ? `${API_URL.UPDATE_LABEL}/${rowData._id}`
          : API_URL.CREATE_LABEL;
        const method = rowData ? "PUT" : "POST";

        const response = await callApi(url, method, payload, token);

        if (
          response?.errorCode === STATUS_CODE.OK ||
          response?.errorCode === STATUS_CODE.CREATED
        ) {
          toast.success(rowData ? "Label updated successfully" : "Label created successfully");
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
                {rowData ? "Edit" : "Add"} Label Rule
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
                  Stone Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none bg-white"
                  name="stoneType"
                  value={formik.values.stoneType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="CENTER">Center Stone</option>
                  <option value="SIDE">Side Stone</option>
                </select>
                {formik.touched.stoneType && formik.errors.stoneType && (
                  <p className="text-sm text-red-500">{formik.errors.stoneType}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Colour <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none uppercase"
                  type="text"
                  name="color"
                  list="label-colors"
                  placeholder="e.g. GH, EF, IJ, D"
                  value={formik.values.color}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {/* Suggestions from the stone-group master; any value is allowed. */}
                <datalist id="label-colors">
                  {colors.map((c) => <option key={c} value={c} />)}
                </datalist>
                <p className="text-xs text-gray-400">
                  Must match the colour stored on the stone group this rule labels.
                </p>
                {formik.touched.color && formik.errors.color && (
                  <p className="text-sm text-red-500">{formik.errors.color}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Clarity <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none uppercase"
                  type="text"
                  name="clarity"
                  list="label-clarities"
                  placeholder="e.g. VVS, VS, IF, VVS2"
                  value={formik.values.clarity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <datalist id="label-clarities">
                  {clarities.map((c) => <option key={c} value={c} />)}
                </datalist>
                {formik.touched.clarity && formik.errors.clarity && (
                  <p className="text-sm text-red-500">{formik.errors.clarity}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium">
                  Display Label Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none"
                  type="text"
                  name="labelName"
                  placeholder="e.g. G VVS2"
                  value={formik.values.labelName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <p className="text-xs text-gray-400">
                  Shown to the customer in place of the stored grade, for this stone position.
                </p>
                {formik.touched.labelName && formik.errors.labelName && (
                  <p className="text-sm text-red-500">{formik.errors.labelName}</p>
                )}
              </div>
            </div>
          </Dialog.Content>
        </form>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
