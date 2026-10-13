'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import AddressForm from './_components/AddressForm';
import { toast } from 'sonner';
import { getToken } from '@/services/clientCookies';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';

const AddressesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAddresses = async () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await callApi(ENDPOINTS.ADDRESS.GET_ADDRESSES, "GET", null, token);
            if (response && (response.status === 200 || response.errorCode === 200)) {
                setAddresses(response.addresses || response.data || []);
            }
        } catch (error) {
            console.error("Error loading addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const handleEdit = (addr: any) => {
        setEditingAddress(addr);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    const handleDelete = async (addressId: string) => {
        const token = getToken();
        if (!token) return;
        if (confirm("Are you sure you want to delete this address?")) {
            try {
                const response = await callApi(ENDPOINTS.ADDRESS.DELETE_ADDRESS(addressId), "DELETE", null, token);
                if (response && (response.status === 200 || response.errorCode === 200)) {
                    toast.success("Address deleted successfully");
                    loadAddresses();
                } else {
                    toast.error(response.message || "Failed to delete address");
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to delete address");
            }
        }
    };

    return (
        <div className="bg-white shadow-sm border border-gray-100 animate-fadeIn relative">
            {/* Conditional Header */}
            {!showForm ? (
                <div className="bg-[#F5EBE4] px-6 py-2.5 flex items-center justify-between">
                    <h3 className="text-xl serif text-gray-800 tracking-wider uppercase">My Addresses</h3>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[#B57A5A] text-white px-8 py-2 text-[11px] font-bold tracking-[0.2em] hover:bg-[#9C684B] transition-all flex items-center gap-2 uppercase"
                    >
                        + ADD ADDRESS
                    </button>
                </div>
            ) : null}

            {/* Content Section */}
            <div>
                {showForm ? (
                    <AddressForm
                        onClose={handleCloseForm}
                        initialValues={editingAddress}
                        onSuccess={loadAddresses}
                    />
                ) : (
                    <>
                        {/* Divider */}
                        <div className="h-[1px] bg-gray-100 w-full"></div>
                        <div className="p-6 md:p-10 min-h-[400px]">
                            {loading ? (
                                <div className="flex items-center justify-center min-h-[200px]">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B57A5A]"></div>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                                    <p className="font-jakarta text-sm">No saved addresses found.</p>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="text-[#B57A5A] underline font-bold mt-2 text-sm hover:text-black font-jakarta"
                                    >
                                        Add your first address
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {addresses.map((addr) => (
                                        <div key={addr._id || addr.id} className="border border-gray-100 p-6 md:p-8 relative group hover:shadow-md transition-shadow duration-300 max-w-md w-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold text-gray-900 font-jakarta">{addr.firstName} {addr.lastName}</h4>
                                                    {addr.isDefault && (
                                                        <span className="bg-[#F5F2EC] text-[#FF5252] text-[9px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(addr)}
                                                        className="text-gray-400 hover:text-[#B57A5A] transition-colors"
                                                        title="Edit Address"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(addr._id || addr.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete Address"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-500 font-jakarta leading-relaxed">
                                                <p>{addr.email}</p>
                                                <p>{addr.phone}</p>
                                                <p className="pt-2">{addr.address}</p>
                                                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                                                <p>{addr.country}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AddressesPage;