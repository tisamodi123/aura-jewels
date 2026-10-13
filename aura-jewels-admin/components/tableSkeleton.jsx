import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TableSkeleton({ row = 4, cell = 6 }) {
  return (
    <tbody>
      {Array.from({ length: row }, (_, i) => {
        return (
          <tr key={i}>
            {Array.from({ length: cell }, (_, ind) => {
              return (
                <td key={ind} className="py-3 px-4">
                  <div className="h-7 w-[70%] mx-auto px-4 rounded-sm  animate-pulse bg-[linear-gradient(90deg,_#e4e4e4_25%,_#f0f0f0_50%,_#e4e4e4_75%)] bg-[length:200%_100%]"></div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

export function ShadcnTableSkeleton({ row, cell }) {
  return Array.from({ length: row }).map((_, idx) => (
    <TableRow key={idx}>
      {Array.from({ length: cell }).map((_, i) => (
        <TableCell className="p-2" key={i}>
          <div className="animate-pulse bg-gray-200 h-6 w-full rounded"></div>
        </TableCell>
      ))}
    </TableRow>
  ));
}
