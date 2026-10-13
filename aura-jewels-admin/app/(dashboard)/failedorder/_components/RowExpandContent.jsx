import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaAngleDown } from "react-icons/fa6";
import OrderModals from "./Modals";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { toast } from "sonner";
import { FaEye } from "react-icons/fa";
import { FileText, Gem, Sparkles, User, Mail, Phone, Calendar, CreditCard, ShieldCheck, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

const LOCKED_STATUSES = ["Rejected", "Returned Rejected", "Refunded", "Failed"];

export default function RowExpandContent({
  detailLoading,
  orderCaptionData,
  GetOrderDetails,
  rowData,
  refreshOrderList,
}) {
  const [state, setState] = useState("order");
  const [statusDialog, setStatusDialog] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [currentBankData, setCurrentBankData] = useState(null);

  const jewelleryDetails = [];
  const diamondDetails = [];

  const handleShowBankDetails = (item) => {
    const isDiamond = Boolean(
      item?.diamondDetail?.[0]?.AccountName &&
      item?.diamondDetail?.[0]?.BankName &&
      item?.diamondDetail?.[0]?.IFSC_CODE
    );
    if (isDiamond) {
      setCurrentBankData({
        accountHolderName: item?.diamondDetail?.[0]?.AccountName,
        bankName: item?.diamondDetail?.[0]?.BankName,
        accountNumber: item?.diamondDetail?.[0]?.AccountNumber,
        ifscCode: item?.diamondDetail?.[0]?.IFSC_CODE,
      })
    } else {
      setCurrentBankData({
        accountHolderName: item?.JeweleryDetail?.[0]?.AccountName,
        bankName: item?.JeweleryDetail?.[0]?.BankName,
        accountNumber: item?.JeweleryDetail?.[0]?.AccountNumber,
        ifscCode: item?.JeweleryDetail?.[0]?.IFSC_CODE,
      });
    }
    setShowBankDetails(true);
  };

  const hasBankDetailsInList = (list, type = 'jewellery') => {
    return list.some(item => {
      if (type === 'diamond') {
        return Boolean(
          item?.diamondDetail?.[0]?.AccountName &&
          item?.diamondDetail?.[0]?.AccountNumber &&
          item?.diamondDetail?.[0]?.BankName &&
          item?.diamondDetail?.[0]?.IFSC_CODE
        );
      }
      return Boolean(
        item?.JeweleryDetail?.[0]?.AccountName &&
        item?.JeweleryDetail?.[0]?.AccountNumber &&
        item?.JeweleryDetail?.[0]?.BankName &&
        item?.JeweleryDetail?.[0]?.IFSC_CODE
      );
    });
  };

  rowData?.[0]?.orderDetail.forEach((item) => {
    const hasJewellery =
      Array.isArray(item.JeweleryDetail) && item.JeweleryDetail.length > 0;
    const hasDiamond =
      Array.isArray(item.diamondDetail) && item.diamondDetail.length > 0;

    if (hasJewellery) {
      jewelleryDetails.push(item);
    } else if (hasDiamond) {
      diamondDetails.push(item);
    }
  });

  const topLabels = [
    { lable: "Order Details", value: "order", isShow: true, icon: FileText },
    {
      lable: "Jewellery Details",
      value: "jewellery",
      isShow: jewelleryDetails.length > 0,
      icon: Gem,
    },
    {
      lable: "Diamond Details",
      value: "diamond",
      isShow: diamondDetails.length > 0,
      icon: Sparkles,
    },
  ];

  const modifiedOrderCaption = orderCaptionData?.map((item) => ({
    ...item,
    parentid: JSON.parse(item.parentid),
  }));

  const token = getToken();

  const handleStatusChange = async (value, data) => {
    setStatusDialog(value);
    setSelectedRow(data);
  };

  const showViewInJewellery = hasBankDetailsInList(jewelleryDetails, 'jewellery');
  const showViewInDiamond = hasBankDetailsInList(diamondDetails, 'diamond');

  if (detailLoading) {
    return (
      <div className="py-2 animate-pulse space-y-6">
        {/* Tabs skeleton */}
        <div className="flex border-b border-zinc-200 gap-1 pb-px">
          {topLabels?.map((item, index) => (
            item.isShow && (
              <div
                key={index}
                className={`flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 ${item.value === state ? "border-blue-600" : "border-transparent"
                  }`}
              >
                <div className="h-4 w-4 bg-zinc-200 rounded-full" />
                <div className="h-4 w-24 bg-zinc-200 rounded" />
              </div>
            )
          ))}
        </div>

        {/* Content skeleton */}
        {state === "order" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-zinc-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-zinc-200 rounded-lg" />
                <div className="h-5 w-40 bg-zinc-200 rounded" />
              </div>
              <div className="h-px bg-zinc-100" />
              <div className="space-y-3 pt-2">
                <div className="h-4 w-1/3 bg-zinc-200 rounded" />
                <div className="h-4 w-2/3 bg-zinc-100 rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 rounded" />
                <div className="h-4 w-3/4 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="border border-zinc-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-zinc-200 rounded-lg" />
                <div className="h-5 w-40 bg-zinc-200 rounded" />
              </div>
              <div className="h-px bg-zinc-100" />
              <div className="space-y-3 pt-2">
                <div className="h-4 w-1/3 bg-zinc-200 rounded" />
                <div className="h-4 w-2/3 bg-zinc-100 rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 rounded" />
                <div className="h-4 w-3/4 bg-zinc-100 rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl p-5 space-y-4 bg-white shadow-sm">
            <div className="h-8 w-full bg-zinc-200 rounded" />
            <div className="h-8 w-full bg-zinc-100 rounded" />
            <div className="h-8 w-full bg-zinc-50 rounded" />
            <div className="h-8 w-full bg-zinc-100 rounded" />
            <div className="h-8 w-full bg-zinc-50 rounded" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="py-2" key={refresh}>
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 gap-1 pb-px">
          {topLabels?.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.value === state;
            return (
              item.isShow && (
                <button
                  key={index}
                  onClick={() => setState(item.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 outline-none focus:outline-none -mb-px ${isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
                    }`}
                >
                  {Icon && <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-zinc-400"}`} />}
                  <span>{item?.lable}</span>
                </button>
              )
            );
          })}
        </div>

        {/* Order Details */}
        {state == "order" && (
          <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
            {/* Left Card: Customer & Order Summary */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-zinc-800 text-sm">Customer & Order Details</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Order No.</span>
                    <span className="font-semibold text-sm text-zinc-800">{rowData?.[0]?.orderNumber || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Order Date</span>
                    <span className="font-medium text-sm text-zinc-855 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      {formatDate(rowData?.[0]?.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Customer Name</span>
                    <span className="font-medium text-sm text-zinc-800 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      {rowData?.[0]?.user_detail?.[0]?.firstName
                        ? rowData?.[0]?.user_detail?.[0]?.firstName + " " + rowData?.[0]?.user_detail?.[0]?.lastName
                        : "-"}
                    </span>
                  </div>
                  {
                    rowData?.[0]?.user_detail?.[0]?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Number</span>
                        <span className="font-medium text-sm text-zinc-800 flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          {rowData?.[0]?.user_detail?.[0]?.countryCode || ""}
                          {rowData?.[0]?.user_detail?.[0]?.phone || "-"}
                        </span>
                      </div>
                    )
                  }
                  {
                    rowData?.[0]?.user_detail?.[0]?.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</span>
                        <span className="font-medium text-sm text-zinc-800 flex items-center gap-2 break-all max-w-[60%] text-right">
                          <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate" title={rowData?.[0]?.user_detail?.[0]?.email}>{rowData?.[0]?.user_detail?.[0]?.email ?? "-"}</span>
                        </span>
                      </div>
                    )
                  }
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Number of Items</span>
                    <span className="inline-flex items-center justify-center bg-zinc-100 text-zinc-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {rowData?.[0]?.orderDetail?.length || 0}
                    </span>
                  </div>
                </div>

                {/* <div className="h-px bg-zinc-100" /> */}

                {/* <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Status</span>
                  <div className="w-[180px]">
                    <Select
                      onValueChange={(value) => {
                        setStatusDialog(value);
                        setSelectedRow({ _id: rowData?.[0]?._id, isOverallOrder: true });
                      }}
                      value={rowData?.[0]?.status || ""}
                      disabled={LOCKED_STATUSES.includes(rowData?.[0]?.status)}
                    >
                      <SelectTrigger className="w-full h-9 rounded-lg border border-zinc-200 focus:ring-1 focus:ring-blue-500 whitespace-nowrap bg-zinc-50/50 hover:bg-zinc-50 font-medium text-sm text-zinc-850">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-lg shadow-lg border border-zinc-200">
                        <SelectGroup>
                          {modifiedOrderCaption
                            ?.filter((caption) => {
                              const currentStatus = rowData?.[0]?.status || "Pending";
                              return (
                                (Array.isArray(caption.parentid) &&
                                  caption.parentid.includes(currentStatus)) ||
                                caption.status_id === currentStatus
                              );
                            })
                            ?.map((caption, captionIndex) => (
                              <SelectItem
                                className="hover:bg-zinc-50 cursor-pointer rounded-md my-0.5 mx-1"
                                key={captionIndex}
                                value={`${caption.status_id}`}
                              >
                                {caption.adminstatuscaption}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Right Card: Payment & Billing Summary */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-zinc-800 text-sm">Payment & Invoice Summary</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Payment Method</span>
                    <span className="font-semibold text-sm text-zinc-800 capitalize bg-zinc-100/60 px-2.5 py-0.5 rounded-md inline-block">
                      {rowData?.[0]?.payment_type || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Transaction Ref.</span>
                    <span className="font-mono text-xs text-zinc-550 block truncate" title={rowData?.[0]?.orderPaymentDetails?.[0]?.payment_transaction_id}>
                      {rowData?.[0]?.orderPaymentDetails?.[0]?.payment_transaction_id ?? "-"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-sm">Gross Amount</span>
                    <span className="font-semibold text-sm text-zinc-800">
                      {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.grossamount) || 0).toLocaleString()}
                    </span>
                  </div>
                  {Number(rowData?.[0]?.discamount) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">Discount{rowData?.[0]?.couponCode ? ` (${rowData[0].couponCode})` : ''}</span>
                      <span className="font-semibold text-sm text-red-600 bg-red-55 px-2 py-0.5 rounded-md">
                        - {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.discamount) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-sm">Shipping Charge</span>
                    <span className="font-semibold text-sm text-zinc-800">
                      {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.shippingcharge) || 0).toLocaleString()}
                    </span>
                  </div>
                  {Number(rowData?.[0]?.taxAmount) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-sm">GST{rowData?.[0]?.taxRate ? ` (${rowData[0].taxRate * 100}%)` : ''}</span>
                      <span className="font-semibold text-sm text-zinc-800">
                        {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.taxAmount) || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {Number(rowData?.[0]?.walletAmount) > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Payment Breakdown</div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 text-sm">Paid by Wallet</span>
                        <span className="font-semibold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.walletAmount) || 0).toLocaleString()}
                        </span>
                      </div>
                      {(() => {
                        const totalNet = Number(rowData?.[0]?.netamount || 0);
                        const walletAmt = Number(rowData?.[0]?.walletAmount || 0);
                        const gatewayPaid = rowData?.[0]?.paymentInfo?.paidAmount !== undefined 
                          ? Number(rowData?.[0]?.paymentInfo?.paidAmount) 
                          : Math.max(0, totalNet - walletAmt);
                        if (gatewayPaid > 0) {
                          const providerName = rowData?.[0]?.paymentInfo?.provider || rowData?.[0]?.payment_type || 'Gateway';
                          return (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 text-sm">Paid via Online ({providerName})</span>
                              <span className="font-semibold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                {rowData?.[0]?.currencysign}{Math.round(gatewayPaid).toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Amount Paid</span>
                      <span className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Secure Payment
                      </span>
                    </div>
                    <span className="text-xl font-extrabold text-zinc-900">
                      {rowData?.[0]?.currencysign}{Math.round(Number(rowData?.[0]?.netamount) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {(() => {
                  const invUrl = rowData?.[0]?.invoiceUrl || (rowData?.[0]?.invoicepath && rowData?.[0]?.invoicepath !== '#' ? rowData?.[0]?.invoicepath : '');
                  const rUrl = rowData?.[0]?.receiptUrl;
                  const dUrl = rowData?.[0]?.detailReceiptUrl && rowData?.[0]?.detailReceiptUrl !== '#' ? rowData?.[0]?.detailReceiptUrl : '';
                  if (!invUrl && !rUrl && !dUrl) return null;
                  return (
                    <div className="pt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                      {invUrl && (
                        <a
                          href={invUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download Invoice
                        </a>
                      )}
                      {rUrl && (
                        <a
                          href={rUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download order detail receip
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
              </div>
            </div>
          </div>
        )}

        {/* Jewellery Details */}
        {state == "jewellery" && (
          <div className="overflow-x-auto border border-zinc-200 rounded-xl mt-6 shadow-sm bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Item code</th>
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Qty</th>
                  <th className="py-3.5 px-4 font-semibold">Total Price</th>
                  <th className="py-3.5 px-4 font-semibold">Exchange Rate</th>
                  <th className="py-3.5 px-4 font-semibold">Design Code</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Ring Size</th>
                  <th className="py-3.5 px-4 font-semibold">Metal Stamp/Type</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  {showViewInJewellery && <th className="py-3.5 px-4 font-semibold">View</th>}
                  <th className="py-3.5 px-4 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                {jewelleryDetails?.map((item, index) => {
                  let statusId =
                    item.JeweleryDetail[0].jewelery_current_status[0]
                      .status_id;
                  let queryStatusId = statusId === "Received" ? "Pending" : statusId;
                  const targetStatus = modifiedOrderCaption.filter(
                    (caption) =>
                      (Array.isArray(caption.parentid) &&
                        caption.parentid.includes(queryStatusId)) ||
                      caption.status_id == statusId
                  );
                  let tempStatusData = [];
                  if (targetStatus.length > 1) {
                    tempStatusData = targetStatus.map((caption) => {
                      if (caption.status_id != 4) {
                        return caption;
                      }
                    });
                  } else {
                    tempStatusData = [...targetStatus];
                  }

                  const finalStatusData = tempStatusData.filter(Boolean);
                  const hasCurrentStatus = finalStatusData.some(opt => String(opt.status_id) === String(statusId));
                  if (!hasCurrentStatus && statusId) {
                    finalStatusData.unshift({
                      status_id: statusId,
                      adminstatuscaption: statusId
                    });
                  }
                  const isBankDetails =
                    item?.JeweleryDetail?.[0]?.AccountName &&
                    item?.JeweleryDetail?.[0]?.AccountNumber &&
                    item?.JeweleryDetail?.[0]?.BankName &&
                    item?.JeweleryDetail?.[0]?.IFSC_CODE;

                  const totalCarat = item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseFloat(dia?.carat) || 0),
                    0
                  );

                  const totalWeight = item.diamondDetail.reduce(
                    (sum, dia) => sum + (parseFloat(dia?.weight) || 0),
                    0
                  );

                  const size = item?.JeweleryDetail?.[0]?.size?.includes(",") ? item?.JeweleryDetail?.[0]?.size.split(",")[0] : item?.JeweleryDetail?.[0]?.size;

                  const itemReason =
                    (item?.JeweleryDetail?.[0]?.reason && item?.JeweleryDetail?.[0]?.reason !== "N/A" ? item?.JeweleryDetail?.[0]?.reason : null) ||
                    item?.refundDetails?.refundRemarks ||
                    item?.refundDetails?.cancellationReason ||
                    (item?.JeweleryDetail?.[0]?.reason ? item?.JeweleryDetail?.[0]?.reason : "-");

                  return (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {item?.JeweleryDetail?.[0]?.itemCode
                            ? item?.JeweleryDetail?.[0]?.itemCode
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.JeweleryDetail?.[0]?.productTitle
                            ? item?.JeweleryDetail?.[0]?.productTitle
                            : "-"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {item?.JeweleryDetail?.[0]?.finalPrice
                            ? rowData?.[0]?.currencysign +
                            Math.round(
                              Number(item?.JeweleryDetail?.[0]?.finalPrice) || 0
                            ).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4">{item?.qty ? item?.qty : "-"}</td>
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {item?.JeweleryDetail?.[0]?.finalPrice
                            ? rowData?.[0]?.currencysign +
                            Math.round(
                              (Number(item?.JeweleryDetail?.[0]?.finalPrice) || 0) * item?.qty
                            ).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {rowData?.[0]?.currencyAmount ? rowData?.[0]?.currencyAmount : "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {item?.JeweleryDetail?.[0]?.designCode ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.JeweleryDetail?.[0]?.category
                            ? item?.JeweleryDetail?.[0]?.category
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {size || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
                            {item?.JeweleryDetail?.[0]?.metalstamp || item?.JeweleryDetail?.[0]?.metaltype
                              ? `${item?.JeweleryDetail?.[0]?.metalstamp ?? ""}${item?.JeweleryDetail?.[0]?.metalstamp && item?.JeweleryDetail?.[0]?.metaltype
                                ? " - "
                                : ""
                              }${item?.JeweleryDetail?.[0]?.metaltype ?? ""}`
                              : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-[140px]">
                            <Select
                              onValueChange={(value) =>
                                handleStatusChange(value, item)
                              }
                              key={`${index}-${statusId}`}
                              value={`${statusId}`}
                              disabled={LOCKED_STATUSES.includes(statusId)}
                            >
                              <SelectTrigger className="w-full h-8 rounded-md border border-zinc-200 focus:ring-0 whitespace-nowrap bg-zinc-50/50 hover:bg-zinc-50 font-medium text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white rounded-lg shadow-lg border border-zinc-200">
                                <SelectGroup>
                                  {finalStatusData?.map((item, index) => {
                                    return (
                                      <SelectItem
                                        className="hover:bg-zinc-50 cursor-pointer rounded-md my-0.5 mx-1"
                                        key={index}
                                        value={`${item.status_id}`}
                                      >
                                        {item.adminstatuscaption}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        {showViewInJewellery && (
                          <td className="py-3 px-4">
                            {isBankDetails ? (
                              <button
                                onClick={() => handleShowBankDetails(item)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-blue-600 transition-all duration-200 focus:outline-none"
                                title="View Bank Details"
                              >
                                <FaEye size={16} />
                              </button>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div className="max-w-[180px] truncate text-zinc-600 font-medium" title={itemReason}>
                            {itemReason}
                          </div>
                        </td>
                      </tr>
                      {item.diamondDetail && item.diamondDetail.length > 0 && (
                        <tr className="bg-zinc-50/30">
                          <td colSpan={showViewInJewellery ? 14 : 13} className="px-6 py-4">
                            <div className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm w-full">
                              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                                Mounted Diamond Specs
                              </div>
                              <div className="overflow-hidden border border-zinc-150 rounded-lg">
                                <table className="w-full text-xs text-left border-collapse">
                                  <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold">
                                      <th className="py-2.5 px-3.5 font-semibold">Stone Type</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Shape</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Color</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Clarity</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Carat</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Weight / Pcs</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100">
                                    {item.diamondDetail.map((dia, ind) => (
                                      <tr key={ind} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-2 px-3.5 text-zinc-800 font-medium capitalize">{dia?.type ? String(dia.type).toLowerCase() : "-"}</td>
                                        <td className="py-2 px-3.5 text-zinc-650">{dia?.shape || "-"}</td>
                                        <td className="py-2 px-3.5 text-zinc-650">{dia?.color || "-"}</td>
                                        <td className="py-2 px-3.5 text-zinc-650">{dia?.clarity || "-"}</td>
                                        <td className="py-2 px-3.5 text-zinc-800 font-semibold">{dia?.carat || "-"}</td>
                                        <td className="py-2 px-3.5 text-zinc-650">{dia?.weight || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="border-t border-zinc-200 bg-zinc-50/50">
                                    <tr className="font-semibold text-zinc-800">
                                      <td colSpan={4} className="py-2.5 px-3.5 text-right text-zinc-500 font-bold uppercase tracking-wider">Total:</td>
                                      <td className="py-2.5 px-3.5 font-extrabold text-blue-600">{Number(totalCarat.toFixed(3))}</td>
                                      <td className="py-2.5 px-3.5 font-bold text-zinc-700">{Number(totalWeight.toFixed(3))}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Diamond Details */}
        {state == "diamond" && (
          <div className="overflow-x-auto border border-zinc-200 rounded-xl mt-6 shadow-sm bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Title</th>
                  <th className="py-3.5 px-4 font-semibold">Stock No.</th>
                  <th className="py-3.5 px-4 font-semibold">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Exchange Rate</th>
                  <th className="py-3.5 px-4 font-semibold">Shape</th>
                  <th className="py-3.5 px-4 font-semibold">Color</th>
                  <th className="py-3.5 px-4 font-semibold">Clarity</th>
                  <th className="py-3.5 px-4 font-semibold">Carat</th>
                  <th className="py-3.5 px-4 font-semibold">Reason</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  {showViewInDiamond && <th className="py-3.5 px-4 font-semibold">View</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                {diamondDetails?.map((item, index) => {
                  let statusId =
                    item?.diamondDetail?.[0]?.diamond_current_status?.[0]
                      ?.status_id;
                  let queryStatusId = statusId === "Received" ? "Pending" : statusId;
                  const targetStatus = modifiedOrderCaption?.filter(
                    (modItem) =>
                      (Array.isArray(modItem.parentid) &&
                        modItem.parentid.includes(queryStatusId)) ||
                      modItem.status_id == statusId
                  );
                  let tempStatusData = [];
                  if (targetStatus.length > 1) {
                    tempStatusData = targetStatus.map((it) =>
                      it.status_id != 4 ? it : undefined
                    );
                  } else {
                    tempStatusData = [...targetStatus];
                  }
                  const finalStatusData = tempStatusData.filter(Boolean);
                  const hasCurrentStatus = finalStatusData.some(opt => String(opt.status_id) === String(statusId));
                  if (!hasCurrentStatus && statusId) {
                    finalStatusData.unshift({
                      status_id: statusId,
                      adminstatuscaption: statusId
                    });
                  }
                  const isBankDetails =
                    item?.diamondDetail?.[0]?.AccountName &&
                    item?.diamondDetail?.[0]?.AccountNumber &&
                    item?.diamondDetail?.[0]?.BankName &&
                    item?.diamondDetail?.[0]?.IFSC_CODE;
                  return (
                    item?.diamondDetail?.length > 0 && (
                      <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-zinc-900">
                          {item?.diamondDetail?.[0]?.carat +
                            " Carat Diamond " +
                            item?.diamondDetail?.[0]?.shape +
                            " Shape"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {item?.diamondDetail?.[0]?.stockId
                            ? item?.diamondDetail?.[0]?.stockId
                            : "-"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {item?.price
                            ? rowData?.[0]?.currencysign + item?.price
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {rowData?.[0]?.currencyAmount ? rowData?.[0]?.currencyAmount : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.diamondDetail?.[0]?.shape
                            ? item?.diamondDetail?.[0]?.shape
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.diamondDetail?.[0]?.color
                            ? item?.diamondDetail?.[0]?.color
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.diamondDetail?.[0]?.clarity
                            ? item?.diamondDetail?.[0]?.clarity
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {item?.diamondDetail?.[0]?.carat
                            ? item?.diamondDetail?.[0]?.carat
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-[150px] truncate text-zinc-500" title={item?.diamondDetail?.[0]?.reason}>
                            {item?.diamondDetail?.[0]?.reason
                              ? item?.diamondDetail?.[0]?.reason
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-[140px]">
                            <Select
                              onValueChange={(value) =>
                                handleStatusChange(value, item)
                              }
                              key={`${index}-${statusId}`}
                              value={`${statusId}`}
                              disabled={LOCKED_STATUSES.includes(statusId)}
                            >
                              <SelectTrigger className="w-full h-8 rounded-md border border-zinc-200 focus:ring-0 whitespace-nowrap bg-zinc-50/50 hover:bg-zinc-50 font-medium text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white rounded-lg shadow-lg border border-zinc-200">
                                <SelectGroup>
                                  {finalStatusData?.map((item, index) => {
                                    return (
                                      <SelectItem
                                        className="hover:bg-zinc-50 cursor-pointer rounded-md my-0.5 mx-1"
                                        key={index}
                                        value={`${item?.status_id}`}
                                      >
                                        {item?.adminstatuscaption}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        {showViewInDiamond && (
                          <td className="py-3 px-4">
                            {isBankDetails ? (
                              <button
                                onClick={() => handleShowBankDetails(item)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-blue-600 transition-all duration-200 focus:outline-none"
                                title="View Bank Details"
                              >
                                <FaEye size={16} />
                              </button>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


      </div>

      {/* Bank Details Dialog */}
      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="sm:max-w-[460px] p-6 rounded-2xl">
          <DialogHeader className="pb-4 border-b border-zinc-100">
            <DialogTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Bank Account Details
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account Holder</span>
                <span className="text-sm font-semibold text-zinc-800">{currentBankData?.accountHolderName || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bank Name</span>
                <span className="text-sm font-medium text-zinc-700">{currentBankData?.bankName || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account Number</span>
                <span className="text-sm font-mono font-medium text-zinc-700">{currentBankData?.accountNumber || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">IFSC Code</span>
                <span className="text-sm font-mono font-medium text-zinc-700 bg-zinc-250/60 px-2 py-0.5 rounded">{currentBankData?.ifscCode || "-"}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setShowBankDetails(false)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-5 h-10 transition-colors"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderModals
        statusDialog={statusDialog}
        selectedRow={selectedRow}
        rowData={rowData}
        GetOrderDetails={GetOrderDetails}
        setStatusDialog={setStatusDialog}
        refreshOrderList={refreshOrderList}
      />
    </>
  );
}
