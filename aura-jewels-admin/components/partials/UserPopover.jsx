"use client";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, UserRound } from "lucide-react";
import Cookies from "js-cookie";
import { clearToken } from "@/lib/auth";

export default function UserPopover({ children }) {
  const handleLogout = () => {
    clearToken();
    window.location.reload();
  };
  return (
    <Popover className="z-[9999]">
      <PopoverTrigger asChild>
        <div>{children}</div>
      </PopoverTrigger>
      <PopoverContent className="w-60 z-[9999]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium border-b-[1px] pb-3">
              My Account
            </h4>
            <p className="text-muted-foreground flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-2 py-2 rounded-md text-sm">
              {" "}
              <span>
                <UserRound size={18} color="black" />
              </span>
              <span className="text-black"> Profile</span>
            </p>
            <p
              onClick={handleLogout}
              className="text-muted-foreground flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-2 py-2 rounded-md text-sm"
            >
              <span>
                <LogOut size={18} color="black" />
              </span>
              <span className="text-black"> Logout</span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
