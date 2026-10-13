import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function OrderModals({
  setStatusDialog,
  selectedRow,
  statusDialog,
  GetOrderDetails,
  rowData,
  refreshOrderList,
}) {
  const token = getToken();
  const [rejectText, setRejectText] = useState("");
  const [shippedData, setShippedData] = useState({
    courierService: "",
    trackCode: "",
    trackingUrl: "",
    remarkText: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  useEffect(() => {
    const refundStates = ["Rejected", "Cancelled", "Cancelled Approved", "Returned Approved"];
    if (refundStates.includes(statusDialog)) {
      const candidates = [
        selectedRow?.refundDetails,
        selectedRow?.JeweleryDetail?.[0]?.refundDetails,
        selectedRow?.diamondDetail?.[0]?.refundDetails,
        rowData?.[0]?.orderDetail?.find((item) => item._id === selectedRow?._id)?.refundDetails,
        rowData?.[0]?.refundDetails,
      ];
      let refundInfo = candidates.find((c) => c && (c.refundType || c.refundMethod || c.refundRemarks || c.amount || c.accountHolderName));
      if (!refundInfo) {
        refundInfo = candidates.find((c) => c && typeof c === 'object' && Object.keys(c).length > 0) || null;
      }

      const prefType = String(refundInfo?.refundType || refundInfo?.refundMethod || "").toLowerCase();
      if (prefType === "bank") {
        setPaymentMethod("bank");
      } else if (prefType === "gateway" || prefType === "original" || prefType === "online") {
        setPaymentMethod("gateway");
      } else if (prefType === "wallet") {
        setPaymentMethod("wallet");
      } else {
        const origPayType = String(
          rowData?.[0]?.payment_type ||
          selectedRow?.payment_type ||
          rowData?.[0]?.paymentMethod ||
          ""
        ).toLowerCase();
        if (
          origPayType.includes("online") ||
          origPayType.includes("gateway") ||
          origPayType.includes("razorpay") ||
          origPayType.includes("card") ||
          origPayType.includes("netbanking")
        ) {
          setPaymentMethod("gateway");
        } else {
          setPaymentMethod("wallet");
        }
      }

      if (refundInfo?.amount && Number(refundInfo.amount) > 0) {
        setRefundAmount(String(refundInfo.amount));
      } else {
        let prefill = 0;
        const isItem = selectedRow?.price != null;
        if (isItem) {
          const qty = Number(selectedRow?.productDetails?.qty || selectedRow?.qty || 1);
          const line = (Number(selectedRow.price) || 0) * qty;
          const share = Number(selectedRow?.couponDiscountShare || 0);
          prefill = Math.max(0, line - share);
        } else {
          prefill =
            selectedRow?.amountDue ??
            selectedRow?.total ??
            selectedRow?.baseAmount ??
            rowData?.[0]?.netamount ??
            0;
        }
        setRefundAmount(prefill ? String(Number(prefill).toFixed(2)) : "");
      }

      if (refundInfo?.accountHolderName) setAccountHolderName(refundInfo.accountHolderName);
      if (refundInfo?.bankName) setBankName(refundInfo.bankName);
      if (refundInfo?.accountNumber) setAccountNumber(refundInfo.accountNumber);
      if (refundInfo?.ifscCode) setBic(refundInfo.ifscCode);
      if (refundInfo?.refundRemarks) setRejectText(refundInfo.refundRemarks);
      else if (selectedRow?.rejectReason) setRejectText(selectedRow.rejectReason);
    }
  }, [statusDialog, selectedRow, rowData]);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bic, setBic] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [errors, setErrors] = useState({});

  const validateBankForm = () => {
    const newErrors = {};
    if (paymentMethod === "bank") {
      if (!accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required";
      if (!bankName.trim()) newErrors.bankName = "Bank name is required";
      if (!accountNumber.trim()) newErrors.accountNumber = "Account number is required";
      if (!bic.trim()) newErrors.bic = "BIC code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusApi = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setDisableBtn(true);
    if (paymentMethod === "bank" && !validateBankForm()) {
      toast.error(M.validation.required);
      setDisableBtn(false);
      return;
    }
    try {
      if (!selectedRow?._id) {
        toast.error("Order identifier is missing.");
        setDisableBtn(false);
        return;
      }

      const isOverall = selectedRow?.isOverallOrder;
      const endpoint = isOverall
        ? API_URL.UPDATE_ORDER_STATUS(selectedRow._id)
        : API_URL.UPDATE_ORDER_ITEM_STATUS(selectedRow._id);

      const payload = {
        status: statusDialog,
        rejectReason: rejectText,
        refundType: paymentMethod || "wallet",
        refundAmount: Number(refundAmount) || 0,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode: bic,
        refundRemarks: rejectText
      };

      const statusRes = await callApi(
        endpoint,
        "PUT",
        payload,
        token
      );

      if (statusRes && (statusRes.errorCode === STATUS_CODE.OK || statusRes.errorCode === 200)) {
        // 2. If Shipped and not overall order, also dispatch tracking details to the parent order
        if (statusDialog === "Shipped" && rowData?.[0]?._id && !isOverall) {
          await callApi(
            API_URL.UPDATE_ORDER_TRACKING(rowData[0]._id),
            "PUT",
            {
              trackingNumber: shippedData.trackCode,
              shippingCarrier: shippedData.courierService,
              trackingUrl: shippedData.trackingUrl
            },
            token
          );
        }

        toast.success(statusRes.message || "Status updated successfully.");
        GetOrderDetails(rowData?.[0]?._id);
        if (refreshOrderList) {
          refreshOrderList();
        }
        setRejectText("");
        setShippedData({
          courierService: "",
          trackCode: "",
          trackingUrl: "",
          remarkText: "",
        });
        setStatusDialog("");
      } else {
        toast.error(statusRes?.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
      console.log("Error :", err);
    } finally {
      setDisableBtn(false);
    }
  };

  const handleShippedData = (name, value) => {
    setShippedData((prev) => ({ ...prev, [name]: value }));
  };

  const rawPaymentStatus =
    selectedRow?.paymentStatus ||
    rowData?.[0]?.paymentStatus ||
    rowData?.[0]?.payment_status?.[0]?.adminstatuscaption ||
    "pending";
  const currentPayStatus = String(rawPaymentStatus).toLowerCase();
  const isPendingPayment = currentPayStatus === "pending" || currentPayStatus === "payment pending";

  const UpdateStatus = (statusValue) => {
    Swal.fire({
      title: "Change Status",
      text: "Are you sure you want to change order status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed === true) {
        if (!selectedRow?._id) {
          toast.error("Order identifier is missing.");
          setStatusDialog("");
          return;
        }
        const isOverall = selectedRow?.isOverallOrder;
        const endpoint = isOverall
          ? API_URL.UPDATE_ORDER_STATUS(selectedRow._id)
          : API_URL.UPDATE_ORDER_ITEM_STATUS(selectedRow._id);

        const payload = { status: statusValue };
        if (isPendingPayment && ["Rejected", "Cancelled", "Cancelled Approved"].includes(statusValue)) {
          payload.refundType = "none";
          payload.refundAmount = 0;
        }

        callApi(endpoint, "PUT", payload, token)
          .then((res) => {
            if (res && (res.errorCode === STATUS_CODE.OK || res.errorCode === 200)) {
              toast.success(res?.message || "Status updated successfully.");
              GetOrderDetails(rowData?.[0]?._id);
              if (refreshOrderList) {
                refreshOrderList();
              }
            } else {
              toast.error(res?.message || "Failed to update status.");
            }
            setStatusDialog("");
          });
      } else {
        setStatusDialog("");
      }
    });
  };

  useEffect(() => {
    if (!statusDialog) return;
    const directStatuses = [
      "Pending",
      "Confirmed",
      "Approved",
      "In Production",
      "Ready to Ship",
      "Delivered",
      "Return Request",
      "Item Received",
      "QA Done",
      "Cancelled Rejected",
      "Refunded"
    ];
    if (isPendingPayment && ["Rejected", "Cancelled", "Cancelled Approved"].includes(statusDialog)) {
      directStatuses.push("Rejected", "Cancelled", "Cancelled Approved");
    }
    if (directStatuses.includes(statusDialog)) {
      UpdateStatus(statusDialog);
    }
  }, [statusDialog, isPendingPayment]);



  // Add these onChange handlers to clear errors as user types

  const handleAccountHolderNameChange = (value) => {
    setAccountHolderName(value);
    if (errors.accountHolderName) {
      setErrors(prev => ({ ...prev, accountHolderName: "" }));
    }
  };

  const handleBankNameChange = (value) => {
    setBankName(value);
    if (errors.bankName) {
      setErrors(prev => ({ ...prev, bankName: "" }));
    }
  };

  const handleAccountNumberChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAccountNumber(numericValue);
    if (errors.accountNumber) {
      setErrors(prev => ({ ...prev, accountNumber: "" }));
    }
  };

  const handleBicChange = (value) => {
    setBic(value);
    if (errors.bic) {
      setErrors(prev => ({ ...prev, bic: "" }));
    }
  };

  const isCustomerNote = Boolean(
    selectedRow?.refundDetails?.refundRemarks ||
    selectedRow?.JeweleryDetail?.[0]?.refundDetails?.refundRemarks ||
    selectedRow?.diamondDetail?.[0]?.refundDetails?.refundRemarks ||
    rowData?.[0]?.orderDetail?.find((item) => item._id === selectedRow?._id)?.refundDetails?.refundRemarks ||
    rowData?.[0]?.refundDetails?.refundRemarks ||
    selectedRow?.rejectReason
  );

  const showRefund = ["Rejected", "Cancelled", "Cancelled Approved", "Returned Approved"].includes(statusDialog);

  return (
    <div>
      {/* Shipped Dialog */}

      <div>
        <Dialog
          open={statusDialog === "Shipped"}
          onOpenChange={setStatusDialog}
        >
          <form>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Order Status</DialogTitle>
              </DialogHeader>
              <div className="h-[1px] bg-gray-300"></div>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label className="text-md" htmlFor="name-1">
                    Courier Service
                  </Label>
                  <Input
                    value={shippedData.courierService}
                    onChange={(e) =>
                      handleShippedData("courierService", e.target.value)
                    }
                    id="name-1"
                    name="name"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name-1" className="text-md">
                    Tracking Code
                  </Label>
                  <Input
                    value={shippedData.trackCode}
                    onChange={(e) =>
                      handleShippedData("trackCode", e.target.value)
                    }
                    id="name-1"
                    name="name"
                  />
                </div>
                <div className="grid gap-3">
                  <Label className="text-md" htmlFor="name-1">
                    Tracking URL<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={shippedData.trackingUrl}
                    onChange={(e) =>
                      handleShippedData("trackingUrl", e.target.value)
                    }
                    id="name-1"
                    name="name"
                  />
                </div>
                <div className="grid gap-3">
                  <Label className="text-md" htmlFor="name-1">
                    Remark
                  </Label>
                  <textarea
                    value={shippedData.remarkText}
                    onChange={(e) =>
                      handleShippedData("remarkText", e.target.value)
                    }
                    className="border border-gray-200 p-3 rounded-md min-h-32 text-md"
                    placeholder="Write Here..."
                  ></textarea>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="cursor-pointer" variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleStatusApi}
                  className="cursor-pointer"
                  type="submit"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      {/* Reject Dialog */}
      {console.log('statusDialog ->>', statusDialog)}
      <div>
        <Dialog
          open={
            ["Rejected", "Cancelled", "Returned Approved", "Cancelled Approved"].includes(statusDialog) &&
            !(isPendingPayment && ["Rejected", "Cancelled", "Cancelled Approved"].includes(statusDialog))
          }
          onOpenChange={setStatusDialog}
        >
          <form>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {statusDialog === "Refunded"
                    ? "Process Refund"
                    : statusDialog === "Returned Approved"
                      ? "Accept Return Request"
                      : "Reject/Cancel Order"}
                </DialogTitle>
              </DialogHeader>
              <div className="h-[1px] bg-gray-300"></div>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label className="text-md" htmlFor="name-1">
                    {statusDialog === "Refunded"
                      ? "Refund Remarks"
                      : statusDialog === "Returned Approved"
                        ? "Return Reason"
                        : isCustomerNote
                          ? "Reject/Cancel Reason (Customer Notes)"
                          : "Reject/Cancel Reason"}
                    {statusDialog !== "Refunded" && !isCustomerNote && <span className="text-red-500">*</span>}
                  </Label>
                  <textarea
                    value={rejectText}
                    onChange={(e) => setRejectText(e.target.value)}
                    readOnly={isCustomerNote}
                    className={`border border-gray-200 p-3 rounded-md min-h-32 text-md ${
                      isCustomerNote ? "bg-gray-100 text-gray-700 cursor-not-allowed" : ""
                    }`}
                    placeholder="Write Your Reason Here..."
                  ></textarea>
                </div>
              </div>

              {/* Refund method/amount — hidden for "Returned Approved" (accept
                  step); only shown once money actually moves (see showRefund). */}
              {showRefund && (
              <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2.5">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="chkbox"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                  />
                  <span className="ml-2">Add In Wallet</span>
                </label>
                {/* Refund to the original payment method — only meaningful for
                    gateway-paid orders. */}
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="chkbox"
                    checked={paymentMethod === "gateway"}
                    onChange={() => setPaymentMethod("gateway")}
                  />
                  <span className="ml-2">Refund to Original Payment</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="chkbox"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                  />
                  <span className="ml-2">Add In Bank Account</span>
                </label>

              </div>
              {paymentMethod === "gateway" && (
                <p className="text-xs text-gray-500 mb-2.5">The amount above will be refunded to the customer&apos;s original payment method via the gateway (only works for gateway-paid orders).</p>
              )}
              {(paymentMethod === "wallet" || paymentMethod === "bank" || paymentMethod === "gateway") && (
                <div className="flex flex-col space-y-1.5 mb-2.5">
                  <label className="text-sm font-medium text-gray-700">
                    Refund Amount (₹)<span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="refundAmount"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Amount to refund"
                  />
                  {paymentMethod === "wallet" && (
                    <p className="text-xs text-gray-500">This amount will be credited to the customer&apos;s store wallet.</p>
                  )}
                </div>
              )}
              {paymentMethod === "bank" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Account Holder Name<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.accountHolderName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      value={accountHolderName}
                      onChange={(e) => handleAccountHolderNameChange(e.target.value)}
                    />
                    {errors.accountHolderName && (
                      <p className="text-red-600 text-sm mt-1">{errors.accountHolderName}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Bank Name<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.bankName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      value={bankName}
                      onChange={(e) => handleBankNameChange(e.target.value)}
                    />
                    {errors.bankName && (
                      <p className="text-red-600 text-sm mt-1">{errors.bankName}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Account Number<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.accountNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      value={accountNumber}
                      onChange={(e) => handleAccountNumberChange(e.target.value)}
                      inputMode="numeric"
                    />
                    {errors.accountNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      IFSC/BIC Code<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="bic"
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.bic ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      value={bic}
                      onChange={(e) => handleBicChange(e.target.value)}
                    />
                    {errors.bic && (
                      <p className="text-red-600 text-sm mt-1">{errors.bic}</p>
                    )}
                  </div>
                </div>
              )}
              </>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="cursor-pointer" variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleStatusApi}
                  disabled={disableBtn}
                  className="cursor-pointer"
                  type="submit"
                >
                  {disableBtn ? "Please Wait..." : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>

      {/* Return Request Rejected Dialog */}
      <div>
        <Dialog
          open={statusDialog === "Returned Rejected"}
          onOpenChange={setStatusDialog}
        >
          <form>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Retrun Request Rejected</DialogTitle>
              </DialogHeader>
              <div className="h-[1px] bg-gray-300"></div>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label className="text-md" htmlFor="name-1">
                    Reject Reason<span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={rejectText}
                    onChange={(e) => setRejectText(e.target.value)}
                    className="border border-gray-200 p-3 rounded-md min-h-32 text-md"
                    placeholder="Write Your Reason Here..."
                  ></textarea>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="cursor-pointer" variant="outline">
                    Close
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleStatusApi}
                  className="cursor-pointer"
                  type="submit"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
