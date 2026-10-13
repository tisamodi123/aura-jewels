export interface ProductShape {
  id: string;
  image: string;
}

export interface Product {
  id: string | number;
  _id?: string;
  productTitle?: string;
  finalPrice?: number;
  discountedPrice?: number;
  offerDetails?: any;
  b2c_offerPrice?: number;
  images?: any[];
  itemCode?: string;
  name?: string;
  title?: string;
  category?: 'Rings' | 'Necklaces' | 'Earrings' | 'Bracelets' | 'Pendants' | 'Bangles' | 'Mangalsutra' | 'Chains' | 'Nose Pins' | 'Watch Accessory' | {
    id?: number;
    name?: string;
    slug?: string;
    image?: string;
  };
  ringSize?: number;
  price?: number;
  setting_price?: number;
  settingprice?: number;
  originalPrice?: number;
  image?: string;
  default_image?: string;
  second_image?: string;
  galleryImages?: string[];
  description?: string | null;
  material?: string;
  diamondType?: 'Lab-Grown' | 'Natural';
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  availableMetals?: string[];
  availableShapes?: ProductShape[];
  technicalSpecs?: Record<string, string>;
  sku?: string;
  metal?: string;
  color?: string;
  shape?: string;
  weight?: string;
  producttype?: number;
  itemcode?: string;
  parentitemcode?: string;
  slug?: string;
  metalStampDetail?: {
    _id?: string;
    karat?: string;
    metaltype?: string;
  };
  metalTypeDetail?: {
    _id?: string;
    metalName?: string;
    colorCode?: string;
  };
  metaltype?: number;
  metalstamp?: number;
  isWishlist?: boolean;
  video?: string;
  metal_type?: {
    id: number;
    paraname: string;
    slug?: string;
    image?: string;
    sort?: number;
    paratypeid?: number;
  };
  metal_stamp?: {
    id: number;
    paraname: string;
    slug?: string;
    image?: string;
    sort?: number;
    paratypeid?: number;
  };
  categoryDetails?: {
    categoryName?: string;
  };
  appxMetalWgt?: number | string;
  variant?: Product[];
  variants?: Product[]; // Sometimes it's plural in API
  sdescription?: string | null;
  metalweight?: number | string;
  total_carat?: number | string;
  settingheight?: string | number;
  shoulderwidth?: string | number;
  shankwidth?: string | number;
  bandthickness?: string | number;
  proddiameter?: string | number;
  shipmentdays?: string | number;
  gender?: string;
  haveChain?: string;
  cWgt?: number | string;
  cLength?: number | string;
  subcategoryname?: string;
  isgemstone?: number;
  gemstonecolor?: string;
  sync_metal_price?: string | number;
  sync_dia_price?: string | number;
  sync_labour_charge_price?: string | number;
  sync_other_charge_price?: string | number;
  jewelry_diamonds?: {
    diamondtype?: string;
    totaldiamonds?: number;
    totalweight?: number | string;
    stonecolor?: string;
    stoneclarity?: string;
    shape?: {
      paraname: string;
    };
    shape_name?: {
      paraname: string;
    };
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}
