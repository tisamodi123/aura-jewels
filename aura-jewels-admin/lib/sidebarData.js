// import { GetAllParaTypes } from "./API_Data";

// import { GetParaTypesWithLabels } from "./API_Data";
import { PARA_TYPES } from "./Constant";

// const ParaTypeList = await GetAllParaTypes();

// const DiaParaType =
//   ParaTypeList?.length > 0
//     ? ParaTypeList?.filter((O) => O.type == "DIAMOND")
//     : [];

// const JewellParaType =
//   ParaTypeList?.length > 0
//     ? ParaTypeList?.filter((O) => O.type == "JEWELLERY")
//     : [];

// const DiaParaTypeObj = DiaParaType?.length > 0
//   ? DiaParaType.filter((V) => V.name !== "Carat")
//     .map((V) => {
//       return {
//         title: V.name,
//         href: `/parameter/${V.name?.toLowerCase()}/${V.id}`,
//         hasDropdown: false,
//       };
//     })
//   : [];

// const JewellParaTypeObj =
//   JewellParaType?.length > 0
//     ? JewellParaType.map((V) => {
//       return {
//         title: V.name,
//         href: `/parameter/${V.name?.toLowerCase()}/${V.id}`,
//         hasDropdown: false,
//       };
//     })
//     : [];

// // For Collection Sub Routes
// let collectionChildren = [];
// if (JewellParaTypeObj.length > 0) {
//   collectionChildren = JewellParaTypeObj.filter((item) => {
//     return item.title === "Collection" || item.title === "Tags";
//   }).map((item) => {
//     if (item.title === "Collection") {
//       // return null
//       return {
//         ...item,
//         title: "Occassion",
//       };
//     } else {
//       return item;
//     }
//   });
// }

// // For Jewellery Sub Routes
// let jewelleryChildren = [];

// if (JewellParaTypeObj.length > 0) {
//   jewelleryChildren = JewellParaTypeObj.filter(
//     (item) => item.title !== "Collection" && item.title !== "Tags"
//   );
//   const newOrder = ["MetalType", "MetalStamp", "SettingType"];
//   jewelleryChildren = newOrder.map((title) =>
//     jewelleryChildren.find((item) => item.title === title)
//   );
// }

// // For Collection Sub Routes

// let sizeAndDimentsion = [];

// if (JewellParaTypeObj.length > 0) {
//   sizeAndDimentsion = JewellParaTypeObj.filter((item) => {
//     return (
//       item.title === "RingSize" ||
//       item.title === "BraceletSize"
//       // ||
//       // item.title === "CenterStoneSize"
//     );
//   });
// }

// export const sidebarData = {
//   mainItems: [
//     {
//       title: "Dashboard",
//       href: "/dashboard",
//       icon: "LayoutDashboard",
//       hasDropdown: false,
//     },
//     {
//       title: "Products",
//       icon: "Package",
//       hasDropdown: true,
//       children: [
//         {
//           title: "Category (Style)",
//           href: "/category",
//           hasDropdown: false,
//         },
//         {
//           title: "Collection",
//           href: "/collections",
//           hasDropdown: true,
//           children: [...collectionChildren],
//         },
//         {
//           title: "Jewellery",
//           href: "/products/jewellery",
//           hasDropdown: true,
//           children: [
//             {
//               title: "Attributes",
//               hasDropdown: true,
//               isEnd: true,
//               children: [
//                 ...jewelleryChildren,
//                 {
//                   title: "Karat Purity",
//                   href: "/karatpurity",
//                   hasDropdown: false,
//                 },
//               ],
//             },
//             {
//               title: "Price & Charges",
//               hasDropdown: true,
//               isEnd: true,
//               children: [
//                 // {
//                 //   title: "Currency",
//                 //   href: "/currency",
//                 //   hasDropdown: false,
//                 // },
//                 {
//                   title: "Diamond Margin",
//                   href: "/diamond-margin",
//                   hasDropdown: false,
//                 },
//                 {
//                   title: "Metal Price",
//                   href: "/metalprice",
//                   hasDropdown: false,
//                 },
//                 {
//                   title: "Labour Charge",
//                   href: "/labourcharge",
//                   hasDropdown: false,
//                 },
//                 {
//                   title: "Other Charge",
//                   href: "/othercharge",
//                   hasDropdown: false,
//                 },
//                 // {
//                 //   title: "Volume Discount",
//                 //   href: "/volumedisc",
//                 //   hasDropdown: false,
//                 // },
//                 {
//                   title: "Stone Group",
//                   href: "/stone-group",
//                   hasDropdown: false,
//                 },
//               ],
//             },
//             {
//               title: "Size & Dimension",
//               hasDropdown: true,
//               isEnd: true,
//               children: [...sizeAndDimentsion],
//             },
//           ],
//         },
//         {
//           title: "Diamond",
//           href: "/products/diamond",
//           hasDropdown: true,
//           children: [
//             ...DiaParaTypeObj,
//             {
//               title: "Vendor",
//               href: "/vendor",
//               hasDropdown: false,
//             },
//           ],
//         },
//       ],
//     },

