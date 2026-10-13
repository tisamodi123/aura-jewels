'use client';

import React from 'react';
import { X } from 'lucide-react';

export type SizeGuideType = 'ring' | 'bracelet' | 'necklace';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: SizeGuideType;
}

const HEADINGS: Record<SizeGuideType, string> = {
    ring: 'Ring Size Guide',
    bracelet: 'Bracelet Size Guide',
    necklace: 'Necklace Length Guide',
};

const DESCRIPTIONS: Record<SizeGuideType, string> = {
    ring: 'Measure the inside circumference or diameter of an existing well-fitting ring to find your perfect size.',
    bracelet: 'Measure your wrist with a flexible tape measure or strip of paper just below the wrist bone to choose the ideal fit.',
    necklace: 'Measure an existing necklace that sits where you like, or use a soft tape around your neck at the desired drop, to pick the ideal chain length.',
};

const TIPS: Record<SizeGuideType, string> = {
    ring: 'Rings with wider bands fit tighter. If your size falls between two options, we suggest ordering the larger size.',
    bracelet: 'Measure your wrist bone comfortably, and add 0.25 to 0.5 inches for a comfortable fit.',
    necklace: 'Lengths include the clasp. Pendants sit roughly 1 inch below the chain length shown — size up if you prefer a lower drop.',
};

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-stone-200 shadow-2xl rounded-sm max-w-md w-full p-6 flex flex-col gap-5 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-widest font-semibold text-[#C5A880] font-dm-sans">
                        Reference Chart
                    </span>
                    <h3 className="font-el-messiri text-2xl text-[#1A1A1A] font-normal">
                        {HEADINGS[type]}
                    </h3>
                    <p className="text-xs text-stone-500 font-dm-sans leading-relaxed">
                        {DESCRIPTIONS[type]}
                    </p>
                </div>

                {type === 'ring' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-dm-sans border-collapse border border-stone-200">
                            <thead>
                                <tr className="bg-stone-50 text-[#013D3D]">
                                    <th className="p-3 border border-stone-200 font-semibold">US & Canada</th>
                                    <th className="p-3 border border-stone-200 font-semibold">UK & Australia</th>
                                    <th className="p-3 border border-stone-200 font-semibold">India / Inside Diam.</th>
                                </tr>
                            </thead>
                            <tbody className="text-stone-600">
                                <tr>
                                    <td className="p-3 border border-stone-200">US 5</td>
                                    <td className="p-3 border border-stone-200">J 1/2</td>
                                    <td className="p-3 border border-stone-200">9 (15.7 mm)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">US 6</td>
                                    <td className="p-3 border border-stone-200">L 1/2</td>
                                    <td className="p-3 border border-stone-200">12 (16.5 mm)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">US 7</td>
                                    <td className="p-3 border border-stone-200">N 1/2</td>
                                    <td className="p-3 border border-stone-200">14 (17.3 mm)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">US 8</td>
                                    <td className="p-3 border border-stone-200">P 1/2</td>
                                    <td className="p-3 border border-stone-200">17 (18.1 mm)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">US 9</td>
                                    <td className="p-3 border border-stone-200">R 1/2</td>
                                    <td className="p-3 border border-stone-200">19 (18.9 mm)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">US 10</td>
                                    <td className="p-3 border border-stone-200">T 1/2</td>
                                    <td className="p-3 border border-stone-200">21 (19.8 mm)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : type === 'bracelet' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-dm-sans border-collapse border border-stone-200">
                            <thead>
                                <tr className="bg-stone-50 text-[#013D3D]">
                                    <th className="p-3 border border-stone-200 font-semibold">Size (Inches)</th>
                                    <th className="p-3 border border-stone-200 font-semibold">Size (cm)</th>
                                    <th className="p-3 border border-stone-200 font-semibold">Fits Wrist Size</th>
                                </tr>
                            </thead>
                            <tbody className="text-stone-600">
                                <tr>
                                    <td className="p-3 border border-stone-200">6.0 Inches</td>
                                    <td className="p-3 border border-stone-200">15.2 cm</td>
                                    <td className="p-3 border border-stone-200">Extra Small (XS)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">6.5 Inches</td>
                                    <td className="p-3 border border-stone-200">16.5 cm</td>
                                    <td className="p-3 border border-stone-200">Small (S)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">7.0 Inches</td>
                                    <td className="p-3 border border-stone-200">17.8 cm</td>
                                    <td className="p-3 border border-stone-200">Medium (M)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">7.5 Inches</td>
                                    <td className="p-3 border border-stone-200">19.1 cm</td>
                                    <td className="p-3 border border-stone-200">Large (L)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">8.0 Inches</td>
                                    <td className="p-3 border border-stone-200">20.3 cm</td>
                                    <td className="p-3 border border-stone-200">Extra Large (XL)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-dm-sans border-collapse border border-stone-200">
                            <thead>
                                <tr className="bg-stone-50 text-[#013D3D]">
                                    <th className="p-3 border border-stone-200 font-semibold">Length (Inches)</th>
                                    <th className="p-3 border border-stone-200 font-semibold">Length (cm)</th>
                                    <th className="p-3 border border-stone-200 font-semibold">Style / Fit</th>
                                </tr>
                            </thead>
                            <tbody className="text-stone-600">
                                <tr>
                                    <td className="p-3 border border-stone-200">14 Inches</td>
                                    <td className="p-3 border border-stone-200">35.6 cm</td>
                                    <td className="p-3 border border-stone-200">Collar — snug at neck base</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">16 Inches</td>
                                    <td className="p-3 border border-stone-200">40.6 cm</td>
                                    <td className="p-3 border border-stone-200">Choker — sits on the neck</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">18 Inches</td>
                                    <td className="p-3 border border-stone-200">45.7 cm</td>
                                    <td className="p-3 border border-stone-200">Princess — on the collarbone (most popular)</td>
                                </tr>
                                <tr className="bg-stone-50/50">
                                    <td className="p-3 border border-stone-200">20 Inches</td>
                                    <td className="p-3 border border-stone-200">50.8 cm</td>
                                    <td className="p-3 border border-stone-200">Matinee — just below the collarbone</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-stone-200">22–24 Inches</td>
                                    <td className="p-3 border border-stone-200">55.9–61.0 cm</td>
                                    <td className="p-3 border border-stone-200">Opera — mid-chest</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 bg-stone-50 border border-stone-200 text-[11px] text-stone-500 font-dm-sans rounded-sm leading-relaxed">
                    <strong>Tip:</strong> {TIPS[type]}
                </div>

                <div className="text-center">
                    <button
                        onClick={onClose}
                        className="bg-[#013D3D] text-white hover:bg-[#002424] transition-colors py-3 px-8 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer w-full sm:w-auto"
                    >
                        Close Chart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SizeGuideModal;