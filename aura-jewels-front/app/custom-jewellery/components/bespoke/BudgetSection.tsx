import React from 'react';
import { BespokeFormikProps } from './types';

interface BudgetSectionProps {
    formik: BespokeFormikProps;
}

export default function BudgetSection({ formik }: BudgetSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Budget
            </h3>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                Estimated Budget
            </label>
            <input
                type="text"
                name="budget"
                value={formik.values.budget}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. ₹75,000, $2,000, or Flexible"
                className="w-full bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
            />
            <p className="text-[11px] text-stone-400 leading-normal font-light">
                This helps us recommend the most suitable materials and design options within your preferred investment.
            </p>
        </div>
    );
}