//     {
//       title: "Orders",
//       href: "/orders",
//       icon: "ShoppingCart",
//       // hasDropdown: true,
//       // children: [
//       //   {
//       //     title: "Abandon Checkout",
//       //     href: "/orders/abandon-checkout",
//       //     hasDropdown: false,
//       //   },
//       // ],
//     },
//     {
//       title: "Failed Order",
//       href: "/failedorder",
//       icon: "ShoppingCart",
//       // hasDropdown: true,
//       // children: [
//       //   {
//       //     title: "Abandon Checkout",
//       //     href: "/orders/abandon-checkout",
//       //     hasDropdown: false,
//       //   },
//       // ],
//     },
//     {
//       title: "Price & Discount",
//       icon: "Tag",
//       hasDropdown: true,
//       children: [
//         {
//           title: "Coupon",
//           href: "/price-and-discount/coupon",
//           hasDropdown: false,
//         },
//       ],
//     },
//     {
//       title: "Customers",
//       href: "/customer-master",
//       icon: "UserRound",
//       hasDropdown: true,
//     },
//     {
//       title: "CMS",
//       icon: "House",
//       hasDropdown: true,
//       children: [
//         {
//           title: "Home",
//           hasDropdown: true,
//           children: [
//             {
//               title: "Home MainSlider",
//               href: "/cms/home/section-1",
//               hasDropdown: false,
//             },
//             {
//               title: "Category Title",
//               href: "/cms/home/section-2",
//               hasDropdown: false,
//             },
//             {
//               title: "Category",
//               href: "/cms/home/category",
//               hasDropdown: false,
//             },
//             {
//               title: "Session 3",
//               href: "/cms/home/section-3",
//               hasDropdown: false,
//             },
//             {
//               title: "Most Love Products",
//               href: "/cms/home/section-4",
//               hasDropdown: false,
//             },
//             {
//               title: "Home Center Slider",
//               href: "/cms/home/section-5",
//               hasDropdown: false,
//             },
//             {
//               title: "Collection Slider",
//               href: "/cms/home/section-6",
//               hasDropdown: false,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: "Settings",
//       icon: "Settings",
//       href: "/settings",
//       hasDropdown: true,
//     },
//   ],
// };

