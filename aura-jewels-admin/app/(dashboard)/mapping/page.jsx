"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { HomeIcon } from "lucide-react";

import Link from "next/link";

import { usePathname } from "next/navigation";
import SelectFileComp from "./_component/SelectFileComp";
import MappingFileComp from "./_component/MappingFileComp";

const Mapping = () => {
  const token = getToken();
  const [fileType, setFileType] = useState("");
  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [isLoading, setIsLoading] = useState(false);
  const [isShowMapCom, setIsShowMapCom] = useState(false);
  const [excelHeadArr, setExcelHeadArr] = useState([]);
  const [vendorId, setVendorId] = useState("");

  console.log("file type ---->", fileType);

  return (
    <>
      <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm flex justify-between">
        <nav aria-label="Breadcrumb" className="la pt-2">
          <ol role="list" className="flex">
            <li>
              <div>
                <Link href="/dashboard" className="flex">
                  <HomeIcon
                    size={18}
                    className="cursor-pointer text-blue-900 mr-2"
                  />
                  <span>Home</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>Products</span>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <Link href={"/products/diamond"}>Diamond</Link>
              </div>
            </li>
            <li>
              <div className="flex">
                <svg
                  fill="#888"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="flex-none w-[25px]"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path>
                </svg>
                <span>{title} Master</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      {console.log('isShowMapCom ->', isShowMapCom)}
      {isShowMapCom ? (
        <MappingFileComp
          setIsShowMapCom={setIsShowMapCom}
          excelHeadArr={excelHeadArr}
          vendorId={vendorId}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          fileType={fileType}
        />
      ) : (
        <SelectFileComp
          setIsShowMapCom={setIsShowMapCom}
          setExcelHeadArr={setExcelHeadArr}
          setVendorId={setVendorId}
          setFileType={setFileType}
        />
      )}
    </>
  );
};

export default Mapping;
