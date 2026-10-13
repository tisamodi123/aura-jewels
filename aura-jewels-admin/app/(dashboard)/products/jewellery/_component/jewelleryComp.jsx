"use client";

//** React imports */
import { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import { ChevronDown, CloudCog, Download, MoveLeft, Paperclip, Search, X } from "lucide-react";

//** Shadcn-ui imports */
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_BASE_URL, API_URL, PREFIX } from "@/lib/APIUrl";
import { cn, isValidData } from "@/lib/utils";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

//** Custom component imports */
import Breadcrumbs from "@/components/Breadcrumbs";
import SmallSpinner from "@/components/SmallSpinner";
import ImportHistoryTable from "./importHistoryTable";
import FullScreenLoader from "@/components/fullScreenloader";
import JewelleryTable from "./jewelleryTable";
import Image from "next/image";
import PreviousUploadFileTable from "./previousUpload";
import { useDebounce } from "use-debounce";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import SyncPriceModal from "@/components/SyncPriceModal";

const MultiSelect = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  displayKey = "name",
  valueKey = "_id",
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[0.80rem] font-semibold text-[#656B7B]">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left text-[0.80rem] font-normal bg-white border-[#E4E8EE] hover:bg-gray-50 text-[#656B7B] h-[38px] px-3 flex items-center"
          >
            <span className="truncate">
              {selectedValues.length === 0
                ? placeholder
                : `${selectedValues.length} Selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[240px] p-2 bg-white border border-[#E4E8EE] shadow-lg rounded-md max-h-[250px] overflow-y-auto"
          align="start"
        >
          <div className="flex flex-col gap-1">
            {options.length === 0 ? (
              <p className="text-[0.80rem] text-gray-400 p-2 text-center">
                No options available
              </p>
            ) : (
              options.map((option) => {
                const optVal = option[valueKey];
                const optLabel = option[displayKey];
                const isChecked = selectedValues.includes(optVal);
                return (
                  <label
                    key={optVal}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer text-[0.80rem] text-gray-700 transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          onChange(selectedValues.filter((v) => v !== optVal));
                        } else {
                          onChange([...selectedValues, optVal]);
                        }
                      }}
                      className="rounded border-[#E4E8EE] text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="truncate">{optLabel}</span>
                  </label>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const JewelleryPage = () => {
  //** Get token */
  const token = getToken();

  //** Next hooks */
  const router = useRouter();

  //** State */
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState("");
  const [isSuccess, setIsSuccess] = useState(0);
  const [isImport, setIsImport] = useState(false);
  const [sercheText, setSerchText] = useState("");
  const [debouncedSearch] = useDebounce(sercheText, 500);
  const [excelPop, setExcelPop] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [subcategoryList, setSubCategoryList] = useState([]);
  const [selectedParentItem, setSelectedParentItem] = useState("");
  const [excelLink, setExcelLink] = useState("");
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isReportGenerating, setIsReportGenerating] = useState(false);
  const [isIsSyncJewellry, setIsSyncJewellry] = useState(false);
  const [openSyncModal, setOpenSyncModal] = useState(false);
  const [diaType, setDiaType] = useState("Natural");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMinPrice] = useDebounce(minPrice, 500);
  const [debouncedMaxPrice] = useDebounce(maxPrice, 500);
  const [showFilters, setShowFilters] = useState(false);

  const [collectionsList, setCollectionsList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [metalsList, setMetalsList] = useState([]);
  const [selectedChildItem, setSelectedChildItem] = useState("");
  const [archived, setArchieved] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadLoader, setUploadLoader] = useState(false);
  const [diamondData, setDiamondData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [date, setDate] = useState({
    from: undefined,
    to: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  console.log("selectedIds -------->", selectedIds)

  useEffect(() => { }, [debouncedSearch]);

  const handleImportEvent = (val) => {
    setIsImport(val);
  };

  const handleExcelChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles(file);
    } else {
      toast.error(M.validation.required);
    }
  };

  const hamdleResetFile = () => {
    setFiles("");
    setUploadLoader(false);
  };

  const handleFileUploadAPI = async () => {
    try {
      setUploadLoader(true);
      if (!files) {
        toast.error(M.validation.required);
        return;
      }
      const formData = new FormData();
      formData.append("excel", files);

      const result = await callApi(`${API_URL.UPLOAD_JEWELLERY_FILE}`, "POST", formData, token);

      setUploadLoader(false);
      if (result?.errorCode == STATUS_CODE.OK) {
        toast.success(result?.message);
        handleResetStateData();
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
      }
    } catch (error) {
      setUploadLoader(false);
      toast.error(M.common.somethingWentWrong);
    } finally {
      setUploadLoader(false);
    }
    setUploadLoader(false);
  };

  const handleResetStateData = () => {
    setFiles("");
    setIsSuccess(Math.random);
  };

  const GetJewelleryData = async () => {
    try {
      setDiamondData([]);
      setIsLoading(true);

      const payload = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        itemcode: selectedChildItem,
        parentitemcode: selectedParentItem,
        archived: archived,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
        search: debouncedSearch,
        status: status,
        category: selectedCategories,
        subCategory: selectedSubCategories,
        metalId: selectedMetals,
        collectionId: selectedCollections,
        tags: selectedTags,
        fromDate: "",
        toDate: ""
      };

      if (date.from) {
        const formattedFromDate = format(date.from, "yyyy/MM/dd");
        payload.fromDate = formattedFromDate;

        if (date.to) {
          const formattedToDate = format(date.to, "yyyy/MM/dd");
          payload.toDate = formattedToDate;
        } else {
          payload.toDate = formattedFromDate;
        }
      }

      const result = await callApi(`${API_URL?.GET_JEWELLERY_LIST}`, "POST", payload, token);

      setIsLoading(false);

      if (result?.errorCode === STATUS_CODE.OK) {
        setDiamondData(result?.data || []);
        const count = result?.pagination?.total || result?.totalCount || result?.count || result?.total || 0;
        setTotalRows(count);
      } else {
        setDiamondData([]);
        setTotalRows(0);
        toast.error(result?.message || M.product.listFetchFailed);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching diamond data.", error);
      toast.error(M.product.listFetchFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const GetCategoryList = async () => {
    try {
      const result = await callApi(`${API_URL?.PARENT_CATEGORY_LIST}`, "GET", null, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        setCategoryList(result?.data || []);
      } else {
        setCategoryList([]);
      }
    } catch (error) {
      console.log("Error fetching category data.", error);
    }
  };

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

  // Removed GetParentItemCodeList() / GetChildItemCodeList(): both POSTed to
  // jewellery/get_itemcode_list, a route that does not exist (404). The
  // parent/child item-code filter UI they populated has since been removed, so
  // the results were never rendered — they only fired two failing requests on
  // every page load. selectedParentItem / selectedChildItem are still used as
  // filter values below.

  const ExportJewelleryList = async () => {
    try {
      setIsExportLoading(true);
      const filters = {
        itemcode: selectedChildItem,
        parentitemcode: selectedParentItem,
        archived: archived,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
        search: debouncedSearch,
        status: status,
        category: selectedCategories,
        subCategory: selectedSubCategories,
        metalId: selectedMetals,
        collectionId: selectedCollections,
        tags: selectedTags,
        fromDate: "",
        toDate: ""
      };

      if (date.from) {
        const formattedFromDate = format(date.from, "yyyy/MM/dd");
        filters.fromDate = formattedFromDate;

        if (date.to) {
          const formattedToDate = format(date.to, "yyyy/MM/dd");
          filters.toDate = formattedToDate;
        } else {
          filters.toDate = formattedFromDate;
        }
      }

      const payload = {
        filters,
        selectedIds: selectedIds
      };

      const result = await callApi(`${API_URL?.EXPORT_JEWELLERY}`, "POST", payload, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        setExcelLink(result?.url);
        setExcelPop(true);
      } else {
        const detail = Array.isArray(result?.errors) && result.errors.length
          ? result.errors.join(", ")
          : (result?.message || M.common.somethingWentWrong);
        toast.error(detail);
      }
    } catch (error) {
      console.error("Error while exporting list", error);
      toast.error(error?.message || M.common.somethingWentWrong);
    } finally {
      setIsExportLoading(false);
    }
  };

  const handleDownloadExport = async () => {
    if (!excelLink) return;
    try {
      const response = await fetch(excelLink);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = excelLink.split("/").pop() || "product_export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(excelLink, "_blank");
    } finally {
      setExcelPop(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }
    try {
      setIsReportGenerating(true);
      const payload = {
        productIds: selectedIds
      };
      
      const result = await callApi(`${API_URL?.GENERATE_PRODUCT_REPORT}`, "POST", payload, token);

      if (result?.errorCode === STATUS_CODE.OK) {
        const fileUrl = result?.url || result?.data?.url || result?.data;
        if (fileUrl) {
          toast.success("Report generated successfully. Downloading...");
          try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Fetch failed");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileUrl.split("/").pop() || "product_report.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
          } catch (err) {
            window.open(fileUrl, "_blank");
          }
        } else {
          toast.error("Report URL not found in the response.");
        }
      } else {
        toast.error(result?.message || M.common.somethingWentWrong);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error?.message || M.common.somethingWentWrong);
    } finally {
      setIsReportGenerating(false);
    }
  };

  // Price syncing is handled by <SyncPriceModal>, which POSTs to
  // products/syncPrice with the password that endpoint requires. The old
  // handleSyncData() here hit jewellery/calcutationProduct — a route that does
  // not exist (404) — and was already unreachable: the "Sync Price" button
  // opens the modal instead.

  const fetchFilterMasters = async () => {
    try {
      const collectionsRes = await callApi(`${API_URL?.GET_COLLECTIONS_LIST}`, "GET", null, token);
      if (collectionsRes?.errorCode === STATUS_CODE.OK) {
        setCollectionsList(collectionsRes?.data || []);
      }

      const tagsRes = await callApi(`${API_URL?.GET_TAGS}`, "GET", null, token);
      if (tagsRes?.errorCode === STATUS_CODE.OK) {
        setTagsList(tagsRes?.data || []);
      }

      const metalsRes = await callApi(`${API_BASE_URL}products/getMetalList`, "GET", null, token);
      if (metalsRes?.errorCode === STATUS_CODE.OK) {
        setMetalsList(metalsRes?.data || []);
      }
    } catch (error) {
      console.error("Error fetching filter masters:", error);
    }
  };

  const fetchAllSubcategoriesForSelected = async (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) {
      setSubCategoryList([]);
      return [];
    }
    try {
      const results = await Promise.all(
        categoryIds.map((id) =>
          callApi(`${API_URL?.SUB_CATEGORY_LIST}/${id}`, "GET", null, token)
        )
      );
      const merged = results.reduce((acc, result) => {
        if (result?.errorCode === STATUS_CODE.OK && result?.data) {
          return [...acc, ...result.data];
        }
        return acc;
      }, []);
      const unique = merged.filter((item, index, self) =>
        self.findIndex((t) => t._id === item._id) === index
      );
      setSubCategoryList(unique);
      return unique;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  };

  useEffect(() => {
    GetCategoryList();
    fetchFilterMasters();
  }, []);

  useEffect(() => {
    fetchAllSubcategoriesForSelected(selectedCategories).then((subList) => {
      if (subList) {
        const validIds = subList.map((s) => s._id || s.id);
        setSelectedSubCategories((prev) => prev.filter((id) => validIds.includes(id)));
      }
    });
    setPagination({ ...pagination, pageIndex: 0 });
  }, [selectedCategories]);

  useEffect(() => {
    GetJewelleryData();
  }, [
    selectedCategories,
    selectedSubCategories,
    selectedMetals,
    selectedCollections,
    selectedTags,
    debouncedMinPrice,
    debouncedMaxPrice,
    debouncedSearch,
    status,
    selectedParentItem,
    selectedChildItem,
    archived,
    date,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  // Clear selectedIds when any filter changes (excluding search)
  useEffect(() => {
    setSelectedIds([]);
  }, [
    selectedCategories,
    selectedSubCategories,
    selectedMetals,
    selectedCollections,
    selectedTags,
    debouncedMinPrice,
    debouncedMaxPrice,
    status,
    selectedParentItem,
    selectedChildItem,
    archived,
    date,
  ]);

  const handleClearSearch = () => {
    setSerchText("");
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedMetals([]);
    setSelectedCollections([]);
    setSelectedTags([]);
    setMinPrice("");
    setMaxPrice("");
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleClearDate = () => {
    setDate({ from: undefined, to: undefined });
    setPagination({ ...pagination, pageIndex: 0 });
  };
  return (
    <>
      {uploadLoader && <FullScreenLoader />}
      {!isImport && (
        <div className="p-2 mb-3 flex items-center justify-between">
          <p className="font-semibold text-xl"> Jewellery List</p>
          <div className="flex gap-2 items-center">
            {syncLoading ? (
              <Button disabled className="primaryWhiteButton">
                <SmallSpinner />
              </Button>
            ) : (
              <Button
                onClick={() => setOpenSyncModal(true)}
                className="primaryWhiteButton"
                title="Recalculates ALL prices + offers: metal, making, diamond (from stone rates) → finalPrice, then re-applies active offers. Use after rate/stock/import changes. Does everything Sync Offers does, plus base prices."
              >
                Sync Price
              </Button>
            )}
            <Button
              onClick={ExportJewelleryList}
              className="cursor-pointer primaryWhiteButton"
              disabled={isExportLoading}
            >
              {isExportLoading ? "Exporting..." : "Export"}
            </Button>

            {selectedIds && selectedIds.length > 0 && (
              <Button
                onClick={handleGenerateReport}
                disabled={isReportGenerating}
                className="primaryWhiteButton"
              >
                {isReportGenerating ? <SmallSpinner /> : "Get Report"}
              </Button>
            )}
            <Button
              className="primaryWhiteButton"
              onClick={() => handleImportEvent(true)}
            >
              Import
            </Button>
            <Button
              className="primaryWhiteButton"
              onClick={() => router.push("/products/jewellery/add-product")}
            >
              Add Product
            </Button>
            {/* <Button
              onClick={SyncJewellryList}
              disabled={isIsSyncJewellry}
              className="hand h-[36px] px-5 font-normal bg-black text-[0.80rem] text-white"
            >
              {isIsSyncJewellry ? "syncing..." : " Sync Jewellry"}
            </Button> */}
            {/* <Button
              onClick={() => router.push("/products/jewellery/addProduct")}
              className="hand h-[36px] px-5 font-normal bg-black text-[0.80rem] text-white"
            >
              Add Product
            </Button> */}
          </div>
        </div>
      )}
      {/* Dropdowns */}
      {!isImport && (
        <div className="bg-white py-4 px-5 border border-[#E4E8EE] rounded-lg shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1 w-full">
              <p className="text-[0.80rem] font-semibold text-[#656B7B] mb-2">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B]" />
                <Input
                  type="text"
                  placeholder="Search item code or product title...."
                  value={sercheText}
                  onChange={(e) => setSerchText(e.target.value)}
                  className="w-full bg-white pl-10 pr-10 text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0 focus:border-[#E4E8EE] h-[38px]"
                />
                {sercheText && (
                  <X
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold"
                  />
                )}
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="w-full md:w-[280px]">
              <p className="text-[0.80rem] font-semibold text-[#656B7B] mb-2">Last Updated Product</p>
              <div className="cursor-pointer relative" title="calendar">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 flex justify-between text-left font-normal border-[#E4E8EE] h-[38px]",
                        !date.from && "text-muted-foreground"
                      )}
                    >
                      <span className="text-[#656B7B] text-[0.80rem]">
                        {date.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "dd/MM/yyyy")} -{" "}
                              {format(date.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(date.from, "dd/MM/yyyy")
                          )
                        ) : (
                          "dd/mm/yyyy - dd/mm/yyyy"
                        )}
                      </span>
                      <Image
                        src={PREFIX + "/calendarIcon.svg"}
                        height={18}
                        width={18}
                        className="pr-1"
                        alt="calendarIcon"
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate || { from: undefined, to: undefined })
                        setPagination({ ...pagination, pageIndex: 0 });
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {(date.from || date.to) && (
                  <X
                    onClick={handleClearDate}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold z-10"
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
                {(selectedCategories.length +
                  selectedSubCategories.length +
                  selectedMetals.length +
                  selectedCollections.length +
                  selectedTags.length +
                  (minPrice ? 1 : 0) +
                  (maxPrice ? 1 : 0)) > 0 && (
                    <span className="bg-blue-600 text-white text-[0.70rem] font-bold px-2 py-0.5 rounded-full">
                      {selectedCategories.length +
                        selectedSubCategories.length +
                        selectedMetals.length +
                        selectedCollections.length +
                        selectedTags.length +
                        (minPrice ? 1 : 0) +
                        (maxPrice ? 1 : 0)}
                    </span>
                  )}
              </Button>

              {/* Reset All Filters Link */}
              {(selectedCategories.length +
                selectedSubCategories.length +
                selectedMetals.length +
                selectedCollections.length +
                selectedTags.length +
                (minPrice ? 1 : 0) +
                (maxPrice ? 1 : 0)) > 0 && (
                  <Button
                    onClick={handleClearFilters}
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
              {/* Category */}
              <MultiSelect
                label="Category"
                placeholder="Select Categories"
                options={categoryList}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                displayKey="categoryName"
                valueKey="_id"
              />

              {/* Sub Category */}
              <MultiSelect
                label="Sub Category"
                placeholder={selectedCategories.length === 0 ? "Select Categories First" : "Select Sub Categories"}
                options={subcategoryList}
                selectedValues={selectedSubCategories}
                onChange={setSelectedSubCategories}
                displayKey="categoryName"
                valueKey="_id"
              />

              {/* Metal */}
              <MultiSelect
                label="Metal"
                placeholder="Select Metals"
                options={metalsList}
                selectedValues={selectedMetals}
                onChange={setSelectedMetals}
                displayKey="name"
                valueKey="_id"
              />

              {/* Collection */}
              <MultiSelect
                label="Collection"
                placeholder="Select Collections"
                options={collectionsList}
                selectedValues={selectedCollections}
                onChange={setSelectedCollections}
                displayKey="name"
                valueKey="_id"
              />

              {/* Tag */}
              <MultiSelect
                label="Tag"
                placeholder="Select Tags"
                options={tagsList}
                selectedValues={selectedTags}
                onChange={setSelectedTags}
                displayKey="name"
                valueKey="_id"
              />

              {/* Price Range */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[0.80rem] font-semibold text-[#656B7B]">
                  Price Range
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPagination({ ...pagination, pageIndex: 0 });
                    }}
                    className="h-[38px] text-[0.80rem] border-[#E4E8EE] bg-white"
                  />
                  <span className="text-gray-400 text-xs font-medium">to</span>
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPagination({ ...pagination, pageIndex: 0 });
                    }}
                    className="h-[38px] text-[0.80rem] border-[#E4E8EE] bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Jewellery Table */}
      {!isImport ? (
        <div className="pt-2">
          <JewelleryTable
            setDiamondData={setDiamondData}
            diamondData={diamondData}
            totalRows={totalRows}
            isLoading={isLoading}
            searchText={sercheText}
            status={status}
            setStatus={setStatus}
            setSerchText={setSerchText}
            GetJewelleryData={GetJewelleryData}
            archived={archived}
            setArchieved={setArchieved}
            setPagination={setPagination}
            pagination={pagination}
            setSelectedIds={setSelectedIds}
            selectedIds={selectedIds}
          />
        </div>
      ) : (
        <div className="pt-2">
          <div
            onClick={() => setIsImport(false)}
            className="mb-6 flex items-center gap-2 cursor-pointer"
          >
            <MoveLeft />
            <span className="text-xl font-semibold"> Jewellery List </span>
          </div>
          <div className="rounded-md border border-gray-200 p-4 mb-6 bg-white shadow-sm">
            <div className="font-semibold text-xl mb-4">Import Jewellery</div>
            <div className="border h-36 rounded-md flex justify-center items-center relative">
              <div className="">
                <div className="flex items-center justify-center py-2 gap-4">
                  <Button
                    variant="outline"
                    title="Download Sample file"
                    className="hand rounded-lg"
                  >
                    <Link
                      href={"/sample-file/jewellery_sample_file.xlsx"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Image
                        src={PREFIX + "/cloudComputing.svg"}
                        alt="uploadIcon"
                        height={18}
                        width={18}
                      />
                      <span className="text-[#656B7B]">Sample File</span>
                    </Link>
                  </Button>
                  <div>
                    <input
                      type="file"
                      id="excel-upload"
                      className="hidden"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleExcelChange}
                    />
                    <Button
                      className="w-[134px] h-[38px] rounded-lg transition-all duration-300 px-2 py-1 shadow-none cursor-pointer"
                      disabled={uploadLoader}
                      variant="outline"
                    >
                      <label
                        className="w-full flex items-center gap-3 text-gray-500 cursor-pointer overflow-x-clip"
                        htmlFor="excel-upload"
                      >
                        {files === "" ? (
                          uploadLoader ? (
                            <>
                              <SmallSpinner size="20px" color="blue" />
                              <span className="text-[#656B7B]">
                                Attach File
                              </span>
                            </>
                          ) : (
                            <>
                              <Image
                                src={PREFIX + "/paperPin.svg"}
                                alt="attachedFileIcon"
                                height={14}
                                width={14}
                              />
                              <span className="text-[#656B7B]">
                                Attach File
                              </span>
                            </>
                          )
                        ) : (
                          files?.name
                        )}
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end absolute right-0 mr-9 gap-4">
                  <Button
                    className="bg-[#3AAE48] cursor-pointer hover:bg-green-50 hover:border-[#3AAE48] hover:border hover:text-[#3AAE48] h-[34px] text-[0.80rem]"
                    onClick={handleFileUploadAPI}
                  >
                    Upload
                  </Button>
                  <Button
                    className={
                      files === ""
                        ? "cursor-not-allowed bg-[#4B4B4B] text-white h-[34px] text-[0.80rem]"
                        : " bg-[#4B4B4B] text-white h-[34px] text-[0.80rem] hand"
                    }
                    variant="outline"
                    onClick={hamdleResetFile}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
            <PreviousUploadFileTable diaType={diaType} isSuccess={isSuccess} />
          </div>
        </div>
      )}

      {/* Download Excel Popover */}
      <Dialog open={excelPop} onOpenChange={setExcelPop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Successful</DialogTitle>
            <DialogDescription>
              Jewellery Excel file is ready to download.
            </DialogDescription>
          </DialogHeader>
          {excelLink && (
            <Button className="cursor-pointer" onClick={handleDownloadExport}>
              Download Excel
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <SyncPriceModal
        open={openSyncModal}
        setOpen={setOpenSyncModal}
        onSuccess={GetJewelleryData}
        selectedIds={selectedIds}
      />
    </>
  );
};

export default JewelleryPage;
