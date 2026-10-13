import React from 'react';
import { BespokeFormikProps } from './types';

interface RemarksSectionProps {
    formik: BespokeFormikProps;
}

export default function RemarksSection({ formik }: RemarksSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Additional Remarks
            </h3>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                Design Instructions & Ideas{' '}
                <span className="text-[10px] lowercase text-stone-400 font-light font-dm-sans">
                    (Optional)
                </span>
            </label>
            <textarea
                name="remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Please describe your design ideas or special requests for our master artisans..."
                rows={4}
                className="w-full bg-transparent border border-stone-200 text-stone-700 placeholder:text-stone-300 p-4 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors resize-none rounded-sm"
            />
            <p className="text-[11px] text-stone-400 leading-normal font-light">
                Describe your bespoke vision in detail. You can specify pattern preferences, desired
                finish, setting styles, chain lengths, or any other specific guidelines.
            </p>
        </div>
    );
}
