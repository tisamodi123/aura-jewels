"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Printer, FileText, Sparkles, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getToken } from "@/lib/auth";
import { backdropVariants, modalVariants } from "@/components/animations/modalAnimations";
import { API_URL } from "@/lib/APIUrl";
import { showError, showSuccess } from "@/lib/toast";
import callApi from "@/lib/callApi";

const StatusDropdown = ({ currentStatus, onStatusChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  const statuses = [
    { value: "Pending", label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/70", dot: "bg-amber-500" },
    { value: "Approved", label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70", dot: "bg-emerald-500" },
    { value: "Reject", label: "Reject", bg: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/70", dot: "bg-rose-500" }
  ];

  const displayStatus = currentStatus || "Pending";
  const matched = statuses.find(s => s.value.toLowerCase() === displayStatus.toLowerCase());
  const activeStyle = matched || {
    value: displayStatus,
    label: displayStatus,
    bg: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/70",
    dot: "bg-blue-500"
  };

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      updateCoords();
      setIsOpen(true);
    }
  };

  const handleSelect = (val) => {
    if (val !== currentStatus) {
      onStatusChange(val);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = () => setIsOpen(false);
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("resize", updateCoords);

    // Listen to scroll events on any element to update coordinates
    window.addEventListener("scroll", updateCoords, true);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left print:hidden" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`inline-flex items-center justify-between gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${activeStyle.bg}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${activeStyle.dot}`} />
        <span>{activeStyle.label}</span>
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: coords.top + 6,
            left: coords.left,
            width: "128px", // w-32 matches tailwind
            zIndex: 99999,
          }}
          className="rounded-xl border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-0.5 space-y-0.5">
            {statuses.map((status) => {
              const isSelected = displayStatus.toLowerCase() === status.value.toLowerCase();
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleSelect(status.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${isSelected
                    ? "bg-gray-50 text-gray-900 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    <span>{status.label}</span>
                  </div>
                  {isSelected && <Check size={10} className="text-gray-500" />}
                </button>
              );
            })}
          </div>
        </motion.div>,
        document.body
      )}
    </div>
  );
};

