"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import JewelleryListTable from "./_components/jewelleryListTable";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";

export default function JewelleryPage() {
  const [jewelleryList, setJewelleryList] = useState([]);
  const token = getToken();
  // Fetch Jewellery Data

  const GetJewelleryList = () => {
    const formdata = new FormData();
    formdata.append("page", "1");
    formdata.append("limit", "20");

    callApi(`${API_URL?.GET_JEWELLERY_LIST}`, "POST", formdata, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setJewelleryList(result?.data);
        }
      });
  }; 
  
  useEffect(() => {
    GetJewelleryList();
  }, []);

  console.log("Jewlety data-->", jewelleryList);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold"> Jewellery List </h1>
        <div className="flex gap-3">
          <Button variant="" className="bg-[#ffffff] border-[#e4e4e7] border">
            Export
          </Button>
          <Button
            variant=""
            className="bg-[#ffffff] border-[#e4e4e7] border"
          // onClick={() => setIsImportingJewellery(true)}
          >
            Import
          </Button>
          <Button
            variant=""
            className="bg-[#18181b] text-white border-[#e4e4e7] border"
          >
            Add Product
          </Button>
        </div>
      </div>
      <div className="bg-white border rounded-lg border-zinc-200 shadow-md">
        <JewelleryListTable tableData={jewelleryList} />
      </div>
    </div>
  );
}
