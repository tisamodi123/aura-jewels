import React from 'react';
import { Upload, X, Trash2, Plus } from 'lucide-react';
import { BespokeFormikProps } from './types';

interface InspirationSectionProps {
    formik: BespokeFormikProps;
}

export default function InspirationSection({ formik }: InspirationSectionProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            const oversized = filesArray.some(file => file.size > 50 * 1024 * 1024);
            if (oversized) {
                formik.setFieldError('attachments', 'One or more files exceed the maximum limit of 50MB.');
                return;
            }
            const currentFiles = formik.values.attachments || [];
            formik.setFieldValue('attachments', [...currentFiles, ...filesArray]);
            formik.setFieldError('attachments', undefined);
        }
    };

    const handleUrlChange = (index: number, value: string) => {
        const updated = [...formik.values.referenceUrls];
        updated[index] = value;
        formik.setFieldValue('referenceUrls', updated);
    };

    const addReferenceUrl = () => {
        formik.setFieldValue('referenceUrls', [...formik.values.referenceUrls, '']);
    };

    const removeReferenceUrl = (index: number) => {
        if (formik.values.referenceUrls.length > 1) {
            formik.setFieldValue('referenceUrls', formik.values.referenceUrls.filter((_, i) => i !== index));
        }
    };

    const removeAttachment = (index: number) => {
        const updated = (formik.values.attachments || []).filter((_, i) => i !== index);
        formik.setFieldValue('attachments', updated);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#B57A5A] border-b border-stone-100 pb-2">
                Upload Your Inspiration
            </h3>
            <p className="text-[11px] text-stone-500 leading-normal font-light">
                Upload anything that helps us understand your vision (Images, Videos, Sketches).
            </p>

            {/* Drag and Drop Container */}
            <div className="border border-dashed border-[#B57A5A]/30 hover:border-[#B57A5A] rounded-[2px] p-6 text-center hover:bg-stone-50/50 transition-all duration-300 relative bg-[#FAF9F6]">
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none space-y-2">
                    <Upload className="w-6 h-6 text-stone-400" />
                    <span className="text-xs text-stone-600 font-medium">
                        Drag and drop files here, or <span className="underline font-bold">click to browse</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                        {formik.values.attachments && formik.values.attachments.length > 0
                            ? `${formik.values.attachments.length} file(s) selected`
                            : 'Supports images, sketches, videos, or design PDFs up to 50MB'}
                    </span>
                </div>
            </div>

            {/* Selected Files List */}
            {formik.values.attachments && formik.values.attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                    <div className="space-y-1.5">
                        {formik.values.attachments.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-stone-50 px-3 py-2 border border-stone-200/60 rounded-sm">
                                <span className="text-xs text-stone-600 truncate max-w-[80%] font-medium">
                                    {file.name} <span className="text-[10px] text-stone-400 ml-1">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(idx)}
                                    className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {formik.errors.attachments && (
                <p className="text-[10px] text-red-500 mt-1">{formik.errors.attachments as string}</p>
            )}

            {/* Reference Links list */}
            <div className="space-y-4 pt-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                    Product Reference URLs (One Or More Optional Links)
                </label>
                <p className="text-[11px] text-stone-400 font-light -mt-2">
                    Link to custom reference online (Pinterest, Instagram, or any website)
                </p>
                <div className="space-y-3">
                    {formik.values.referenceUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleUrlChange(idx, e.target.value)}
                                placeholder="Link to custom reference online (Pinterest, Instagram, or any website)"
                                className="flex-grow bg-transparent border-b border-stone-200 text-stone-700 placeholder:text-stone-300 py-2.5 text-sm focus:outline-none focus:border-[#B57A5A] transition-colors"
                            />
                            {formik.values.referenceUrls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeReferenceUrl(idx)}
                                    className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addReferenceUrl}
                        className="mt-2 border border-stone-200 hover:border-[#B57A5A] text-[#B57A5A] hover:bg-[#B57A5A]/5 transition-colors py-2 px-4 text-xs font-bold font-dm-sans rounded-sm cursor-pointer inline-flex items-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Another Reference URL
                    </button>
                </div>
            </div>
        </div>
    );
}
