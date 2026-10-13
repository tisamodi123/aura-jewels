"use client";

import React from "react";
import {
  Store,
  Users,
  ShieldCheck,
  CreditCard,
  PackageOpen,
  Receipt,
  Bell,
  Globe,
  FileText,
  Mail,
  Clipboard,
  Search,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/usePermissions";

export default function SeedBar() {
  const router = useRouter();
  const pathname = usePathname();
  const afterSettings = pathname.split("/settings/")[1];
  const { me, can } = useMe();

  // The staff model uses a single `name` field.
  const fullName = (me?.name || "").trim();
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  function MenuItem({ icon, label, path }) {
    return (
      <div
        onClick={() => router.push(`/settings/${path}`)}
        className={`flex items-center  px-3 py-2 text-gray-700 hover:bg-gray-100 ${afterSettings === path && "bg-gray-200"
          } rounded-md cursor-pointer transition-colors`}
      >
        <span className="text-gray-500">{icon}</span>
        <span className="ml-3 text-sm">{label}</span>
      </div>
    );
  }
  return (
    <aside className="w-64 h-[85vh] flex justify-between flex-col bg-white shadow-sm rounded-lg p-4">
      <nav className="space-y-1">
        {/* <MenuItem icon={<Store size={18} />} label="General" path={"general"} /> */}
        <MenuItem path={"users"} icon={<Users size={18} />} label="Staff" />
        {can("permission_view") && (
          <MenuItem
            icon={<ShieldCheck size={18} />}
            label="Roles & Permissions"
            path={"role-and-permission"}
          />
        )}
        {/* <MenuItem
          icon={<CreditCard size={18} />}
          label="Payment Gateway"
          path={"payment-gateway"}
        /> */}
        {/* <MenuItem
          icon={<PackageOpen size={18} />}
          label="Shipping & Delivery"
          path={"shipping-and-delivery"}
        /> */}
        {/* <MenuItem
          icon={<Receipt size={18} />}
          label="Taxes And Duties"
          path={"tax-and-duties"}
        /> */}
        {/* <MenuItem
          icon={<Bell size={18} />}
          label="Notifications"
          path={"notifications"}
        /> */}
        <MenuItem
          icon={<Globe size={18} />}
          label="Languages & Currency"
          path={"langauge-and-currency"}
        />
        <MenuItem
          icon={<Search size={18} />}
          label="SEO Settings"
          path={"seo"}
        />
        {/* <MenuItem
          icon={<FileText size={18} />}
          label="Policies"
          path={"policies"}
        /> */}
        {/* <MenuItem
          icon={<Mail size={18} />}
          label="Email Configuration"
          path={"email-configuration"}
        /> */}
        {/* <MenuItem
          icon={<Clipboard size={18} />}
          label="Guideline Files"
          path={"guideline-files"}
        /> */}
      </nav>

      <div className="mt-8 flex items-center p-3 bg-black text-white rounded-md">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white text-black rounded-md font-semibold text-sm">
          {initials || "N/A"}
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-sm font-medium truncate">{fullName || "Staff"}</p>
          <p className="text-xs text-gray-300 truncate">{me?.email || ""}</p>
        </div>
      </div>
    </aside>
  );
}
