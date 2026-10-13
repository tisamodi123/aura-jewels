"use client";

import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { ASSET_URL, API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import copy from "copy-to-clipboard";

const Field = ({ label, value }) =>
  value || value === 0 ? (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-800 break-words">{value}</span>
    </div>
  ) : null;

const SectionTitle = ({ children }) => (
  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
    {children}
  </h3>
);

const Divider = () => <hr className="border-gray-100" />;

const CustomOrderDrawer = ({ order, onClose }) => {

  // lock scroll when drawer opens
  useEffect(() => {
    document.body.style.overflow = order ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [order]);

  // Bespoke quote + Razorpay payment link (advance payment).
  const [quoteAmount, setQuoteAmount] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  useEffect(() => {
    setQuoteAmount(order?.quotedPrice ? String(order.quotedPrice) : "");
    setLinkUrl(order?.paymentLink?.url || "");
  }, [order]);
  const handleCustomPaymentLink = async () => {
    if (!order?._id) return;
    const amt = Number(quoteAmount);
    if (!amt || amt <= 0) { toast.error("Enter a quote amount first"); return; }
    setLinkLoading(true);
    try {
      const res = await callApi(API_URL.CUSTOM_PAYMENT_LINK(order._id), "POST", { amount: amt }, getToken());
      const url = res?.data?.url;
      if ((res?.errorCode === 200 || res?.errorCode === "200") && url) {
        setLinkUrl(url);
        copy(url);
        toast.success("Payment link created & copied");
      } else {
        toast.error(res?.message || "Could not create payment link");
      }
    } catch (e) {
      toast.error("Could not create payment link");
    } finally {
      setLinkLoading(false);
    }
  };

  if (!order) return null;

  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    countryCode,
    otherProduct,
    approxMetalWeight,
    braceletSize,
    stoneType,
    approxStoneWeight,
    gemstonePreference,
    budget,
    engraving,
    remarks,
    urls = [],
    attachments = [],
  } = order;

  const mobile = mobileNumber
    ? `${countryCode ?? ""} ${mobileNumber}`.trim()
    : "—";

  const budgetText = budget
    ? `₹ ${Number(budget).toLocaleString("en-IN")}`
    : "";

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <style>{`
        @keyframes coFadeIn   { from { opacity: 0; }             to { opacity: 1; } }
        @keyframes coSlideIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: "coFadeIn 0.2s ease-out" }}
        onClick={onClose}
      />

      <div
        className="relative h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
        style={{ animation: "coSlideIn 0.28s cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Custom Order Details</h2>
            <p className="text-xs text-gray-500">
              {firstName} {lastName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100%-72px)] overflow-y-auto space-y-5 p-6">
          <div>
            <SectionTitle>Customer Info</SectionTitle>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={firstName} />
              <Field label="Last Name" value={lastName} />
              <Field
                label="Email"
                value={
                  email ? (
                    <a
                      href={`mailto:${email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {email}
                    </a>
                  ) : null
                }
              />
              <Field
                label="Mobile"
                value={
                  mobileNumber ? (
                    <a
                      href={`tel:${(countryCode || "")}${mobileNumber}`.replace(/\s+/g, "")}
                      className="text-blue-600 hover:underline"
                    >
                      {mobile}
                    </a>
                  ) : null
                }
              />
            </div>
          </div>
          <Divider />
          <div>
            <SectionTitle>Jewellery Preferences</SectionTitle>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Category"
                value={order.categoryId?.categoryName ?? "—"}
              />

              <Field label="Other Product" value={otherProduct} />

              <Field
                label="Metal"
                value={
                  order.metalId
                    ? `${order.metalId.name}${order.metalId.stamp
                      ? ` (${order.metalId.stamp})`
                      : ""
                    }`
                    : "—"
                }
              />

              <Field
                label="Approx Metal Weight"
                value={
                  approxMetalWeight ? `${approxMetalWeight} g` : ""
                }
              />

              <Field
                label="Ring Size"
                value={order.ringSizeId?.name}
              />

              <Field label="Bracelet Size" value={braceletSize} />
              <Field label="Stone Type" value={stoneType} />

              <Field
                label="Approx Stone Weight"
                value={
                  approxStoneWeight ? `${approxStoneWeight} ct` : ""
                }
              />

              <Field
                label="Gemstone Preference"
                value={gemstonePreference}
              />

              <Field label="Budget" value={budgetText} />
              <Field label="Engraving" value={engraving} />
              <Field label="Remarks" value={remarks} />
            </div>
          </div>

          {urls.length > 0 && (
            <>
              <Divider />

              <div>
                <SectionTitle>Reference URLs</SectionTitle>

                <div className="space-y-1">
                  {urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-xs text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {attachments.length > 0 && (
            <>
              <Divider />
              <div>
                <SectionTitle>Attachments</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => {
                    const isImage =
                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);
                    const isPdf = /\.pdf$/i.test(file);

                    if (isImage) {
                      return (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={file}
                            alt={`Attachment ${index + 1}`}
                            className="h-20 w-20 rounded-md border object-cover"
                          />
                        </a>
                      );
                    }

                    if (isPdf) {
                      return (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50/60 p-2 text-center transition-colors hover:bg-red-100/80"
                          title="Open PDF"
                        >
                          <FileText className="h-7 w-7 text-red-600" />
                          <span className="w-full truncate text-[10px] font-bold uppercase text-red-600">
                            PDF
                          </span>
                        </a>
                      );
                    }

                    return (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600"
                      >
                        {file}
                      </a>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Quote + Razorpay payment link (advance payment) */}
          <Divider />
          <div>
            <SectionTitle>Payment</SectionTitle>
            <div className="flex items-center gap-2 text-xs mb-3">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold capitalize ${order.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>
                {order.paymentStatus || "pending"}
              </span>
            </div>
            {order.paymentStatus !== "paid" && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">Quote Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  placeholder="Enter quoted price"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#087B5D]"
                />
                <button
                  type="button"
                  onClick={handleCustomPaymentLink}
                  disabled={linkLoading}
                  className="w-full rounded-md bg-[#087B5D] py-2 text-xs font-semibold text-white hover:bg-[#29AB87] disabled:opacity-60"
                >
                  {linkLoading ? "Creating link..." : "Request Payment (Razorpay Link)"}
                </button>
              </div>
            )}
            {linkUrl && (
              <div className="mt-2 flex items-center gap-1.5">
                <input readOnly value={linkUrl} className="flex-1 truncate rounded bg-gray-100 px-2 py-1 text-[11px]" />
                <button type="button" className="text-xs font-semibold text-[#087B5D]" onClick={() => { copy(linkUrl); toast.success("Copied"); }}>Copy</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderDrawer;