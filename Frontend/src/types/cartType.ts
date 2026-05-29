
export interface CartItem{
    _id?:string
    description?:string,
    dishId:string
    name:string,
    imageUrl:string
    sellingPrice:number,
    costPrice:number,
    quantity:number
}

export type CartState = {
    cart:CartItem[],
    cartRestaurantId:string|null,
    addToCart:(item:CartItem,restaurantId:string)=> void,
    clearCart:()=> void,
    removeFromCart:(item:CartItem)=> void
    incrementQuantity:(item:CartItem)=> void
    decrementQuantity:(item:CartItem)=> void
    resetStore:()=> void

}

