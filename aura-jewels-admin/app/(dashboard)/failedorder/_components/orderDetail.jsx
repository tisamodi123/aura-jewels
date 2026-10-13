"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/custom-style.css";
import { toast } from "sonner";
import { HiOutlinePaperClip } from "react-icons/hi";
import copy from "copy-to-clipboard";
import Link from "next/link";
import { Download, FileText, Upload } from "lucide-react";
import { PREFIX, JEWELLERY_IMAGE_PATH, API_URL, API_BASE_URL } from "@/lib/APIUrl";
import { M } from "@/lib/messages";
import { callApi } from "@/lib/callApi";
import { formatDate } from "@/lib/utils";
import { getToken } from "@/lib/auth";

export default function OrderDetailsPage({ detailData }) {

  const router = useRouter();
  const [openItems, setOpenItems] = useState({});
  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Generate a Razorpay payment link for an unpaid order and copy it to the
  // clipboard for the admin to share with the customer.
  const [payLinkLoading, setPayLinkLoading] = useState(false);
  const [payLinkUrl, setPayLinkUrl] = useState("");
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceUploading, setInvoiceUploading] = useState(false);

  const isShippedStatus = (() => {
    const s = String(detailData?.[0]?.status || "").toLowerCase();
    if (["shipped", "delivered", "qa done", "ready to ship", "out for delivery", "completed"].includes(s)) {
      return true;
    }
    const items = detailData?.[0]?.orderDetail || [];
    return items.some((item) => {
      const jStatus = String(item?.JeweleryDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption || "").toLowerCase();
      const dStatus = String(item?.diamondDetail?.[0]?.diamond_current_status?.[0]?.adminstatuscaption || "").toLowerCase();
      return jStatus === "shipped" || dStatus === "shipped" || jStatus === "delivered" || dStatus === "delivered";
    });
  })();

  const handleUploadInvoice = async (e) => {
    if (e) e.preventDefault();
    if (!invoiceFile) {
      toast.error("Please select an Image or PDF file to upload.");
      return;
    }
    const orderId = detailData?.[0]?._id;
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    setInvoiceUploading(true);
    try {
      const formData = new FormData();
      formData.append("invoice", invoiceFile);

      const token = getToken();
      const endpoint = API_URL.ORDER_INVOICE ? API_URL.ORDER_INVOICE(orderId) : `${API_BASE_URL}order/${orderId}/invoice`;
      const response = await callApi(endpoint, "POST", formData, token);

      if (response?.errorCode === 200 || response?.status === 200 || response?.success || response?.message?.toLowerCase()?.includes("success")) {
        toast.success(response?.message || "Invoice uploaded successfully!");
        setInvoiceFile(null);
        router.refresh();
      } else {
        toast.error(response?.message || "Failed to upload invoice.");
      }
    } catch (err) {
      console.error("Invoice Upload Error:", err);
      toast.error(err?.message || "An error occurred while uploading invoice.");
    } finally {
      setInvoiceUploading(false);
    }
  };

  // Re-check a stuck order against Razorpay (money debited but order not completed).
  const handleReconcilePayment = async () => {
    const orderId = detailData?.[0]?._id;
    if (!orderId) return;
    setReconcileLoading(true);
    try {
      const res = await callApi(API_URL.ORDER_RECONCILE_PAYMENT(orderId), "POST", {}, getToken());
      if (res?.errorCode === 200 || res?.errorCode === "200") {
        const status = res?.data?.status;
        if (status === "finalized" || status === "already_paid") toast.success(res?.message || "Payment confirmed");
        else toast.success(res?.message || "Reconciliation complete");
        router.refresh(); // re-pull the order so the new status shows
      } else {
        toast.error(res?.message || "Could not reconcile payment");
      }
    } catch (e) {
      toast.error("Could not reconcile payment");
    } finally {
      setReconcileLoading(false);
    }
  };

  const handleRequestPaymentLink = async () => {
    const orderId = detailData?.[0]?._id;
    if (!orderId) return;
    setPayLinkLoading(true);
    try {
      const res = await callApi(API_URL.ORDER_PAYMENT_LINK(orderId), "POST", {}, getToken());
      const url = res?.data?.url;
      if ((res?.errorCode === 200 || res?.errorCode === "200") && url) {
        setPayLinkUrl(url);
        copy(url);
        toast.success("Payment link created & copied to clipboard");
      } else {
        toast.error(res?.message || "Could not create payment link");
      }
    } catch (e) {
      toast.error("Could not create payment link");
    } finally {
      setPayLinkLoading(false);
    }
  };

  // Helper to ensure image src is valid for Next.js
  const getImageSrc = (img) => {
    if (!img) return `${PREFIX || ''}/noImage2.jpg`;
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return `${JEWELLERY_IMAGE_PATH || ''}${img}`;
  };

  let address =
    detailData?.[0]?.shippingAddress?.address +
    ", " +
    detailData?.[0]?.shippingAddress?.zipCode +
    ", " +
    detailData?.[0]?.shippingAddress?.city +
    ", " +
    detailData?.[0]?.shippingAddress?.state +
    ", " +
    detailData?.[0]?.shippingAddress?.country;

  let billingAddress =
    detailData?.[0]?.billingAddress?.address +
    ", " +
    detailData?.[0]?.billingAddress?.zipCode +
    ", " +
    detailData?.[0]?.billingAddress?.city +
    ", " +
    detailData?.[0]?.billingAddress?.state +
    ", " +
    detailData?.[0]?.billingAddress?.country;

  const currencySign = detailData?.[0]?.currencysign;

  const gstNo = detailData?.[0]?.gstNo || detailData?.[0]?.shippingAddress?.gstNo || detailData?.[0]?.billingAddress?.gstNo || '';
  const companyName = detailData?.[0]?.companyName || detailData?.[0]?.shippingAddress?.companyName || detailData?.[0]?.billingAddress?.companyName || '';
  const isGst = detailData?.[0]?.isGst || !!gstNo || !!companyName;

  const handleCopy = (text) => {
    const success = copy(text);
    if (success) {
      toast.success(M.common.success);
    } else {
      toast.error(M.common.somethingWentWrong);
    }
  };

  const invoiceUrl = detailData?.[0]?.invoicepath;
  const rawPaymentStatus = detailData?.[0]?.paymentStatus || detailData?.[0]?.payment_status?.[0]?.adminstatuscaption || "pending";

  const getPaymentStatusDisplay = (statusStr) => {
    if (!statusStr) return "Pending";
    const s = String(statusStr).toLowerCase();
    if (s === "paid" || s === "success") return "Paid";
    if (s === "failed") return "Failed";
    if (s === "refund pending") return "Refund Pending";
    if (s === "refund processing") return "Refund Processing";
    if (s === "refund success" || s === "refunded") return "Refund Success";
    return statusStr;
  };

  const getPaymentStatusBadgeStyle = (statusStr) => {
    const s = String(statusStr || "").toLowerCase();
    if (s === "paid" || s === "success" || s === "refund success" || s === "refunded") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "refund processing") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s === "refund pending") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (s === "failed") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getPaymentStatusTextColor = (statusStr) => {
    const s = String(statusStr || "").toLowerCase();
    if (s === "paid" || s === "success" || s === "refund success" || s === "refunded") {
      return "text-emerald-600";
    }
    if (s === "refund processing") {
      return "text-blue-600";
    }
    if (s === "refund pending") {
      return "text-purple-600";
    }
    if (s === "failed") {
      return "text-rose-600";
    }
    return "text-amber-600";
  };

  const currentPayStatus = String(rawPaymentStatus).toLowerCase();
  const isUnpaid = currentPayStatus === "pending" || currentPayStatus === "failed";

  const paymentSuccess = detailData?.[0]?.payment_status?.[0]?.adminstatuscaption;
  let paymentText = getPaymentStatusDisplay(rawPaymentStatus);


  const trackingCode = detailData?.[0]?.orderDetail?.[0]?.JeweleryDetail?.[0]?.trackingcode ? detailData?.[0]?.orderDetail?.[0]?.JeweleryDetail?.[0]?.trackingcode : detailData?.[0]?.orderDetail?.[0]?.diamondDetail?.[0]?.trackingcode;
  const trackingURL = detailData?.[0]?.orderDetail?.[0]?.JeweleryDetail?.[0]?.trackingurl ? detailData?.[0]?.orderDetail?.[0]?.diamondDetail?.[0]?.trackingurl : detailData?.[0]?.orderDetail?.[0]?.JeweleryDetail?.[0]?.trackingurl;
  const isShippedStutas = detailData?.[0]?.orderDetail?.[0]?.JeweleryDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption === "Shipped" ? detailData?.[0]?.orderDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption : detailData?.[0]?.orderDetail?.[0]?.diamondDetail?.[0]?.diamond_current_status?.[0]?.adminstatuscaption;

  return (
    <div>
      <div>
        <div className="w-[100%] mx-auto">
          {/* Order Details Top Header */}
          <div
            className="flex items-center mb-6 justify-between"
            title="create-top-header"
          >
            <div className="flex items-center gap-3">
              <span className="cursor-pointer" onClick={() => router.back()}>
                <Image
                  src={`${PREFIX || ''}/leftArrows.svg`}
                  height={20}
                  width={20}
                  alt="backArrow"
                />
              </span>
              <div>
                <span className="font-semibold text-lg text-zinc-800">Order Details</span>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-zinc-500">
                  {detailData?.[0]?.orderNumber && (
                    <span className="font-mono font-semibold text-zinc-700">#{detailData[0].orderNumber}</span>
                  )}
                  {detailData?.[0]?.createdAt && (
                    <span>
                      {formatDate(detailData[0].createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(() => {
                const invUrl = detailData?.[0]?.invoiceUrl || (detailData?.[0]?.invoicepath && detailData?.[0]?.invoicepath !== '#' ? detailData?.[0]?.invoicepath : '');
                const rUrl = detailData?.[0]?.receiptUrl;
                const dUrl = detailData?.[0]?.detailReceiptUrl && detailData?.[0]?.detailReceiptUrl !== '#' ? detailData?.[0]?.detailReceiptUrl : '';
                return (
                  <>
                    {invUrl && (
                      <a
                        href={invUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm"
                        title="Download Uploaded Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Invoice
                      </a>
                    )}
                    {rUrl && (
                      <a
                        href={rUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Order Detail Receipt
                      </a>
                    )}
                    {dUrl && (
                      <a
                        href={dUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
                        title="Download Detailed Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Order Item Receipt
                      </a>
                    )}
                  </>
                );
              })()}
              {detailData?.[0]?.status && (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 capitalize">
                  {detailData[0].status}
                </span>
              )}
            </div>
          </div>

          {/* Top Upload Invoice Bar */}
          <div className="mb-6 bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isShippedStatus ? 'bg-blue-50 text-blue-600' : 'bg-zinc-100 text-zinc-400'}`}>
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-zinc-800">Upload Order Invoice</h4>
                    {isShippedStatus ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                        Shipped
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                        Pending Ship
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isShippedStatus
                      ? "Order is shipped. Select an Image or PDF file to upload invoice."
                      : "Invoice upload option is enabled after order status is Shipped."}
                  </p>
                </div>
              </div>

              {isShippedStatus && (
                <form onSubmit={handleUploadInvoice} className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setInvoiceFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-zinc-700 max-w-[240px] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-zinc-200 rounded-lg p-1 bg-zinc-50/50"
                  />
                  <button
                    type="submit"
                    disabled={!invoiceFile || invoiceUploading}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {invoiceUploading ? "Uploading..." : "Upload Invoice"}
                  </button>
                </form>
              )}
            </div>
            {invoiceFile && isShippedStatus && (
              <div className="mt-2 text-[11px] text-zinc-500 pl-1">
                Selected File: <strong className="text-zinc-700">{invoiceFile.name}</strong> ({Math.round(invoiceFile.size / 1024)} KB)
              </div>
            )}
            {(() => {
              const uploadedInvoiceUrl = detailData?.[0]?.invoiceUrl || (detailData?.[0]?.invoicepath && detailData?.[0]?.invoicepath !== '#' ? detailData?.[0]?.invoicepath : '');
              if (!uploadedInvoiceUrl) return null;
              return (
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 flex-wrap bg-purple-50/60 p-3 rounded-lg border border-purple-100">
                  <span className="text-xs text-purple-950 font-medium flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Uploaded Invoice Available:
                  </span>
                  <a
                    href={uploadedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
                    title="Download Uploaded Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Invoice
                  </a>
                </div>
              );
            })()}
          </div>

          {/*Delivery Method Section */}
          <div title="delivery-section">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-zinc-100">
              <div className="mb-6 border border-zinc-100 p-6 rounded-xl bg-white">
                <h3 className="text-[0.95rem] font-bold text-zinc-800 mb-4 border-b border-zinc-50 pb-2">Order Items</h3>
                {/* Order Summary Map */}
                {detailData?.[0]?.orderDetail?.map((item) => {
                  const hasJewel = item.JeweleryDetail?.length > 0;
                  const hasDiamond = item.diamondDetail?.length > 0;
                  const jewel = hasJewel ? item.JeweleryDetail[0] : null;
                  const diamond = hasDiamond ? item.diamondDetail[0] : null;

                  const totalCarat = hasDiamond ? item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseFloat(dia?.carat) || 0),
                    0
                  ) : 0;

                  const totalWeight = hasDiamond ? item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseFloat(dia?.weight) || 0),
                    0
                  ) : 0;

                  const totalDiamondPrice = hasDiamond ? item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseFloat(dia?.finalamount) || 0),
                    0
                  ) : 0;

                  const totalPieces = hasDiamond ? item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseInt(dia?.pieces) || 0),
                    0
                  ) : 0;

                  const imageSrc = hasJewel
                    ? getImageSrc(jewel.images?.[0]?.MediaLocation || jewel.image)
                    : (hasDiamond ? getImageSrc(diamond.image) : getImageSrc(null));

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col border border-zinc-100 rounded-xl p-5 mb-4 bg-zinc-50/30 hover:bg-zinc-50 transition-colors duration-200 gap-4"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative h-20 w-20 flex-shrink-0 bg-white border border-zinc-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <Image
                              src={imageSrc}
                              alt="product image"
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-[0.9rem] font-bold text-zinc-900 leading-tight">
                              {hasJewel ? jewel.productTitle : `${diamond.carat} Carat ${diamond.shape} Diamond`}
                            </h4>

                            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[0.75rem] text-zinc-500 font-medium">
                              {hasJewel && (
                                <>
                                  <span>Metal: <strong className="text-zinc-700">{jewel.metaltype} ({jewel.metalstamp})</strong></span>
                                  {jewel.size && jewel.size !== "N/A" && (
                                    <span>• Size: <strong className="text-zinc-700">{jewel.size}</strong></span>
                                  )}
                                  {jewel.metalWeight && jewel.metalWeight !== "N/A" && (
                                    <span>• Metal Wgt: <strong className="text-zinc-700">{jewel.metalWeight?.toFixed(3)}g</strong></span>
                                  )}
                                  {jewel.category && (
                                    <span>• Category: <strong className="text-zinc-700">{jewel.category}</strong></span>
                                  )}
                                  {jewel.selectedOrigin && jewel.selectedOrigin !== "N/A" && (
                                    <span>• Origin: <strong className="text-zinc-700">{jewel.selectedOrigin}</strong></span>
                                  )}
                                  {jewel.selectedColor && jewel.selectedColor !== "N/A" && (
                                    <span>• Color: <strong className="text-zinc-700">{jewel.selectedColor}</strong></span>
                                  )}
                                  {jewel.selectedClarity && jewel.selectedClarity !== "N/A" && (
                                    <span>• Clarity: <strong className="text-zinc-700">{jewel.selectedClarity}</strong></span>
                                  )}
                                  {jewel.engravingText && jewel.engravingText !== "N/A" && (
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">• Engraving: "{jewel.engravingText}"</span>
                                  )}
                                </>
                              )}
                            </div>

                            <p className="text-[0.75rem] text-zinc-400">
                              SKU: <span className="font-mono text-zinc-600 font-semibold">{hasJewel ? jewel.itemCode : diamond.stockId}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 text-[0.85rem]">
                          <div className="text-left md:text-right">
                            <span className="text-zinc-400 text-[0.75rem] block">Price</span>
                            <span className="font-semibold text-zinc-900">
                              {currencySign}{Number(item?.price).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-zinc-400 text-[0.75rem] block">Qty</span>
                            <span className="font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded text-[0.75rem]">
                              {item?.qty || 1}
                            </span>
                          </div>

                          <div className="text-right min-w-[90px]">
                            <span className="text-zinc-400 text-[0.75rem] block">Total</span>
                            <span className="font-bold text-zinc-900 text-[0.95rem]">
                              {currencySign}{(Number(item?.price) * (item?.qty || 1)).toLocaleString()}
                            </span>
                          </div>

                          {(item?.refundDetails?.refundRemarks || item?.refundDetails?.cancellationReason || (jewel?.reason && jewel.reason !== "N/A")) && (
                            <div className="text-right min-w-[100px]">
                              <span className="text-zinc-400 text-[0.75rem] block">Reason</span>
                              <span className="font-semibold text-zinc-700 text-[0.80rem]">
                                {item?.refundDetails?.refundRemarks || item?.refundDetails?.cancellationReason || jewel?.reason}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {hasDiamond && (
                        <div className="mt-2 w-full ">
                          <div
                            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-wider mb-2 cursor-pointer select-none w-fit"
                            onClick={() => toggleItem(item._id)}
                          >
                            <svg
                              className={`h-3 w-3 text-zinc-500 transition-transform duration-200 ${openItems[item._id] ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                            <span>DIAMOND DETAILS</span>
                          </div>
                          {openItems[item._id] && (
                            <div className="overflow-hidden border border-zinc-200/80 rounded-lg bg-white shadow-sm transition-all duration-200">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                                    <th className="py-2.5 px-3.5 font-semibold">Stone Type</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Shape</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Color</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Clarity</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Carat</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Weight</th>
                                    <th className="py-2.5 px-3.5 font-semibold">Pcs</th>
                                    <th className="py-2.5 px-3.5 font-semibold text-right">Price</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                  {item.diamondDetail.map((dia, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                      <td className="py-2 px-3.5 text-zinc-800 font-medium">
                                        {dia?.type ? (
                                          String(dia.type).toLowerCase().includes("center")
                                            ? dia.type
                                            : String(dia.type).charAt(0).toUpperCase() + String(dia.type).slice(1).toLowerCase()
                                        ) : "-"}
                                      </td>
                                      <td className="py-2 px-3.5 text-zinc-650">{dia?.shape || "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-650">{dia?.color || "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-650">{dia?.clarity || "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-800 font-semibold">{dia?.carat || "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-650">{dia?.weight || "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-650">{dia?.pieces !== undefined && dia?.pieces !== null ? dia.pieces : "-"}</td>
                                      <td className="py-2 px-3.5 text-zinc-950 font-bold text-right">
                                        {dia?.finalamount ? `${currencySign}${Number(dia.finalamount).toLocaleString()}` : "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="border-t border-zinc-200 bg-zinc-50/50">
                                  <tr className="font-semibold text-zinc-800">
                                    <td colSpan={4} className="py-2.5 px-3.5 text-right text-zinc-500 font-bold uppercase tracking-wider">Total:</td>
                                    <td className="py-2.5 px-3.5 font-extrabold text-blue-600">{Number(totalCarat.toFixed(3))}</td>
                                    <td className="py-2.5 px-3.5 font-bold text-zinc-700">{Number(totalWeight.toFixed(3))}</td>
                                    <td className="py-2.5 px-3.5 font-bold text-zinc-700">{totalPieces}</td>
                                    <td className="py-2.5 px-3.5 font-extrabold text-zinc-950 text-right">
                                      {totalDiamondPrice ? `${currencySign}${Number(totalDiamondPrice).toLocaleString()}` : "-"}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Amount total section */}
              <div className="mb-8 border border-zinc-100 p-6 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                  <span className="text-sm font-bold text-zinc-700">Payment Summary</span>
                  <div className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${getPaymentStatusBadgeStyle(rawPaymentStatus)}`}>
                    {getPaymentStatusDisplay(rawPaymentStatus)}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">
                      {currencySign}{Math.round(Number(detailData?.[0]?.grossamount || 0)).toLocaleString()}
                    </span>
                  </div>
                  {Number(detailData?.[0]?.discamount) > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Discount{detailData?.[0]?.couponCode ? ` (${detailData[0].couponCode})` : ''}</span>
                      <span className="font-semibold text-red-600">
                        - {currencySign}{Math.round(Number(detailData?.[0]?.discamount || 0)).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-zinc-900">
                      {currencySign}{Math.round(Number(detailData?.[0]?.shippingcharge || 0)).toLocaleString()}
                    </span>
                  </div>
                  {Number(detailData?.[0]?.taxAmount) > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>GST{detailData?.[0]?.taxRate ? ` (${detailData[0].taxRate * 100}%)` : ''}</span>
                      <span className="font-semibold text-zinc-900">
                        {currencySign}{Math.round(Number(detailData?.[0]?.taxAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {Number(detailData?.[0]?.walletAmount) > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Breakdown</div>
                      <div className="flex justify-between text-zinc-600">
                        <span>Paid by Wallet</span>
                        <span className="font-semibold text-emerald-700">
                          {currencySign}{Math.round(Number(detailData?.[0]?.walletAmount || 0)).toLocaleString()}
                        </span>
                      </div>
                      {(() => {
                        const totalNet = Number(detailData?.[0]?.netamount || 0);
                        const walletAmt = Number(detailData?.[0]?.walletAmount || 0);
                        const gatewayPaid = detailData?.[0]?.paymentInfo?.paidAmount !== undefined
                          ? Number(detailData?.[0]?.paymentInfo?.paidAmount)
                          : Math.max(0, totalNet - walletAmt);
                        if (gatewayPaid > 0) {
                          const providerName = detailData?.[0]?.paymentInfo?.provider || detailData?.[0]?.payment_type || 'Gateway';
                          return (
                            <div className="flex justify-between text-zinc-600">
                              <span>Paid via Online ({providerName})</span>
                              <span className="font-semibold text-blue-700">
                                {currencySign}{Math.round(gatewayPaid).toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                    <span className="font-bold text-zinc-800">Total</span>
                    <span className="font-bold text-lg text-zinc-900">
                      {currencySign}{detailData?.[0]?.netamount !== undefined && detailData?.[0]?.netamount !== null ? Math.round(Number(detailData?.[0]?.netamount || 0)).toLocaleString() : '0'}
                    </span>
                  </div>
                  {detailData?.[0]?.paymentStatus !== 'paid' && Number(detailData?.[0]?.remainingAmount) > 0 && (
                    <div className="flex justify-between items-center text-amber-700">
                      <span className="font-semibold">Amount Due</span>
                      <span className="font-bold">{currencySign}{Math.round(Number(detailData?.[0]?.remainingAmount || 0)).toLocaleString()}</span>
                    </div>
                  )}
                  {Number(detailData?.[0]?.refundDetails?.amount) > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="font-semibold">
                        Refunded{detailData?.[0]?.refundDetails?.refundType && detailData[0].refundDetails.refundType !== 'none' ? ` (${detailData[0].refundDetails.refundType})` : ''}
                      </span>
                      <span className="font-bold">{currencySign}{Math.round(Number(detailData?.[0]?.refundDetails?.amount || 0)).toLocaleString()}</span>
                    </div>
                  )}

                  {(() => {
                    const rUrl = detailData?.[0]?.receiptUrl || (detailData?.[0]?.invoicepath && detailData?.[0]?.invoicepath !== '#' ? detailData?.[0]?.invoicepath : '');
                    const dUrl = detailData?.[0]?.detailReceiptUrl && detailData?.[0]?.detailReceiptUrl !== '#' ? detailData?.[0]?.detailReceiptUrl : '';
                    if (!rUrl && !dUrl) return null;
                    return (
                      <div className="pt-3 mt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                        {rUrl && (
                          <a
                            href={rUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download order detail receipt
                          </a>
                        )}
                        {dUrl && (
                          <a
                            href={dUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Order Item Receipt
                          </a>
                        )}
                      </div>
                    );
                  })()}
                  {detailData?.[0]?.settlementReview?.needed && (
                    <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
                      ⚠ Settlement review needed{detailData?.[0]?.settlementReview?.reason ? `: ${detailData[0].settlementReview.reason}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Shipping & Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Customer Details */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Customer Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-zinc-800">
                      {detailData?.[0]?.shippingAddress?.firstName || detailData?.[0]?.user_detail?.[0]?.firstName || ''} {detailData?.[0]?.shippingAddress?.lastName || detailData?.[0]?.user_detail?.[0]?.lastName || ''}
                    </p>
                    <p className="text-sm text-zinc-600 break-all">
                      {detailData?.[0]?.shippingAddress?.emailId || detailData?.[0]?.shippingAddress?.email || detailData?.[0]?.user_detail?.[0]?.email || '-'}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {detailData?.[0]?.shippingAddress?.number || detailData?.[0]?.shippingAddress?.phone || detailData?.[0]?.user_detail?.[0]?.phone ? `+ ${detailData?.[0]?.shippingAddress?.number || detailData?.[0]?.shippingAddress?.phone || detailData?.[0]?.user_detail?.[0]?.phone}` : '-'}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Shipping Address
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-zinc-800">
                      {detailData?.[0]?.shippingAddress?.firstName} {detailData?.[0]?.shippingAddress?.lastName}
                    </p>
                    {(detailData?.[0]?.shippingAddress?.emailId || detailData?.[0]?.shippingAddress?.email) && (
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-zinc-700">Email: </span>
                        {detailData?.[0]?.shippingAddress?.emailId || detailData?.[0]?.shippingAddress?.email}
                      </p>
                    )}
                    {(detailData?.[0]?.shippingAddress?.number || detailData?.[0]?.shippingAddress?.phone) && (
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-zinc-700">Mobile: </span>
                        +{detailData?.[0]?.shippingAddress?.number || detailData?.[0]?.shippingAddress?.phone}
                      </p>
                    )}
                    <p className="text-sm text-zinc-600 leading-relaxed">{address}</p>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Billing Address
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-zinc-800">
                      {detailData?.[0]?.billingAddress?.firstName} {detailData?.[0]?.billingAddress?.lastName}
                    </p>
                    {(detailData?.[0]?.billingAddress?.emailId || detailData?.[0]?.billingAddress?.email) && (
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-zinc-700">Email: </span>
                        {detailData?.[0]?.billingAddress?.emailId || detailData?.[0]?.billingAddress?.email}
                      </p>
                    )}
                    {(detailData?.[0]?.billingAddress?.number || detailData?.[0]?.billingAddress?.phone) && (
                      <p className="text-sm text-zinc-600">
                        <span className="font-medium text-zinc-700">Mobile: </span>
                        +{detailData?.[0]?.billingAddress?.number || detailData?.[0]?.billingAddress?.phone}
                      </p>
                    )}
                    <p className="text-sm text-zinc-600 leading-relaxed">{billingAddress}</p>
                  </div>
                </div>

                {/* GST Details */}
                {isGst && (
                  <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                      GST Invoice Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      {companyName && (
                        <p className="text-sm text-zinc-600">
                          <span className="font-semibold text-zinc-700">Company Name: </span>
                          <span className="text-zinc-650">{companyName}</span>
                        </p>
                      )}
                      {gstNo && (
                        <p className="text-sm text-zinc-600">
                          <span className="font-semibold text-zinc-700">GST Number: </span>
                          <span className="text-zinc-650 uppercase">{gstNo}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Statuses & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Payment Status */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Payment Status
                  </h4>
                  <div className="space-y-2 text-sm text-zinc-600">
                    <div className="flex justify-between items-center">
                      <span>Method:</span>
                      <span className="font-semibold text-zinc-800">{detailData?.[0]?.payment_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span className={`font-semibold capitalize ${getPaymentStatusTextColor(rawPaymentStatus)}`}>
                        {getPaymentStatusDisplay(rawPaymentStatus)}
                      </span>
                    </div>
                    {detailData?.[0]?.paymentInfo?.gatewayPaymentId && (
                      <div className="flex justify-between items-center gap-2">
                        <span>Txn ID:</span>
                        <span className="font-mono text-[11px] text-zinc-800 break-all text-right">{detailData[0].paymentInfo.gatewayPaymentId}</span>
                      </div>
                    )}
                    {detailData?.[0]?.paymentInfo?.gatewayOrderId && (
                      <div className="flex justify-between items-center gap-2">
                        <span>Gateway Order:</span>
                        <span className="font-mono text-[11px] text-zinc-800 break-all text-right">{detailData[0].paymentInfo.gatewayOrderId}</span>
                      </div>
                    )}
                    {detailData?.[0]?.paymentInfo?.capturedAt && (
                      <div className="flex justify-between items-center">
                        <span>Captured:</span>
                        <span className="text-zinc-800 text-xs">
                          {new Date(detailData[0].paymentInfo.capturedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Request payment link — only for unpaid orders */}
                    {isUnpaid && (
                      <div className="pt-2 border-t border-zinc-100 mt-2">
                        {/* Re-check payment: recover a stuck order (money debited but
                            not completed) by asking Razorpay for the real status. */}
                        <button
                          type="button"
                          onClick={handleReconcilePayment}
                          disabled={reconcileLoading}
                          className="w-full text-xs font-semibold bg-white border border-[#087B5D] text-[#087B5D] hover:bg-[#087B5D]/5 py-2 rounded-md cursor-pointer disabled:opacity-60 mb-2"
                          title="Ask Razorpay whether this order was actually paid, and finalize/fail it accordingly."
                        >
                          {reconcileLoading ? "Re-checking payment..." : "Re-check Payment Status"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestPaymentLink}
                          disabled={payLinkLoading}
                          className="w-full text-xs font-semibold bg-[#087B5D] hover:bg-[#29AB87] text-white py-2 rounded-md cursor-pointer disabled:opacity-60"
                        >
                          {payLinkLoading ? "Creating link..." : "Request Payment (Razorpay Link)"}
                        </button>
                        {payLinkUrl && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <input readOnly value={payLinkUrl} className="flex-1 text-[11px] bg-zinc-100 px-2 py-1 rounded truncate" />
                            <button type="button" className="text-zinc-500 hover:text-zinc-700" onClick={() => { copy(payLinkUrl); toast.success("Copied"); }}>
                              <HiOutlinePaperClip className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Status */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Shipping Status
                  </h4>
                  {(detailData?.[0]?.trackingNumber || detailData?.[0]?.trackingUrl || detailData?.[0]?.shippingCarrier) ? (
                    <div className="space-y-3 text-sm">
                      {detailData?.[0]?.shippingCarrier && (
                        <div className="flex justify-between items-center text-zinc-600">
                          <span>Carrier:</span>
                          <span className="font-semibold text-zinc-800">{detailData[0].shippingCarrier}</span>
                        </div>
                      )}
                      {detailData?.[0]?.trackingNumber && (
                        <div className="flex justify-between items-center text-zinc-600">
                          <span>Tracking Number:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded text-xs">{detailData[0].trackingNumber}</span>
                            <button
                              type="button"
                              className="text-zinc-500 hover:text-zinc-700 transition-colors"
                              onClick={() => handleCopy(`${detailData[0].trackingNumber}`)}
                            >
                              <HiOutlinePaperClip className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      {detailData?.[0]?.estimatedDeliveryDate && (
                        <div className="flex justify-between items-center text-zinc-600">
                          <span>Est. Delivery:</span>
                          <span className="text-zinc-800">
                            {new Date(detailData[0].estimatedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      {detailData?.[0]?.trackingUrl && (
                        <div className="flex justify-between items-center text-zinc-600">
                          <span>Track Order:</span>
                          <Link target="_blank" href={`${detailData[0].trackingUrl}`} className="text-blue-600 hover:underline font-medium">
                            Open Tracking Link
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Not Shipped Yet</p>
                  )}
                </div>

                {/* Note */}
                <div className="border border-zinc-100 p-6 rounded-2xl bg-zinc-50/20 hover:shadow-sm transition-all duration-200">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    Notes
                  </h4>
                  <p className="text-sm text-zinc-600 leading-relaxed break-words">
                    {detailData?.[0]?.orderComment || 'No comments or notes provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
