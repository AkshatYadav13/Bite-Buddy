import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cartType";
import { Link } from "react-router-dom";
import { getCartTotal } from "@/lib/utils";
import { EmptyState } from "@/components/shared/utilityComponents";
import { useUserStore } from "@/store/useUserStore";

const Cart = () => {
  const { clearCart, incrementQuantity, decrementQuantity, removeFromCart,cart } = useCartStore();
  const cartTotal = getCartTotal()
  const {user}  = useUserStore()

  if (cart.length === 0) {
    return (
      <div className="h-screen flex bg-gray-50 dark:bg-input/110 items-center">
        <EmptyState
          title="Your cart is empty"
          message="Looks like you haven't added anything to your cart yet."
          icon={<ShoppingCart size={48} className="text-gray-500" />}
          actionLabel="Start Shopping"
        ></EmptyState>
      </div>
    );
  }

  return (
    <div className="px-3 py-6 md:px-6 lg:px-10 bg-gray-50 dark:bg-input/110">
      <div className="flex justify-end">
        <Button onClick={clearCart} variant="outline">
          Clear All
        </Button>
      </div>

      <Table className="my-10">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-28">Items</TableHead>
            <TableHead className="min-w-52">Title</TableHead>
            <TableHead className="w-[250px] min-w-24">Price</TableHead>
            <TableHead className="pl-8 w-[250px] min-w-38">Quantity</TableHead>
            <TableHead className="w-[250px] min-w-25">Total</TableHead>
            <TableHead className="pr-5 text-right w-3">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody  >
          {cart.map((cartItem: CartItem) => (
            <TableRow key={cartItem.dishId} >
              <TableCell className="font-medium">
                <img
                  src={cartItem?.imageUrl}
                  alt={cartItem?.name}
                  className="w-20 sm:w-35 h-18 rounded-lg object-cover"
                />
              </TableCell>
              <TableCell>{cartItem.name}</TableCell>
              <TableCell>{cartItem.sellingPrice} &#8377;</TableCell>
              <TableCell>
                <div className="w-fit flex items-center rounded-full border border-gray-100 dark:border-gray-800 shadow-md">
                  <Button
                    onClick={() => decrementQuantity(cartItem)}
                    size="icon"
                    variant="outline"
                    className="bg-gray-200 rounded-full"
                  >
                    <Minus></Minus>
                  </Button>
                  <span className="px-3 text-md">{cartItem.quantity}</span>
                  <Button
                    onClick={() => incrementQuantity(cartItem)}
                    size="icon"
                    variant="outline"
                    className="bg-gray-200 rounded-full"
                  >
                    <Plus></Plus>
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                {cartItem.sellingPrice * cartItem.quantity} &#8377;
              </TableCell>
              <TableCell className="text-right h-20">
                <Button
                  variant="outline"
                  onClick={() => removeFromCart(cartItem)}
                  size="sm"
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right h-15 text-lg font-bold text-green-600 dark:text-green-400">
              &#8377; {cartTotal}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="flex justify-end">
        {
          user?.addresses && user?.addresses?.length > 0 ?
          <Link to={`/customer/order/shipping`} className="sm:max-w-50 w-full">
            <Button className="my-gradient-btn w-full">Place Order</Button>
          </Link>
          :
          <Link to={`/profile`} className="sm:max-w-50 w-full">
            <Button className="my-gradient-btn w-full">Add Delivery Address</Button>
          </Link>
        }
      </div>
    </div>
  );
};

export default Cart;
