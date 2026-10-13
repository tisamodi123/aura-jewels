import diamondsData from './diamonds_dump.json';

export interface DiamondFilterPayload {
  page?: number | string;
  limit?: number | string;
  shape?: string | string[];
  color?: string | string[];
  clarity?: string | string[];
  cut?: string | string[];
  polish?: string | string[];
  symmetry?: string | string[];
  fluorescence?: string | string[];
  minPrice?: number | string;
  maxPrice?: number | string;
  minWeight?: number | string;
  maxWeight?: number | string;
  minCarat?: number | string;
  maxCarat?: number | string;
  diamondType?: string;
  sortPrice?: string;
}

export function getFilteredDiamonds(payload: DiamondFilterPayload) {
  let list = [...(diamondsData as any[])];

  // 1. Diamond Type Filter
  if (payload.diamondType) {
    const type = payload.diamondType.toLowerCase().trim();
    const whiteColors = ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    
    if (type === 'lab grown' || type === 'lab-grown' || type === 'labgrown') {
      list = list.filter(d => 
        d.creation?.toLowerCase() !== 'natural' && 
        whiteColors.includes(String(d.color || '').toLowerCase().trim())
      );
    } else if (type === 'natural') {
      list = list.filter(d => 
        d.creation?.toLowerCase() === 'natural' && 
        whiteColors.includes(String(d.color || '').toLowerCase().trim())
      );
    } else if (type.includes('color') || type.includes('fancy')) {
      list = list.filter(d => 
        d.creation?.toLowerCase() !== 'natural' && 
        !whiteColors.includes(String(d.color || '').toLowerCase().trim())
      );
    }
  }

  // 2. Shape Filter
  if (payload.shape) {
    const shapes = Array.isArray(payload.shape)
      ? payload.shape
      : typeof payload.shape === 'string'
        ? payload.shape.split(',').filter(Boolean)
        : [];
    if (shapes.length > 0) {
      const normalizedShapes = shapes.map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
      list = list.filter(d => {
        const sVal = d.shape?.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizedShapes.includes(sVal);
      });
    }
  }

  // 3. Color Filter
  if (payload.color) {
    const colors = Array.isArray(payload.color)
      ? payload.color

      : typeof payload.color === 'string'
        ? payload.color.split(',').filter(Boolean)
        : [];
    if (colors.length > 0) {
      const normalizedColors = colors.map((c: string) => c.toLowerCase().trim());
      list = list.filter(d => normalizedColors.includes(d.color?.toLowerCase().trim()));
    }
  }

  // 4. Clarity Filter
  if (payload.clarity) {
    const clarities = Array.isArray(payload.clarity)
      ? payload.clarity
      : typeof payload.clarity === 'string'
        ? payload.clarity.split(',').filter(Boolean)
        : [];
    if (clarities.length > 0) {
      const normalizedClarities = clarities.map((c: string) => c.toLowerCase().trim());
      list = list.filter(d => normalizedClarities.includes(d.clarity?.toLowerCase().trim()));
    }
  }

  // 5. Cut Filter
  if (payload.cut) {
    const cuts = Array.isArray(payload.cut)
      ? payload.cut
      : typeof payload.cut === 'string'
        ? payload.cut.split(',').filter(Boolean)
        : [];
    if (cuts.length > 0) {
      const normalizedCuts = cuts.map((c: string) => c.toLowerCase().trim());
      list = list.filter(d => normalizedCuts.includes(d.cut?.toLowerCase().trim()));
    }
  }

  // 6. Polish Filter
  if (payload.polish) {
    const polishes = Array.isArray(payload.polish)
      ? payload.polish
      : typeof payload.polish === 'string'
        ? payload.polish.split(',').filter(Boolean)
        : [];
    if (polishes.length > 0) {
      const normalizedPolishes = polishes.map((p: string) => p.toLowerCase().trim());
      list = list.filter(d => normalizedPolishes.includes(d.polish?.toLowerCase().trim()));
    }
  }

  // 7. Symmetry Filter
  if (payload.symmetry) {
    const symmetries = Array.isArray(payload.symmetry)
      ? payload.symmetry
      : typeof payload.symmetry === 'string'
        ? payload.symmetry.split(',').filter(Boolean)
        : [];
    if (symmetries.length > 0) {
      const normalizedSymmetries = symmetries.map((s: string) => s.toLowerCase().trim());
      list = list.filter(d => normalizedSymmetries.includes(d.symmetry?.toLowerCase().trim()));
    }
  }

  // 8. Fluorescence Filter
  if (payload.fluorescence) {
    const fluorescences = Array.isArray(payload.fluorescence)
      ? payload.fluorescence
      : typeof payload.fluorescence === 'string'
        ? payload.fluorescence.split(',').filter(Boolean)
        : [];
    if (fluorescences.length > 0) {
      const normalizedFluorescences = fluorescences.map((f: string) => f.toLowerCase().trim());
      list = list.filter(d => normalizedFluorescences.includes(d.fluorescence?.toLowerCase().trim()));
    }
  }

  // 9. Price Range Filter
  if (payload.minPrice !== undefined && payload.minPrice !== '') {
    list = list.filter(d => d.price >= Number(payload.minPrice));
  }
  if (payload.maxPrice !== undefined && payload.maxPrice !== '') {
    list = list.filter(d => d.price <= Number(payload.maxPrice));
  }

  // 10. Carat Range Filter
  const minW = payload.minWeight !== undefined && payload.minWeight !== '' ? payload.minWeight : payload.minCarat;
  const maxW = payload.maxWeight !== undefined && payload.maxWeight !== '' ? payload.maxWeight : payload.maxCarat;
  if (minW !== undefined && minW !== '') {
    list = list.filter(d => d.carat >= Number(minW));
  }
  if (maxW !== undefined && maxW !== '') {
    list = list.filter(d => d.carat <= Number(maxW));
  }

  // 11. Sorting
  if (payload.sortPrice === 'highToLow' || payload.sortPrice === 'Price: High to Low') {
    list.sort((a, b) => b.price - a.price);
  } else {
    list.sort((a, b) => a.price - b.price);
  }

  // 12. Pagination
  const page = Number(payload.page) || 1;
  const limit = Number(payload.limit) || 20;
  const startIndex = (page - 1) * limit;
  const paginatedList = list.slice(startIndex, startIndex + limit);

  return {
    data: paginatedList,
    total: list.length
  };
}
