// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   BarChart,
//   Settings,
//   Store,
//   ChevronRight,
//   ChevronDown,
//   PlusIcon,
//   MinusIcon,
//   Logs,
//   House,
//   Tag,
//   UserRound,
// } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { sidebarData } from "../../lib/sidebarData";

// // Mapping of icon names to Lucide icons
// const iconMap = {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   House,
//   BarChart,
//   Settings,
//   Store,
//   Logs,
//   Tag,
//   UserRound,
// };

// const Sidebar = ({ isShowMenu }) => {
//   // Dynamic state management
//   const [openStates, setOpenStates] = useState({});
//   const [isHover, setIsHover] = useState(isShowMenu);
//   const pathname = usePathname();
//   // console.log(pathname, "pathname");
//   const segments = pathname.split("/").filter(Boolean);

//   const findParent = (items, targetTitle, parent = null) => {
//     for (const item of items) {
//       if (item.title === targetTitle) return parent;
//       if (item.children) {
//         const foundParent = findParent(item.children, targetTitle, item);
//         if (foundParent) return foundParent;
//       }
//     }
//     return null;
//   };

//   // Toggle dropdown open/closed

//   const toggleDropdown = (title) => {
//     const parent = findParent(sidebarData?.mainItems, title);
//     console.log("parent ---->>", parent)
//     const siblings = parent ? parent?.children : sidebarData?.mainItems;
//     console.log("siblings ---->>", siblings)

//     setOpenStates((prev) => {
//       const newState = { ...prev };
//       // Close all sibling dropdowns
//       siblings.forEach((sibling) => {
//         if (sibling.title !== title) newState[sibling.title] = false;
//       });
//       // Toggle the current dropdown
//       newState[title] = !prev[title];
//       return newState;
//     });
//   };

//   const getInitialOpenStates = (items) => {
//     const states = {};

//     const checkItems = (itemList, parentTitles = []) => {
//       itemList.forEach((item) => {
//         const fullPathMatch =
//           item.href && pathname.includes(item.href.toLowerCase());

//         if (fullPathMatch) {
//           parentTitles.forEach((title) => {
//             states[title] = true;
//           });
//           states[item.title] = true;
//         }

//         if (item.children) {
//           checkItems(item.children, [...parentTitles, item.title]);
//         }
//       });
//     };

//     checkItems(items);
//     return states;
//   };

//   // Open menus based on current pathname
//   useEffect(() => {
//     setOpenStates(getInitialOpenStates(sidebarData.mainItems));
//   }, [pathname]);

//   // Recursive Dropdown Component
//   const RecursiveDropdown = ({ item, depth = 0 }) => {
//     const Icon = item.icon ? iconMap[item.icon] : null;
//     const isOpen = openStates[item.title] || false;

//     return (
//       <li className={`flex flex-col cursor-pointer`}>
//         <Link
//           href={item?.href || "#"}
//           className={`flex items-center  justify-between p-2 hover:bg-gray-100 rounded-md 
//             ${pathname === item.href ? "bg-gray-200" : ""}`}
//           onClick={() => {
//             if (isHover) toggleDropdown(item.title);
//           }}
//         >
//           <div className="flex items-center space-x-3">
//             {Icon && <Icon className="w-6 h-6 text-gray-600" />}
//             {/* <span className="hidden group-hover:block text-gray-700">{item.title}</span> */}
//             <span
//               className={`block text-[0.87rem] text-gray-700 ${isShowMenu ? "" : "hidden"
//                 }`}
//             >
//               {item.title}
//             </span>
//           </div>
//           {item?.isEnd ? (
//             isOpen ? (
//               <MinusIcon
//                 className={`block w-4 h-4 text-gray-600 ${isShowMenu ? "" : "hidden"
//                   }`}
//               />
//             ) : (
//               <PlusIcon
//                 className={`block w-4 h-4 text-gray-600 ${isShowMenu ? "" : "hidden"
//                   }`}
//               />
//             )
//           ) : item.children ? (
//             isOpen ? (
//               // <ChevronDown className="hidden group-hover:block w-5 h-5 text-gray-600" />
//               <ChevronDown
//                 className={`block w-4 h-4 text-gray-600 ${isShowMenu ? "" : "hidden"
//                   }`}
//               />
//             ) : (
//               // <ChevronRight className="hidden group-hover:block 6 h-5 text-gray-600" />
//               <ChevronRight
//                 className={`block w-4 h-4 text-gray-600 ${isShowMenu ? "" : "hidden"
//                   }`}
//               />
//             )
//           ) : (
//             ""
//           )}
//           {/* {item.children && (
//             isOpen ? (
//               // <ChevronDown className="hidden group-hover:block w-5 h-5 text-gray-600" />
//               <ChevronDown className={`block w-5 h-5 text-gray-600 ${isShowMenu ? '' : 'hidden'}`} />
//             ) : (
//               // <ChevronRight className="hidden group-hover:block w-5 h-5 text-gray-600" />
//               <ChevronRight className={`block w-5 h-5 text-gray-600 ${isShowMenu ? '' : 'hidden'}`} />
//             )
//           )} */}
//         </Link>

