import { BookmarkX } from "lucide-react";
import React from "react";

export default function NoDataFound({ headerLength }) {
  return (
    <tbody>
      <tr>
        <td style={{ padding: 0 }} colSpan={headerLength}>
          <div
            className="flex flex-col items-center justify-center  rounded-lg h-[30vh] py-10 w-full"
            style={{
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.08)",
            }}
          >
            <BookmarkX size={60} strokeWidth={0.2} color="#656B7B" />
            <p className="text-[#656B7B]  text-md mt-2">No data found</p>
          </div>
        </td>
      </tr>
    </tbody>
  );
}
