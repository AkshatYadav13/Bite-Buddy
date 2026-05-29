import { CartItem, CartState } from "@/types/cartType";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartRestaurantId:null,

      addToCart: (item: CartItem,restaurantId:string) => {
        if(!get().cartRestaurantId){
          set({cartRestaurantId:restaurantId})
        }
        const quantity = item.quantity || 1 

        const existingItem = get().cart.find(
          (cartItem) => cartItem.dishId === item.dishId
        );

        if (existingItem) {
          set((state) => ({
            cart: state.cart.map((cartItem) =>
              cartItem.dishId === item.dishId
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem
            ),
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { ...item, quantity}],
          }));
        }

        toast.success(`${item.name} added to cart`);
      },

      clearCart: () => {
        set({ cart: [],cartRestaurantId:null });
        toast.success("Your cart is now empty");
      },

      removeFromCart: (item: CartItem) => {
        if(get().cart.length === 1){
          set({cartRestaurantId:null}) 
        }

        set((state) => ({
          cart: state.cart.filter(
            (cartItem) => cartItem.dishId !== item.dishId
          ),
        }));
        toast.success("Item removed from cart");
      },

      incrementQuantity: (item: CartItem) => {
        set((state) => ({
          cart: state.cart.map((cartItem) =>
            cartItem.dishId === item.dishId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        }));
      },

      decrementQuantity: (item: CartItem) => {
        set((state) => ({
          cart: state.cart
            .map((cartItem) =>
              cartItem.dishId === item.dishId
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
            )
            .filter((cartItem) => cartItem.quantity > 0),
        }));
      },

      resetStore: () => {
        set({ cart: [],cartRestaurantId:null });
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
