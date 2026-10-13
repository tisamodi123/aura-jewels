import { Product } from '@/types';
export const PREFIX = process.env.NEXT_PUBLIC_PREFIX

// Diamond Certificate Image Paths
export const IGI_IMAGE = "/images/diamond-certif/IGI.jpeg"
export const GIA_IMAGE = "/images/diamond-certif/GIA.jpeg"
export const GSI_IMAGE = "/images/diamond-certif/GSI.jpeg"

// Feature toggle: set to true to show quantity +/- controls in the cart.
// Set to false to hide them (each product is fixed at qty = 1).
export const ALLOW_QUANTITY = true;

export const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
} as const;

export const DIAMOND_ORIGINS = ["Lab Grown"];//"Natural", 

export const CUSTOMER_ORDER_STATUSES = [
    'All',
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded',
    'Return Requested'
];

export const CUSTOMER_INDIVIDUAL_ORDER_STATUSES = [
    'All',
    'Pending',
    'Approved',
    'In Production',
    'Ready to Ship',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Cancelled Rejected',
    'Rejected',
    'Return Requested',
    'Return Request Accepted',
    'Return Request Rejected',
    'Item Returned',
    'Refunded',
    'Failed'
];

export const statuses = [
    { value: "Accept", label: "Accept", bg: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70", dot: "bg-emerald-500" },
    { value: "Pending", label: "Pending", bg: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/70", dot: "bg-amber-500" },
    { value: "Approved", label: "Approved", bg: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70", dot: "bg-emerald-500" },
    { value: "Reject", label: "Reject", bg: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/70", dot: "bg-rose-500" }
];

export const QUOTATION_CLIENT_STATUSES = ["Accept", "Reject", "Approved"];

export const INQUIRY_STATUS = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    ALL_TYPES: ["NEW", "CONTACTED", "COMPLETED", "CANCELLED"]
} as const;

export const PAYMENT_STATUS = {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUND_PENDING: "refund pending",
    REFUND_PROCESSING: "refund processing",
    REFUND_SUCCESS: "refund success",
    ALL_TYPES: [
        "pending",
        "paid",
        "failed",
        "refund pending",
        "refund processing",
        "refund success"
    ]
} as const;

export const REFUND_STATUS = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
    REJECTED: "Rejected",
    PENDING_LOWER: "pending",
    PROCESSING_LOWER: "processing",
    COMPLETED_LOWER: "completed",
    FAILED_LOWER: "failed",
    REJECTED_LOWER: "rejected",
    ALL_TYPES: [
        "Pending",
        "Processing",
        "Completed",
        "Failed",
        "Rejected",
        "pending",
        "processing",
        "completed",
        "failed",
        "rejected"
    ]
} as const;

export const amountShowOrderStatus = [
    // CANCEL_REQUEST: "Cancel Requested",
    // CANCEL_APPROVED: "Cancel Approved",
    // CANCELLED: "Cancelled",
    // REFUND_PENDING: "Refund Pending",
    // REFUND_PROCESSING: "Refund Processing",
    "Refunded"
    // REFUND_FAILED: "Refund Failed"
]

export const PRODUCTS: Product[] = [
    {
        "id": "3880",
        "producttype": 76,
        "itemcode": "WBR27-142486",
        "parentitemcode": "WBR27",
        "tags": ["Best Seller"],
        "setting_price": 168770,
        "slug": "fusion-ceramic-diamond-bracelet-wbr27-142486",
        "title": "Fusion Ceramic Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08776_YG0.jpg",
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "category": "Bracelets",
        "description": "A stunning Fusion Ceramic Diamond Bracelet featuring high-quality lab-grown diamonds set in 14K Yellow Gold. Perfect for modern elegance.",
        "metalweight": 12.45,
        "total_carat": 1.25,
        "settingheight": "4.5",
        "shankwidth": "3.2",
        "bandthickness": "1.8",
        "proddiameter": "65",
        "shipmentdays": "8",
        "gender": "Women",
        "sync_metal_price": "85000",
        "sync_dia_price": "62000",
        "sync_labour_charge_price": "15000",
        "sync_other_charge_price": "6770",
        "jewelry_diamonds": [
            {
                "diamondtype": "Side",
                "totaldiamonds": 45,
                "totalweight": 1.25,
                "stonecolor": "E-F",
                "stoneclarity": "VVS-VS",
                "shape_name": { "paraname": "Round" }
            }
        ],
        "variant": [
            {
                "id": 3879,
                "producttype": 76,
                "title": "Fusion Ceramic Diamond Bracelet",
                "slug": "fusion-ceramic-diamond-bracelet-wbr27",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR27",
                "settingprice": 141669,
                "setting_price": 141669,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" },
                "metalweight": 11.2,
                "total_carat": 1.15,
                "sync_metal_price": "75000",
                "sync_dia_price": "58000",
                "sync_labour_charge_price": "14000",
                "sync_other_charge_price": "5000",
                "jewelry_diamonds": [
                    {
                        "diamondtype": "Side",
                        "totaldiamonds": 40,
                        "totalweight": 1.15,
                        "stonecolor": "F-G",
                        "stoneclarity": "VS-SI",
                        "shape_name": { "paraname": "Round" }
                    }
                ]
            },
            {
                "id": 3880,
                "producttype": 76,
                "title": "Fusion Ceramic Diamond Bracelet",
                "slug": "fusion-ceramic-diamond-bracelet-wbr27-142486",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR27-142486",
                "settingprice": 168770,
                "setting_price": 168770,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3880-W",
                "producttype": 76,
                "title": "Fusion Ceramic Diamond Bracelet",
                "slug": "fusion-ceramic-diamond-bracelet-wbr27-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR27-W",
                "settingprice": 168770,
                "setting_price": 168770,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            },
            {
                "id": "3880-R",
                "producttype": 76,
                "title": "Fusion Ceramic Diamond Bracelet",
                "slug": "fusion-ceramic-diamond-bracelet-wbr27-rose",
                "metaltype": 681,
                "metalstamp": 682,
                "itemcode": "WBR27-R",
                "settingprice": 168770,
                "setting_price": 168770,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_RG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 681, "paraname": "Rose Gold", "slug": "rose-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            },
            // {
            //     "id": "3880-P",
            //     "producttype": 76,
            //     "title": "Fusion Ceramic Diamond Bracelet",
            //     "slug": "fusion-ceramic-diamond-bracelet-wbr27-platinum",
            //     "metaltype": 684,
            //     "metalstamp": 694,
            //     "itemcode": "WBR27-P",
            //     "settingprice": 185647,
            //     "setting_price": 185647,
            //     "isWishlist": false,
            //     "default_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-1.jpg",
            //     "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR27-Y-2.jpg",
            //     "galleryImages": [
            //         `${PREFIX}/images/Product-Details/p1.jpg`,
            //         `${PREFIX}/images/Product-Details/p2.jpg`,
            //         `${PREFIX}/images/Product-Details/p3.jpg`,
            //         `${PREFIX}/images/Product-Details/p4.jpg`,
            //         `${PREFIX}/images/Product-Details/p5.jpg`,
            //         `${PREFIX}/images/Product-Details/p6.jpg`
            //     ],
            //     "metal_type": { "id": 684, "paraname": "Platinum", "slug": "platinum" },
            //     "metal_stamp": { "id": 694, "paraname": "Pt950" }
            // }
        ],
    },
    {
        "id": "3871",
        "producttype": 76,
        "itemcode": "WBR9-142477",
        "parentitemcode": "WBR9",
        "tags": ["Best Seller"],
        "setting_price": 228441,
        "slug": "grand-brilliance-statement-diamond-bracelet-wbr9-142477",
        "title": "Grand Brilliance Statement Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08771_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR9-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3870,
                "producttype": 76,
                "title": "Grand Brilliance Statement Diamond Bracelet",
                "slug": "grand-brilliance-statement-diamond-bracelet-wbr9",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR9",
                "settingprice": 209175,
                "setting_price": 209175,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR9-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3871,
                "producttype": 76,
                "title": "Grand Brilliance Statement Diamond Bracelet",
                "slug": "grand-brilliance-statement-diamond-bracelet-wbr9-142477",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR9-142477",
                "settingprice": 228441,
                "setting_price": 228441,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR9-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3871-W",
                "producttype": 76,
                "title": "Grand Brilliance Statement Diamond Bracelet",
                "slug": "grand-brilliance-statement-diamond-bracelet-wbr9-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR9-W",
                "settingprice": 228441,
                "setting_price": 228441,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR9-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            },
            {
                "id": "3871-R",
                "producttype": 76,
                "title": "Grand Brilliance Statement Diamond Bracelet",
                "slug": "grand-brilliance-statement-diamond-bracelet-wbr9-rose",
                "metaltype": 681,
                "metalstamp": 682,
                "itemcode": "WBR9-R",
                "settingprice": 228441,
                "setting_price": 228441,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_RG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR9-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 681, "paraname": "Rose Gold", "slug": "rose-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3862",
        "producttype": 76,
        "itemcode": "WBR8-142468",
        "parentitemcode": "WBR8",
        "tags": ["Best Seller"],
        "setting_price": 133524,
        "slug": "minimal-link-diamond-bracelet-wbr8-142468",
        "title": "Minimal Link Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08767_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR8-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3861,
                "producttype": 76,
                "title": "Minimal Link Diamond Bracelet",
                "slug": "minimal-link-diamond-bracelet-wbr8",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR8",
                "settingprice": 110252,
                "setting_price": 110252,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR8-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3862,
                "producttype": 76,
                "title": "Minimal Link Diamond Bracelet",
                "slug": "minimal-link-diamond-bracelet-wbr8-142468",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR8-142468",
                "settingprice": 133524,
                "setting_price": 133524,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR8-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3862-W",
                "producttype": 76,
                "title": "Minimal Link Diamond Bracelet",
                "slug": "minimal-link-diamond-bracelet-wbr8-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR8-W",
                "settingprice": 133524,
                "setting_price": 133524,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR8-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            },
            {
                "id": "3862-R",
                "producttype": 76,
                "title": "Minimal Link Diamond Bracelet",
                "slug": "minimal-link-diamond-bracelet-wbr8-rose",
                "metaltype": 681,
                "metalstamp": 682,
                "itemcode": "WBR8-R",
                "settingprice": 133524,
                "setting_price": 133524,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_RG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR8-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 681, "paraname": "Rose Gold", "slug": "rose-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3853",
        "producttype": 76,
        "itemcode": "WBR7-142459",
        "parentitemcode": "WBR7",
        "tags": ["Best Seller"],
        "setting_price": 250516,
        "slug": "fluid-marquise-sparkle-diamond-bracelet-wbr7-142459",
        "title": "Fluid Marquise Sparkle Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG15540_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR7-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3852,
                "producttype": 76,
                "title": "Fluid Marquise Sparkle Diamond Bracelet",
                "slug": "fluid-marquise-sparkle-diamond-bracelet-wbr7",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR7",
                "settingprice": 216933,
                "setting_price": 216933,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR7-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3853,
                "producttype": 76,
                "title": "Fluid Marquise Sparkle Diamond Bracelet",
                "slug": "fluid-marquise-sparkle-diamond-bracelet-wbr7-142459",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR7-142459",
                "settingprice": 250516,
                "setting_price": 250516,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR7-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3853-W",
                "producttype": 76,
                "title": "Fluid Marquise Sparkle Diamond Bracelet",
                "slug": "fluid-marquise-sparkle-diamond-bracelet-wbr7-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR7-W",
                "settingprice": 250516,
                "setting_price": 250516,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR7-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            },
            {
                "id": "3853-R",
                "producttype": 76,
                "title": "Fluid Marquise Sparkle Diamond Bracelet",
                "slug": "fluid-marquise-sparkle-diamond-bracelet-wbr7-rose",
                "metaltype": 681,
                "metalstamp": 682,
                "itemcode": "WBR7-R",
                "settingprice": 250516,
                "setting_price": 250516,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_RG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR7-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 681, "paraname": "Rose Gold", "slug": "rose-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3844",
        "producttype": 76,
        "itemcode": "WBR6-142450",
        "parentitemcode": "WBR6",
        "tags": ["Best Seller"],
        "setting_price": 195147,
        "slug": "structured-elegance-diamond-bracelet-wbr6-142450",
        "title": "Structured Elegance Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG15539_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR6-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3843,
                "producttype": 76,
                "title": "Structured Elegance Diamond Bracelet",
                "slug": "structured-elegance-diamond-bracelet-wbr6",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR6",
                "settingprice": 167750,
                "setting_price": 167750,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR6-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3844,
                "producttype": 76,
                "title": "Structured Elegance Diamond Bracelet",
                "slug": "structured-elegance-diamond-bracelet-wbr6-142450",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR6-142450",
                "settingprice": 195147,
                "setting_price": 195147,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR6-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3844-W",
                "producttype": 76,
                "title": "Structured Elegance Diamond Bracelet",
                "slug": "structured-elegance-diamond-bracelet-wbr6-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR6-W",
                "settingprice": 195147,
                "setting_price": 195147,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR6-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3835",
        "producttype": 76,
        "itemcode": "WBR5-142441",
        "parentitemcode": "WBR5",
        "tags": ["Best Seller"],
        "setting_price": 160874,
        "slug": "signature-bezel-diamond-bracelet-wbr5-142441",
        "title": "Signature Bezel Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG15532_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR5-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3834,
                "producttype": 76,
                "title": "Signature Bezel Diamond Bracelet",
                "slug": "signature-bezel-diamond-bracelet-wbr5",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WBR5",
                "settingprice": 134360,
                "setting_price": 134360,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR5-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3835,
                "producttype": 76,
                "title": "Signature Bezel Diamond Bracelet",
                "slug": "signature-bezel-diamond-bracelet-wbr5-142441",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WBR5-142441",
                "settingprice": 160874,
                "setting_price": 160874,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR5-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3835-W",
                "producttype": 76,
                "title": "Signature Bezel Diamond Bracelet",
                "slug": "signature-bezel-diamond-bracelet-wbr5-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WBR5-W",
                "settingprice": 160874,
                "setting_price": 160874,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WBR5-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3826",
        "producttype": 76,
        "itemcode": "IGB25-142432",
        "parentitemcode": "IGB25",
        "tags": ["New Arrival"],
        "setting_price": 66906,
        "slug": "heart-of-elegance-diamond-bracelet-igb25-142432",
        "title": "Heart of Elegance Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG14823_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB25-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3825,
                "producttype": 76,
                "title": "Heart of Elegance Diamond Bracelet",
                "slug": "heart-of-elegance-diamond-bracelet-igb25",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "IGB25",
                "settingprice": 56243,
                "setting_price": 56243,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB25-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3826,
                "producttype": 76,
                "title": "Heart of Elegance Diamond Bracelet",
                "slug": "heart-of-elegance-diamond-bracelet-igb25-142432",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "IGB25-142432",
                "settingprice": 66906,
                "setting_price": 66906,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB25-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3826-W",
                "producttype": 76,
                "title": "Heart of Elegance Diamond Bracelet",
                "slug": "heart-of-elegance-diamond-bracelet-igb25-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "IGB25-W",
                "settingprice": 66906,
                "setting_price": 66906,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB25-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3817",
        "producttype": 76,
        "itemcode": "IGB24-142423",
        "parentitemcode": "IGB24",
        "tags": ["New Arrival"],
        "setting_price": 67435,
        "slug": "sleek-brilliance-diamond-bracelet-igb24-142423",
        "title": "Sleek Brilliance Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG14730_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB24-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3816,
                "producttype": 76,
                "title": "Sleek Brilliance Diamond Bracelet",
                "slug": "sleek-brilliance-diamond-bracelet-igb24",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "IGB24",
                "settingprice": 57008,
                "setting_price": 57008,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB24-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3817,
                "producttype": 76,
                "title": "Sleek Brilliance Diamond Bracelet",
                "slug": "sleek-brilliance-diamond-bracelet-igb24-142423",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "IGB24-142423",
                "settingprice": 67435,
                "setting_price": 67435,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB24-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3817-W",
                "producttype": 76,
                "title": "Sleek Brilliance Diamond Bracelet",
                "slug": "sleek-brilliance-diamond-bracelet-igb24-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "IGB24-W",
                "settingprice": 67435,
                "setting_price": 67435,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB24-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3808",
        "producttype": 76,
        "itemcode": "IGB23-142414",
        "parentitemcode": "IGB23",
        "tags": ["Best Seller"],
        "setting_price": 70091,
        "slug": "refined-geometry-diamond-bracelet-igb23-142414",
        "title": "Refined Geometry Diamond Bracelet",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG14806_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB23-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Bracelets",
        "variant": [
            {
                "id": 3807,
                "producttype": 76,
                "title": "Refined Geometry Diamond Bracelet",
                "slug": "refined-geometry-diamond-bracelet-igb23",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "IGB23",
                "settingprice": 59425,
                "setting_price": 59425,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB23-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3808,
                "producttype": 76,
                "title": "Refined Geometry Diamond Bracelet",
                "slug": "refined-geometry-diamond-bracelet-igb23-142414",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "IGB23-142414",
                "settingprice": 70091,
                "setting_price": 70091,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB23-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3808-W",
                "producttype": 76,
                "title": "Refined Geometry Diamond Bracelet",
                "slug": "refined-geometry-diamond-bracelet-igb23-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "IGB23-W",
                "settingprice": 70091,
                "setting_price": 70091,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/IGB23-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3802",
        "producttype": 76,
        "itemcode": "WE61-142408",
        "parentitemcode": "WE61",
        "tags": ["Best Seller"],
        "setting_price": 63683,
        "slug": "inez-ear-climbers-diamond-earrings-we61-142408",
        "title": "Inez Ear Climbers Diamond Earrings",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG15538_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE61-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Earrings",
        "variant": [
            {
                "id": 3801,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we61",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WE61",
                "settingprice": 55613,
                "setting_price": 55613,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE61-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3802,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we61-142408",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WE61-142408",
                "settingprice": 63683,
                "setting_price": 63683,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE61-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3802-W",
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we61-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WE61-W",
                "settingprice": 63683,
                "setting_price": 63683,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE61-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3796",
        "producttype": 76,
        "itemcode": "WE60-142402",
        "parentitemcode": "WE60",
        "tags": ["New Arrival"],
        "setting_price": 91749,
        "slug": "inez-ear-climbers-diamond-earrings-we60-142402",
        "title": "Inez Ear Climbers Diamond Earrings",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG14829_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE60-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Earrings",
        "variant": [
            {
                "id": 3795,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we60",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WE60",
                "settingprice": 83152,
                "setting_price": 83152,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE60-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3796,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we60-142402",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WE60-142402",
                "settingprice": 91749,
                "setting_price": 91749,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE60-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3796-W",
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we60-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WE60-W",
                "settingprice": 91749,
                "setting_price": 91749,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE60-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    {
        "id": "3790",
        "producttype": 76,
        "itemcode": "WE59-142396",
        "parentitemcode": "WE59",
        "tags": ["New Arrival"],
        "setting_price": 96026,
        "slug": "inez-ear-climbers-diamond-earrings-we59-142396",
        "title": "Inez Ear Climbers Diamond Earrings",
        "metaltype": 680,
        "metalstamp": 682,
        "isWishlist": false,
        "metal_type": {
            "id": 680,
            "paraname": "Yellow Gold",
            "sort": 2,
            "paratypeid": 44
        },
        "metal_stamp": {
            "id": 682,
            "paraname": "14k",
            "sort": 1,
            "paratypeid": 45
        },
        "video": "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
        "default_image": `https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOLRG12613_YG0.jpg`,
        "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE59-Y-3.jpg",
        "galleryImages": [
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
            "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
        ],
        "availableShapes": [
            { "id": "Oval", "image": "/images/no-img.png" },
            { "id": "Princess", "image": "/images/no-img.png" },
            { "id": "Emerald", "image": "/images/no-img.png" },
            { "id": "Round", "image": "/images/no-img.png" }
        ],
        "category": "Earrings",
        "variant": [
            {
                "id": 3789,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we59",
                "metaltype": 680,
                "metalstamp": 821,
                "itemcode": "WE59",
                "settingprice": 88252,
                "setting_price": 88252,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE59-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 821, "paraname": "9k", "slug": "9k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": 3790,
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we59-142396",
                "metaltype": 680,
                "metalstamp": 682,
                "itemcode": "WE59-142396",
                "settingprice": 96026,
                "setting_price": 96026,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOGR00206_YG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE59-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 680, "paraname": "Yellow Gold", "slug": "yellow-gold", "image": "/images/dummy product/product01.png" },
                "metal_stamp": { "id": 682, "paraname": "14k", "slug": "14k", "image": "/images/dummy product/product01.png" }
            },
            {
                "id": "3790-W",
                "producttype": 76,
                "title": "Inez Ear Climbers Diamond Earrings",
                "slug": "inez-ear-climbers-diamond-earrings-we59-white",
                "metaltype": 679,
                "metalstamp": 682,
                "itemcode": "WE59-W",
                "settingprice": 96026,
                "setting_price": 96026,
                "isWishlist": false,
                "default_image": "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTPE08732_WG0.jpg",
                "second_image": "https://d1tu4935goy156.cloudfront.net/Images/WE59-Y-2.jpg",
                "galleryImages": [
                    `${PREFIX}/images/Product-Details/p1.jpg`,
                    `${PREFIX}/images/Product-Details/p2.jpg`,
                    `${PREFIX}/images/Product-Details/p3.jpg`,
                    `${PREFIX}/images/Product-Details/p4.jpg`,
                    `${PREFIX}/images/Product-Details/p5.jpg`,
                    `${PREFIX}/images/Product-Details/p6.jpg`
                ],
                "metal_type": { "id": 679, "paraname": "White Gold", "slug": "white-gold" },
                "metal_stamp": { "id": 682, "paraname": "14k" }
            }
        ]
    },
    // {
    //     id: "1464",
    //     name: "Vintage-Inspired Halos Diamond Ring",
    //     title: "Vintage-Inspired Halos Diamond Ring",
    //     category: "Rings",
    //     tags: ["Best Seller", "New Arrival"],
    //     price: 59430,
    //     setting_price: 59430,
    //     image: `${PREFIX}/images/product6.webp`,
    //     galleryImages: [
    //         "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG0.jpg",
    //         "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_20.jpg",
    //         "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_30.jpg",
    //         "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_50.jpg",
    //         "https://d2spbytg38ui5z.cloudfront.net/images/product-list/KOSTNR08770_YG_60.jpg",
    //     ],
    //     description: "0.710 ctw White Lab Grown Diamond 18K Rose Gold Ladies Ring",
    //     metaltype: 681,
    //     metalstamp: 692,
    //     itemcode: "IGR97-181653",
    //     availableShapes: [
    //         { "id": "Oval", "image": "/images/no-img.png" },
    //         { "id": "Princess", "image": "/images/no-img.png" },
    //         { "id": "Emerald", "image": "/images/no-img.png" },
    //         { "id": "Round", "image": "/images/no-img.png" }
    //     ],
    //     video: "https://d1tu4935goy156.cloudfront.net/Videos/WE60-Y.mp4",
    //     metal_type: { id: 681, paraname: "Rose Gold", slug: "rose-gold" },
    //     metal_stamp: { id: 692, paraname: "18k" },
    //     variant: [
    //         {
    //             id: 1464,
    //             producttype: 76,
    //             itemcode: "IGR97-181653",
    //             title: "Vintage-Inspired Halos Diamond Ring",
    //             slug: "Vintage-Inspired-Halos-Diamond-Ring-IGR97-181653",
    //             setting_price: 59430,
    //             isWishlist: false,
    //             default_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-R-1.jpg",
    //             second_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-R-2.jpg",
    //             metal_type: { id: 681, paraname: "Rose Gold", slug: "rose-gold" },
    //             metal_stamp: { id: 692, paraname: "18k" }
    //         },
    //         {
    //             id: 1463,
    //             producttype: 76,
    //             itemcode: "IGR97",
    //             title: "Vintage-Inspired Halos Center Diamond 0.52 ct Ring",
    //             slug: "vintage-inspired-halos-center-diamond-052-ct-ring-igr97",
    //             setting_price: 46359,
    //             isWishlist: false,
    //             default_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-R-1.jpg",
    //             second_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-R-2.jpg",
    //             metal_type: { id: 681, paraname: "Rose Gold", slug: "rose-gold" },
    //             metal_stamp: { id: 821, paraname: "9k" }
    //         },
    //         {
    //             id: 1465,
    //             producttype: 76,
    //             itemcode: "IGR97-141654",
    //             title: "Vintage-Inspired Halos Diamond Ring",
    //             slug: "Vintage-Inspired-Halos-Diamond-Ring-IGR97-141654",
    //             setting_price: 50793,
    //             isWishlist: false,
    //             default_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-W-1.jpg",
    //             second_image: "https://d1tu4935goy156.cloudfront.net/Images/IGR97-W-2.jpg",
    //             metal_type: { id: 679, paraname: "White Gold", slug: "white-gold" },
    //             metal_stamp: { id: 682, paraname: "14k" }
    //         }
    //     ]
    // }
];

export const REVIEWS_DATA = [
    {
        user: "Valeria F.",
        verified: true,
        rating: 5,
        date: "Jan 12, 2024",
        title: "Perfection!",
        text: "I went to the store with my fiancé and we both got our wedding bands here. The ring is perfect! Love the white gold and the diamonds, they look even better in person. I have small hands so the thin band is perfect.",
        helpful: 12
    },
    {
        user: "Ariel Q.",
        verified: true,
        rating: 4,
        date: "Dec 28, 2023",
        title: "Understated Elegance",
        text: "The pavé work is incredible. It catches the light from every angle without being too flashy for my office wear.",
        helpful: 5
    }
];

export const CATEGORIES = ['All', 'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants', 'Bangles', 'Mangalsutra', 'Chains', 'Nose Pins', 'Watch Accessory'];

export const FAQ_IMAGE = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200";

export const RING_FILTERS = [
    {
        title: 'Gender',
        options: [
            { label: 'Women', count: 2046 },
            { label: 'Men', count: 415 }
        ]
    },
    {
        title: 'Rings Style',
        options: [
            { label: 'Band', count: 603 },
            { label: 'Couple Band', count: 270 },
            { label: 'Cocktail', count: 96 }
        ]
    }
];

export const COLLECTIONS_DATA = [
    {
        name: 'The Bridal Edit',
        // image: '/images/collection01.png',
        image: `${PREFIX}/images/New folder/11.jpg`,

        description: 'Handcrafted heirlooms for your most significant milestone.',
        tagline: 'Crafted for Forever'
    },
    {
        name: 'Modern Minimalist',
        // image: '/images/collection04.png',
        image: `${PREFIX}/images/New folder/02.jpg`,
        description: 'Clean lines and quiet luxury for the contemporary professional.',
        tagline: 'Crafted for Forever'
    },
    {
        name: 'Heritage Reimagined',
        // image: '/images/collection03.png'
        image: `${PREFIX}/images/New folder/08.jpg`,
        description: 'Traditional Indian motifs reinterpreted for today\'s aesthetic.',
        tagline: 'Crafted for Forever'
    }
];

export const TESTIMONIALS = [
    {
        name: "Ananya R.",
        text: "The craftsmanship is impeccable. My solitaire ring feels so personal and the sparkle is unmatched."
    },
    {
        name: "Rohit K.",
        text: "Exceptional quality and attention to detail. The finish and brilliance exceeded my expectations."
    },
    {
        name: "Meera S.",
        text: "Elegant, timeless, and beautifully made. I receive compliments every time I wear it."
    },
    {
        name: "Vikram P.",
        text: "From design to delivery, the experience was seamless. The jewelry feels truly luxurious."
    },
    {
        name: "Neha A.",
        text: "Absolutely in love with my ring. The diamond catches light perfectly and feels very premium."
    },
    {
        name: "Arjun M.",
        text: "Minimal, refined, and crafted with care. Exactly what I was looking for in fine jewelry."
    },
    {
        name: "Rohit K.",
        text: "Exceptional quality and attention to detail. The finish and brilliance exceeded my expectations."
    },
    {
        name: "Vikram P.",
        text: "From design to delivery, the experience was seamless. The jewelry feels truly luxurious."
    },
];

export const CHAPTERS_DATA = [
    { id: 'rings', name: 'Rings', image: `${PREFIX}/images/ringg.jpg`, link: '#' },
    { id: 'earrings', name: 'Earrings', image: `${PREFIX}/images/Earrings.png`, link: '#' },
    { id: 'necklaces', name: 'Necklaces', image: `${PREFIX}/images/Necklace.png`, link: '#' },
    { id: 'bracelets', name: 'Bracelets', image: `${PREFIX}/images/Bracelets.png`, link: '#' },
    { id: 'bangles', name: 'Bangles', image: `${PREFIX}/images/Bangles.png`, link: '#' },
    { id: 'pendants', name: 'Pendants', image: `${PREFIX}/images/Pendants.png`, link: '#' }
];

// ---------- Product details page ----------------

// Image gallary message show
export const IMAGE_GALLERY_MESSAGE = "The images shown are for illustrative purposes only. The final product may vary slightly in color, finish, or other minor details."

// is pandents
export const PANDENTS_INCLUDE = ['Pendant', 'Pendants'];

// Pandents disclaimer body (rendered with a bold "Disclaimer:" prefix).
export const PANDENTS_MESSAGE = "The chain shown in the product images is for display purposes only. This product includes the pendant only. Chain is not included."
