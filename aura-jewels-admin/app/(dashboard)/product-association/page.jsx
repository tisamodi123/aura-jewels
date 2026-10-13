"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE } from "@/lib/Constant";
import { toast } from "sonner";
import { Search } from "lucide-react";
import AssociationTable from "./_components/AssociationTable";
import "@/styles/jewellerylisttable.css";

export default function ProductAssociationPage() {
  const token = getToken();

  // Filter configuration states
  const [filterType, setFilterType] = useState("collection"); // 'collection' | 'tag'
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilterId, setSelectedFilterId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [associationMode, setAssociationMode] = useState("parent"); // 'parent' | 'sku'

  // Table lists and pagination states
  const [assignedData, setAssignedData] = useState([]);
  const [unassignedData, setUnassignedData] = useState([]);
  const [assignedTotal, setAssignedTotal] = useState(0);
  const [unassignedTotal, setUnassignedTotal] = useState(0);

  const [assignedPage, setAssignedPage] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Selection states
  const [selectedAssigned, setSelectedAssigned] = useState(new Set());
  const [selectedUnassigned, setSelectedUnassigned] = useState(new Set());

  // Load dropdown options based on filterType
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setFilterOptions([]);
        setSelectedFilterId("");

        let url = "";
        if (filterType === "collection") url = API_URL.GET_COLLECTIONS_LIST;
        else if (filterType === "tag") url = API_URL.GET_TAGS;

        const res = await callApi(url, "GET", null, token);
        if (res?.errorCode === STATUS_CODE.OK) {
          const list = res?.data || res?.result || [];
          setFilterOptions(list);
          if (list.length > 0) {
            setSelectedFilterId(list[0]._id);
          }
        }
      } catch (err) {
        console.error("Error loading filter options:", err);
      }
    };
    if (token) fetchOptions();
  }, [filterType, token]);

  // Load lists from both endpoints when filter changes
  const fetchAssociations = useCallback(async () => {
    if (!selectedFilterId) {
      setAssignedData([]);
      setUnassignedData([]);
      setAssignedTotal(0);
      setUnassignedTotal(0);
      return;
    }

    setIsLoading(true);
    try {
      // Load assigned
      const assignedBody = {
        filterType,
        filterId: selectedFilterId,
        assignedPage,
        unassignedPage,
        limit: pageSize,
        search: searchText,
        associationMode
      };

      const res = await callApi(
        `${API_URL.GET_JEWELLERY_LIST.replace("getProductList", "getProductAssociation")}`,
        "POST",
        assignedBody,
        token
      );

      if (res?.errorCode === STATUS_CODE.OK) {
        setAssignedData(res.assigned?.data || []);
        setAssignedTotal(res.assigned?.total || 0);

        setUnassignedData(res.unassigned?.data || []);
        setUnassignedTotal(res.unassigned?.total || 0);
      } else {
        toast.error(res?.message || "Failed to load associated products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching product associations.");
    } finally {
      setIsLoading(false);
    }
  }, [filterType, selectedFilterId, assignedPage, unassignedPage, pageSize, searchText, associationMode, token]);

  useEffect(() => {
    if (token && selectedFilterId) {
      fetchAssociations();
    }
  }, [selectedFilterId, assignedPage, unassignedPage, pageSize, searchText, associationMode, token, fetchAssociations]);

  // Clear selections only when base filter filters change, not on pagination
  useEffect(() => {
    setSelectedAssigned(new Set());
    setSelectedUnassigned(new Set());
  }, [selectedFilterId, filterType, associationMode]);

  // Handle transfer/moves
  const handleTransfer = async (action) => {
    const productIds = Array.from(action === "assign" ? selectedUnassigned : selectedAssigned);
    if (productIds.length === 0) {
      toast.warning("Please select at least one product to move.");
      return;
    }

    try {
      setIsLoading(true);
      const updateBody = {
        filterType,
        filterId: selectedFilterId,
        productIds,
        action, // 'assign' | 'unassign'
        associationMode
      };

      const res = await callApi(
        `${API_URL.GET_JEWELLERY_LIST.replace("getProductList", "updateProductAssociation")}`,
        "POST",
        updateBody,
        token
      );

      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success(res.message || "Moved successfully!");
        // Clear local select sets
        if (action === "assign") setSelectedUnassigned(new Set());
        else setSelectedAssigned(new Set());

        // Refresh grids
        fetchAssociations();
      } else {
        toast.error(res?.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error transferring products.");
    } finally {
      setIsLoading(false);
    }
  };

  // Selection toggle helper functions
  const toggleSelectAssigned = (id) => {
    const next = new Set(selectedAssigned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAssigned(next);
  };

  const toggleSelectUnassigned = (id) => {
    const next = new Set(selectedUnassigned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnassigned(next);
  };

  const toggleSelectAllAssigned = () => {
    const allCurrentSelected = assignedData.length > 0 && assignedData.every((d) => selectedAssigned.has(d._id));
    const next = new Set(selectedAssigned);
    if (allCurrentSelected) {
      assignedData.forEach((d) => next.delete(d._id));
    } else {
      assignedData.forEach((d) => next.add(d._id));
    }
    setSelectedAssigned(next);
  };

  const toggleSelectAllUnassigned = () => {
    const allCurrentSelected = unassignedData.length > 0 && unassignedData.every((d) => selectedUnassigned.has(d._id));
    const next = new Set(selectedUnassigned);
    if (allCurrentSelected) {
      unassignedData.forEach((d) => next.delete(d._id));
    } else {
      unassignedData.forEach((d) => next.add(d._id));
    }
    setSelectedUnassigned(next);
  };

  return (
    <div className="p-3 space-y-6 bg-zinc-50 min-h-screen text-zinc-800">

      {/* Header and Info */}
      {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-zinc-200">
      </div> */}
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Product Association Manager</h1>

      {/* Primary Filters Control Card */}
      <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-5 items-end">

        {/* Association Mode Select */}
        <div className="w-full md:w-1/5">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Select Mode
          </label>
          <select
            value={associationMode}
            onChange={(e) => setAssociationMode(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition"
          >
            <option value="parent">Parent Mode</option>
            <option value="sku">SKU Mode</option>
          </select>
        </div>

        {/* Type select */}
        <div className="w-full md:w-1/5">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Filter Mode
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition"
          >
            {/* <option value="category">Category</option> */}
            <option value="collection">Collection</option>
            <option value="tag">Tag</option>
          </select>
        </div>

        {/* Dynamic target select */}
        <div className="w-full md:w-1/3">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Select {filterType === "category" ? "Category" : filterType === "collection" ? "Collection" : "Tag"}
          </label>
          <select
            value={selectedFilterId}
            onChange={(e) => setSelectedFilterId(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition capitalize"
          >
            <option value="">-- Choose Target --</option>
            {filterOptions.map((opt) => (
              <option key={opt._id} value={opt._id}>
                {opt.categoryName || opt.collectionName || opt.name || opt.title || opt.code || "Unnamed Option"}
              </option>
            ))}
          </select>
        </div>

        {/* Live Search */}
        <div className="w-full md:w-1/4">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Search Products
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search design no, title, or SKU..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition"
            />
          </div>
        </div>

      </div>

      {/* Grids Layout - Stacked Horizontally/Vertically */}
      <div className="space-y-6">

        {/* 1. ASSIGNED PRODUCTS TABLE */}
        <AssociationTable
          subtitle="Assigned List"
          title="Currently Associated Products"
          isHeaderDark={true}
          data={assignedData}
          total={assignedTotal}
          page={assignedPage}
          pageSize={pageSize}
          setPage={setAssignedPage}
          setPageSize={setPageSize}
          selectedSet={selectedAssigned}
          toggleSelect={toggleSelectAssigned}
          toggleSelectAll={toggleSelectAllAssigned}
          emptyMessage="No assigned products found."
        />

        {/* 2. TRANSFER TOOLBAR DECK */}
        <div className="flex flex-row justify-center items-center gap-4 ">
          <button
            onClick={() => handleTransfer("assign")}
            disabled={selectedUnassigned.size === 0 || isLoading}
            className="flex items-center gap-2 px-3 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
          >
            Associate Selected Products (Move Up)
          </button>

          <button
            onClick={() => handleTransfer("unassign")}
            disabled={selectedAssigned.size === 0 || isLoading}
            className="flex items-center gap-2 px-3 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 rounded-xl font-bold shadow-md hover:shadow-lg disabled:bg-zinc-50 disabled:text-zinc-300 disabled:border-zinc-100 disabled:shadow-none active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
          >
            Remove Selected Products (Move Down)
          </button>
        </div>

        {/* 3. AVAILABLE PRODUCTS TABLE */}
        <AssociationTable
          subtitle="Unassigned List"
          title="Available Products"
          isHeaderDark={false}
          data={unassignedData}
          total={unassignedTotal}
          page={unassignedPage}
          pageSize={pageSize}
          setPage={setUnassignedPage}
          setPageSize={setPageSize}
          selectedSet={selectedUnassigned}
          toggleSelect={toggleSelectUnassigned}
          toggleSelectAll={toggleSelectAllUnassigned}
          emptyMessage="No unassigned products available."
        />

      </div>

    </div>
  );
}
