

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Package, Star, User, Store } from "lucide-react";
import { convertToIndianTime, toIndianDateFormat } from "@/lib/utils";
import { getStatusColor } from "@/components/shared/utilityComponents";
import { OrderType } from "@/types/orderTypes";

const ViewOrderDetailsDialog = ({
  open,
  setOpen,
  order,
  loading
}: {
  open: boolean;
  setOpen: () => void;
  order: OrderType;
  loading:boolean
}) => {

  return (
    <div className="p-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Order Details</DialogTitle>
            <DialogDescription>
            {loading ? (
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            ) : (
              <>Order ID: {order._id.slice(-8).toUpperCase()}</>
            )}
            </DialogDescription>
          </DialogHeader>
          {
            loading ?(
              <LoadingSkeleton/>
            ):(
            <div className="space-y-6">
              {/* Status Section */}
              <div className="flex items-center justify-between">
                <Badge
                  className={`px-4 py-2 text-sm font-medium ${getStatusColor(
                    order.currentStatus
                  )}`}
                >
                  {order.currentStatus}
                </Badge>
                <span className="text-sm text-gray-500">
                  {toIndianDateFormat(order.createdAt.toString())}
                </span>
              </div>

              <Separator />

              {/* Restaurant & Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                    <Store className="w-4 h-4" />
                    Restaurant
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">
                      {order.restaurant.restaurantName}
                    </div>
                    <div className="text-gray-500">
                      {order.restaurant.address}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    Customer
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{order.user.fullName}</div>
                    <div className="text-gray-500">{order.user.contact}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Delivery Details */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-400">
                  Delivery Information
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-green-600" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 dark:text-gray-500">Pickup</div>
                      <div className="text-gray-600 dark:text-white">
                        {order.deliveryDetails.pickup.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-red-600" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 dark:text-gray-500">Drop</div>
                      <div className="text-gray-600 dark:text-white">
                        {order.deliveryDetails.drop.address}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{order.deliveryDetails.estimatedTimeMin} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>{order.deliveryDetails.distanceKm} km</span>
                  </div>
                </div>

                {order.deliveryAgent && (
                  <div className="pt-2 border-t">
                    <p className="font-medium text-gray-700 dark:text-gray-400">Delivery Agent: </p>
                    <div className="text-sm pt-2">
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-500">Name: </span>
                        <span className="text-gray-600 dark:text-white">
                          {order?.deliveryAgent?.user?.fullName}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-500">
                          Contact:{" "}
                        </span>
                        <span className="text-gray-500 dark:text-white ml-2">
                          {order.deliveryAgent?.user?.contact}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cart Items */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-400">Order Items</h3>
                <div className="space-y-3">
                  {order.cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{item.sellingPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Bill Details */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-400">Bill Summary</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Cart Total</span>
                    <span>₹{order.bill.cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping Fee</span>
                    <span>₹{order.bill.shippingFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>App Fee</span>
                    <span>₹{order.bill.appFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>GST</span>
                    <span>₹{order.bill.gstAmount}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium text-base text-gray-900 dark:text-white">
                    <span>Grand Total</span>
                    <span>₹{order.bill.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              {order.ratingDetails && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-400">Ratings</h3>
                    <div className="flex gap-4 text-sm">
                      {order.ratingDetails.restaurant && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{order.ratingDetails.restaurant} Restaurant</span>
                        </div>
                      )}
                      {order.ratingDetails.food && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{order.ratingDetails.food} Food</span>
                        </div>
                      )}
                      {order.ratingDetails.deliveryAgent && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {order.ratingDetails.deliveryAgent} Delivery
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Status Timeline */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-400">Order Timeline</h3>
                <div className="space-y-2">
                  {order.statusDetails.map((s, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === order.statusDetails.length - 1
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1 flex justify-between items-center text-sm">
                        <span
                          className={
                            index === order.statusDetails.length - 1
                              ? "font-medium"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        >
                          {s.status}
                        </span>
                        <span className="text-gray-500">
                          {convertToIndianTime(s.time.toString())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )
          }
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewOrderDetailsDialog;


const LoadingSkeleton = ()=>{
  return (
      <div className="space-y-6 animate-pulse">

      {/* Status */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>

      <Separator />

      {/* Restaurant & Customer */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 w-52 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>

      <Separator />

      {/* Delivery Section */}
      <div className="space-y-4">
        <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-3 w-64 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-3 w-52 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>

      <Separator />

      {/* Cart Items */}
      <div className="space-y-4">
        {[1, 2].map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>

      <Separator />

      {/* Bill */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        ))}
        <div className="h-4 w-32 bg-gray-400 dark:bg-gray-500 rounded mt-3" />
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-3">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>

    </div>
  )
}