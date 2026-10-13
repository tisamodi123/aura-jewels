import { getAllProducts, getAllSettings, getDiamonds } from '@/services/productService';
import { getFilteredDiamonds } from './diamondsFilterHelper';
import callApi from '@/lib/commonApi';
import { ENDPOINTS } from '@/lib/Api_Url';
import { getCountry } from './locationServer';

export interface ServerJewelryDataParams {
  scope?: 'all' | 'category' | 'collection';
  category?: string;
  subcategory?: string;
  collectionId?: string;
  searchParams?: any;
}



export async function fetchServerJewelryData({
  scope = 'all',
  category,
  subcategory,
  collectionId,
  searchParams = {},
}: ServerJewelryDataParams) {
  try {
    const countryCode = await getCountry(searchParams);
    const currency = countryCode === 'IN' ? 'INR' : 'USD';
    const serverHeaders = {
      'x-country': countryCode || 'IN',
      'x-currency': currency,
    };

    const targetPage = searchParams.page ? Number(searchParams.page) : 1;
    const isDiamonds = category === 'diamonds';

    const payload: any = {
      page: targetPage,
      limit: 20,
      search: searchParams.search || '',
      category: searchParams.category ? searchParams.category.split(',').filter(Boolean) : [],
      subCategory: searchParams.subCategory ? searchParams.subCategory.split(',').filter(Boolean) : [],
      metals: searchParams.metals ? searchParams.metals.split(',').filter(Boolean) : [],
      shape: searchParams.shape
        ? searchParams.shape.split(',').filter(Boolean)
        : searchParams.shapes
          ? searchParams.shapes.split(',').filter(Boolean)
          : [],
      collectionId: searchParams.collectionId ? searchParams.collectionId.split(',').filter(Boolean) : [],
      tags: searchParams.tags ? searchParams.tags.split(',').filter(Boolean) : [],
      gender: searchParams.gender ? searchParams.gender.split(',').filter(Boolean) : [],
      sortPrice:
        searchParams.sortPrice === 'Price: High to Low' || searchParams.sortPrice === 'highToLow'
          ? 'highToLow'
          : 'lowToHigh',
    };

    if (scope === 'category' && category) {
      payload.categorySlug = category;
      delete payload.category;
    }
    if (scope === 'collection' && collectionId) {
      payload.collectionSlug = collectionId;
      delete payload.collectionId;
    }
    if (subcategory) {
      payload.subCategorySlug = subcategory;
    }
    if (searchParams.minPrice !== undefined && searchParams.minPrice !== '') payload.minPrice = Number(searchParams.minPrice);
    if (searchParams.maxPrice !== undefined && searchParams.maxPrice !== '') payload.maxPrice = Number(searchParams.maxPrice);
    if (searchParams.minWeight !== undefined && searchParams.minWeight !== '') payload.minWeight = Number(searchParams.minWeight);
    if (searchParams.maxWeight !== undefined && searchParams.maxWeight !== '') payload.maxWeight = Number(searchParams.maxWeight);

    if (searchParams.metalTypeSlug) payload.metalTypeSlug = searchParams.metalTypeSlug;
    if (searchParams.metalStempSlug) payload.metalStempSlug = searchParams.metalStempSlug;
    if (searchParams.shapeSlug) payload.shapeSlug = searchParams.shapeSlug;
    if (searchParams.collectionSlug) payload.collectionSlug = searchParams.collectionSlug;

    // Build specialized diamond payload if category is diamonds
    let productsPromise;
    if (isDiamonds) {
      const diamondPayload = {
        page: targetPage,
        limit: 20,
        search: searchParams.search || '',
        shape: searchParams.shape ? searchParams.shape.split(',').filter(Boolean) : [],
        color: searchParams.color ? searchParams.color.split(',').filter(Boolean) : [],
        clarity: searchParams.clarity ? searchParams.clarity.split(',').filter(Boolean) : [],
        cut: searchParams.cut ? searchParams.cut.split(',').filter(Boolean) : [],
        polish: searchParams.polish ? searchParams.polish.split(',').filter(Boolean) : [],
        symmetry: searchParams.symmetry ? searchParams.symmetry.split(',').filter(Boolean) : [],
        fluorescence: searchParams.fluorescence ? searchParams.fluorescence.split(',').filter(Boolean) : [],
        priceMin: searchParams.minPrice !== undefined && searchParams.minPrice !== '' ? Number(searchParams.minPrice) : undefined,
        priceMax: searchParams.maxPrice !== undefined && searchParams.maxPrice !== '' ? Number(searchParams.maxPrice) : undefined,
        caratMin: searchParams.minWeight !== undefined && searchParams.minWeight !== '' ? Number(searchParams.minWeight) : undefined,
        caratMax: searchParams.maxWeight !== undefined && searchParams.maxWeight !== '' ? Number(searchParams.maxWeight) : undefined,
        diamondType: searchParams.diamondType || searchParams.type || 'Lab Grown',
        sortBy: searchParams.sortPrice === 'highToLow' || searchParams.sortPrice === 'Price: High to Low' ? 'price' : 'price',
        sortOrder: searchParams.sortPrice === 'highToLow' || searchParams.sortPrice === 'Price: High to Low' ? 'desc' : 'asc',
      };
      productsPromise = getDiamonds(diamondPayload, serverHeaders).catch(() => null);
       console.log("diamondPayload", productsPromise);
    } else {
      productsPromise = getAllProducts(payload, serverHeaders).catch(() => null);
    }

    const [settingsRes, productsRes, landingRes, homeScreenRes] = await Promise.all([
      getAllSettings().catch(() => null),
      productsPromise,
      category
        ? callApi(ENDPOINTS.HOME.GET_CATEGORY_LANDING_PAGE_DATA, 'POST', { categorySlug: category }, undefined, false, serverHeaders).catch(
          () => null
        )
        : Promise.resolve(null),
      callApi(ENDPOINTS.HOME.GET_HOME_SCREEN_DATA, 'GET', null, undefined, false, serverHeaders).catch(() => null),
    ]);

    const initialAllParams = settingsRes?.data || null;
    let initialProducts = productsRes?.errorCode === 200 ? productsRes?.data || [] : [];
    let initialTotalCount =
      productsRes?.errorCode === 200
        ? (productsRes?.pagination?.total !== undefined ? productsRes.pagination.total : (productsRes?.total || initialProducts.length))
        : 0;

    if (isDiamonds && initialProducts.length === 0) {
      const diamondPayload = {
        page: targetPage,
        limit: 20,
        shape: searchParams.shape ? searchParams.shape.split(',').filter(Boolean) : [],
        color: searchParams.color ? searchParams.color.split(',').filter(Boolean) : [],
        clarity: searchParams.clarity ? searchParams.clarity.split(',').filter(Boolean) : [],
        cut: searchParams.cut ? searchParams.cut.split(',').filter(Boolean) : [],
        polish: searchParams.polish ? searchParams.polish.split(',').filter(Boolean) : [],
        symmetry: searchParams.symmetry ? searchParams.symmetry.split(',').filter(Boolean) : [],
        fluorescence: searchParams.fluorescence ? searchParams.fluorescence.split(',').filter(Boolean) : [],
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        minWeight: searchParams.minWeight,
        maxWeight: searchParams.maxWeight,
        diamondType: searchParams.diamondType || searchParams.type || 'Lab Grown',
        sortPrice: searchParams.sortPrice,
      };
      const localResult = getFilteredDiamonds(diamondPayload);
      initialProducts = localResult.data;
      initialTotalCount = localResult.total;
    }



    const initialStyleList =
      landingRes?.errorCode === 200 && landingRes?.data?.exploreByStyle?.styles
        ? landingRes.data.exploreByStyle.styles
        : [];
    const homeSections = homeScreenRes?.data?.sections || null;

    return {
      initialProducts,
      initialTotalCount,
      initialAllParams,
      initialStyleList,
      homeSections,
    };
  } catch (error) {
    console.log('Error fetching server jewelry data:', error);
    return {
      initialProducts: [],
      initialTotalCount: 0,
      initialAllParams: null,
      initialStyleList: [],
    };
  }
}
