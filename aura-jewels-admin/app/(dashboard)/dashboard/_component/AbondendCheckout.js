import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

export default function AbondendCheckoutSection() {
  const abandonedCheckouts = Array(10).fill({
    OrderID: "#1001",
    CustomerName: "John Wick",
    EmailId: "JohnWick88@gmail.com",
    MobileNumber: "1234567890",
    NoOfItems: "2",
    NetAmount: "$9,800.00",
    DiscountAmount: "$8,202 .00",
    LastUpdate: "02/12/2024",
  });

  return (
    <>
      <div className="border border-gray-200 bg-white shadow-sm rounded-md p-4 mt-6">
        <div className="flex justify-between p-2">
          {/* Left Side */}
          <div className="flex items-center space-x-4 text-gray-500">
            <h2 className="text-lg font-semibold text-gray-700 mr-4">
              Abandoned CheckOuts
            </h2>
          </div>
        </div>

        {/* Product Table */}
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-12 px-4 py-2 text-center">
                <input type="checkbox" className="w-4 h-4" />
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Order
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Customer Name
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Email Id
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Mobile Number
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                No of Items
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Net Amount
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Discount Amount
              </TableHead>
              <TableHead className="px-4 py-2 text-center font-semibold">
                Last Update
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {abandonedCheckouts.length > 0 ? (
              abandonedCheckouts.map((recentItem, index) => (
                <TableRow key={index} className="border-b text-sm">
                  <TableCell className="px-4 py-2 text-center">
                    <input type="checkbox" className="w-4 h-4" />
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.OrderID}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.CustomerName}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.EmailId}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.MobileNumber}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.NoOfItems}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.NetAmount}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.DiscountAmount}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    {recentItem.LastUpdate}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan="9"
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No abandoned checkouts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
