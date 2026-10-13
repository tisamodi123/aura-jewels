"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, ShoppingCart, User, Package, Tag, MapPin, Calendar, Bell, Languages , Lock, FileText, Home, MessageSquare, Megaphone } from "lucide-react";

const menuItems = [
  { name: "General", href: "/settings/general", icon: <Home size={18} /> },
  { name: "Users And Permissions", href: "/settings/users-and-permissions", icon: <Users size={18} /> },
  { name: "Payments", href: "/settings/payments", icon: <CreditCard size={18} /> },
  { name: "SMS Gateway (OTP)", href: "/settings/sms", icon: <MessageSquare size={18} /> },
  { name: "Offer Popup", href: "/settings/offer-popup", icon: <Megaphone size={18} /> },
  { name: "Checkout", href: "/settings/checkout", icon: <ShoppingCart size={18} /> },
  { name: "Customer Accounts", href: "/settings/customer-accounts", icon: <User size={18} /> },
  { name: "Shipping And Delivery", href: "/settings/shipping-and-delivery", icon: <Package size={18} /> },
  { name: "Taxes And Duties", href: "/settings/taxes-and-duties", icon: <Tag size={18} /> },
  { name: "Locations", href: "/settings/locations", icon: <MapPin size={18} /> },
  { name: "Customer Events", href: "/settings/customer-events", icon: <Calendar size={18} /> },
  { name: "Notifications", href: "/settings/notifications", icon: <Bell size={18} /> },
  { name: "Languages", href: "/settings/languages", icon: <Languages  size={18} /> },
  { name: "Customer Privacy", href: "/settings/customer-privacy", icon: <Lock size={18} /> },
  { name: "Policies", href: "/settings/policies", icon: <FileText size={18} /> },
];

const SettingSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-60 h-[50%] rounded-md border border-gray-200 p-4 bg-white shadow-sm sticky top-0">
      <nav>
        <ul>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <li
                key={index}
                className={`mb-2 p-1 rounded-lg flex items-center text-[#656B7B] 
                  ${isActive ? "font-bold text-black" : ""}`}
              >
                {item.icon}
                <Link href={item.href} className="ml-2 text-sm font-medium">
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-5 p-2 bg-white shadow-sm rounded-lg flex items-center border w-full">
        <div className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold bg-black">
          YA
        </div>
        <div className="ml-3 flex flex-col overflow-hidden">
          <p className="text-sm font-semibold truncate">Yashraj Ahirrao</p>
          <p className="text-xs text-gray-500 truncate">yashrajahirrao88@gmail.com</p>
        </div>
      </div>

    </div>
  );
};

export default SettingSidebar;
