"use client";

//** React imports */
import { useEffect, useState, useCallback } from "react";

//** Next imports */
import Link from "next/link";
import { useRouter } from "next/navigation";

//** Third party imports */
import { toast } from "sonner";
import { Download, MoveLeft, Paperclip, ArrowDown, ArrowUp } from "lucide-react";

//** Shadcn-ui imports */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//** Custom imports */
import { getToken } from "@/lib/auth";
import { API_URL, PREFIX } from "@/lib/APIUrl";
import { isValidData } from "@/lib/utils";
import { callApi } from "@/lib/callApi";

//** Custom component imports */
import DiamondTable from "./diamondTable";
import DiamondForm from "./diamondForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import SmallSpinner from "@/components/SmallSpinner";
import ImportHistoryTable from "./importHistoryTable";
import FullScreenLoader from "@/components/fullScreenloader";
import Image from "next/image";



import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { STATUS_CODE } from "@/lib/Constant";
import { M } from "@/lib/messages";

const DiamondPage = () => {
  //** Get token */
  const token = getToken();

  //** Next hooks */
  const router = useRouter();

  //** State */
  const [files, setFiles] = useState("");
  const [isSuccess, setIsSuccess] = useState(0);
  const [isImport, setIsImport] = useState(false);
  const [diaType, setDiaType] = useState("Lab Grown");
  const [uploadLoader, setUploadLoader] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [finalSearchText, setFinalSearchText] = useState("");
  const [minRap, setMinRap] = useState("");
  const [maxRap, setMaxRap] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [shapeList, setShapeList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [clarityList, setClarityList] = useState([]);
  const [cutList, setCutList] = useState([]);
  const [polishList, setPolishList] = useState([]);
  const [symmetryList, setSymmetryList] = useState([]);
  const [fluorescenceList, setFluorescenceList] = useState([]);
  const [labList, setLabList] = useState([]);

  const [selectedShape, setSelectedShape] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedClarity, setSelectedClarity] = useState("all");
  const [selectedCut, setSelectedCut] = useState("all");
  const [selectedPolish, setSelectedPolish] = useState("all");
  const [selectedSymmetry, setSelectedSymmetry] = useState("all");
  const [selectedFluorescence, setSelectedFluorescence] = useState("all");
  const [selectedLab, setSelectedLab] = useState("all");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isOpen, setIsOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [diamondData, setDiamondData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Diamond CRUD States
  const initialFormState = {
    stockId: "",
    status: "ACTIVE",
    shape: "",
    color: "",
    clarity: "",
    sizeMM: "",
    cut: "",
    polish: "",
    symmetry: "",
    fluorescence: "",
    creation: "Natural",
    gemstoneType: "",
    gemstoneOrigin: "",
    carat: "",
    caratNo: "",
    certNo: "",
    certLab: "",
    certLink: "",
    country: "",
    rap: "",
    disc: "",
  };
  const [formValues, setFormValues] = useState(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState("add"); // 'add' | 'edit'
  const [selectedDiamondId, setSelectedDiamondId] = useState(null);
  const [addUpdateLoading, setAddUpdateLoading] = useState(false);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((text) => {
      setFinalSearchText(text);
    }, 500), // 500ms delay after typing stops
    []
  );

  // Update debounced search when searchText changes
  useEffect(() => {
    debouncedSearch(searchText);
  }, [searchText, debouncedSearch]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // If Enter is pressed, immediately set the final search text
      setFinalSearchText(searchText);
      // Also clear any pending debounce
      debouncedSearch.cancel?.();
    }
  };

  useEffect(() => {
    if (isValidData(token)) {
      const fetchParams = async (type, setter) => {
        try {
          const res = await callApi(
            API_URL.PARAMETER_LIST,
            "POST",
            { type, status: "ACTIVE", page: 1, limit: 500 },
            token,
          );
          if (res?.errorCode === STATUS_CODE.OK) {
            setter(res.data || []);
          }
        } catch (err) {
          console.error("Parameter fetch error", type, err);
        }
      };

      fetchParams("shape", setShapeList);
      fetchParams("color", setColorList);
      fetchParams("clarity", setClarityList);
      fetchParams("cut", setCutList);
      fetchParams("polish", setPolishList);
      fetchParams("symmetry", setSymmetryList);
      fetchParams("fluorescence", setFluorescenceList);
      fetchParams("lab", setLabList);
    }
  }, [token]);

  useEffect(() => {
    if (!isValidData(token)) {
      router.replace("/login");
    }
  }, [isImport]);

  const handleDiamonType = (val) => {
    setDiaType(val);
  };

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
      formData.append("diamondType", diaType);

      const result = await callApi(`${API_URL.UPLOAD_DIAMOND_IMPORT_FILE}`, "POST", formData, token);
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

  const handleFileExportAPI = async () => {
    try {
      setUploadLoader(true);
      const formData = new FormData();
      formData.append("diamondType", diaType);

      const result = await callApi(`${API_URL.EXPORT_DIAMOND_FILE}`, "POST", formData, token);
      setUploadLoader(false);
      if (result?.errorCode == STATUS_CODE.OK) {
        const link = document.createElement("a");
        link.href = result?.url;
        link.setAttribute("download", "solitaire-list.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
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
  };

  const fetchDiamondData = async () => {
    try {
      setDiamondData([]);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("page", pagination.pageIndex + 1);
      formData.append("limit", pagination.pageSize);
      formData.append("diamondType", diaType);
      formData.append("search", finalSearchText);
      formData.append("sortField", sortField);
      formData.append("sortOrder", sortOrder);
      if (minRap) formData.append("minRap", minRap);
      if (maxRap) formData.append("maxRap", maxRap);
      if (minDiscount) formData.append("minDiscount", minDiscount);
      if (maxDiscount) formData.append("maxDiscount", maxDiscount);

      if (selectedShape !== "all") formData.append("shape", selectedShape);
      if (selectedColor !== "all") formData.append("color", selectedColor);
      if (selectedClarity !== "all") formData.append("clarity", selectedClarity);
      if (selectedCut !== "all") formData.append("cut", selectedCut);
      if (selectedPolish !== "all") formData.append("polish", selectedPolish);
      if (selectedSymmetry !== "all") formData.append("symmetry", selectedSymmetry);
      if (selectedFluorescence !== "all") formData.append("fluorescence", selectedFluorescence);
      if (selectedLab !== "all") formData.append("certLab", selectedLab);

      const result = await callApi(`${API_URL?.GET_DIAMOND_LIST}`, "POST", formData, token);

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
      console.log("Error fetching diamond data.", error);
      toast.error(M.product.listFetchFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isValidData(token) && !isImport) {
      fetchDiamondData();
    }
  }, [diaType, pagination.pageIndex, pagination.pageSize, finalSearchText, minRap, maxRap, minDiscount, maxDiscount, selectedShape, selectedColor, selectedClarity, selectedCut, selectedPolish, selectedSymmetry, selectedFluorescence, selectedLab, sortField, sortOrder, isImport]);

  const handleResetStateData = () => {
    setFiles("");
    setIsSuccess(Math.random);
  };

  const openAddModal = () => {
    setFormValues(initialFormState);
    setFormType("add");
    setSelectedDiamondId(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (row) => {
    try {
      const res = await callApi(`${API_URL.GET_DIAMOND_DETAILS}/${row._id}`, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK && res.data) {
        const d = res.data;
        setFormValues({
          stockId: d.stockId || "",
          status: d.status || "ACTIVE",
          shape: d.shape?._id || d.shape || "",
          color: d.color?._id || d.color || "",
          clarity: d.clarity?._id || d.clarity || "",
          sizeMM: d.sizeMM || "",
          cut: d.cut?._id || d.cut || "",
          polish: d.polish?._id || d.polish || "",
          symmetry: d.symmetry?._id || d.symmetry || "",
          fluorescence: d.fluorescence?._id || d.fluorescence || "",
          creation: d.creation || "Natural",
          gemstoneType: d.gemstoneType || "",
          gemstoneOrigin: d.gemstoneOrigin || "",
          carat: d.carat || "",
          caratNo: d.caratNo || "",
          certNo: d.certNo || "",
          certLab: d.certLab?._id || d.certLab || "",
          certLink: d.certLink || "",
          country: d.country || "",
          rap: d.rap || "",
          disc: d.disc || "",
        });
        setFormType("edit");
        setSelectedDiamondId(row._id);
        setIsFormOpen(true);
      } else {
        toast.error(res?.message || "Failed to fetch diamond details");
      }
    } catch (err) {
      toast.error("Failed to fetch diamond details");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Diamond",
      text: "Are you sure want to delete this diamond?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await callApi(`${API_URL.DELETE_DIAMOND}/${id}`, "DELETE", null, token);
          if (res?.errorCode === STATUS_CODE.OK) {
            toast.success(res?.message || "Diamond deleted successfully");
            fetchDiamondData();
          } else {
            toast.error(res?.message || "Failed to delete diamond");
          }
        } catch (err) {
          toast.error("Failed to delete diamond");
        }
      }
    });
  };

  const handleToggleStatus = (id, newStatus) => {
    Swal.fire({
      title: "Change Status",
      text: "Are you sure want to change this diamond's status?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await callApi(`${API_URL.UPDATE_DIAMOND_STATUS}/${id}`, "PATCH", { status: newStatus }, token);
          if (res?.errorCode === STATUS_CODE.OK) {
            toast.success(res?.message || "Status updated successfully");
            fetchDiamondData();
          } else {
            toast.error(res?.message || "Failed to update status");
          }
        } catch (err) {
          toast.error("Failed to update status");
        }
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.stockId.trim()) {
      toast.error("Stock ID is required");
      return;
    }

    try {
      setAddUpdateLoading(true);
      const payload = { ...formValues };
      // Clean empty IDs to null
      const idFields = ['shape', 'color', 'clarity', 'cut', 'polish', 'symmetry', 'fluorescence', 'certLab'];
      idFields.forEach(field => {
        if (!payload[field]) payload[field] = null;
      });

      const url = formType === 'add' 
        ? `${API_URL.ADD_DIAMOND}` 
        : `${API_URL.UPDATE_DIAMOND}/${selectedDiamondId}`;
      const method = formType === 'add' ? 'POST' : 'PUT';

      const res = await callApi(url, method, payload, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success(res?.message || `Diamond ${formType === 'add' ? 'created' : 'updated'} successfully`);
        setIsFormOpen(false);
        fetchDiamondData();
      } else {
        toast.error(res?.message || `Failed to ${formType === 'add' ? 'create' : 'update'} diamond`);
      }
    } catch (err) {
      toast.error(`Failed to ${formType === 'add' ? 'create' : 'update'} diamond`);
    } finally {
      setAddUpdateLoading(false);
    }
  };

  const handleSort = (column, sortDirection) => {
    const fieldMap = {
      "Loat No": "stockId",
      "Status": "status",
      "Carat": "carat",
      "Colour": "color",
      "Clarity": "clarity",
      "Cut": "cut",
      "Polish": "polish",
      "symm": "symmetry",
      "Fluro": "fluorescence",
      "Lab": "certLab",
      "Certificate": "certNo",
      "Measurements": "sizeMM",
      "Price Per CTS": "ppc",
      "RAP": "rap",
      "Total Price": "price",
      "Discount": "disc",
    };
    const field = fieldMap[column.name] || "createdAt";
    setSortField(field);
    setSortOrder(sortDirection);
  };

  const [showInput, setShowInput] = useState(false);

  return (
    <>
      {uploadLoader && <FullScreenLoader />}
      {/* <Breadcrumbs /> */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold"> Diamond List</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="hand"
            onClick={handleFileExportAPI}
          >
            Export
          </Button>
          <Button
            variant="outline"
            className="hand"
            onClick={() => handleImportEvent(true)}
          >
            Import
          </Button>
          <Button
            className="hand bg-blue-600 hover:bg-blue-700 text-white"
            onClick={openAddModal}
          >
            Add Diamond
          </Button>
        </div>
      </div>
      {!isImport ? (
        <div className="pt-2">
          <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
            <div className="flex justify-between">

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="border h-8 flex justify-center items-center rounded-lg border-[#E4E8EE] p-1.5 transition-all duration-300 ease-in-out">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`
                        transition-all duration-500 ease-in-out
                        bg-transparent text-sm
                        ${showInput ? "w-40 px-2 visible" : "w-0 px-0 invisible"
                        }
                        border-none outline-none
                      `}
                    />
                    <Image
                      onClick={() => setShowInput(!showInput)}
                      src={`${PREFIX}/searchIcon.svg`}
                      alt="search Icon"
                      height={15}
                      width={15}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* RAP Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase">RAP (₹):</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minRap}
                    onChange={(e) => setMinRap(e.target.value)}
                    className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-stone-400"
                  />
                  <span className="text-xs text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxRap}
                    onChange={(e) => setMaxRap(e.target.value)}
                    className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-stone-400"
                  />
                </div>

                {/* Discount Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Disc (%):</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minDiscount}
                    onChange={(e) => setMinDiscount(e.target.value)}
                    className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-stone-400"
                  />
                  <span className="text-xs text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-20 h-8 px-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-stone-400"
                  />
                </div>

                {/* Advanced Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-8 px-3 text-xs flex items-center gap-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 rounded-lg cursor-pointer"
                >
                  {showAdvancedFilters ? "Hide Filters" : "More Filters"}
                </Button>

                {(minRap || maxRap || minDiscount || maxDiscount || selectedShape !== "all" || selectedColor !== "all" || selectedClarity !== "all" || selectedCut !== "all" || selectedPolish !== "all" || selectedSymmetry !== "all" || selectedFluorescence !== "all" || selectedLab !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMinRap("");
                      setMaxRap("");
                      setMinDiscount("");
                      setMaxDiscount("");
                      setSelectedShape("all");
                      setSelectedColor("all");
                      setSelectedClarity("all");
                      setSelectedCut("all");
                      setSelectedPolish("all");
                      setSelectedSymmetry("all");
                      setSelectedFluorescence("all");
                      setSelectedLab("all");
                    }}
                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 bg-transparent cursor-pointer font-semibold"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-3 mt-3 border-t border-stone-100">
                {/* Shape Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Shape</span>
                  <Select value={selectedShape} onValueChange={setSelectedShape}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {shapeList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Color</span>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {colorList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clarity Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Clarity</span>
                  <Select value={selectedClarity} onValueChange={setSelectedClarity}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {clarityList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cut Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Cut</span>
                  <Select value={selectedCut} onValueChange={setSelectedCut}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {cutList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Polish Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Polish</span>
                  <Select value={selectedPolish} onValueChange={setSelectedPolish}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {polishList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Symmetry Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Symmetry</span>
                  <Select value={selectedSymmetry} onValueChange={setSelectedSymmetry}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {symmetryList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fluorescence Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Fluro</span>
                  <Select value={selectedFluorescence} onValueChange={setSelectedFluorescence}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {fluorescenceList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lab Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Lab</span>
                  <Select value={selectedLab} onValueChange={setSelectedLab}>
                    <SelectTrigger className="h-8 text-xs border-stone-200 focus:ring-0">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {labList.map((p) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.code || p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DiamondTable
            tableData={diamondData}
            pagination={pagination}
            setPagination={setPagination}
            totalRows={totalRows}
            isLoading={isLoading}
            fetchDiamondData={fetchDiamondData}
            handleSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      ) : (
        <div className="pt-2">
          <div className="rounded-md border border-gray-200 p-2 mb-3 bg-white shadow-sm">
            <Button onClick={() => setIsImport(false)} className="hand">
              <MoveLeft />
              Diamond List
            </Button>
          </div>
          <div className="rounded-md border border-gray-200 p-4 mb-3 bg-white shadow-sm">
            <div className="flex items-center justify-center py-2 gap-4">
              <Button
                variant="outline"
                title="Download Sample file"
                className="hand"
              >
                <Link
                  href={"/sample-file/diamond-import-sample.csv"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download />
                  Sample File
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
                  className="w-[134px] h-[38px] transition-all duration-300 px-2 py-1 rounded-md shadow-none cursor-pointer"
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
                          Attach File
                        </>
                      ) : (
                        <>
                          <Paperclip size={20} />
                          Attach File
                        </>
                      )
                    ) : (
                      files?.name
                    )}
                  </label>
                </Button>
              </div>
            </div>
            <div className="flex justify-end mr-9 gap-4">
              <Button
                className="hand bg-black text-white"
                onClick={handleFileUploadAPI}
              >
                Upload Excel File
              </Button>
              <Button
                className={
                  files === ""
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-white hover:bg-gray-100 hand"
                }
                variant="outline"
                onClick={hamdleResetFile}
              >
                Reset
              </Button>
            </div>
          </div>
          <ImportHistoryTable
            diaType={diaType}
            isSuccess={isSuccess}
          />
        </div>
      )}
      <DiamondForm
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        formType={formType}
        formValues={formValues}
        setFormValues={setFormValues}
        handleFormSubmit={handleFormSubmit}
        addUpdateLoading={addUpdateLoading}
        shapeList={shapeList}
        colorList={colorList}
        clarityList={clarityList}
        cutList={cutList}
        polishList={polishList}
        symmetryList={symmetryList}
        fluorescenceList={fluorescenceList}
        labList={labList}
      />
    </>
  );
};

export default DiamondPage;