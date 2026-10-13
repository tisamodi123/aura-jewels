import { MoveLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function page() {
  const date = new Date();
  const arr = [1, 2, 3, 4, 5, 6, 67, 67, 4, 21, 1];
  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-6 bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className="border-b-[1px] border-[#E4E8EE] mb-4">
            <h2 className="text-[0.98rem] flex items-center gap-2 font-semibold mb-4">
              <Link href={`/settings/general`} className="cursor-pointer">
                <MoveLeft />
              </Link>{" "}
              <span> Store Activity Log</span>
            </h2>
          </div>
          {/* Logs */}
          <div>
            {arr.map((item, index) => {
              return (
                <div
                  key={index}
                  className="border border-[#E4E8EE] rounded-md p-4 mb-4"
                >
                  <div className="text-[0.87rem] mb-1 text-black font-semibold">
                    Surbhi Soni Accessed Shop
                  </div>
                  <div className="text-[0.80rem] text-[#656B7B]">
                    April 2, 2025 at 4:01 PM GMT+5:30
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
