"use client";

import QuillEditor from "@/components/textEditor";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function PolicyBox({ title, setState }) {
  const [description, setDescription] = useState("");
  let modifyTitle = "";
  if (title == "returnRefundPolicy") {
    modifyTitle = "Return And Refund Policy";
  }
  if (title == "privacyPolicy") {
    modifyTitle = "Privacy Policy";
  }
  if (title == "termOfServices") {
    modifyTitle = "Term of Services";
  }
  if (title == "shippingPolicy") {
    modifyTitle = "Shipping Policy";
  }
  if (title == "contactInformation") {
    modifyTitle = "Contact Information";
  }
  return (
    <div>
      {" "}
      <div className="shadow-sm px-6 py-4 rounded-md bg-white">
        <div>
          <div className="border-b-[1px] border-[#E4E8EE] mb-4">
            <h2 className="text-[0.98rem] flex items-center gap-2 font-semibold mb-4">
              <Link
                href={`#`}
                onClick={() => setState("")}
                className="cursor-pointer"
              >
                <MoveLeft />
              </Link>{" "}
              <span>{modifyTitle}</span>
            </h2>
          </div>
          <div>
            <QuillEditor value={description} onChange={setDescription} />
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button className=" h-[36px] px-5  font-normal border cursor-pointer border-[#E4E8EE] hover:bg-gray-50 bg-[#DE6565] text-[0.80rem] text-white">
          Cancel
        </Button>
        <Button className=" h-[36px] px-5  font-normal border cursor-pointer border-[#E4E8EE] hover:bg-gray-50 bg-black text-[0.80rem] text-white">
          Publish
        </Button>
      </div>
    </div>
  );
}