const QuotationViewModal = ({ order, onClose, onSuccess }) => {
  const token = getToken();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (order?._id) {
      setQuotations([]);
      setLoading(true);
      getQuotationList(order._id);
    } else {
      setQuotations([]);
      setLoading(false);
    }
  }, [order?._id]);

  const getQuotationList = async (orderId) => {
    if (!orderId) return;
    try {
      const response = await callApi(`${API_URL?.GET_QUOTATION_LIST}${orderId}`, "GET", null, token);
      if (response?.errorCode === 200) {
        if (response?.data && response?.data.length > 0) {
          setQuotations(response?.data);
        } else {
          showError(response?.message || "No quotations found for this order");
        }
      } else {
        showError(response?.message || "Quotation not found");
      }
    } catch (error) {
      console.log("GetQuotationList Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    if (!order?._id || !quotationId) return;
    try {
      setUpdatingId(quotationId);
      const formData = new FormData();
      formData.append("customOrderId", order._id);
      formData.append("quotationId", quotationId);
      formData.append("status", newStatus);

      const response = await callApi(API_URL.UPDATE_QUOTATION_STATUS, "POST", formData, token);
      if (response?.errorCode === 200) {
        showSuccess(response?.message || "Status updated successfully");
        getQuotationList(order._id);
        onSuccess?.();
      } else {
        showError(response?.message || "Failed to update status");
      }
    } catch (error) {
      console.log("UpdateQuotationStatus Error:", error);
      showError("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          {/* BACKDROP */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm print:hidden"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            id="print-area"
            className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print:shadow-none print:rounded-none print:max-w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4 print:bg-white print:border-b-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 print:hidden">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    Quotation Invoice
                    {!loading && quotations?.length === 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 print:hidden">
                        <Sparkles size={10} />
                        No Data
                      </span>
                    )}
                    {loading && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800 animate-pulse print:hidden">
                        Loading...
                      </span>
                    )}
                  </h2>

                  <p className="text-xs text-gray-500">
                    {order.firstName} {order.lastName} · {order.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                {/* <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Printer size={14} />
                  Print
                </button> */}

                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* INFO */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border bg-gray-50/50 p-4 text-sm md:grid-cols-3">
                {/* <div>
                  <p className="text-[10px] font-bold text-gray-400">Order ID</p>
                  <p className="font-semibold">{order._id}</p>
                </div> */}

                <div>
                  <p className="text-[10px] font-bold text-gray-400">Category</p>
                  <p>{order.categoryId?.categoryName || "—"}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400">Budget</p>
                  <p className="font-semibold text-indigo-600">
                    ₹ {order.budget?.toLocaleString("en-IN") || "—"}
                  </p>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-visible rounded-xl border print:border-none">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 print:bg-white">
                    <tr>
                      <th className="p-3 w-10">#</th>
                      <th className="p-3">Quotation Info</th>
                      <th className="p-3">Metal Details</th>
                      <th className="p-3">Diamond Details</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse align-top">
                          <td className="p-3">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-gray-200 rounded"></div>
                              <div className="h-3 w-48 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <div className="h-4 w-20 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <div className="h-4 w-24 bg-gray-200 rounded"></div>
                              <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="h-5 w-20 bg-gray-200 rounded ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : quotations.length > 0 ? (
                      quotations.map((q, i) => (
                        <tr key={i} className="hover:bg-gray-50 align-top">
                          <td className="p-3 font-semibold text-gray-400">
                            {i + 1}
                          </td>

                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{q.title || "—"}</span>
                                {q.name && (
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600">
                                    {q.name}
                                  </span>
                                )}
                                {updatingId === q.quotationId || updatingId === q._id ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-800 animate-pulse print:hidden">
                                    Updating...
                                  </span>
                                ) : (
                                  <>
                                    <div className="flex items-start gap-2 flex-col">
                                      <div className="div">
                                        <StatusDropdown
                                          currentStatus={q.status}
                                          disabled={updatingId !== null}
                                          onStatusChange={(newStatus) => handleStatusChange(q.quotationId || q._id, newStatus)}
                                        />
                                        <span className={`hidden print:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${(q.status || "").toLowerCase() === 'new'
                                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                                          : ['approved', 'active', 'accepted', 'Accept'].includes((q.status || "").toLowerCase())
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : ['pending'].includes((q.status || "").toLowerCase())
                                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                                              : ['rejected', 'declined', 'reject'].includes((q.status || "").toLowerCase())
                                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                          }`}>
                                          {q.status || "Pending"}
                                        </span>
                                      </div>
                                      {
                                        q.approvedByUser && q.status == "Accept" && (
                                          <div className="text-[10px] text-emerald-750 bg-emerald-50/70 border border-emerald-150 rounded px-2.5 py-1 mt-1.5 flex items-center gap-1.5 font-medium max-w-xs leading-normal">
                                            <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                                            <span>Approved by user. Pending your approval.</span>
                                          </div>
                                        )
                                      }
                                    </div>
                                  </>
                                )}
                              </div>
                              {q.remarks && (
                                <p className="text-xs text-gray-500 max-w-[200px] break-words whitespace-pre-line italic">
                                  {q.remarks}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800">
                                {q.metalInfo?.metalType?.name ||
                                  (typeof q.metalInfo?.metalType === 'string' ? q.metalInfo.metalType : "") ||
                                  q.metalType ||
                                  "—"}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                {(q.metalInfo?.metalWeight || q.metalWeight) && (
                                  <span>{q.metalInfo?.metalWeight || q.metalWeight}g</span>
                                )}
                                {(q.metalInfo?.metalWeight || q.metalWeight) && (q.metalInfo?.metalPrice || q.metalPrice) && (
                                  <span className="text-gray-300">|</span>
                                )}
                                {(q.metalInfo?.metalPrice || q.metalPrice) && (
                                  <span className="font-medium text-gray-700">
                                    ₹{Number(q.metalInfo?.metalPrice || q.metalPrice).toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800">
                                {q.diamond?.diamondLabel || q.diamondLabel || "—"}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                {(q.diamond?.carate || q.carate) && (
                                  <span>{q.diamond?.carate || q.carate}ct</span>
                                )}
                                {(q.diamond?.carate || q.carate) && (q.diamond?.price || q.price) && (
                                  <span className="text-gray-300">|</span>
                                )}
                                {(q.diamond?.price || q.price) && (
                                  <span className="font-medium text-gray-700">
                                    ₹{Number(q.diamond?.price || q.price).toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-right font-bold text-gray-900 text-base">
                            ₹{Number(q.totalPrice || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No quotations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end border-t bg-gray-50 px-6 py-4 print:hidden">
              <button
                onClick={onClose}
                className="rounded-lg border bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuotationViewModal;