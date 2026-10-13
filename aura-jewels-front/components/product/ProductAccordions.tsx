import React, { useState } from 'react';
import { ChevronDown, Info, Tag, Diamond } from 'lucide-react';
import { formatPrice } from '@/lib/priceUtils';
import { computeTax, withTax, taxRowLabel } from '@/lib/taxUtils';
import { formatShipmentDays } from '@/lib/shipmentDays';
import { useGlobleStore } from '@/store/globleStore';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { GSI_IMAGE, IGI_IMAGE } from '@/lib/constants';

interface ProductAccordionsProps {
    product: any;
    displayPrice: number;
    offerDetails?: any;
    selectedDiamondOrigin?: string;
}

// Stone weights are carats for diamonds, but `size` on a colour stone / gem is a
// millimetre dimension ("4.40 x 2.70"). Render a number as carats and pass any
// non-numeric label through untouched rather than coercing it to NaN.
const formatCarat = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isFinite(n)) return n > 0 ? `${n.toFixed(3)} ct` : '-';
    return String(value);
};

// De-duplicate while preserving the order the stones are listed in, so a ring set
// with round + pear reads "ROUND / PEAR", not an arbitrary re-ordering.
const uniqueInOrder = (values: (string | undefined | null)[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
        const s = String(v ?? '').trim();
        if (!s || seen.has(s.toUpperCase())) continue;
        seen.add(s.toUpperCase());
        out.push(s);
    }
    return out;
};

/**
 * Collapse a set of stones into one description: the shapes present, the
 * colour/clarity grades present, and the combined pieces and carat weight.
 * Handles both the current `stoneDetails` shape and the legacy
 * `jewelry_diamonds` shape.
 */
const summariseStones = (stones: any[]) => {
    const shapes = uniqueInOrder(stones.map((s) => s.shape || s.shape_name?.paraname));
    const colors = uniqueInOrder(stones.map((s) => s.color ?? s.stonecolor));
    const clarities = uniqueInOrder(stones.map((s) => s.clarity ?? s.stoneclarity));

    // A Label Master rule replaces the raw grade for display. Only use the
    // labels when EVERY stone has one — a half-labelled list would read as if
    // some stones were a different quality.
    const labels = stones.map((s) => s.labelName).filter(Boolean);
    const allLabelled = labels.length === stones.length && labels.length > 0;

    const pieces = stones.reduce(
        (sum, s) => sum + (Number(s.pieces ?? s.totaldiamonds) || 0), 0
    );

    // `totalCarat` is the row total (size x pieces); `weight` is the same figure
    // under the older field name. Never multiply by pieces again here.
    const carats = stones.reduce(
        (sum, s) => sum + (Number(s.totalCarat ?? s.weight ?? s.totalweight) || 0), 0
    );

    return {
        shapes: shapes.length ? shapes.join(', ') : '-',
        colors: colors.length ? colors.join(', ') : '-',
        clarities: clarities.length ? clarities.join(', ') : '-',
        // Non-null only when every stone carries a Label Master rule.
        label: allLabelled ? uniqueInOrder(labels).join(', ') : null,
        pieces,
        carats,
    };
};

const ProductAccordions: React.FC<ProductAccordionsProps> = ({ product, displayPrice, offerDetails, selectedDiamondOrigin }) => {
    const [openSection, setOpenSection] = useState<string | null>('details');
    const { currency, currencySymbol, country } = useGlobleStore();

    // GST is charged on the post-offer net, exactly as the cart/order do — so the
    // breakup's Grand Total is the true all-in amount the customer will pay for
    // this item. `displayPrice` is already the discounted price when an offer
    // applies, so it IS the net.
    const gstAmount = computeTax(Number(displayPrice), country);
    const grandTotalInclTax = withTax(Number(displayPrice), country);
    let DefaultPriceSource = selectedDiamondOrigin
        ? (selectedDiamondOrigin.toLowerCase() === 'natural' ? 'natural_price' : 'lgd_price')
        : (product?.defaultPriceSource || 'lgd_price');

    // Derived offer helpers
    const hasOffer = !!(offerDetails?.offer?._id);
    const targetField = offerDetails?.targetField || '';
    const discountAmount = hasOffer ? (offerDetails.discountAmount || 0) : 0;
    // Combined offer: a separate % on making charge and on diamond value.
    const isCombined = targetField === 'combined';
    const combinedComponents: any[] = isCombined ? (offerDetails?.components || []) : [];
    const makingComp = combinedComponents.find((c: any) => c.field === 'labourPrice');
    const diamondComp = combinedComponents.find((c: any) => c.field === 'TotalDiamondPrice');
    const isDiamondDiscounted = hasOffer && (targetField === 'TotalDiamondPrice' || !!diamondComp);
    const isMakingDiscounted = hasOffer && (targetField === 'labourPrice' || !!makingComp);
    const isComponentDiscounted = isDiamondDiscounted || isMakingDiscounted;
    const combinedLabel = isCombined
        ? [makingComp ? `${makingComp.percent}% Making` : null, diamondComp ? `${diamondComp.percent}% Diamond` : null]
            .filter(Boolean).join(' + ') + ' OFF'
        : null;
    const discountLabel = hasOffer
        ? (isCombined
            ? combinedLabel
            : offerDetails.offer?.discountType === 'percentage'
                ? `${offerDetails.offer.discountValue}% OFF`
                : `Save ${formatPrice(discountAmount)}`)
        : null;
    const offerName = offerDetails?.offer?.name || '';
    const toggleSection = (section: string) => {
        setOpenSection(prev => (prev === section ? null : section));
    };
    // Product detail values mapped as per specification/image
    const skuText = product?.sku || product?.itemCode || product?.itemcode || product?.variantSku || '-';
    const metalStampText = [product?.metalStampDetail?.karat || product?.metalstamp, product?.metalTypeDetail?.metalName || product?.metaltype].filter(Boolean).join(' ') || '-';
    const categoryName = product?.categoryDetails?.categoryName || product?.categoryName || (typeof product?.category === 'string' ? product.category : product?.category?.name) || '-';
    const categoryText = categoryName !== '-' ? String(categoryName).toUpperCase() : '-';

    const rawGoldWgt = product?.appxMetalWgt ?? product?.metalweight;
    const goldWeightText = (rawGoldWgt !== null && rawGoldWgt !== undefined && Number(rawGoldWgt) > 0) ? `${Number(rawGoldWgt).toFixed(3).replace(/\.?0+$/, '')} g` : '-';

    const rawDiaWgt = product?.totalCarat ?? product?.total_carat;
    const totalDiamondWeightText = (rawDiaWgt !== null && rawDiaWgt !== undefined && Number(rawDiaWgt) > 0) ? `${Number(rawDiaWgt).toFixed(3)} ct` : '-';

    const rawGross = product?.grossWeight ?? product?.totalProductWeight ?? product?.totalProductWgt;
    let calculatedGross: number | null = null;
    if (rawGross !== null && rawGross !== undefined && Number(rawGross) > 0) {
        calculatedGross = Number(rawGross);
    } else {
        const gW = Number(rawGoldWgt || 0);
        const dW = Number(rawDiaWgt || 0);
        if (gW > 0 || dW > 0) {
            calculatedGross = gW + (dW * 0.2);
        }
    }
    const totalProductWeightText = calculatedGross !== null && calculatedGross > 0
        ? `${calculatedGross.toFixed(3).replace(/\.?0+$/, '')} g`
        : '-';

    const shippingDaysText = formatShipmentDays(product?.shipmentDays || product?.shipmentdays || product?.expectedShippingDays) || '15 to 17 Days';

    return (
        <div className="w-full flex flex-col font-sans border border-[#ECECEC] bg-white rounded-none">
            {/* Product Details Section */}
            <div className="overflow-hidden border-b border-[#ECECEC] last:border-0">
                <button
                    onClick={() => toggleSection('details')}
                    className="w-full px-6 py-5 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors"
                >
                    <span className="text-[14px] font-bold tracking-widest text-[#1F1F1F] uppercase flex items-center gap-3">
                        <Diamond className="w-4 h-4 text-[#B57A5A] shrink-0 fill-current opacity-90" strokeWidth={1} />
                        Product Details
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'details' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSection === 'details' ? 'max-h-[1200px]' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 pt-0">
                        {product?.productDesc && (
                            <p className="text-[13px] text-[#4A4A4A] leading-relaxed mb-4">
                                {product.productDesc}
                            </p>
                        )}
                        <div className="flex flex-col">
                            <DetailRow label="SKU" value={skuText} />
                            <DetailRow label="METAL STAMP" value={metalStampText} />
                            <DetailRow label="CATEGORY" value={categoryText} />
                            <DetailRow label="GOLD WEIGHT (APPROX)" value={goldWeightText} />
                            <DetailRow label="TOTAL DIAMOND WEIGHT" value={totalDiamondWeightText} />
                            <DetailRow label="TOTAL PRODUCT WEIGHT (APPROX)" value={totalProductWeightText} />
                            <DetailRow label="EXPECTED SHIPPING DAYS" value={shippingDaysText} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Stone Details Section */}
            {(() => {
                const stones = product?.stoneDetails || [];
                const centerStones = stones.filter((s: any) => s.type?.toUpperCase() === 'CENTER');
                if (centerStones.length === 0) return null;

                return (
                    <div className="overflow-hidden border-b border-[#ECECEC] last:border-0">
                        <button
                            onClick={() => toggleSection('centerStone')}
                            className="w-full px-6 py-5 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-[14px] font-bold tracking-widest text-[#1F1F1F] uppercase flex items-center gap-3">
                                <Diamond className="w-4 h-4 text-[#B57A5A] shrink-0 fill-current opacity-90" strokeWidth={1} />
                                Center Diamond Details
                            </span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'centerStone' ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openSection === 'centerStone' ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <div className="px-6 pb-6 pt-0 flex flex-col">
                                {centerStones.map((s: any, idx: number) => (
                                    <div key={idx} className="flex flex-col mb-4 last:mb-0">
                                        {centerStones.length > 1 && (
                                            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-jakarta bg-gray-50 px-3 py-1 self-start rounded-full">
                                                Diamond #{idx + 1}
                                            </div>
                                        )}
                                        <DetailRow label="Shape" value={s.shape} />
                                        {s.labelName ? (
                                            <DetailRow label="Color / Clarity" value={s.labelName} />
                                        ) : (
                                            <>
                                                <DetailRow label="Color" value={s.color} />
                                                <DetailRow label="Clarity" value={s.clarity} />
                                            </>
                                        )}
                                        <DetailRow label="Pieces" value={s.pieces} />
                                        <DetailRow label="Total Weight" value={formatCarat(s.totalCarat ?? s.weight)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Side Stone Details Section */}
            {(() => {
                const stones = product?.stoneDetails || [];
                const sideStones = stones.filter((s: any) => s.type?.toUpperCase() === 'SIDE');

                const finalSideStones = sideStones.length > 0 ? sideStones : (stones.length === 0 ? (product?.jewelry_diamonds || []) : []);
                if (finalSideStones.length === 0) return null;

                const summary = summariseStones(finalSideStones);

                return (
                    <div className="overflow-hidden border-b border-[#ECECEC] last:border-0">
                        <button
                            onClick={() => toggleSection('sideStone')}
                            className="w-full px-6 py-5 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-[14px] font-bold tracking-widest text-[#1F1F1F] uppercase flex items-center gap-3">
                                <Diamond className="w-4 h-4 text-[#B57A5A] shrink-0 fill-current opacity-90" strokeWidth={1} />
                                Side Diamond Details
                            </span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'sideStone' ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openSection === 'sideStone' ? 'max-h-[800px]' : 'max-h-0'}`}>
                            <div className="px-6 pb-6 pt-0 flex flex-col">
                                <DetailRow label="Shape" value={summary.shapes} />
                                {summary.label ? (
                                    <DetailRow label="Color / Clarity" value={summary.label} />
                                ) : (
                                    <>
                                        <DetailRow label="Color" value={summary.colors} />
                                        <DetailRow label="Clarity" value={summary.clarities} />
                                    </>
                                )}
                                <DetailRow label="Pieces" value={summary.pieces} />
                                <DetailRow label="Total Weight" value={formatCarat(summary.carats)} />
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Price Breakup Section */}
            <div className="overflow-hidden border-b border-[#ECECEC] last:border-0">
                <button
                    onClick={() => toggleSection('price')}
                    className="w-full px-6 py-5 flex items-center justify-between text-left group hover:bg-gray-50 transition-colors"
                >
                    <span className="text-[14px] font-bold tracking-widest text-[#1F1F1F] uppercase flex items-center gap-3">
                        <Diamond className="w-4 h-4 text-[#B57A5A] shrink-0 fill-current opacity-90" strokeWidth={1} />
                        Price Breakup
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openSection === 'price' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSection === 'price' ? 'max-h-[1200px]' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 pt-0 space-y-4 overflow-x-auto">
                        {/* Gold Table */}
                        <PriceTable
                            rows={[]}
                            totalLabel="Total Gold Value"
                            totalValue={formatPrice(Number(product?.metalPrice))}
                            totalWeight={product?.appxMetalWgt ? `${Number(product.appxMetalWgt).toFixed(3).replace(/\.?0+$/, '')} g` : '-'}
                        />

                        {/* Dynamic Diamond Table */}
                        {(() => {
                            const stones = product?.stoneDetails || [];
                            const list = stones.length > 0 ? stones : [];
                            if (list.length === 0) return null;

                            const getStonePriceAndRate = (s: any) => {
                                const isCenterStone = s.type?.toUpperCase() === 'CENTER';
                                let useNatural = false;
                                if (isCenterStone) {
                                    useNatural = selectedDiamondOrigin?.toLowerCase() === 'natural';
                                } else {
                                    const price = Number(s.price || s.finalValue || 0);
                                    if (s.naturalPrice !== undefined && s.naturalPrice !== null && s.lgdPrice !== undefined && s.lgdPrice !== null) {
                                        useNatural = Math.abs(price - Number(s.naturalPrice)) < 0.1;
                                    } else {
                                        useNatural = DefaultPriceSource === 'natural_price';
                                    }
                                }

                                const price = useNatural
                                    ? Number(s.naturalPrice !== undefined && s.naturalPrice !== null ? s.naturalPrice : (s.price || 0))
                                    : Number(s.lgdPrice !== undefined && s.lgdPrice !== null ? s.lgdPrice : (s.price || 0));

                                const rate = useNatural
                                    ? Number(s.stoneGroup?.natural_price || s.stoneGroup?.lgd_price || 0)
                                    : Number(s.stoneGroup?.lgd_price || s.stoneGroup?.natural_price || 0);

                                return { price, rate };
                            };


                            const rows = list.map((s: any) => {
                                const grade = s.labelName || `${s.color || ''}/${s.clarity || ''}`;
                                const desc = `${grade} ${s.shape || ''} - ${s.pieces}`;
                                const { price: stonePrice, rate: stoneRate } = getStonePriceAndRate(s);
                                const rateVal = stoneRate > 0
                                    ? `${currencySymbol} ${Number(stoneRate).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', { minimumFractionDigits: currency === 'INR' ? 0 : 2, maximumFractionDigits: currency === 'INR' ? 2 : 2 })} / ct`
                                    : '-';
                                const weightVal = `${Number(s.totalCarat || s.weight || s.totalweight || 0).toFixed(3)} ct`;
                                const finalVal = formatPrice(stonePrice);

                                return {
                                    component: desc,
                                    rate: rateVal,
                                    weight: weightVal,
                                    value: finalVal
                                };
                            });

                            const rawDiamondTotal = product?.sync_dia_price
                                ? Number(product.sync_dia_price)
                                : list.reduce((sum: number, s: any) => sum + getStonePriceAndRate(s).price, 0);

                            const totalPieces = list.reduce(
                                (sum: number, s: any) => sum + (Number(s.pieces ?? s.totaldiamonds) || 0), 0
                            );

                            const totalCarats = list.reduce(
                                (sum: number, s: any) => sum + (Number(s.totalCarat ?? s.weight ?? s.totalweight) || 0), 0
                            );

                            const otherCharges = Number(product?.otherChargePrice || 0);

                            return (
                                <>
                                    <PriceTable
                                        rows={[]}
                                        totalLabel={totalPieces > 0 ? `Total Diamond Value (${totalPieces} Pcs)` : 'Total Diamond Value'}
                                        totalValue={formatPrice(rawDiamondTotal + otherCharges)}
                                        totalWeight={totalCarats > 0 ? `${totalCarats.toFixed(3)} ct` : '-'}
                                    />
                                    {isDiamondDiscounted && (
                                        <div className="grid grid-cols-4 border border-green-250 rounded-none overflow-hidden bg-green-50/50">
                                            <div className="px-3.5 py-3 text-[11px] font-bold text-green-805 border-r border-green-200 col-span-2 flex items-center gap-1 font-jakarta">
                                                <Tag className="w-3.5 h-3.5" /> Diamond Offer{offerName ? ` · ${offerName}` : ''}
                                            </div>
                                            <div className="px-3 py-3 text-[11px] text-center text-green-708 border-r border-green-200 font-semibold font-jakarta">
                                                {diamondComp ? `${diamondComp.percent}% OFF` : discountLabel}
                                            </div>
                                            <div className="px-3.5 py-3 text-[11px] text-right font-extrabold text-green-805 font-jakarta">
                                                - {formatPrice(diamondComp ? diamondComp.amount : discountAmount)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Charges & Totals in Styled Boxes */}
                        <div className="space-y-3">
                            {hasOffer && (targetField === 'labourPrice' || makingComp) ? (
                                (() => {
                                    const origVal = makingComp ? makingComp.originalValue : offerDetails.originalValue;
                                    const cutVal = makingComp ? makingComp.amount : discountAmount;
                                    const discVal = Number(origVal) - Number(cutVal);
                                    const label = makingComp ? `${makingComp.percent}% OFF` : discountLabel;
                                    return (
                                        <div className="grid grid-cols-4 border border-green-255 rounded-none overflow-hidden bg-green-50/50 font-jakarta">
                                            <div className="px-3.5 py-3 text-[11px] font-bold text-green-805 border-r border-green-200 font-jakarta">
                                                Making Charges
                                            </div>
                                            <div className="px-3 py-3 text-[11px] text-center text-green-708 border-r border-green-200 col-span-2 font-semibold flex items-center justify-center gap-1 font-jakarta">
                                                <Tag className="w-3.5 h-3.5" /> {label}{offerName ? ` · ${offerName}` : ''}
                                            </div>
                                            <div className="px-3.5 py-3 text-[11px] text-right font-extrabold text-green-850 flex flex-col items-end font-jakarta">
                                                <span className="text-green-805">{formatPrice(discVal)}</span>
                                                <span className="text-gray-400 line-through text-[10px] font-semibold">{formatPrice(origVal)}</span>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <PriceRow label="Making Charges" value={formatPrice(Number(product?.labourPrice))} />
                            )}
                            <PriceRow label="Sub Total" value={formatPrice(Number(product?.finalPrice || displayPrice))} isBold />
                            {hasOffer && !isComponentDiscounted && (
                                <div className="grid grid-cols-4 border border-green-255 rounded-none overflow-hidden bg-green-50/50 font-jakarta">
                                    <div className="px-3.5 py-3 text-[11px] font-bold text-green-805 border-r border-green-205 col-span-2 flex items-center gap-1 font-jakarta font-bold">
                                        <Tag className="w-3.5 h-3.5" /> Offer Discount{offerName ? ` · ${offerName}` : ''}
                                    </div>
                                    <div className="px-3 py-3 text-[11px] text-center text-green-708 border-r border-green-205 font-bold font-jakarta">
                                        {discountLabel}
                                    </div>
                                    <div className="px-3.5 py-3 text-[11px] text-right font-extrabold text-green-805 font-jakarta">
                                        - {formatPrice(discountAmount)}
                                    </div>
                                </div>
                            )}
                            {gstAmount > 0 && (
                                <PriceRow label={taxRowLabel(country)} value={formatPrice(gstAmount)} />
                            )}
                            <PriceRow
                                label={gstAmount > 0 ? 'Grand Total (Incl. GST)' : 'Grand Total'}
                                value={formatPrice(grandTotalInclTax)}
                                isGrandTotal
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed italic text-center font-jakarta">
                            Final gold and diamonds weights may vary slightly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }: { label: string, value: any }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#ECECEC] last:border-0 font-sans gap-1 sm:gap-4">
        <div className="text-[#707070] font-bold text-[11px] uppercase tracking-wider">
            {label}
        </div>
        <div className="text-[#1F1F1F] font-bold text-[13px] text-left sm:text-right">{value || '-'}</div>
    </div>
);

const PriceRow = ({ label, value, isBold = false, isGrandTotal = false }: { label: string, value: string, isBold?: boolean, isGrandTotal?: boolean }) => (
    <div className={`grid grid-cols-4 border border-gray-200 rounded-none overflow-hidden ${isGrandTotal ? 'bg-[#F8F9FA]' : ''} font-jakarta`}>
        <div className={`px-3 py-2.5 text-[11px] font-bold text-gray-800 border-r border-gray-200 font-jakarta ${isBold || isGrandTotal ? 'uppercase' : ''}`}>
            {label}
        </div>
        <div className="px-3 py-2.5 text-[11px] text-center text-gray-400 border-r border-gray-200 font-jakarta">-</div>
        <div className="px-3 py-2.5 text-[11px] text-center text-gray-400 border-r border-gray-200 font-jakarta">-</div>
        <div className={`px-3 py-2.5 text-[11px] text-right text-gray-800 font-bold font-jakarta ${isGrandTotal ? 'text-[12px]' : ''}`}>
            {value}
        </div>
    </div>
);

const PriceTable = ({
    rows,
    totalLabel,
    totalValue,
    totalWeight
}: {
    rows: any[],
    totalLabel: string,
    totalValue: string,
    totalWeight?: string
}) => (
    <div className="border border-gray-200 rounded-none overflow-hidden shadow-xs font-jakarta">
        <table className="w-full text-[11px] border-collapse font-jakarta">
            <thead>
                <tr className="bg-white text-gray-800 font-bold uppercase tracking-wider text-[10px] font-jakarta">
                    <th className="px-3 py-3 text-left border-r border-gray-200 w-[60%] font-jakarta">Component</th>
                    <th className="px-3 py-3 text-center border-r border-gray-200 w-[20%] font-jakarta">Weight</th>
                    <th className="px-3 py-3 text-right w-[20%] font-jakarta">Final Value</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white font-jakarta">
                {rows.map((row, i) => (
                    <tr key={i} className="text-gray-700 font-jakarta">
                        <td className="px-3 py-2.5 font-medium border-r border-gray-200 font-jakarta">{row.component}</td>
                        <td className="px-3 py-2.5 text-center border-r border-gray-200 text-gray-500 font-jakarta">{row.weight}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-gray-800 font-jakarta">{row.value}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="bg-white font-bold border-t border-gray-200 font-jakarta">
                    <td className="px-3 py-3 text-gray-900 uppercase tracking-wide border-r border-gray-200 font-jakarta">{totalLabel}</td>
                    <td className="px-3 py-3 text-center border-r border-gray-200 text-gray-900 font-black font-jakarta">{totalWeight || '-'}</td>
                    <td className="px-3 py-3 text-right text-gray-900 font-black font-jakarta">{totalValue}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);

export default ProductAccordions;
