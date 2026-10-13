"use client";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
// import DataTable from "react-data-table-component";
import { HomeIcon, PlusIcon } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";
import CollectionModal from "./_components/CollectionModal";
import "../../../styles/collectiontable.css";
import Image from "next/image";
import CollectionTable from "./_components/CollectionTable";
import CollectionProductListDrawer from "./_components/CollectionProductListDrawer";
import { useDebounce } from "use-debounce";

const CollectionMaster = () => {
  const token = getToken();

  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [collectionList, setCollectionList] = useState([]);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openProductListDrawer, setOpenProductListDrawer] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);

  const GetCollectionList = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("page", pagination.pageIndex + 1);
    formData.append("limit", pagination.pageSize);
    formData.append("search", debouncedSearch);
    callApi(`${API_URL?.COLLECTIONS_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCollectionList(result?.data);
          const count = result?.pagination?.total || result?.totalCount || result?.count || result?.total || 0;
          setTotalRows(count);
        }
        setLoading(false);
      });
  };

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
        callApi(`${API_URL?.UPDATE_COLLECTIONS_STATUS}/${id}`, "PUT", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCollectionList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  const DeleteCollection = (id) => {
    Swal.fire({
      title: "Delete Collection",
      text: "Are You Sure Want To Delete Collection?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_COLLECTIONS}/${id}`, "DELETE", null, token)
          .then((result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCollectionList();
            } else {
              toast.error(result?.message);
            }
          });
      }
    });
  };

  // const columns = [
  //   {
  //     name: "No",
  //     selector: (row, index) => {
  //       return index + 1;
  //     },
  //   },
  //   {
  //     name: "Collection Name",
  //     selector: (row) => row.collectionName,
  //   },
  //   {
  //     name: "Image",
  //     cell: (row) => {
  //       return <img src={`${row?.image1}`} />;
  //     },
  //   },
  //   {
  //     name: "Slug",
  //     selector: (row) => row.slug,
  //   },
  //   {
  //     name: "Description",
  //     selector: (row) => row.description,
  //   },
  //   {
  //     name: "Status",
  //     cell: (row) => {
  //       return (
  //         <span
  //           className={`hand px-4 py-2 text-xs rounded-md ${row.status == "ACTIVE"
  //             ? "bg-green-100 text-green-700"
  //             : "bg-red-100 text-red-700"
  //             } `}
  //           onClick={() => UpdateStatus(row?.id)}
  //         >
  //           {row.status}
  //         </span>
  //       );
  //     },
  //   },
  //   {
  //     name: "Action",
  //     cell: (row) => {
  //       return (
  //         <>
  //           {/* <div className="pr-5">
  //                       <Link href={'/'}>
  //                           <PlusIcon
  //                               size={18}
  //                               className="cursor-pointer text-blue-900"                        
  //                           />
  //                       </Link>
  //                   </div> */}
  //           <div>
  //             <MdEdit
  //               color="green"
  //               className="hand hover: rounded-lg hover:bg-green-200 p-1"
  //               size={30}
  //               onClick={() => handleShowModal(row)}
  //             />
  //           </div>
  //           <div className="ml-5">
  //             <MdDelete
  //               color="red"
  //               className="hand hover: rounded-lg hover:bg-red-200 p-1"
  //               size={30}
  //               onClick={() => console.log("row ===>", row.id)}
  //             // onClick={() =>  DeleteCollection(row?.id || row?._id)}
  //             />
  //           </div>
  //         </>
  //       );
  //     },
  //   },
  // ];

  // Edit loads the full collection by id so the modal gets pageBanner +
  // interProductBanners (the list endpoint is slim). Add path opens the
  // modal with an empty rowData.
  const handleShowModal = async (rowData = "") => {
    // Row data may carry `id` OR `_id` depending on the list source — accept
    // either so Edit doesn't silently fall through to the Create branch.
    const rowId = rowData?.id || rowData?._id;
    if (rowId) {
      try {
        const res = await callApi(
          `${API_URL.GET_COLLECTION_BY_ID}/${rowId}`,
          "GET",
          null,
          token,
        );
        if (res?.errorCode === STATUS_CODE.OK && res.data) {
          setRowData(res.data);
          setOpenDrawer(true);
          return;
        }
        toast.error(res?.message || "Failed to load collection");
        return;
      } catch (err) {
        toast.error("Failed to load collection");
        return;
      }
    }
    setRowData({});
    setOpenDrawer(true);
  };

  const handleShowProductList = (collectionData) => {
    setSelectedCollection(collectionData);
    setOpenProductListDrawer(true);
  };

  useEffect(() => {
    GetCollectionList();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);



  return (
    <>
      <div className=" p-2 mb-3 flex items-center justify-between">
        <div className="font-semibold">Collection</div>
        <Button
          className="hand bg-black text-white"
          onClick={() => handleShowModal()}
        >
          Create Collection
        </Button>
      </div>
      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        <div>
          <CollectionTable
            onUpdateStatus={UpdateStatus}
            onEdit={handleShowModal}
            onDelete={DeleteCollection}
            onAddProducts={handleShowProductList}
            tableData={collectionList}
            pagination={pagination}
            setPagination={setPagination}
            loading={loading}
            totalRows={totalRows}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </div>
      </div>

      <CollectionModal
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetCollectionList={GetCollectionList}
        rowData={rowData}
        setRowData={setRowData}
      />

      <CollectionProductListDrawer
        open={openProductListDrawer}
        setOpen={setOpenProductListDrawer}
        collectionData={selectedCollection}
      />
    </>
  );
};

export default CollectionMaster;
