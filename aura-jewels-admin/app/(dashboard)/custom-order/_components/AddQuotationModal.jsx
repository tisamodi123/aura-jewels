"use client";

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Plus, Trash2, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { showError, showSuccess } from "@/lib/toast";
import { reactSelectStyles } from "@/components/common/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";

const emptyRow = () => ({
  id: Math.random().toString(36).substring(2, 9),
  title: "",
  carate: "",
  diamondLabel: "",
  metalPrice: "",
  metalType: "",
  metalWeight: "",
  price: "",
  remarks: "",
  totalPrice: "",
});

const Field = memo(
  ({ label, name, value, onChange, placeholder = "" }) => (
    <div className="flex flex-col gap-1">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </Label>
      <Input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  )
);

Field.displayName = "Field";

const AddQuotationModal = ({ order, onClose, onSuccess }) => {
  const token = getToken();

  const [rows, setRows] = useState([emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [metalList, setMetalList] = useState([]);

  useEffect(() => {
    const fetchMetals = async () => {
      try {
        const res = await callApi(API_URL.GET_METAL_LIST, "GET", null, token);
        if (res?.errorCode === STATUS_CODE.OK) {
          setMetalList(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Metal list fetch error:", error);
      }
    };

    fetchMetals();
  }, [token]);

  useEffect(() => {
    document.body.style.overflow = order ? "hidden" : "";
    if (!order) {
      setRows([emptyRow()]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  const metalOptions = useMemo(
    () =>
      metalList.map((metal) => ({
        value: metal._id,
        label: `${metal.name}${metal.stamp ? ` (${metal.stamp})` : ""
          }`,
      })),
    [metalList]
  );

  const handleChange = useCallback((rowIdx, field, value) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIdx ? { ...row, [field]: value } : row
      )
    );
  }, []);

  const handleNumericChange = useCallback((rowIdx, field, value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join("")}` 
      : cleaned;
    handleChange(rowIdx, field, formatted);
  }, [handleChange]);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const removeRow = useCallback((idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out completely empty rows
    const activeRows = rows.filter((row) =>
      Object.entries(row).some(
        ([key, value]) => key !== "id" && typeof value === "string" && value.trim() !== ""
      )
    );

    if (activeRows.length === 0) {
      showError("Please fill in at least one quotation.");
      return;
    }

    // Validate each active row
    for (let i = 0; i < activeRows.length; i++) {
      const row = activeRows[i];
      const rowNum = rows.indexOf(row) + 1; // 1-based index in the UI list

      if (!row.metalWeight || row.metalWeight.trim() === "") {
        showError(`Metal Weight is required for Quotation #${rowNum}.`);
        return;
      }
      
      const metalWeightNum = parseFloat(row.metalWeight);
      if (isNaN(metalWeightNum) || metalWeightNum <= 0) {
        showError(`Please enter a valid Metal Weight for Quotation #${rowNum}.`);
        return;
      }

      if (!row.totalPrice || row.totalPrice.trim() === "") {
        showError(`Total Price is required for Quotation #${rowNum}.`);
        return;
      }

      const totalPriceNum = parseFloat(row.totalPrice);
      if (isNaN(totalPriceNum) || totalPriceNum <= 0) {
        showError(`Please enter a valid Total Price for Quotation #${rowNum}.`);
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("customOrderId", order._id);

      // Append active rows with continuous sequential indices
      activeRows.forEach((row, index) => {
        Object.entries(row).forEach(([key, value]) => {
          if (key === "id") return;
          const trimmed = typeof value === "string" ? value.trim() : "";
          if (trimmed) {
            formData.append(`quotations[${index}][${key}]`, trimmed);
          }
        });
      });

      const result = await callApi(API_URL.ADD_QUOTATION, "POST", formData, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        showSuccess(
          result?.message || "Quotation added successfully."
        );

        setRows([emptyRow()]);
        onSuccess?.();
        onClose();
      } else {
        showError(result?.message || "Failed to add quotation.");
      }
    } catch (error) {
      console.log("Add quotation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  Add Quotation
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {order.firstName} {order.lastName} · {order.email}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col overflow-hidden"
            >
              <div className="overflow-y-auto px-6 py-5 space-y-6">
                <AnimatePresence initial={false}>
                  {rows.map((row, idx) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-xl border border-gray-100 bg-gray-50/60 p-4 pt-5"
                    >
                      <span className="absolute -top-3 left-4 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        #{idx + 1}
                      </span>

                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="absolute right-3 top-3 rounded-md p-1 text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Field
                          label="Title"
                          value={row.title}
                          placeholder="e.g. Diamond Stud Earrings"
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "title",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Carate"
                          value={row.carate}
                          placeholder="e.g. 18"
                          onChange={(e) =>
                            handleNumericChange(
                              idx,
                              "carate",
                              e.target.value
                            )
                          }
                        />

                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                            Metal Type
                          </Label>

                          <Select
                            inputId={`metalType-${idx}`}
                            options={metalOptions}
                            value={
                              metalOptions.find(
                                (item) =>
                                  item.value === row.metalType
                              ) || null
                            }
                            onChange={(option) =>
                              handleChange(
                                idx,
                                "metalType",
                                option?.value || ""
                              )
                            }
                            placeholder="Select Metal"
                            isClearable
                            menuPosition="fixed"
                            menuPortalTarget={
                              typeof window !== "undefined"
                                ? document.body
                                : null
                            }
                            styles={reactSelectStyles}
                          />
                        </div>

                        <Field
                          label="Metal Weight (g)"
                          value={row.metalWeight}
                          placeholder="e.g. 5.20"
                          onChange={(e) =>
                            handleNumericChange(
                              idx,
                              "metalWeight",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Metal Price (₹)"
                          value={row.metalPrice}
                          placeholder="e.g. 35000"
                          onChange={(e) =>
                            handleNumericChange(
                              idx,
                              "metalPrice",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Diamond Label"
                          value={row.diamondLabel}
                          placeholder="e.g. VVS EF"
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "diamondLabel",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Diamond Price (₹)"
                          value={row.price}
                          placeholder="e.g. 45000"
                          onChange={(e) =>
                            handleNumericChange(
                              idx,
                              "price",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Total Price (₹)"
                          value={row.totalPrice}
                          placeholder="e.g. 80000"
                          onChange={(e) =>
                            handleNumericChange(
                              idx,
                              "totalPrice",
                              e.target.value
                            )
                          }
                        />

                        <Field
                          label="Remarks"
                          value={row.remarks}
                          placeholder="e.g. Laser engraving included"
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "remarks",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={addRow}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 py-3 text-sm font-medium text-indigo-500 hover:bg-indigo-50"
                >
                  <Plus size={16} />
                  Add Another Quotation
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Save Quotation
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddQuotationModal;