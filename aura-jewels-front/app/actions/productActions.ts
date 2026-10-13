'use server';

import { getAllProducts, getDiamonds } from '@/services/productService';
import { getFilteredDiamonds } from '@/lib/diamondsFilterHelper';

export async function fetchMoreProductsAction(payload: any) {
  try {
    const res = await getAllProducts(payload);
    if (res?.errorCode === 200) {
      return {
        success: true,
        data: res.data || [],
        total: res.total || 0,
      };
    }
    return { success: false, data: [], total: 0 };
  } catch (err) {
    console.error('Server Action fetch error:', err);
    return { success: false, data: [], total: 0 };
  }
}

export async function fetchMoreDiamondsAction(payload: any) {
  try {
    const res = await getDiamonds(payload);
    let data = res?.errorCode === 200 ? res.data || [] : [];
    let total = res?.errorCode === 200 ? (res.pagination?.total !== undefined ? res.pagination.total : (res.total || 0)) : 0;

    if (data.length === 0) {
      const localResult = getFilteredDiamonds(payload);
      data = localResult.data;
      total = localResult.total;
    }

    return {
      success: true,
      data,
      total,
    };
  } catch (err) {
    console.error('Server Action fetch diamonds error:', err);
    const localResult = getFilteredDiamonds(payload);
    return {
      success: true,
      data: localResult.data,
      total: localResult.total,
    };
  }
}
