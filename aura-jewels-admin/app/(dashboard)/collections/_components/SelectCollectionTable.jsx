"use client";

//** React imports */
import { useEffect, useState } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import { ChevronDown, Download, MoveLeft, Paperclip, Search, X } from "lucide-react";

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
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";
import { cn, isValidData } from "@/lib/utils";

//** Custom component imports */
import SmallSpinner from "@/components/SmallSpinner";
import FullScreenLoader from "@/components/fullScreenloader";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";

const SelectCollectionTable = () => {
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
    const [isIsSyncJewellry, setIsSyncJewellry] = useState(false);
    const [diaType, setDiaType] = useState("Natural");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedChilditem, setSelectedChildItem] = useState("");
    const [archived, setArchieved] = useState(false);
    const [status, setStatus] = useState("");
    const [uploadLoader, setUploadLoader] = useState(false);
    const [diamondData, setDiamondData] = useState([]);
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
            formData.append("file", files);

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

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const formData = new FormData();
            formData.append("page", pagination.pageIndex + 1);
            formData.append("limit", pagination.pageSize);
            formData.append("itemcode", selectedChilditem);
            formData.append("parentitemcode", selectedParentItem);
            formData.append("archived", archived);
            formData.append("maxPrice", "");
            formData.append("minPrice", "");
            formData.append("search", debouncedSearch);
            formData.append("status", status);
            formData.append("category", selectedCategory);
            formData.append("subcategory", selectedSubCategory);

            if (date.from) {
                const formattedFromDate = format(date.from, "yyyy/MM/dd");
                formData.append("fromDate", formattedFromDate);

                if (date.to) {
                    const formattedToDate = format(date.to, "yyyy/MM/dd");
                    formData.append("toDate", formattedToDate);
                } else {
                    formData.append("toDate", formattedFromDate);
                }
            } else {
                formData.append("fromDate", "");
                formData.append("toDate", "");
            }

            const result = await callApi(`${API_URL?.GET_JEWELLERY_LIST}`, "POST", formData, token);
            setIsLoading(false);

            if (result?.errorCode === STATUS_CODE.OK) {
                setDiamondData(result?.data || []);
                setTotalRows(result?.totalCount > 0 ? result?.totalCount : 0);
            } else {
                setDiamondData([]);
                setTotalRows(0);
                toast.error(result?.message || M.common.fetchFailed);
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Error fetching diamond data.", error);
            toast.error(M.common.fetchFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const GetCategoryList = async () => {
        try {
            const result = await callApi(`${API_URL?.GET_JEWELLERY_CATEGORY}`, "GET", null, token);

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
            const result = await callApi(`${API_URL?.GET_JEWELLERY_SUBCATEGORY}/${id}`, "GET", null, token);

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
    // parent/child item-code filter UI they populated has since been removed,
    // so the results were never rendered — they only fired two failing requests
    // on every page load. selectedParentItem / selectedChilditem are still used
    // as filter values below.

    const ExportJewelleryList = async () => {
        try {
            setIsExportLoading(true);
            formData.append("fromDate", selectedSubCategory);
            formData.append("toDate", selectedSubCategory);

            const result = await callApi(`${API_URL?.EXPORT_JEWELLERY}`, "POST", formData, token);

            if (result?.errorCode === STATUS_CODE.OK) {
                console.log("export this --->", result);
                setExcelLink(result?.url);
                setIsExportLoading(false);
                setExcelPop(true);
            }
        } catch (error) {
            console.log("Error while exporting list", error);
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

    // Removed handleSyncData(): it POSTed to jewellery/calcutationProduct, a
    // route that does not exist (404). Its only caller — the "Sync Price"
    // button — sits inside a commented-out JSX block. Price syncing lives in
    // <SyncPriceModal>, which POSTs to products/syncPrice with the password
    // that endpoint requires.

    useEffect(() => {
        GetJewelleryData();
    }, [
        selectedCategory,
        selectedSubCategory,
        debouncedSearch,
        status,
        selectedParentItem,
        selectedChilditem,
        archived,
        date,
    ]);

    useEffect(() => {
        GetCategoryList();
        if (selectedCategory) {
            GetSubCategoryList(selectedCategory);
            setPagination({ ...pagination, pageIndex: 0 });

        }
    }, [selectedCategory]);

    const handleSubCategory = (value) => {
        if (selectedCategory == "") {
            return toast.error(M.validation.required);
        }
        setSelectedSubCategory(value);
        setPagination({ ...pagination, pageIndex: 0 });
    };

    // Removed SyncJewellryList(): it POSTed to products/classic_jewelerysync,
    // a route that does not exist (404). Its only caller — the "Sync Jewellry"
    // button — sits inside the commented-out JSX block below.

    // Clear handlers
    const handleClearSearch = () => {
        setSerchText("");
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleClearCategory = () => {
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSubCategoryList([]);
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleClearSubCategory = () => {
        setSelectedSubCategory("");
        setPagination({ ...pagination, pageIndex: 0 });
    };

    const handleClearDate = () => {
        setDate({ from: undefined, to: undefined });
        setPagination({ ...pagination, pageIndex: 0 });
    };


    return (
        <>
            {uploadLoader && <FullScreenLoader />}
            {/* {!isImport && (
                <div className="p-2 mb-3 flex items-center justify-between">
                    <p className="font-semibold text-xl">Jewellery List</p>
                    <div className="flex gap-2 items-center">
                        {syncLoading ? (
                            <Button disabled className="primaryWhiteButton">
                                <SmallSpinner />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSyncData}
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

                        <Button
                            className="primaryWhiteButton"
                            onClick={() => handleImportEvent(true)}
                        >
                            Import
                        </Button>
                        <Button
                            onClick={SyncJewellryList}
                            disabled={isIsSyncJewellry}
                            className="hand h-[36px] px-5 font-normal bg-black text-[0.80rem] text-white"
                        >
                            {isIsSyncJewellry ? "syncing..." : " Sync Jewellry"}
                        </Button>
                        <Button
                            onClick={() => router.push("/products/jewellery/addProduct")}
                            className="hand h-[36px] px-5 font-normal bg-black text-[0.80rem] text-white"
                        >
                            Add Product
                        </Button>
                    </div>
                </div>
            )} */}
            {/* Dropdowns */}
            {!isImport && (
                <div className="bg-white py-2 px-3">
                    <div className="flex gap-6 mb-4 items-center">
                        <div className="flex-1">
                            <p>Search</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B]" />
                                <Input
                                    type="text"
                                    placeholder="Search...."
                                    value={sercheText}
                                    onChange={(e) => setSerchText(e.target.value)}
                                    className="w-full bg-white pl-10 pr-10 text-[0.80rem] text-[#656B7B] border-[#E4E8EE] focus:outline-none focus:ring-0 focus:border-[#E4E8EE]"
                                />
                                {sercheText && (
                                    <X
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p>Category</p>
                            <div className="relative">
                                <Select
                                    value={selectedCategory}
                                    onValueChange={(value) => setSelectedCategory(value)}
                                >
                                    <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                                        <SelectValue
                                            placeholder="Category"
                                            className="text-[#656B7B]"
                                        />
                                        {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectGroup>
                                            {categoryList?.map((cat) => {
                                                return (
                                                    <SelectItem
                                                        className="hover:bg-gray-100"
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.categoryName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {selectedCategory && (
                                    <X
                                        onClick={handleClearCategory}
                                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold z-10"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p>Sub Category</p>
                            <div className="relative">
                                <Select
                                    value={selectedSubCategory}
                                    onValueChange={(value) => handleSubCategory(value)}
                                    disabled={!selectedCategory}
                                >
                                    <SelectTrigger className="w-full bg-white cursor-pointer text-[0.80rem] text-[#656B7B] border-[#E4E8EE] justify-between focus:outline-none focus:ring-0 focus:border-[#E4E8EE]">
                                        <SelectValue
                                            placeholder="Sub Category"
                                            className="text-[#656B7B]"
                                        />
                                        {/* <ChevronDown className="h-4 w-4 text-[#656B7B]" /> */}
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-[200px] overflow-y-scroll scroll-hidden">
                                        <SelectGroup>
                                            {subcategoryList?.map((subCat) => {
                                                return (
                                                    <SelectItem
                                                        key={subCat.id}
                                                        className="hover:bg-gray-100"
                                                        value={subCat.id}
                                                    >
                                                        {subCat.categoryName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {selectedSubCategory && (
                                    <X
                                        onClick={handleClearSubCategory}
                                        className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#656B7B] cursor-pointer hover:font-bold z-10"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <p>Last Updated Product</p>
                            <div className="cursor-pointer relative" title="calendar">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full pl-3 flex justify-between text-left font-normal",
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
                    </div>
                </div>
            )}
            {/* Jewellery Table */}
            {!isImport ? (
                <div className="pt-2">
                    <SelectCollectionTable
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
                                            href={"/sample-file/jewellry.xlsx"}
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

                    {/* <div className="bg-white border border-zinc-200 shadow-md rounded-md mb-5">
                        <PreviousUploadFileTable diaType={diaType} isSuccess={isSuccess} />
                    </div> */}
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
                        <Button className="cursor-pointer" onClick={handleDownloadExport}>Download Excel</Button>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SelectCollectionTable;
