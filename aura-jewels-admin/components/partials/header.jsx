"use client";
import Image from "next/image";
import { Search, Bell, Menu, AlignJustify } from "lucide-react";
import { useState, useEffect } from "react";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import UserPopover from "./UserPopover";
import { STATUS_CODE } from "@/lib/Constant";
import { useMe } from "@/lib/usePermissions";

const Header = ({ isShowMenu, handleShowMenu }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(isShowMenu);
  const [isUserProfile, setIsUserProfile] = useState(false);

  // Logged-in staff profile via the shared cached hook (same source the
  // settings card uses — the old raw fetch here was failing → "N/A").
  const { me, loaded } = useMe();
  const userData = me;
  const loading = !loaded;

  // The staff model uses a single `name` field — derive initials from it.
  function getInitials(name) {
    return (name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  useEffect(() => {
    handleShowMenu(isMenuOpen);
  }, [isMenuOpen]);

  const handleUserPopover = () => {
    setIsUserProfile((prev) => !prev);
  };

  const userName = (userData?.name || "").trim();

  const firstTwoCharacters = getInitials(userData?.name);

  return (
    <>
      <header className="bg-[#1A1919] relative z-[999]  text-white px-4 md:px-6 py-4  h-[9vh] shadow-md flex items-center justify-between">
        {/* Left Section: Logo & Search Bar */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Image
            src="https://th.bing.com/th/id/R.86fd9693aeb180ef221a26ff447ecd22?rik=1BZHDyEdim3STw&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fshopify-logo-png-shopify-1000.png&ehk=PFPZn4GmJrZesVzyRiQnd2MV7eVc610dHwLtbbZzCp8%3d&risl=&pid=ImgRaw&r=0"
            width={120}
            height={60}
            alt="Shopify Logo"
            className="h-8 w-auto md:h-10 hidden"
            unoptimized
            draggable="false"
          />

          <AlignJustify
            className="hand"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Right Section: Icons & Profile */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div>
              <UserPopover>
                <div className="w-8 h-8 cursor-pointer bg-white text-black flex items-center justify-center rounded-lg font-semibold">
                  {firstTwoCharacters ? firstTwoCharacters : "N/A"}
                </div>
              </UserPopover>
            </div>
            <p className="hidden md:block text-sm font-medium">
              {userData == null && loading
                ? "Loading...."
                : userData && !loading
                ? `${userName}`
                : "N/A"}
            </p>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hover:text-gray-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#1A1919] text-white shadow-lg md:hidden">
            <div className="flex flex-col p-4 gap-3">
              <button className="bg-[#363636] border rounded-md px-4 py-2 border-[#4B4B4B]">
                View Store
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-semibold">
                  {firstTwoCharacters ? firstTwoCharacters : "N/A"}
                </div>
                <p className="text-sm font-medium">
                  {" "}
                  {userData == null && loading
                    ? "Loading...."
                    : userData && !loading
                    ? `${userName}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
