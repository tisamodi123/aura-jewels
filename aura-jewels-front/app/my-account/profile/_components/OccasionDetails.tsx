import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';

type Occasion = { recipient: string; type: string; date: string | Date | null };

interface OccasionDetailsProps {
    occasions: Occasion[];
    setOccasions: React.Dispatch<React.SetStateAction<Occasion[]>>;
    isSaving: boolean;
    onSubmit: () => void;
    errorMsg: (msg: string) => void;
}

const fmt = (v: any): string => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
};

export default function OccasionDetails({
    occasions,
    setOccasions,
    isSaving,
    onSubmit,
    errorMsg,
}: OccasionDetailsProps) {
    const [giftRecipient, setGiftRecipient] = useState('Wife');
    const [occasionType, setOccasionType] = useState('Birthday');
    const [occasionDate, setOccasionDate] = useState<Date | null>(null);

    const addOccasion = () => {
        if (!occasionDate) {
            errorMsg('Pick a date for the occasion');
            return;
        }
        setOccasions((prev) => [...prev, { recipient: giftRecipient, type: occasionType, date: occasionDate }]);
        setOccasionDate(null);
    };

    const removeOccasion = (idx: number) => {
        setOccasions((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="bg-[#FAF6F3] shadow-sm border border-gray-100">
            <div className="bg-[#F5EBE4] py-3 px-6">
                <h3 className="text-xl serif text-gray-800">Occasion Details</h3>
            </div>
            <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-12 bg-white">
                <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 font-jakarta">Who Are You Most Likely To Gift?</h4>
                        <div className="flex flex-wrap gap-3">
                            {['Self', 'Wife', 'Mother', 'Father', 'Sister', 'Daughter', 'Son', 'Girlfriend', 'Brother'].map(r => (
                                <button key={r} type="button" onClick={() => setGiftRecipient(r)}
                                    className={`px-4 py-1.5 rounded-md border text-xs font-jakarta transition-all ${giftRecipient === r ? 'border-[#B57A5A] bg-[#B57A5A] text-white' : 'border-gray-200 text-gray-400 bg-white hover:border-gray-400'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 font-jakarta">Tell Us Which Dates Are Important For You?</h4>
                        <div className="relative">
                            <DatePicker selected={occasionDate} onChange={(date: Date | null) => setOccasionDate(date)} dateFormat="dd-MM-yyyy" placeholderText="Date Of Occasion"
                                className="w-full border border-transparent py-2 px-4 bg-[#F5EBE4] text-sm font-jakarta outline-none rounded-md" wrapperClassName="w-full" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"><Calendar className="w-4 h-4 text-gray-400" /></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900 font-jakarta">Are You Celebrating An Occasion?</h4>
                        <div className="flex flex-wrap gap-3">
                            {['Anniversary', 'Birthday', 'Engagement', 'Wedding'].map(o => (
                                <button key={o} type="button" onClick={() => setOccasionType(o)}
                                    className={`px-4 py-1.5 rounded-md border text-xs font-jakarta transition-all ${occasionType === o ? 'border-[#B57A5A] bg-[#B57A5A] text-white' : 'border-gray-200 text-gray-400 bg-white hover:border-gray-400'}`}>
                                    {o}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={addOccasion} className="flex-1 bg-white text-xs md:text-sm text-[#B57A5A] border border-[#B57A5A] py-2 font-jakarta tracking-widest hover:bg-gray-50">
                            ADD OCCASION
                        </button>
                        <button type="button" onClick={onSubmit} disabled={isSaving} className="flex-1 text-xs md:text-sm bg-[#B57A5A] text-white py-2 font-jakarta tracking-widest hover:opacity-90 disabled:opacity-50">
                            {isSaving ? 'SAVING...' : 'SAVE DETAILS'}
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:w-80 bg-[#F9FAFA] p-5 rounded-xl border border-gray-50 self-start">
                    <h4 className="text-sm font-bold text-gray-900 font-jakarta mb-4">Your Occasion Details</h4>
                    <div className="space-y-3">
                        {occasions.length === 0 && <p className="text-xs text-gray-400 font-jakarta">No occasions added yet.</p>}
                        {occasions.map((occ, idx) => (
                            <div key={idx} className="bg-[#F5EBE4] p-3 rounded-md flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-xs font-jakarta text-gray-600">{occ.recipient} {occ.type}</p>
                                    <p className="text-xs font-jakarta text-gray-500">{fmt(occ.date)}</p>
                                </div>
                                <button type="button" onClick={() => removeOccasion(idx)} className="text-gray-400 hover:text-red-500" title="Remove">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 font-jakarta mt-3">Occasions are saved when you click SAVE DETAILS.</p>
                </div>
            </div>
        </div>
    );
}
