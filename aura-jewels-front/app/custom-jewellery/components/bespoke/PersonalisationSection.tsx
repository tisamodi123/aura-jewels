import React from 'react';
import { BespokeFormikProps } from './types';

interface PersonalisationSectionProps {
    formik: BespokeFormikProps;
}

export default function PersonalisationSection({ formik }: PersonalisationSectionProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Personalisation
            </h3>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                Engraving{' '}
                <span className="text-[10px] lowercase text-stone-400 font-light font-dm-sans">
                    (Optional)
                </span>
            </label>
            <input
                type="text"
                name="engraving"
                value={formik.values.engraving}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter letters, numbers, or symbols"
                className="w-full bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
            />
            <p className="text-[11px] text-stone-400 leading-normal font-light">
                Add a special name, initials, date, or meaningful message to engrave inside or on
                the custom jewel.
            </p>
        </div>
    );
}
