'use client';

import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { getWallet, getWalletTransactions } from '@/services/walletService';
import { formatPrice } from '@/lib/priceUtils';
import { STATUS_CODE } from '@/lib/constants';

interface Txn {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    balanceAfter: number;
    source: string;
    note?: string;
    createdAt: string;
}

const SOURCE_LABEL: Record<string, string> = {
    refund: 'Refund credited',
    order: 'Used on order',
    adjustment: 'Adjustment',
    reversal: 'Order reversal',
};

export default function MyWallet() {
    const [balance, setBalance] = useState<number>(0);
    const [txns, setTxns] = useState<Txn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [w, t] = await Promise.all([getWallet(), getWalletTransactions(1, 50)]);
                if (w && (w.errorCode === STATUS_CODE.OK || w.status === STATUS_CODE.OK)) {
                    setBalance(Number(w.data?.balance) || 0);
                }
                if (t && (t.errorCode === STATUS_CODE.OK || t.status === STATUS_CODE.OK)) {
                    setTxns(Array.isArray(t.data) ? t.data : []);
                }
            } catch (e) {
                console.error('wallet load error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-jakarta font-medium text-gray-900 uppercase tracking-wide mb-1">
                    My Wallet
                </h1>
                <p className="text-sm text-gray-500 font-jakarta">
                    Use your store credit towards any order at checkout.
                </p>
            </div>

            {/* Balance card */}
            <div className="bg-[#B57A5A] text-white rounded-xl p-6 md:p-8 flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-jakarta font-bold mb-2">
                        Available Balance
                    </p>
                    <p className="text-3xl md:text-4xl font-jakarta font-bold">
                        {loading ? '—' : formatPrice(balance)}
                    </p>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <WalletIcon className="w-7 h-7 text-white" />
                </div>
            </div>

            {/* Transactions */}
            <div>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#B57A5A] font-jakarta mb-4">
                    Transaction History
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : txns.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-lg p-10 text-center text-gray-400 font-jakarta text-sm">
                        No wallet activity yet. Refunds credited to your wallet will appear here.
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-lg divide-y divide-gray-50">
                        {txns.map((t) => {
                            const isCredit = t.type === 'credit';
                            return (
                                <div key={t._id} className="flex items-center gap-4 p-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-jakarta font-semibold text-gray-900">
                                            {SOURCE_LABEL[t.source] || (isCredit ? 'Credit' : 'Debit')}
                                        </p>
                                        <p className="text-xs text-gray-400 font-jakarta truncate">
                                            {t.note || ''}{t.note ? ' · ' : ''}
                                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-jakarta font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isCredit ? '+' : '−'}{formatPrice(t.amount)}
                                        </p>
                                        <p className="text-[11px] text-gray-400 font-jakarta">Bal: {formatPrice(t.balanceAfter)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