//         {isOpen && item.children && (
//           <ul className="ml-6 space-y-2">
//             {item.children.map((child, index) => {
//               if (item.title === "Occassion") return
//               else {
//                 return (
//                   <RecursiveDropdown key={index} item={child} depth={depth + 1} />
//                 )
//               }
//             })}
//           </ul>
//         )}
//       </li>
//     );
//   };

//   const handleSibarEnter = () => {
//     setIsHover(true);
//   };

//   return (
//     <aside className={`custom-scrollbar overflow-auto h-[91vh] group w-[20%] z-10 bg-white shadow-md transition-all duration-450`}>
//       {/* Sidebar Menu */}
//       <nav className="mt-4">
//         <ul className="space-y-2 pl-4 pr-4">
//           {sidebarData.mainItems.map((item, index) => (
//             <RecursiveDropdown key={index} item={item} />
//           ))}
//         </ul>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;

// Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  Store,
  ChevronRight,
  ChevronDown,
  Logs,
  House,
  Tag,
  UserRound,
  ClipboardList,
  Mail,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getSidebarData } from "../../lib/sidebarData";
import { useMe } from "@/lib/usePermissions";

// Menu title → the "view" permission the backend enforces on that section, so
// what a role can SEE matches what it can actually CALL. Items with no entry
// are always shown. Titles are matched trimmed (some sidebarData entries carry
// a trailing space, e.g. "Customers ").
const PERM_BY_TITLE = {
  "Dashboard": "dashboard_view",
  "Products": "product_list",
  "Jewellery List": "product_list",
  "Product Association": "product_list",
  "Label Master": "product_list",
  "Category (Style)": "category_list",
  "Collection": "collection_list",
  "Tags": "tag_list",
  "Size Master": "size_list",
  "Diamond": "product_list",
  "Diamond List": "product_list",
  "Metal": "metal_type_list",
  "Metal Price": "metal_type_list",
  "Charges": "labour_charge_list",
  "Stone Group": "stone_group_list",
  "Orders": "order_list",
  "Failed Orders": "order_list",
  "Custom Orders": "custom_order_list",
  "Order Inquiries": "order_inquiry_list",
  "Contact Inquiries": "contact_inquiry_list",
  "Price & Discount": "coupon_list",
  "Offer Master": "coupon_list",
  "Customers": "customer_list",
  "Customers Group": "customer_group_list",
  "CMS": "cms_view",
  "Home Page": "cms_view",
  "Category Landing": "cms_view",
  "Mega Menu": "cms_view",
  "Settings": "settings_view",
  "Payment Gateway": "settings_view",
};

// Mapping of icon names to Lucide icons
const iconMap = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  House,
  BarChart,
  Settings,
  Store,
  Logs,
  Tag,
  UserRound,
  ClipboardList,
  Mail,
  MessageSquare,
  UserCheck
};

