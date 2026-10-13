// Resolve WHICH diamond (Natural vs Lab Grown) a cart / order line represents.
// Prefers the explicit snapshot (item.origin); otherwise derives it from the
// centre stone's group type or its price track (lgd vs natural). Returns '' when
// it genuinely can't tell — callers hide the row rather than fabricate an origin
// (a wrong "Lab Grown" on a natural-diamond order is worse than showing nothing).
export const resolveDiamondOrigin = (item: any): string => {
    const explicit = String(item?.origin || '').toLowerCase();
    if (explicit) {
        if (explicit === 'lgd' || explicit === 'labgrown' || explicit.includes('lab')) return 'Lab Grown';
        if (explicit === 'natural') return 'Natural';
        return item.origin;
    }
    const dd = item?.diamondDetails ?? item?.stoneDetails;
    const arr = Array.isArray(dd) ? dd : (dd ? [dd] : []);
    const center = arr.find((s: any) => String(s?.type || '').toLowerCase() === 'center') || arr[0];
    if (!center) return '';
    const sgType = String(center.stoneGroup?.type || center.stoneGroup?.stoneType || '').toLowerCase();
    if (sgType.includes('lab') || sgType === 'lgd') return 'Lab Grown';
    if (sgType === 'natural' || sgType === 'natural diamond') return 'Natural';
    const nat = Number(center.naturalPrice ?? center.stoneGroup?.natural_price) || 0;
    const lgd = Number(center.lgdPrice ?? center.stoneGroup?.lgd_price) || 0;
    if (nat > 0 && lgd <= 0) return 'Natural';
    if (lgd > 0 && nat <= 0) return 'Lab Grown';
    return ''; // undeterminable — don't guess
};
