"use client";
import React from "react";

// Date formatting utility function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  // Get day, month, year
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  // Get time in 12-hour format
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

export default function CartRowExpand({ rowData, defaultCurrency }) {
  if (!rowData || !Array.isArray(rowData) || rowData.length === 0) {
    return (
      <div className="px-6 py-4 text-xs text-slate-400 text-center bg-slate-50/40">
        No items in cart
      </div>
    );
  }

  // Normalize items to support both legacy and flat formats
  const normalizedItems = rowData.map((item, index) => {
    const hasProductDetails = Array.isArray(item.ProductDetails) && item.ProductDetails.length > 0;
    const hasDiamondDetails = Array.isArray(item.DiamondDetails) && item.DiamondDetails.length > 0;

    if (hasProductDetails) {
      const prod = item.ProductDetails[0];
      return {
        id: item._id || prod._id || index,
        itemCode: prod.itemCode || "-",
        productTitle: prod.productTitle || "-",
        metal: (prod.metalstamp || "") + " " + (prod.metaltype || ""),
        size: item.ringsize?.[0]?.paraMtrName || "-",
        qty: item.qty || 1,
        amount: item.jeweleryprice || prod.finalPrice || 0,
        currency: item.checkoutCurrency || "₹",
        details: hasDiamondDetails 
          ? `${item.DiamondDetails[0].carat || ""}ct ${item.DiamondDetails[0].shape || ""}` 
          : "-",
        createdAt: item.createdAt
      };
    } else if (hasDiamondDetails && !hasProductDetails) {
      const dia = item.DiamondDetails[0];
      return {
        id: item._id || dia._id || index,
        itemCode: dia.stockId || "-",
        productTitle: `${dia.carat || 0} Carat ${dia.shape || ""} Shape Diamond`,
        metal: "-",
        size: "-",
        qty: item.qty || 1,
        amount: item.diamondprice || 0,
        currency: item.checkoutCurrency || "₹",
        details: `${dia.color || ""}/${dia.clarity || ""}/${dia.cut || ""}`,
        createdAt: item.createdAt
      };
    } else {
      // Flat structure
      let specStr = "-";
      if (item.origin || item.color || item.clarity) {
        const parts = [];
        if (item.origin) parts.push(item.origin);
        if (item.color || item.clarity) {
          const colorClarity = [item.color, item.clarity].filter(Boolean).join("/");
          if (colorClarity) parts.push(colorClarity);
        }
        specStr = parts.join(" - ");
      }

      return {
        id: item._id || index,
        itemCode: item.itemCode || "-",
        productTitle: item.productTitle || "-",
        metal: item.metal || "-",
        size: item.size || "-",
        qty: item.qty || 1,
        amount: item.amount || 0,
        currency: item.checkoutCurrency || "₹",
        details: specStr,
        createdAt: item.createdAt
      };
    }
  });

  return (
    <div className="px-6 py-4 bg-slate-50/40">
      <div className="overflow-x-auto w-full border border-slate-100 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Product Title</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Item Code</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Metal</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Specs</th>
              <th className="py-2.5 px-4 font-semibold text-slate-500 uppercase tracking-wider">Added Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {normalizedItems.map((item, index) => {
              const rawCurr = defaultCurrency || item.currency;
              const currencySymbol = (!rawCurr || rawCurr === "INR" || rawCurr.trim() === "INR") ? "₹" : rawCurr.trim();
              const roundedAmount = Math.round(Number(item.amount) || 0);

              return (
                <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-800">{item.productTitle}</td>
                  <td className="py-2.5 px-4 text-slate-600">{item.itemCode}</td>
                  <td className="py-2.5 px-4 text-slate-600">{item.metal}</td>
                  <td className="py-2.5 px-4 text-slate-600 text-center">{item.size}</td>
                  <td className="py-2.5 px-4 text-slate-600 text-center font-medium">{item.qty}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {currencySymbol} {roundedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">
                    {item.details !== "-" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/50">
                        {item.details}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{formatDate(item.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}