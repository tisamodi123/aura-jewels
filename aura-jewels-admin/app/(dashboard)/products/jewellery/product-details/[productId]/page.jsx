
import { MoveLeft } from "lucide-react";
import React from "react";
import DiamondDetailTable from "../_components/diamondDetail";
import Image from "next/image";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import ImageWithFallback from "@/components/ImageWithFallback";

async function getProductDetails(productId, token) {
  try {
    const data = await callApi(`${API_URL.GET_JEWELLERY_DETAIL}/${productId}`, "GET", null, token);
    return data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

function calculateTotalWeight(stoneDetails) {
  if (!stoneDetails || !Array.isArray(stoneDetails)) return 0;

  return stoneDetails.reduce((total, stone) => {
    const weight = parseFloat(stone.wgt) || 0;
    return total + weight;
  }, 0);
}



export default async function ProductDetailPage({ params }) {
  const measurements = [
    { label: "Setting Height", value: "-" },
    { label: "Setting Depth", value: "-" },
    { label: "Shoulder Width", value: "-" },
    { label: "Shank Width", value: "-" },
    { label: "Band Thickness", value: "-" },
  ];
  const cokiestore = cookies();

  const token = await cokiestore.get("aura-admin-token")?.value;

  const { productId } = await params;
  const productData = await getProductDetails(productId, token);
  const jewelleryDetailsData = productData?.data || [];
  const totalWeight = calculateTotalWeight(jewelleryDetailsData?.stoneDetails);

  return (
    <div>
      <div className="pt-2">
        <div className="mb-6 flex  items-center gap-2 cursor-pointer">
          <Link href={`/products/jewellery`}>
            <MoveLeft />
          </Link>
          <span className="text-xl font-semibold"> Jewellery List</span>
        </div>
      </div>
      <div className=" px-6 py-6 bg-white rounded-lg mb-6 shadow-sm">
        <div className="">
          <div className="border-b-[1px] border-[#E4E8EE] mb-6">
            <h2 className="text-[1.2rem] font-semibold mb-6">
              Jewellery Details
            </h2>
            <div className=" text-[0.90rem] pb-4">
              <p className="mb-2">
                <span className="font-semibold">Product Title</span> :{" "}
                <span>{jewelleryDetailsData?.productTitle}</span>
              </p>
              <p>
                <span className="font-semibold">Product Description :</span>{" "}
                {jewelleryDetailsData?.productDesc}
              </p>
            </div>
          </div>
          {/* Price Design Code */}
          <div
            className="border-b-[1px] pb-6 border-[#E4E8EE]"
            title="price-and-designcode"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border border-[#E4E8EE] p-6 rounded-md">
              {/* Left Column */}
              <div className="space-y-2 text-[0.90rem]">
                <div className="flex justify-between">
                  <div className="font-semibold">Price :</div>
                  <div>
                    $ {Math.round(jewelleryDetailsData?.finalPrice * 100) / 100}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Item Code :</div>
                  <div>{jewelleryDetailsData?.itemCode || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Parent Item Code :</div>
                  <div>{jewelleryDetailsData?.parentItem || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Metal Type :</div>
                  <div>{jewelleryDetailsData?.metalType || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Metal Stemp :</div>
                  <div>{jewelleryDetailsData?.metalStamp || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Setting Type :</div>
                  <div>{jewelleryDetailsData?.settingType || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Metal Weight (Approx) :</div>
                  <div>{jewelleryDetailsData?.appxMetalWgt || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Qty :</div>
                  <div>1</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Item Size :</div>
                  <div>50</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Labour Code :</div>
                  <div>{jewelleryDetailsData?.labourCode || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Other Charges Code :</div>
                  <div>{jewelleryDetailsData?.otherChargeCode ? jewelleryDetailsData?.otherChargeCode : "N/A"}</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2 text-[0.90rem]">
                <div className="flex justify-between">
                  <div className="font-semibold">Design Code :</div>
                  <div>{jewelleryDetailsData?.designCode || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Same Design Code :</div>
                  <div>{"SJR59122" || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Category :</div>
                  <div>{jewelleryDetailsData?.category || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Sub Category :</div>
                  <div>
                    {jewelleryDetailsData?.subCategories?.join(",") || "N/A"}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Collection :</div>
                  <div>
                    {jewelleryDetailsData?.collection?.join(",") || "N/A"}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Tag :</div>
                  <div> {jewelleryDetailsData?.tags?.join(",") || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Markup :</div>
                  <div>{jewelleryDetailsData?.markup || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Tag Fact :</div>
                  <div>{jewelleryDetailsData?.tagFact || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Gender :</div>
                  <div>{jewelleryDetailsData?.gender || "N/A"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Have Chain :</div>
                  <div>{jewelleryDetailsData?.haveChain || "N/A"}</div>
                </div>
                {(jewelleryDetailsData?.haveChain === "Yes" || jewelleryDetailsData?.cWgt || jewelleryDetailsData?.cLength) && (
                  <>
                    <div className="flex justify-between">
                      <div className="font-semibold">Chain Weight :</div>
                      <div>{jewelleryDetailsData?.cWgt ? `${jewelleryDetailsData.cWgt} g` : "N/A"}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-semibold">Chain Length :</div>
                      <div>{jewelleryDetailsData?.cLength || "N/A"}</div>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <div className="font-semibold">Is Engraving :</div>
                  <div>
                    {(jewelleryDetailsData?.isEngraving ? "Yes" : "No") ||
                      "N/A"}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="font-semibold">Shipment Days :</div>
                  <div>{jewelleryDetailsData?.shipmentDays || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Diamond Details */}
          <div>
            <div className="pt-6 flex items-center justify-between">
              <h2 className="text-[1.2rem] font-semibold mb-6">
                Diamond Details
              </h2>
              <h2 className="text-[0.98rem] font-semibold mb-6">
                Total Weight (ct): {totalWeight.toFixed(2)} ct
              </h2>
            </div>
            {/* Table */}
            <DiamondDetailTable
              tableData={jewelleryDetailsData?.stoneDetails}
            />
          </div>
          {/* Product Video and Images */}
          <div className="mt-8 flex flex-col border-b-[1px] border-[#E4E8EE] lg:flex-row gap-6 items-start">
            {/* Single Video Section */}
            <div title="single-video" className="mb-6">
              <h2 className="text-[1rem] font-semibold mb-4">Product Video</h2>
              <div className="w-[300px] h-[200px] bg-black rounded overflow-hidden shadow">
                <video
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source
                    src={jewelleryDetailsData?.videoUrl}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Image Gallery Section */}
            <div
              title="image"
              className="flex-1 max-w-full overflow-x-auto scroll-hidden"
            >
              <h2 className="text-[1rem] font-semibold mb-4">Product Images</h2>
              <div className=" pb-2">
                <div className="flex gap-4">
                  {jewelleryDetailsData?.images?.map((img, i) => (
                    <ImageWithFallback
                      key={i}
                      src={img?.MediaLocation}
                      height={200}
                      width={200}
                      alt={`Product Image ${i + 1}`}
                      className="object-cover rounded shadow shrink-0"
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>
          {/* Other Details */}
          <div>
            <div className="pt-6 flex items-center justify-between">
              <h2 className="text-[1.2rem] font-semibold mb-6">
                Other Details
              </h2>
            </div>
          </div>
          {/* Measurment Table */}
          <table className="w-full border rounded-md  border-[#E4E8EE] text-sm">
            <tbody>
              <tr className="border-t  border-[#E4E8EE]">
                <td className="px-4 py-2   border-[#E4E8EE] font-medium">
                  Setting Heigth
                </td>
                <td className="px-4 py-2 text-right">
                  {jewelleryDetailsData?.settingHeight ? jewelleryDetailsData?.settingHeight : "N/A"}
                </td>
              </tr>
              <tr className="border-t  border-[#E4E8EE]">
                <td className="px-4 py-2   border-[#E4E8EE] font-medium">
                  Setting Depth
                </td>
                <td className="px-4 py-2 text-right">
                  {jewelleryDetailsData?.settingDepth || "N/A"}
                </td>
              </tr>
              <tr className="border-t  border-[#E4E8EE]">
                <td className="px-4 py-2   border-[#E4E8EE] font-medium">
                  Shoulder Width
                </td>
                <td className="px-4 py-2 text-right">
                  {jewelleryDetailsData?.shoulderWidth || "N/A"}
                </td>
              </tr>
              <tr className="border-t  border-[#E4E8EE]">
                <td className="px-4 py-2   border-[#E4E8EE] font-medium">
                  Shank Width
                </td>
                <td className="px-4 py-2 text-right">
                  {jewelleryDetailsData?.shankWidth || "N/A"}
                </td>
              </tr>
              <tr className="border-t  border-[#E4E8EE]">
                <td className="px-4 py-2   border-[#E4E8EE] font-medium">
                  Band Thickness
                </td>
                <td className="px-4 py-2 text-right">
                  {jewelleryDetailsData?.bandThickness || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
