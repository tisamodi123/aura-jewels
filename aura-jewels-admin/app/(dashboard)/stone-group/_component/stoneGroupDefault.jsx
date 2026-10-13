"use client";
import React, { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/APIUrl";
import { callApi } from "@/lib/callApi";
import { STATUS_CODE, DIAMOND_TYPES, GEM_TYPES } from "@/lib/Constant";
import { toast } from "sonner";
import { Edit2, Trash, Check, X, Search } from "lucide-react";
import Swal from "sweetalert2";
import { useDebounce } from "use-debounce";

// Set to true to fetch from StoneGroup master unique values, or false for manual text inputs
const USE_STONE_GROUP_FETCH = true;

export default function StoneGroupDefault() {
  const token = getToken();

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [stoneType, setStoneType] = useState("diamond");
  const [type, setType] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedClarity, setSelectedClarity] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [origin, setOrigin] = useState("Both");
  const [sort, setSort] = useState(0);
  const [status, setStatus] = useState("ACTIVE");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Stone Group distinct values options
  const [stoneGroupCombinations, setStoneGroupCombinations] = useState([]);

  // Search & Pagination list
  const [historyList, setHistoryList] = useState([]);
  const [activeDefaults, setActiveDefaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  // Fetch current active defaults
  const fetchActiveDefaults = async () => {
    try {
      const res = await callApi(API_URL.STONE_GROUP_DEFAULT_ACTIVE, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        setActiveDefaults(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching active defaults:", error);
    }
  };

  // Fetch distinct stone group combinations
  const fetchStoneGroupCombinations = async () => {
    try {
      const res = await callApi(API_URL.STONE_GROUP_COMBINATIONS, "GET", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        setStoneGroupCombinations(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching stone group combinations:", error);
    }
  };

  // Fetch paginated history list
  const fetchHistoryList = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await callApi(API_URL.STONE_GROUP_DEFAULT_LIST, "POST", {
        page,
        limit: 10,
        search: debouncedSearch
      }, token);
      setIsLoading(false);
      if (res?.errorCode === STATUS_CODE.OK) {
        setHistoryList(res.data || []);
        if (res.pagination) {
          setPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            totalPages: res.pagination.totalPages
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching defaults history:", error);
    }
  };

  useEffect(() => {
    fetchActiveDefaults();
    fetchStoneGroupCombinations();
  }, []);

  useEffect(() => {
    fetchHistoryList(1);
  }, [debouncedSearch]);

  const resetForm = () => {
    setEditingId(null);
    setSelectedColor("");
    setSelectedClarity("");
    setDisplayName("");
    setOrigin("Both");
    setSort(0);
    setStatus("ACTIVE");
    setIsDefault(false);
    setType("");
  };

  const handleEditClick = (item) => {
    setEditingId(item._id || item.id);
    setStoneType(item.stoneType);
    setType(item.type || "");
    setSelectedColor(item.color || "");
    setSelectedClarity(item.clarity || "");
    setDisplayName(item.displayName || "");
    setOrigin(item.origin || "Both");
    setSort(item.sort || 0);
    setStatus(item.status || "ACTIVE");
    setIsDefault(item.isDefault || false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stoneType.toLowerCase() === "diamond") {
      if (!selectedColor) {
        toast.error("Color is required for Diamonds.");
        return;
      }
      if (!selectedClarity) {
        toast.error("Clarity is required for Diamonds.");
        return;
      }
    } else if (stoneType.toLowerCase() === DIAMOND_TYPES.GEMSTONE) {
      if (!type) {
        toast.error("Gemstone Type is required.");
        return;
      }
    }

    try {
      setIsSubmitLoading(true);
      const payload = {
        stoneType: stoneType.toLowerCase(),
        type: stoneType.toLowerCase() === DIAMOND_TYPES.GEMSTONE ? (type || null) : null,
        color: stoneType.toLowerCase() === "diamond" ? (selectedColor || null) : null,
        clarity: stoneType.toLowerCase() === "diamond" ? (selectedClarity || null) : null,
        displayName: displayName || undefined,
        origin: stoneType.toLowerCase() === "diamond" ? origin : "Both",
        sort: Number(sort) || 0,
        status: status || "ACTIVE",
        isDefault: isDefault
      };

      let res;
      if (editingId) {
        res = await callApi(`${API_URL.STONE_GROUP_DEFAULT_UPDATE}/${editingId}`, "PUT", payload, token);
      } else {
        res = await callApi(API_URL.STONE_GROUP_DEFAULT_ADD, "POST", payload, token);
      }

      setIsSubmitLoading(false);

      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success(res?.message || "Default parameter settings saved successfully.");
        resetForm();
        fetchActiveDefaults();
        fetchHistoryList(pagination.page);
      } else {
        toast.error(res?.message || "Failed to save default settings.");
      }
    } catch (error) {
      setIsSubmitLoading(false);
      toast.error("Error saving default settings.");
    }
  };

  const toggleDefault = async (id) => {
    try {
      const res = await callApi(`${API_URL.STONE_GROUP_DEFAULT_TOGGLE_DEFAULT}/${id}`, "PATCH", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success(res?.message || "Default status updated successfully.");
        fetchActiveDefaults();
        fetchHistoryList(pagination.page);
      } else {
        toast.error(res?.message || "Failed to update default status.");
      }
    } catch (error) {
      toast.error("Error updating default status.");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await callApi(`${API_URL.STONE_GROUP_DEFAULT_UPDATE_STATUS}/${id}`, "PATCH", null, token);
      if (res?.errorCode === STATUS_CODE.OK) {
        toast.success(res?.message || "Status updated successfully.");
        fetchActiveDefaults();
        fetchHistoryList(pagination.page);
      } else {
        toast.error(res?.message || "Failed to update status.");
      }
    } catch (error) {
      toast.error("Error updating status.");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Setting",
      text: "Are you sure you want to delete this configuration? You cannot delete the active default setting.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await callApi(`${API_URL.STONE_GROUP_DEFAULT_DELETE}/${id}`, "DELETE", null, token);
          if (res?.errorCode === STATUS_CODE.OK) {
            toast.success(res?.message || "Setting deleted successfully.");
            fetchActiveDefaults();
            fetchHistoryList(pagination.page);
          } else {
            toast.error(res?.message || "Cannot delete the configuration.");
          }
        } catch (error) {
          toast.error("Failed to delete setting.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top section: Configure new default */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Configuration" : "Add Quality / Default Configuration"}</h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-red-500 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stone Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={stoneType}
                  onChange={(e) => {
                    setStoneType(e.target.value);
                    setSelectedClarity("");
                    setType("");
                  }}
                  disabled={editingId}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none"
                >
                  {DIAMOND_TYPES.ALL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {stoneType.toLowerCase() === DIAMOND_TYPES.GEMSTONE ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gemstone Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={editingId}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none"
                  >
                    <option value="">Select Type</option>
                    {GEM_TYPES.ALL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  {USE_STONE_GROUP_FETCH ? (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Select Stone Group Combination (Color / Clarity) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedColor && selectedClarity ? `${selectedColor}|${selectedClarity}` : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [col, cla] = val.split("|");
                            setSelectedColor(col);
                            setSelectedClarity(cla);
                          } else {
                            setSelectedColor("");
                            setSelectedClarity("");
                          }
                        }}
                        disabled={editingId}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none"
                      >
                        <option value="">Select Combination</option>
                        {stoneGroupCombinations.map((comb, idx) => (
                          <option key={idx} value={`${comb.color}|${comb.clarity}`}>
                            {comb.color} / {comb.clarity}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. EF"
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          disabled={editingId}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none bg-white disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Clarity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. VVS"
                          value={selectedClarity}
                          onChange={(e) => setSelectedClarity(e.target.value)}
                          disabled={editingId}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none bg-white disabled:bg-gray-100"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Quality Specific Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. EF/VVS or Premium"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                />
              </div>

              {stoneType.toLowerCase() === "diamond" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Origin
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none"
                  >
                    <option value="Both">Both (LGD & Natural)</option>
                    <option value="Lab Grown">Lab Grown</option>
                    <option value="Natural">Natural</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-6 items-center pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-[#087B5D] focus:ring-[#087B5D]"
                />
                Mark as Active Default Setting
              </label>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="px-6 py-2 bg-[#087B5D] hover:bg-[#29AB87] text-white rounded-md cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmitLoading ? "Saving..." : editingId ? "Update Setting" : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active default view */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">Active Default Settings</h2>

          <div className="space-y-4">
            {activeDefaults.length > 0 ? (
              activeDefaults.map((defSetting) => {
                const typeLabel = defSetting.stoneType?.charAt(0).toUpperCase() + defSetting.stoneType?.slice(1);
                const subTypeLabel = defSetting.type ? ` (${defSetting.type.charAt(0).toUpperCase() + defSetting.type.slice(1)})` : "";
                return (
                  <div key={defSetting._id || defSetting.id} className="p-4 bg-zinc-50 rounded-md border">
                    <div className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">
                      {typeLabel}{subTypeLabel} Default
                    </div>
                    {defSetting.stoneType === "diamond" ? (
                      <div className="text-sm font-semibold text-gray-800">
                        Color: <span className="text-[#087B5D] font-bold">{defSetting.color || "None"}</span>
                        <br />
                        Clarity: <span className="text-[#087B5D] font-bold">{defSetting.clarity || "None"}</span>
                        <br />
                        Origin: <span className="text-[#087B5D] font-medium text-xs">{defSetting.origin}</span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-gray-800">
                        Type: <span className="text-[#087B5D] font-bold">{defSetting.type ? defSetting.type.toUpperCase() : "None"}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-400">No active default set</div>
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 font-sans">Settings & Qualities Master List</h2>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search quality..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b">
                <th className="p-4">Display Name</th>
                <th className="p-4">Stone Type</th>
                <th className="p-4">Gem Type</th>
                <th className="p-4">Color</th>
                <th className="p-4">Clarity</th>
                <th className="p-4">Origin</th>
                <th className="p-4 text-center">Sort</th>
                <th className="p-4 text-center">Default</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400">Loading configurations...</td>
                </tr>
              ) : historyList.length > 0 ? (
                historyList.map((item) => (
                  <tr key={item._id || item.id} className="border-b hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">
                      {item.displayName || `${item.color}/${item.clarity}`}
                    </td>
                    <td className="p-4 capitalize text-gray-600">
                      {item.stoneType}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.stoneType === "color stone" ? (item.type ? item.type.toUpperCase() : "-") : "-"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.stoneType === "diamond" ? (item.color || "N/A") : "-"}
                    </td>
                    <td className="p-4 text-gray-600">
                      {item.stoneType === "diamond" ? (item.clarity || "N/A") : "-"}
                    </td>
                    <td className="p-4 text-gray-600 text-xs font-semibold">
                      {item.stoneType === "diamond" ? (item.origin || "Both") : "-"}
                    </td>
                    <td className="p-4 text-center text-gray-600 font-medium">
                      {item.sort}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleDefault(item._id || item.id)}
                        className={`p-1 rounded transition-colors ${item.isDefault ? "text-green-600 bg-green-50" : "text-gray-300 hover:text-gray-500"}`}
                        title={item.isDefault ? "Currently Default" : "Set as Default"}
                      >
                        <Check size={18} className="mx-auto" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleStatus(item._id || item.id)}
                        className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${item.status === "ACTIVE" ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-red-700 bg-red-50 hover:bg-red-100"}`}
                        title="Click to toggle status"
                      >
                        {item.status || "ACTIVE"}
                      </button>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2 items-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                        title="Edit setting"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        disabled={item.isDefault}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                        title="Delete setting"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-400">No settings configuration found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
            <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchHistoryList(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => fetchHistoryList(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
