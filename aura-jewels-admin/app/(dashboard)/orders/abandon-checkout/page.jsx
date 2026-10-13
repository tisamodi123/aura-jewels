import { Button } from "@/components/ui/button";
import React from "react";
import AbondendCheckoutTable from "../_components/abondendCheckoutTable";

export default function page() {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold"> Abandoned Checkouts</h1>
        <div className="flex gap-3">
          <Button
            variant=""
            className="bg-[#ffffff] text-[#656B7B] border-[#e4e4e7] border"
          >
            Export
          </Button>
        </div>
      </div>
      <div className="bg-white border rounded-lg border-zinc-200 shadow-md">
        <AbondendCheckoutTable />
      </div>
    </div>
  );
}
