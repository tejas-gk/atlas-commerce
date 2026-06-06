import { useEffect, useState } from 'react';
import { useStore } from '@/store';

export const useHydratedStore = () => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Zustand persist middleware hydrates the store from localStorage
        // This just marks when hydration is complete
        setIsHydrated(true);
    }, []);

    const cart = useStore((state: any) => state.cart);
    const wishlist = useStore((state: any) => state.wishlist);
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);

    return {
        isHydrated,
        cart: isHydrated ? cart : [],
        wishlist: isHydrated ? wishlist : [],
        addToCart,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
    };
};