// sidebarData.js
export const getSidebarData = async () => {
  const ParaTypeList = PARA_TYPES;

  const DiaParaType = ParaTypeList?.length > 0
    ? ParaTypeList?.filter((O) => O.type == "DIAMOND")
    : [];

  const JewellParaType = ParaTypeList?.length > 0
    ? ParaTypeList?.filter((O) => O.type == "JEWELLERY")
    : [];

  const DiaParaTypeObj = DiaParaType?.length > 0
    ? DiaParaType.map((V) => ({
        title: V.name,
        href: `/parameter/${V.name?.toLowerCase()}`,
        hasDropdown: false,
      }))
    : [];

  const JewellParaTypeObj = JewellParaType?.length > 0
    ? JewellParaType.map((V) => ({
      title: V.name,
      // href: `/parameter/${V.name?.toLowerCase()}`,
      href: `${V.href}`,
      hasDropdown: false,
    }))
    : [];

  // For Collection Sub Routes - Only Collection and Tags
  const collectionChildren = JewellParaTypeObj.length > 0
    ? JewellParaTypeObj.filter((item) => item.title === "Tags")
    : [];

  // For Jewellery Sub Routes
  let jewelleryChildren = [];
  if (JewellParaTypeObj.length > 0) {
    jewelleryChildren = JewellParaTypeObj.filter(
      (item) => item.title !== "Tags"
    );
    const newOrder = ["MetalType", "MetalStamp", "SettingType"];
    jewelleryChildren = newOrder
      .map((title) => jewelleryChildren.find((item) => item.title === title))
      .filter(Boolean);
  }

  // Size and Dimension
  const sizeAndDimension = JewellParaTypeObj.length > 0
    ? JewellParaTypeObj.filter((item) =>
      item.title === "RingSize" || item.title === "BraceletSize"
    )
    : [];

  return {
    mainItems: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        hasDropdown: false,
      },
      {
        title: "Products",
        icon: "Package",
        hasDropdown: true,
        children: [
          {
            title: "Category (Style)",
            href: "/category",
            hasDropdown: false,
          },
          {
            title: "Collection",
            href: "/collections",
            hasDropdown: true,
            children: collectionChildren,
          },
          {
            title: "Tags",
            href: "/tags",
            hasDropdown: false,
          },
          {
            title: "Jewellery",
            // href: "/products/jewellery",
            hasDropdown: true,
            children: [
              {
                title: "Jewellery List",
                href: "/products/jewellery",
                hasDropdown: false,
              },
              {
                title: "Product Association",
                href: "/product-association",
                hasDropdown: false,
              },
              {
                title: "Attributes",
                hasDropdown: true,
                isEnd: true,
                children: [
                  // ...jewelleryChildren,
                  {
                    title: "Metal",
                    href: "/metal-master",
                    hasDropdown: false,
                  },
                  // {
                  //   title: "Karat Purity",
                  //   href: "/karatpurity",
                  //   hasDropdown: false,
                  // },
                ],
              },
              {
                title: "Price & Charges",
                hasDropdown: true,
                isEnd: true,
                children: [
                  // {
                  //   title: "Diamond Margin",
                  //   href: "/diamond-margin",
                  //   hasDropdown: false,
                  // },
                  {
                    title: "Metal Price",
                    href: "/metalprice",
                    hasDropdown: false,
                  },
                  {
                    title: "Charges",
                    href: "/charges",
                    hasDropdown: false,
                  },
                  // {
                  //   title: "Labour Charge",
                  //   href: "/labourcharge",
                  //   hasDropdown: false,
                  // },
                  // {
                  //   title: "Other Charge",
                  //   href: "/othercharge",
                  //   hasDropdown: false,
                  // },
                  {
                    title: "Stone Group",
                    href: "/stone-group",
                    hasDropdown: false,
                  },
                  {
                    title: "Label Master",
                    href: "/label-master",
                    hasDropdown: false,
                  },
                ],
              },
              {
                title: "Size Master",
                href: "/size-master",
                hasDropdown: false,
                isEnd: true,
              },
              // {
              //   title: "Size & Dimension",
              //   hasDropdown: true,
              //   isEnd: true,
              //   children: sizeAndDimension,
              // },
            ],
          },
          {
            title: "Diamond",
            hasDropdown: true,
            children: [
              {
                title: "Diamond List",
                href: "/products/diamond",
                hasDropdown: false,
              },
              ...DiaParaTypeObj,
            ],
          },
        ],
      },
      {
        title: "Orders",
        href: "/orders",
        icon: "ShoppingCart",
      },
      {
        title: "Failed Orders",
        href: "/failedorder",
        icon: "ShoppingCart",
      },
      {
        title: "Custom Orders",
        href: "/custom-order",
        icon: "ClipboardList",
      },
      {
        title: "Order Inquiries",
        href: "/order-inquiry",
        icon: "Mail",
      },
      {
        title: "Contact Inquiries",
        href: "/contact-inquiry",
        icon: "MessageSquare",
      },
      {
        title: "Subscribers",
        href: "/subscribers",
        icon: "UserCheck",
      },
      {
        title: "Price & Discount",
        icon: "Tag",
        hasDropdown: true,
        children: [
          {
            title: "Coupon",
            href: "/discount/coupon",
            hasDropdown: false,
          },
          {
            title: "Offer Master",
            href: "/discount/Offers",
            hasDropdown: false,
          },
        ],
      },
      {
        title: "Customers ",
        // href: "/customer-master",
        icon: "UserRound",
        hasDropdown: true,
        children: [
          {
            title: "Customers",
            href: "/customer-master",
            hasDropdown: false,
          },
          // {
          //   title: "Customers Group",
          //   href: "/customer-group",
          //   hasDropdown: false,
          // },
        ]
      },
      {
        title: "CMS",
        icon: "House",
        hasDropdown: true,
        children: [
          {
            title: "Home Page",
            href: "/cms/home",
            hasDropdown: false,
          },
          {
            title: "Category Landing",
            href: "/cms/landing",
            hasDropdown: false,
          },
          {
            title: "Mega Menu",
            href: "/menus",
            hasDropdown: false,
          },
        ],
      },
      {
        title: "Settings",
        icon: "Settings",
        href: "/settings",
        hasDropdown: true,
      },
      {
        title: "Payment Gateway",
        icon: "Settings",
        href: "/payment-gateway",
        hasDropdown: false,
      },
    ],
  };
};
