"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import CurrencyTable from "./_components/CurrencyTable";
import LanguageTable from "./_components/LanguageTable";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import AddCurrencyModal from "../_components/AddCurrencyModal";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

export default function CurrencyPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [currencyData, setCurrencyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = getToken();
  // Fetch Customer Data API

  const GetCurrencyData = () => {
    setLoading(true);
    callApi(`${API_URL?.CURRENCY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCurrencyData(result?.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        toast.error(M.common.fetchFailed);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Delete API integration
  const DeleteCurrency = (id) => {
    Swal.fire({
      title: "Delete Currency",
      text: "Are You Sure Want To Delete Currency?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CURRENCY}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCurrencyData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // Update Status API

  const UpdateStatus = (id) => {
    Swal.fire({
      title: "Change Status",
      text: "Are You Sure Want To Change Status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.UPDATE_CURRENCY_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCurrencyData();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  useEffect(() => {
    GetCurrencyData();
  }, []);

  return (
    <>
      {/* Currency */}
      <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">Currency</h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[80%] pb-4">
                Currency is the system of money used in a particular country or
                region for financial transactions. It includes coins, banknotes,
                and digital forms of money. Currencies are essential for trade,
                commerce, and economic stability, enabling the exchange of goods
                and services both locally and internationally.
              </p>
              <div>
                <Button
                  onClick={() => setIsOpen(true)}
                  className="hand h-[36px] px-5  font-normal bg-black text-[0.80rem] text-white"
                >
                  Add Currency
                </Button>
              </div>
            </div>
          </div>
          {/* Currency Table */}
          <CurrencyTable
            onDelete={DeleteCurrency}
            onUpdateStatus={UpdateStatus}
            tableData={currencyData}
            GetCurrencyData={GetCurrencyData}
          />
        </div>
      </div>
      {/* Language */}
      {/* <div className="max-w-4xl mx-auto  bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className=" px-6 pt-6 ">
            <h2 className="text-[0.98rem] font-semibold mb-2">Language</h2>
            <div className="flex border-b-[1px]  border-[#E4E8EE] justify-between">
              <p className="text-[#656B7B] text-[0.80rem] w-[94%] pb-4">
                Languages are systems of communication used by people to express
                thoughts, ideas, and emotions. They serve as the foundation of
                human interaction, culture, and global connectivity
              </p>
            </div>
          </div>
          
          <LanguageTable />
        </div>
      </div> */}
      <AddCurrencyModal
        open={isOpen}
        setOpen={setIsOpen}
        GetCurrencyData={GetCurrencyData}
      />
    </>
  );
}