const Sidebar = ({ isShowMenu }) => {
  const [openStates, setOpenStates] = useState({});
  const [sidebarItems, setSidebarItems] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const isExpanded = isShowMenu || isHovered;
  const { can, loaded } = useMe();

  // Hide a menu item (and prune empty parents) when the role lacks its view
  // permission. Until the profile has loaded we show everything to avoid a
  // flash of an empty sidebar; Super Admin always passes `can()`.
  const filterByPerm = (items) => {
    if (!Array.isArray(items) || !loaded) return items || [];
    return items
      .filter((it) => {
        const perm = PERM_BY_TITLE[String(it.title || "").trim()];
        return !perm || can(perm);
      })
      .map((it) => (it.children ? { ...it, children: filterByPerm(it.children) } : it))
      .filter((it) => !it.children || it.children.length > 0 || it.href);
  };

  useEffect(() => {
    const loadSidebarData = async () => {
      const data = await getSidebarData();
      setSidebarItems(data);
    };
    loadSidebarData();
  }, []);

  const findParent = (items, targetTitle, parent = null) => {
    if (!items) return null;
    for (const item of items) {
      if (item.title === targetTitle) return parent;
      if (item.children) {
        const foundParent = findParent(item.children, targetTitle, item);
        if (foundParent) return foundParent;
      }
    }
    return null;
  };

  const toggleDropdown = (title) => {
    if (!sidebarItems) return;
    const parent = findParent(sidebarItems?.mainItems, title);
    const siblings = parent ? parent?.children : sidebarItems?.mainItems;

    setOpenStates((prev) => {
      const newState = { ...prev };
      siblings.forEach((sibling) => {
        if (sibling.title !== title) newState[sibling.title] = false;
      });
      newState[title] = !prev[title];
      return newState;
    });
  };

  const getInitialOpenStates = (items) => {
    const states = {};

    const checkItems = (itemList, parentTitles = []) => {
      itemList.forEach((item) => {
        const fullPathMatch =
          item.href && pathname.includes(item.href.toLowerCase());

        if (fullPathMatch) {
          parentTitles.forEach((title) => {
            states[title] = true;
          });
          states[item.title] = true;
        }

        if (item.children) {
          checkItems(item.children, [...parentTitles, item.title]);
        }
      });
    };

    if (items) checkItems(items);
    return states;
  };

  useEffect(() => {
    if (sidebarItems) {
      setOpenStates(getInitialOpenStates(sidebarItems.mainItems));
    }
  }, [pathname, sidebarItems]);

  const RecursiveDropdown = ({ item, depth = 0 }) => {
    const Icon = item.icon ? iconMap[item.icon] : null;
    const isOpen = openStates[item.title] || false;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li className="flex flex-col cursor-pointer">
        <Link
          href={item?.href || "#"}
          className={`flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors ${isExpanded ? "justify-between" : "justify-center"} ${pathname === item.href ? "bg-gray-200 font-semibold" : ""
            }`}
          onClick={(e) => {
            if (hasChildren) {
              toggleDropdown(item.title);
            }
          }}
        >
          <div className={`flex items-center ${isExpanded ? "space-x-3" : "justify-center w-full"}`}>
            {Icon && <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />}
            <span
              className={`text-[0.87rem] text-gray-700 whitespace-nowrap overflow-hidden ${isExpanded ? "block" : "hidden"
                }`}
            >
              {item.title}
            </span>
          </div>
          {hasChildren && (
            isOpen ? (
              <ChevronDown
                className={`w-4 h-4 text-gray-600 ${isExpanded ? "block" : "hidden"
                  }`}
              />
            ) : (
              <ChevronRight
                className={`w-4 h-4 text-gray-600 ${isExpanded ? "block" : "hidden"
                  }`}
              />
            )
          )}
        </Link>

        {isOpen && hasChildren && isExpanded && (
          <ul className="ml-6 space-y-2">
            {item.children.map((child, index) => (
              <RecursiveDropdown key={index} item={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`custom-scrollbar overflow-x-hidden overflow-y-auto h-[91vh] z-10 bg-white shadow-md transition-all duration-300 ${isExpanded ? "w-[250px] md:w-[20%]" : "w-0 md:w-[80px]"}`}
    >
      <nav className="mt-4">
        <ul className={`space-y-2 ${isExpanded ? "pl-4 pr-4" : "pl-2 pr-2 md:pl-4 md:pr-4"}`}>
          {filterByPerm(sidebarItems?.mainItems).map((item, index) => (
            <RecursiveDropdown key={index} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
