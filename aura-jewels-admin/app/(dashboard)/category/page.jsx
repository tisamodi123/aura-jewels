"use client";
import { API_URL } from "@/lib/APIUrl";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";

import { HomeIcon, ChevronDown, Search, X } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { MdDelete, MdEdit } from "react-icons/md";
import CategoryModal from "./_components/CategoryModal";
import CategoryTable from "./_components/CategoryTable";
import { useDebounce } from "use-debounce";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CategoryMaster = () => {
  const token = getToken();
  const router = useRouter();
  const pathname = usePathname();
  const title = pathname
    ?.replace("/", "")
    ?.split("")
    ?.map((v, i) => (i == 0 ? v.toUpperCase() : v))
    ?.join("");

  const [categoryList, setCategoryList] = useState([]);
  // Full list of top-level (parent=null) categories — feeds the modal's
  // "Type" dropdown so admins can pick any parent regardless of which
  // page of the paginated table is currently loaded.
  const [parentCategoryList, setParentCategoryList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowData, setRowData] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [selectedParentCategory, setSelectedParentCategory] = useState(" ");
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(" ");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    (selectedParentCategory && selectedParentCategory.trim() !== "" ? 1 : 0) +
    (selectedSubCategory && selectedSubCategory.trim() !== "" ? 1 : 0);

  const GetSubCategoryList = async (id) => {
    try {
      const result = await callApi(`${API_URL?.SUB_CATEGORY_LIST}/${id}`, "GET", null, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        setSubCategoryList(result?.data || []);
      } else {
        setSubCategoryList([]);
      }
    } catch (error) {
      console.log("Error fetching category data.", error);
    }
  };

  const GetCategoryList = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("page", pagination?.pageIndex + 1);
    formData.append("limit", pagination?.pageSize);
    formData.append("search", debouncedSearch);
    if (selectedParentCategory && selectedParentCategory.trim() !== "") {
      formData.append("parentCategoryId", selectedParentCategory.trim());
    }
    if (selectedSubCategory && selectedSubCategory.trim() !== "") {
      formData.append("subCategoryId", selectedSubCategory.trim());
    }

    callApi(`${API_URL?.CATEGORY_LIST}`, "POST", formData, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK) {
          setCategoryList(result?.data);
          // Handle nested pagination object or top-level count fields
          const count = result?.pagination?.total || result?.totalCount || result?.count || result?.total || 0;
          setTotalRows(count);
        }
      })
      .catch((err) => {
        toast.error(M.common.fetchFailed);
      })
      .finally(() => {
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
        callApi(`${API_URL?.UPDATE_CATEGORY_STATUS}/${id}`, "PATCH", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              GetCategoryList();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };
  const DeleteCategory = (id) => {
    Swal.fire({
      title: "Delete Category",
      text: "Are You Sure Want To Delete Category?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed === true) {
        callApi(`${API_URL?.DELETE_CATEGORY}/${id}`, "DELETE", null, token).then(
          (result) => {
            if (result?.errorCode == STATUS_CODE.OK) {
              toast.success(result?.message);
              setSelectedParentCategory(" ");
              setSelectedSubCategory(" ");
              setSubCategoryList([]);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              GetCategoryList();
              GetParentCategoryList();
            } else {
              toast.error(result?.message);
            }
          }
        );
      }
    });
  };
  // Edit flow loads the full category by id so the modal gets pageBanner,
  // banners, side cards and populated tags (the list endpoint is slim
  // and only carries what the table renders). Add flow opens with an
  // empty rowData immediately.
  const handleShowModal = async (rowData = "") => {
    if (rowData?._id) {
      try {
        const res = await callApi(
          `${API_URL.GET_CATEGORY_BY_ID}/${rowData._id}`,
          "GET",
          null,
          token,
        );
        if (res?.errorCode === STATUS_CODE.OK && res.data) {
          setRowData(res.data);
          setOpenDrawer(true);
          return;
        }
        toast.error(res?.message || M.common.fetchFailed);
        return;
      } catch (err) {
        toast.error(M.common.fetchFailed);
        return;
      }
    }
    setRowData({});
    setOpenDrawer(true);
  };

  useEffect(() => {
    if (selectedParentCategory && selectedParentCategory.trim() !== "") {
      GetSubCategoryList(selectedParentCategory.trim());
    } else {
      setSubCategoryList([]);
    }
    setSelectedSubCategory(" ");
  }, [selectedParentCategory]);

  useEffect(() => {
    GetCategoryList();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, selectedParentCategory, selectedSubCategory]);

  // Top-level parent list — independent of the paginated table so the
  // modal's parent dropdown always sees every possible parent. Re-fetched
  // after any create/update so newly added top-level cats show up
  // without a page refresh.
  const GetParentCategoryList = () => {
    callApi(`${API_URL?.PARENT_CATEGORY_LIST}`, "GET", null, token)
      .then((result) => {
        if (result?.errorCode == STATUS_CODE.OK && Array.isArray(result.data)) {
          setParentCategoryList(result.data);
        }
      })
      .catch(() => { });
  };
  useEffect(() => {
    GetParentCategoryList();
  }, []);

  const RefreshAll = () => {
    GetCategoryList();
    GetParentCategoryList();
    if (selectedParentCategory && selectedParentCategory.trim() !== "") {
      GetSubCategoryList(selectedParentCategory.trim());
    } else {
      setSubCategoryList([]);
    }
  };
  const [syncJewellery, setSyncJewellery] = useState(false);
  // Removed HandleSynccategory(): it GET'd category/CategorySync, a route that
  // does not exist in this API (404). In the legacy backend it pulled the
  // category tree from the external "Classic" ERP; that integration was never
  // ported. Its only caller — the "Sync Category" button — is commented out.

  return (
    <>
      <div className=" p-2 mb-3  items-center  flex justify-between">
        <div className="font-semibold">{title} (Style)</div>

        <div className="flex gap-2 items-center">
          {/* <Button
            className="hand bg-black text-white"
            onClick={HandleSynccategory}
          >
            {syncJewellery ? "Syncing..." : "Sync Category"}
          </Button> */}
          <Button
            className="hand bg-black text-white"
            onClick={() => handleShowModal()}
          >
            Create Category
          </Button>
        </div>
      </div>
      {/* Search & Filter Card (Exactly like Jewellery) */}
      <div className="bg-white py-4 px-5 border border-[#E4E8EE] rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <p className="text-[0.80rem] font-semibold text-[#656B7B] mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B]" />
              <Input
                type="text"
                placeholder="Search category name...."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
                className="w-full bg-white pl-10 pr-10 text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0 focus:border-[#E4E8EE] h-[38px]"
              />
              {searchText && (
                <X
                  onClick={() => {
                    setSearchText("");
                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold"
                />
              )}
            </div>
          </div>

          {/* Advanced Filters Trigger */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={cn(
                "flex items-center gap-2 text-[0.80rem] h-[38px] border-[#E4E8EE] px-4",
                showFilters ? "bg-gray-100 text-black border-gray-400" : "bg-white text-[#656B7B]"
              )}
            >
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[0.70rem] font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Reset All Filters Link */}
            {activeFilterCount > 0 && (
              <Button
                onClick={() => {
                  setSelectedParentCategory(" ");
                  setSelectedSubCategory(" ");
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[0.80rem] h-[38px]"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 pt-5 border-t border-[#E4E8EE] transition-all duration-300">
            {/* Parent Category Select Filter */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[0.80rem] font-semibold text-[#656B7B]">
                Parent Category
              </label>
              <Select
                value={selectedParentCategory}
                onValueChange={(val) => {
                  setSelectedParentCategory(val);
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="w-full border border-[#E4E8EE] rounded-lg px-3 h-[38px] text-[0.80rem] bg-white text-[#656B7B] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem className="hover:bg-gray-100 text-[0.80rem] cursor-pointer" value=" ">
                    All Categories
                  </SelectItem>
                  {parentCategoryList && parentCategoryList.map((cat) => (
                    <SelectItem
                      className="hover:bg-gray-100 text-[0.80rem] cursor-pointer"
                      key={cat._id}
                      value={cat._id}
                    >
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Category Select Filter */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[0.80rem] font-semibold text-[#656B7B]">
                Sub Category
              </label>
              <Select
                value={selectedSubCategory}
                disabled={!selectedParentCategory || selectedParentCategory.trim() === ""}
                onValueChange={(val) => {
                  setSelectedSubCategory(val);
                  setPagination(prev => ({ ...prev, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="w-full border border-[#E4E8EE] rounded-lg px-3 h-[38px] text-[0.80rem] bg-white text-[#656B7B] focus:ring-0 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <SelectValue placeholder={selectedParentCategory && selectedParentCategory.trim() !== "" ? "All Sub Categories" : "Select Parent Category First"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem className="hover:bg-gray-100 text-[0.80rem] cursor-pointer" value=" ">
                    All Sub Categories
                  </SelectItem>
                  {subCategoryList && subCategoryList.map((subCat) => (
                    <SelectItem
                      className="hover:bg-gray-100 text-[0.80rem] cursor-pointer"
                      key={subCat._id}
                      value={subCat._id}
                    >
                      {subCat.categoryName || subCat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 shadow-md rounded-md  mb-5">
        <div>
          <CategoryTable
            tableData={categoryList}
            onUpdateStatus={UpdateStatus}
            OnDelete={DeleteCategory}
            loading={loading}
            handleShowModal={handleShowModal}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={totalRows}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </div>
      </div>

      <CategoryModal
        key={rowData?._id || "new-category-modal"}
        open={openDrawer}
        setOpen={setOpenDrawer}
        GetCategoryList={RefreshAll}
        rowData={rowData}
        setRowData={setRowData}
        categoryList={categoryList}
        parentCategoryList={parentCategoryList}
      />
    </>
  );
};

export default CategoryMaster;
