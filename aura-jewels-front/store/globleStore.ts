import { create } from "zustand";
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from "@/lib/Api_Url";
import { getToken, setWishlistCookie } from "@/services/clientCookies";
import { addToWishlist as addToWishlistApi, removeFromWishlist as removeFromWishlistApi } from "@/services/wishlistService";
import { isSameWishlistLine, normalizeSelection } from "@/lib/lineIdentity";

interface UsesGlobalState {
    cart: any[];
    wishlist: any[];
    cartCount: number;
    wishCount: number;
    country: string;
    currency: string;
    currencySymbol: string;
    exchangeRate: number;
    setCartCount: (count: any) => void;
    setWishCount: (count: any) => void;
    setRegion: (country: string, currency: string, symbol: string, exchangeRate: number) => void;
    setCart: (cart: any[]) => void;
    setWishlist: (wishlist: any[]) => void;
    addToCart: (product: any) => void;
    removeFromCart: (id: any) => void;
    addToWishlist: (product: any) => Promise<void>;
    // Accepts a product id (legacy) or the wishlist line itself. Passing the
    // line is required to remove one origin without removing the other.
    removeFromWishlist: (target: any) => Promise<void>;
    checkout: () => void;
    couponCode: string;
    setCouponCode: (code: string) => void;
}

export const useGlobleStore = create<UsesGlobalState>((set) => ({
    couponCode: "",
    setCouponCode: (code: string) => set({ couponCode: code }),
    cart: [],
    wishlist: [],
    cartCount: 0,
    wishCount: 0,
    country: DEFAULT_COUNTRY || 'IN',
    currency: (DEFAULT_COUNTRY || 'IN') === 'IN' ? 'INR' : 'USD',
    currencySymbol: (DEFAULT_COUNTRY || 'IN') === 'IN' ? '₹' : (DEFAULT_CURRENCY || '$'),
    exchangeRate: 84.5,

    // Count
    setCartCount: (count: any) => set({ cartCount: count }),
    setWishCount: (count: any) => set({ wishCount: count }),

    // Region
    setRegion: (country: string, currency: string, symbol: string, exchangeRate: number) => set({ country, currency, currencySymbol: symbol, exchangeRate }),

    setCart: (cart: any[]) => set({ cart: cart, cartCount: cart.length }),
    setWishlist: (wishlist: any[]) => set({ wishlist: wishlist, wishCount: wishlist.length }),

    // Add & Remove from Cart
    addToCart: (product: any) => set((state: any) => {
        const item = product.isDiamond ? {
            ...product,
            id: product.id || product._id || product.stockId,
            _id: product._id || product.id || product.stockId,
            cartId: product.cartId || `diamond-${product.id || product._id || product.stockId}`,
            stockId: product.stockId || product.stock_id || '',
            sku: product.stockId || product.sku || '',
            title: product.title || product.name || '',
            name: product.title || product.name || '',
            image: product.image || product.default_image || '',
            default_image: product.default_image || product.image || '',
            price: product.price || 0,
            isDiamond: true,
            qty: product.qty || product.quantity || 1,
            quantity: product.quantity || product.qty || 1,
        } : product;

        const exists = state.cart.some((i: any) => (i.id || i._id) === (item.id || item._id) || (item.cartId && i.cartId === item.cartId));
        const newCart = exists ? state.cart : [...state.cart, item];

        if (item.isDiamond && typeof window !== 'undefined') {
            try {
                const existingDiamonds = JSON.parse(localStorage.getItem('Aura Jewels_diamond_cart') || '[]');
                const diamondExists = existingDiamonds.some((d: any) => (d.id || d._id) === (item.id || item._id));
                if (!diamondExists) {
                    const nextDiamonds = [...existingDiamonds, item];
                    localStorage.setItem('Aura Jewels_diamond_cart', JSON.stringify(nextDiamonds));
                }
            } catch (e) { }
        }

        return { cart: newCart, cartCount: newCart.length };
    }),
    removeFromCart: (target: any) => set((state: any) => {
        const targetId = typeof target === 'object' ? (target.id || target._id || target.cartId) : target;
        const newCart = state.cart.filter((item: any) => (item.id || item._id || item.cartId) !== targetId);
        if (typeof window !== 'undefined') {
            try {
                const existingDiamonds = JSON.parse(localStorage.getItem('Aura Jewels_diamond_cart') || '[]');
                const nextDiamonds = existingDiamonds.filter((d: any) => (d.id || d._id || d.cartId) !== targetId);
                localStorage.setItem('Aura Jewels_diamond_cart', JSON.stringify(nextDiamonds));

                const existingCustom = JSON.parse(localStorage.getItem('Aura Jewels_custom_rings') || '[]');
                const nextCustom = existingCustom.filter((c: any) => (c.id || c._id || c.cartId) !== targetId);
                localStorage.setItem('Aura Jewels_custom_rings', JSON.stringify(nextCustom));
            } catch (e) { }
        }
        return { cart: newCart, cartCount: newCart.length };
    }),

    // Add & Remove from Wishlist
    addToWishlist: async (product: any) => {
        const token = getToken();
        const id = product.id || product._id;
        const defaultSize = (product.sizes || []).find((sz: any) => sz.isDefault) || (product.sizes || [])[0];
        const sizeDetailsId = typeof product?.sizeDetails === 'object' ? product?.sizeDetails?._id : (typeof product?.sizeDetails === 'string' ? product?.sizeDetails : null);
        const resolvedSizeId = (product.selectedSize !== undefined && product.selectedSize !== null)
            ? product.selectedSize
            : (product.sizeId || sizeDetailsId || defaultSize?._id || null);


        const item = product.isDiamond ? {
            ...product,
            id: id,
            _id: id,
            stockId: product.stockId || product.stock_id || '',
            sku: product.stockId || product.sku || product.itemCode || '',
            title: product.title || product.name || product.productTitle || '',
            name: product.title || product.name || product.productTitle || '',
            image: product.image || product.default_image || (product.images?.[0]?.MediaLocation) || '',
            default_image: product.default_image || product.image || (product.images?.[0]?.MediaLocation) || '',
            price: product.price || product.setting_price || product.settingprice || product.finalPrice || 0,
            slug: product.slug || '',
            isDiamond: true,
            shape: typeof product.shape === 'object' ? (product.shape?.name || product.shape?.parameterName) : product.shape,
            carat: product.carat,
            color: typeof product.color === 'object' ? (product.color?.name || product.color?.parameterName) : product.color,
            clarity: typeof product.clarity === 'object' ? (product.clarity?.name || product.clarity?.parameterName) : product.clarity,
            cut: typeof product.cut === 'object' ? (product.cut?.name || product.cut?.parameterName) : product.cut,
            polish: typeof product.polish === 'object' ? (product.polish?.name || product.polish?.parameterName) : product.polish,
            symmetry: typeof product.symmetry === 'object' ? (product.symmetry?.name || product.symmetry?.parameterName) : product.symmetry,
            fluorescence: typeof product.fluorescence === 'object' ? (product.fluorescence?.name || product.fluorescence?.parameterName) : product.fluorescence,
            lab: typeof product.certLab === 'object' ? (product.certLab?.name || product.certLab?.parameterName) : (product.lab || product.certLab),
            certNo: product.certNo || product.certificateNo || product.cert_no || '',
            depth: product.depth || product.depthPer || product.depth_percent || '',
            table: product.table || product.tablePer || product.table_percent || '',
            origin: product.origin || 'Natural',
        } : {
            ...product,
            id: id,
            _id: id,
            sku: product.sku || product.itemCode || '',
            title: product.title || product.name || product.productTitle || '',
            name: product.title || product.name || product.productTitle || '',
            image: product.image || product.default_image || (product.images?.[0]?.MediaLocation) || '',
            default_image: product.default_image || product.image || (product.images?.[0]?.MediaLocation) || '',
            price: product.price || product.setting_price || product.settingprice || product.finalPrice || 0,
            setting_price: product.setting_price || product.settingprice || product.price || product.finalPrice || 0,
            slug: product.slug || '',
            sizeId: resolvedSizeId,
            isDiamond: false,
            shape: product.shape,
            carat: product.carat,
            // Selected center-stone origin/quality (repriced + shown in the wishlist).
            // An explicit `null` means "the product default" and must NOT fall
            // through to `product.origin` — that is what `??` would do.
            ...normalizeSelection({
                origin: product.selectedOrigin !== undefined ? product.selectedOrigin : product.origin,
                color: product.selectedColor !== undefined ? product.selectedColor : product.color,
                clarity: product.selectedClarity !== undefined ? product.selectedClarity : product.clarity,
            }),
        };

        set((state: any) => {
            const exists = state.wishlist.some((i: any) => isSameWishlistLine(i, item) || ((item.isDiamond || item.isCompleteRing) && (i.id || i._id || i.cartId) === (item.id || item._id || item.cartId)));
            if (exists) return {};
            const newWishlist = [...state.wishlist, item];

            // Save diamond & custom ring wishlist to localStorage so getWishlist() doesn't wipe them
            const diamonds = newWishlist.filter((i: any) => i.isDiamond);
            const customRings = newWishlist.filter((i: any) => i.isCompleteRing);
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('Aura Jewels_diamond_wishlist', JSON.stringify(diamonds));
                    localStorage.setItem('Aura Jewels_custom_wishlist', JSON.stringify(customRings));
                } catch (e) { }
            }

            if (!token) {
                setWishlistCookie(newWishlist.filter((i: any) => !i.isDiamond && !i.isCompleteRing));
            }
            return { wishlist: newWishlist, wishCount: newWishlist.length };
        });

        if (token && !product.isDiamond && !product.isCompleteRing) {
            try {
                const res: any = await addToWishlistApi(
                    { jeweleryId: item.id, origin: item.origin, color: item.color, clarity: item.clarity, sizeId: item.sizeId },
                    token
                );
                // Keep the row id so this exact variant can be removed later.
                const wishlistId = res?.data?.wishlistId;
                if (wishlistId) {
                    set((state: any) => ({
                        wishlist: state.wishlist.map((i: any) =>
                            isSameWishlistLine(i, item) ? { ...i, wishlistId } : i
                        ),
                    }));
                }
            } catch (error) {
                console.error("Error adding to wishlist API:", error);
            }
        }
    },

    removeFromWishlist: async (target: any) => {
        const token = getToken();
        // Legacy callers pass a bare product id; that can only mean "the line
        // with no selection", which is what a listing-page heart creates.
        const line = typeof target === 'string' || typeof target === 'number'
            ? { id: String(target) }
            : target;

        const targetId = typeof target === 'object'
            ? (target?.id || target?._id || target?.wishlistId || target?.cartId)
            : String(target);

        set((state: any) => {
            const newWishlist = state.wishlist.filter((item: any) => {
                if (isSameWishlistLine(item, line)) return false;

                const itemId = item?.id || item?._id || item?.wishlistId || item?.cartId;
                if (targetId && itemId && String(itemId) === String(targetId)) return false;

                return true;
            });

            const diamonds = newWishlist.filter((i: any) => i.isDiamond);
            const customRings = newWishlist.filter((i: any) => i.isCompleteRing);

            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem('Aura Jewels_diamond_wishlist', JSON.stringify(diamonds));
                    localStorage.setItem('Aura Jewels_custom_wishlist', JSON.stringify(customRings));
                } catch (e) { }
            }

            if (!token) {
                setWishlistCookie(newWishlist.filter((i: any) => !i.isDiamond && !i.isCompleteRing));
            }

            return { wishlist: newWishlist, wishCount: newWishlist.length };
        });

        if (token && !line?.isDiamond && !line?.isCompleteRing) {
            try {
                await removeFromWishlistApi({
                    wishlistId: line?.wishlistId,
                    jeweleryId: line?.id ?? line?._id,
                    origin: line?.origin ?? null,
                    color: line?.color ?? null,
                    clarity: line?.clarity ?? null,
                    sizeId: line?.sizeId ?? null,
                }, token);
            } catch (error) {
                console.error("Error removing from wishlist API:", error);
            }
        }
    },

    // Checkout
    checkout: () => {
        set({ cart: [], cartCount: 0 });
    }
}))