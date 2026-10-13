"use client";

import React, { useEffect, useState } from "react";
import { X, User, Mail, Phone, ShoppingBag, Clipboard, FileText, CheckCircle, Loader2 } from "lucide-react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { API_URL, PREFIX, JEWELLERY_IMAGE_PATH } from "@/lib/APIUrl";
import { STATUS_CODE, INQUIRY_STATUS } from "@/lib/Constant";
import { showError, showSuccess } from "@/lib/toast";
import Image from "next/image";

const Field = ({ label, value, icon: Icon }) =>
  value || value === 0 ? (
    <div className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <span className="text-sm text-gray-800 break-words font-medium">{value}</span>
      </div>
    </div>
  ) : null;

const Divider = () => <hr className="border-gray-100 my-2" />;

const OrderInquiryDrawer = ({ inquiryId, onClose, refetchList }) => {
  const token = getToken();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  // Helper to safely parse and fall back on sku/productId schema shapes
  const getProductInfo = (inquiryObj) => {
    if (!inquiryObj) return {};
    const productIdObj = inquiryObj.productId || {};
    const skuObj = typeof inquiryObj.sku === 'object' ? inquiryObj.sku : {};
    const skuStr = typeof inquiryObj.sku === 'string' ? inquiryObj.sku : "";

    const title = productIdObj.productTitle || skuObj.productTitle || "";
    const code = productIdObj.itemCode || skuObj.itemCode || skuStr || "";
    const images = productIdObj.images || skuObj.images || [];
    const slug = productIdObj.slug || skuObj.slug || "";

    return { title, code, images, slug };
  };

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = inquiryId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [inquiryId]);

  // Fetch inquiry detail
  const fetchDetail = async () => {
    if (!inquiryId) return;
    try {
      setLoading(true);
      const url = API_URL.GET_ORDER_INQUIRY_DETAIL(inquiryId);
      const res = await callApi(url, "GET", null, token);

      if (res?.errorCode === STATUS_CODE.OK || res?.data) {
        const data = res.data;
        setInquiry(data);
        setAdminNotes(data.adminNotes || "");
        setStatus(data.status || "NEW");

        // Find main image
        const { images } = getProductInfo(data);
        const mainImg = images.find(img => img.IsMainMedia)?.MediaLocation || images[0]?.MediaLocation || "";
        setActiveImage(mainImg);
      } else {
        showError(res?.message || "Failed to fetch inquiry details.");
        onClose();
      }
    } catch (error) {
      console.log("Fetch inquiry detail error:", error);
      showError("An error occurred while fetching details.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [inquiryId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const url = API_URL.UPDATE_ORDER_INQUIRY_STATUS(inquiryId);
      const res = await callApi(
        url,
        "POST",
        { status, adminNotes },
        token
      );

      if (res?.errorCode === STATUS_CODE.OK || res?.message === "Status updated successfully") {
        showSuccess("Inquiry updated successfully.");
        fetchDetail();
        refetchList?.();
      } else {
        showError(res?.message || "Failed to update inquiry.");
      }
    } catch (error) {
      console.log("Update inquiry details error:", error);
      showError("An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!inquiryId) return null;

  const getImageSrc = (img) => {
    if (!img) return `${PREFIX || ""}/no-img.jpg`;
    if (img.startsWith("http") || img.startsWith("/")) return img;
    return `${JEWELLERY_IMAGE_PATH || ""}${img}`;
  };

  const formattedDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case INQUIRY_STATUS.NEW:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case INQUIRY_STATUS.CONTACTED:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case INQUIRY_STATUS.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case INQUIRY_STATUS.CANCELLED:
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <style>{`
        @keyframes oFadeIn   { from { opacity: 0; }             to { opacity: 1; } }
        @keyframes oSlideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ animation: "oFadeIn 0.2s ease-out" }}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div
        className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col"
        style={{ animation: "oSlideIn 0.28s cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Order Inquiry Details</h2>
            {inquiry && (
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                ID: {inquiry._id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Loading inquiry details...</p>
            </div>
          ) : inquiry ? (
            <>
              {/* Top Banner Status */}
              <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Current Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(inquiry.status)}`}>
                    {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).toLowerCase() : ""}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Submitted On</span>
                  <span className="text-sm text-gray-700 font-semibold">{formattedDate(inquiry.createdAt)}</span>
                </div>
              </div>
 
              {/* Customer Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b pb-1.5">
                  <User size={14} className="text-zinc-500" /> Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Customer Name" value={inquiry.name} icon={User} />
                  <Field
                    label="Email Address"
                    value={
                      inquiry.email ? (
                        <a href={`mailto:${inquiry.email}`} className="text-indigo-600 hover:underline break-all">
                          {inquiry.email}
                        </a>
                      ) : null
                    }
                    icon={Mail}
                  />
                  <Field
                    label="Phone Number"
                    value={
                      inquiry.phone || inquiry.mobileNumber ? (
                        <a
                          href={`tel:${inquiry.countryCode || ""}${inquiry.phone || inquiry.mobileNumber}`.replace(/\s+/g, "")}
                          className="text-indigo-600 hover:underline"
                        >
                          {inquiry.countryCode ? `${inquiry.countryCode} ` : ""}{inquiry.phone || inquiry.mobileNumber}
                        </a>
                      ) : null
                    }
                    icon={Phone}
                  />
                </div>

                {inquiry.createdBy && inquiry.createdBy.email !== inquiry.email && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Submitted By Registered Account
                    </span>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p><strong>Name:</strong> {inquiry.createdBy.name}</p>
                      <p><strong>Email:</strong> {inquiry.createdBy.email}</p>
                      <p><strong>Role:</strong> <span className="capitalize">{inquiry.createdBy.role}</span></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Inquiry Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b pb-1.5">
                  <FileText size={14} className="text-zinc-500" /> Inquiry Message / Notes
                </h3>
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-sm text-gray-700 leading-relaxed italic whitespace-pre-wrap">
                  {inquiry.notes || "No message or notes left by the customer."}
                </div>
              </div>

              {/* Product SKU Details */}
              {(() => {
                const { title, code, images, slug } = getProductInfo(inquiry);
                if (!title && !code && (!images || images.length === 0)) return null;
                return (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b pb-1.5">
                      <ShoppingBag size={14} className="text-zinc-500" /> Interested Product Details
                    </h3>

                    <div className="border border-zinc-150 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
                      <div className="flex p-4 gap-4">
                        {/* Left: Product Images */}
                        <div className="w-1/3 flex flex-col gap-2">
                          <div className="relative aspect-square w-full bg-zinc-50 border rounded-lg overflow-hidden flex items-center justify-center">
                            {activeImage ? (
                              <Image
                                src={getImageSrc(activeImage)}
                                alt={title || "Product image"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">No Image</span>
                            )}
                          </div>
                          {/* Image selector dots/thumbnails */}
                          {images && images.length > 1 && (
                            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                              {images.map((img) => (
                                <button
                                  key={img._id}
                                  onClick={() => setActiveImage(img.MediaLocation)}
                                  className={`relative w-8 h-8 rounded border overflow-hidden flex-shrink-0 transition-colors ${activeImage === img.MediaLocation ? "border-indigo-600 ring-1 ring-indigo-600" : "border-gray-200"
                                    }`}
                                >
                                  <img
                                    src={getImageSrc(img.MediaLocation)}
                                    alt="thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Info */}
                        <div className="w-2/3 space-y-3">
                          <div>
                            {title && (
                              <h4 className="font-bold text-gray-800 leading-snug">
                                {title}
                              </h4>
                            )}
                            {code && (
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                SKU: <span className="font-semibold text-gray-600">{code}</span>
                              </p>
                            )}
                          </div>

                          {slug && (
                            <a
                              href={`${process.env.NEXT_PUBLIC_FRONT_END_URL || ""}product/${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                            >
                              View on Storefront →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Inquiry details not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderInquiryDrawer;
