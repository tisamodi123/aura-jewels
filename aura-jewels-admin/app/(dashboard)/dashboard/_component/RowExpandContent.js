import React, { useState } from "react";

export default function RowExpandContent({ rowData }) {
  const [state, setState] = useState("order");
  const rawCurrency = rowData?.[0]?.currencysign;
  const currencySign = (!rawCurrency || rawCurrency === "INR" || rawCurrency.trim() === "INR") ? "₹" : rawCurrency.trim();
  const gstNo = rowData?.[0]?.gstNo || rowData?.[0]?.shippingAddress?.gstNo || rowData?.[0]?.billingAddress?.gstNo || '';
  const companyName = rowData?.[0]?.companyName || rowData?.[0]?.shippingAddress?.companyName || rowData?.[0]?.billingAddress?.companyName || '';

  const jewelleryDetails = [];
  const diamondDetails = [];

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
    { lable: "Order Details", value: "order", isShow: true },
    {
      lable: "Jewellery Details",
      value: "jewellery",
      isShow: jewelleryDetails.length > 0 ? true : false,
    },
    {
      lable: "Diamond Details",
      value: "diamond",
      isShow: diamondDetails.length > 0 ? true : false,
    },
  ];

  return (
    <>
      <div className="px-6 py-4 bg-slate-50/40">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 gap-6 text-sm mb-4">
          {topLabels.map((item, index) => {
            return (
              item.isShow && (
                <div
                  onClick={() => setState(item.value)}
                  key={index}
                  className={`cursor-pointer pb-2.5 text-xs font-semibold transition-all relative ${item.value === state
                    ? "text-[#087B5D]"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {item.lable}
                  {item.value === state && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#087B5D] rounded-full" />
                  )}
                </div>
              )
            );
          })}
        </div>

        {/* Order Details */}
        {state === "order" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Left Card */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Order No. :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{rowData?.[0]?.orderNumber || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Customer Name :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {rowData?.[0]?.shippingAddress?.firstName
                        ? rowData?.[0]?.shippingAddress?.firstName + " " + rowData?.[0]?.shippingAddress?.lastName
                        : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Customer Number :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {rowData?.[0]?.shippingAddress?.number ? `+${rowData?.[0]?.shippingAddress?.number}` : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Customer Email :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800 break-all">
                      {rowData?.[0]?.shippingAddress?.emailId || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Total Amount :</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {rowData?.[0]?.totalamount ? currencySign + " " + Math.round(Number(rowData?.[0]?.totalamount || 0)).toLocaleString('en-IN') : "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">No of Items :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {rowData?.[0]?.orderDetail?.length || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Card */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Payment Type :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{rowData?.[0]?.payment_type || "-"}</td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Transaction No. :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {rowData?.[0]?.orderPaymentDetails?.[0]?.payment_transaction_id || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Order Date :</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {rowData?.[0]?.createdAt || "-"}
                    </td>
                  </tr>
                  {companyName && (
                    <tr className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">Company Name :</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {companyName}
                      </td>
                    </tr>
                  )}
                  {gstNo && (
                    <tr className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 px-4 font-semibold text-slate-500 bg-slate-50/30 w-[35%] border-r border-slate-50">GST Number :</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 uppercase">
                        {gstNo}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jewellery Details */}
        {state === "jewellery" && (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-xl mt-2 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Item code</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Total Price</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Design Code</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">
                    Metal
                  </th>
                  {/* <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Setting Type</th> */}
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jewelleryDetails?.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-700">{item?.JeweleryDetail?.[0]?.itemCode || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.JeweleryDetail?.[0]?.productTitle || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.JeweleryDetail?.[0]?.finalPrice ? currencySign + " " + Math.round(Number(item?.JeweleryDetail?.[0]?.finalPrice || 0)).toLocaleString('en-IN') : '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.qty || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{currencySign} {Math.round((Number(item?.JeweleryDetail?.[0]?.finalPrice) || 0) * (Number(item?.qty) || 1)).toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.JeweleryDetail?.[0]?.designCode || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.JeweleryDetail?.[0]?.category || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {[item?.JeweleryDetail?.[0]?.metalstamp, item?.JeweleryDetail?.[0]?.metaltype]
                            .filter(Boolean)
                            .join(' - ') || '-'}
                        </td>
                        {/* <td className="py-2 px-3 text-slate-600">{item?.JeweleryDetail?.[0]?.settingType || '-'}</td> */}
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/50">
                            {item?.JeweleryDetail?.[0]?.jewelery_current_status?.[0]?.adminstatuscaption || '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500">{item?.JeweleryDetail?.[0]?.reason || 'N/A'}</td>
                      </tr>
                      {item.diamondDetail && item.diamondDetail.length > 0 && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={12} className="px-6 py-4">
                            <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm w-full">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                Mounted Diamond Specs
                              </div>
                              <div className="overflow-hidden border border-slate-150 rounded-lg">
                                <table className="w-full text-xs text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                      <th className="py-2.5 px-3.5 font-semibold">Stone Type</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Shape</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Color</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Clarity</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Carat</th>
                                      <th className="py-2.5 px-3.5 font-semibold">Weight / Pcs</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.diamondDetail.map((dia, ind) => (
                                      <tr key={ind} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-2 px-3.5 text-slate-800 font-medium capitalize">{dia?.type ? String(dia.type).toLowerCase() : "-"}</td>
                                        <td className="py-2 px-3.5 text-slate-650">{dia?.shape || "-"}</td>
                                        <td className="py-2 px-3.5 text-slate-650">{dia?.color || "-"}</td>
                                        <td className="py-2 px-3.5 text-slate-650">{dia?.clarity || "-"}</td>
                                        <td className="py-2 px-3.5 text-slate-800 font-semibold">{dia?.carat || "-"}</td>
                                        <td className="py-2 px-3.5 text-slate-650">{dia?.weight || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
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
        {state === "diamond" && (
          <div className="overflow-x-auto w-full border border-slate-100 rounded-xl mt-2 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Stock No.</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Shape</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Color</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Clarity</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Carat</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="py-2 px-3 font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diamondDetails?.map((item, index) => {
                  return (
                    item?.diamondDetail?.length > 0 && (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-700 text-xs">
                          {item.diamondDetail?.[0]?.carat +
                            " Carat Diamond " +
                            item.diamondDetail?.[0]?.shape +
                            " Shape"}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item?.diamondDetail?.[0]?.stockId || '-'}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item?.price ? currencySign + " " + Math.round(Number(item?.price || 0)).toLocaleString('en-IN') : '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.diamondDetail?.[0]?.shape || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.diamondDetail?.[0]?.color || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.diamondDetail?.[0]?.clarity || '-'}</td>
                        <td className="py-2 px-3 text-slate-600">{item?.diamondDetail?.[0]?.carat || '-'}</td>
                        <td className="py-2 px-3 text-slate-500">{item?.diamondDetail?.[0]?.reason || 'N/A'}</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/50">
                            {item?.diamondDetail?.[0]?.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </>
  );
}
