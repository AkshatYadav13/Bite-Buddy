import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Eye,
  FolderOpen,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode, RefObject, useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import { OrderStatus } from "@/types/orderTypes";
import { useCartStore } from "@/store/useCartStore";
import { CartItem } from "@/types/cartType";
import { Button } from "../ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvalidAccessProps {
  title?: string;
  message?: string;
  redirectLabel?: string;
  redirectPath?: string;
}

export const InvalidAccess: React.FC<InvalidAccessProps> = ({
  title = "Oops! Something went wrong",
  message = "The page you’re trying to access is not available or the request is invalid. Please check the URL or navigate back to a valid section of the website.",
  redirectLabel = "Go to Home",
  redirectPath = "/",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="p-4 bg-red-100 rounded-full mb-4">
        <AlertTriangle className="text-red-500" size={48} />
      </div>
      <h1 className="text-3xl font-bold text-red-600 mb-2">{title}</h1>
      <p className="text-gray-700 max-w-md mb-6">{message}</p>
      <Link
        to={redirectPath}
        className="px-6 py-2 text-white rounded-full my-gradient-btn transition"
      >
        {redirectLabel}
      </Link>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionLink?: string;
  showBtn?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No result Found",
  message = "We couldn’t find any data to display here.",
  icon = <FolderOpen size={48} className="text-gray-500" />,
  actionLabel = "Go Back",
  actionLink = "/",
  showBtn = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center m-auto text-center px-4">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {icon}
      </div>

      <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
        {title}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-7">{message}</p>
      {showBtn && (
        <Link
          to={actionLink}
          className="px-6 py-2 rounded-full text-white font-medium transition my-gradient-btn "
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export const CardSkeletonPage = () => {
  return (
    <div className="my-10 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {[...Array(3)].map((_, index) => (
        <CardSkeleton key={index}></CardSkeleton>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16 / 6}>
          <Skeleton className="w-full h-full" />
        </AspectRatio>
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <div className="mt-2 gap-1 flex items-center text-gray-900 dark:text-gray-900">
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-2 flex gap-1 items-center text-gray-900 dark:bg-gray-900">
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-4  dark:bg-gray-900 flex justify-end">
        <Skeleton className="h-10 w-24 rounded-full" />
      </CardFooter>
    </Card>
  );
};

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50  dark:bg-input/110  p-6">
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Loading = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className=" fixed inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4 p-6  ">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          {/* Inner spinning ring with gradient */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
          {/* Center dot for visual appeal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
          {message}  
        </p>
      </div>
    </div>
  );
};

// utility fn

export type AllStatus =
  | OrderStatus
  | "Approved"
  | "Rejected"
  | "Active"
  | "Online"
  | "Offline"
  | "Open"
  | "Closed"
  | "Busy"
  | "Paid"
  | "OnDelivery"
  | "Available"

export const getStatusColor = (status: AllStatus | string): string => {
  const sharedStyles = {
    yellow:
      "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
    blue: "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700",
    orange:
      "bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700",
    purple:
      "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700",
    green:
      "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700",
    red: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700",
    gray: "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600",
  };

  const colors: Record<AllStatus, string> = {
    Pending: sharedStyles.yellow,
    Placed: sharedStyles.orange,
    Confirmed: sharedStyles.blue,
    Preparing: sharedStyles.orange,
    ReadyForPickup: sharedStyles.orange,
    AcceptedByAgent: sharedStyles.orange,
    OutForDelivery: sharedStyles.purple,
    Delivered: sharedStyles.green,
    Canceled: sharedStyles.red,

    Approved: sharedStyles.green,
    Paid: sharedStyles.green,
    Rejected: sharedStyles.red,
    Active: sharedStyles.blue,
    Online: sharedStyles.green,
    Offline: sharedStyles.yellow,
    Open: sharedStyles.green,
    Closed: sharedStyles.red,
    Busy: sharedStyles.yellow,
    OnDelivery:sharedStyles.blue,
    Available:sharedStyles.green
  };

  return colors[status as AllStatus] || sharedStyles.gray; // fallback for unknown statuses
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Approved":
    case "PAID":
      return <CheckCircle className="h-4 w-4" />;
    case "Rejected":
      return <XCircle className="h-4 w-4" />;
    case "Pending":
      return <AlertCircle className="h-4 w-4" />;
    case "Delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "Canceled":
      return <AlertCircle className="w-4 h-4" />;
    case "Active":
      return <Eye className="h-3 w-3" />;
    case "Open":
      return <CheckCircle className="h-4 w-4" />;
    case "Closed":
      return <XCircle className="h-4 w-4" />;

    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status,
      )}`}
    >
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

export const NewBadge = ({ classes }: { classes: string }) => {
  return (
    <span
      className={`absolute ${classes} bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full shadow-lg overflow-hidden`}
    >
      <Sparkles className="w-3 h-3" />
      New
    </span>
  );
};

export const FavoriteBtn = ({
  isFavorite,
  onClickHandler,
  defaultVisible = false,
  loading
}: {
  isFavorite: boolean;
  onClickHandler: () => void;
  defaultVisible?: boolean;
  loading:boolean;
}) => {
  return (
    <button
      onClick={onClickHandler}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800  rounded-full transition-colors ${
        !isFavorite && !defaultVisible ? "invisible group-hover:visible" : ""
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Heart
          className={`w-5 h-5 ${
            isFavorite ? "text-red-500 fill-current" : "text-gray-600"
          }`}
        />
      )}
    </button>
  );
};

type AddToCartBtnProps = {
  cartItem: CartItem;
  restaurantId: string;
  classes?: string;
  text?: string;
};

export const AddToCartBtn = ({
  cartItem,
  restaurantId,
  classes,
  text = "Add to Cart",
}: AddToCartBtnProps) => {
  const [added, setAdded] = useState<boolean>(false);
  const { addToCart } = useCartStore();

  function addToCartHandler() {
    setAdded(true);
    addToCart(cartItem, restaurantId);
    setTimeout(() => {
      setAdded(false);
    }, 800);
  }

  return (
    <Button
      className={`w-full my-gradient-btn py-3 flex items-center justify-center gap-2 ${classes} rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
      onClick={addToCartHandler}
    >
      {added ? (
        <>
          <Check className="font-bold w-4 h-4" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4" />
          <span>{text}</span>
        </>
      )}
    </Button>
  );
};

type TabButtonProps = {
  id: string;
  label?: string;
  icon?: React.ElementType;
  isActive: boolean;
  onClick: (id: string) => void;
};

export const TabButton = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
}: TabButtonProps) => (
  <button
    onClick={() => onClick(id)}
    className={`capitalize relative flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
      isActive
        ? "text-blue-500 border-blue-500 bg-red-50 dark:bg-blue-900/20 dark:blue-teal-400 dark:border-blue-400"
        : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
    }`}
  >
    {Icon && <Icon size={20} />}
    {label || id}
  </button>
);

export const MyUnderLine = ({ lenght = 24 }: { lenght?: number }) => {
  return (
    <div
      className={`w-${lenght} h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full`}
    ></div>
  );
};

type ImagePreviewBoxProps = {
  imageRef: RefObject<HTMLInputElement | null>;
  previewImage: string | null;
  fallbackImage?: string | null;
  className?: string;
};

export const ImagePreviewBox = ({
  imageRef,
  previewImage,
  fallbackImage,
  className = "",
}: ImagePreviewBoxProps) => {
  return (
    <div
      className={`w-full h-full mx-auto relative ${
        !previewImage && "border-4"
      } border-dashed rounded-md overflow-hidden group cursor-pointer bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
      onClick={() => imageRef?.current?.click()}
    >
      {(previewImage || fallbackImage) && (
        <img
          src={previewImage! || fallbackImage!}
          alt="select image from local"
          className="w-full h-full object-cover text-center"
        />
      )}
      <div className="absolute inset-0 bg-gray-300 dark:hover:bg-gray-500 bg-opacity-50 hidden group-hover:flex items-center justify-center text-white text-2xl transition">
        <Plus />
      </div>
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton = ({ rows = 5, columns = 6 }: TableSkeletonProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeleton;


export const Notify = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
          {title}
        </h3>
        <p className="text-amber-700 dark:text-amber-300 text-sm">{content}</p>
      </div>
    </div>
  );
};



import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
};

export const LocationInMapDialog = ({
  open,
  onOpenChange,
  latitude,
  longitude,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Live Agent Location</DialogTitle>
        </DialogHeader>

        {latitude && longitude ? (
          <div className="h-[400px] w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={[latitude, longitude]}>
                <Popup>Agent Current Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">
            Location not available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const StatsCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
        <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
      <div className="h-7 w-28 bg-gray-300 dark:bg-gray-600 rounded" />
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </CardContent>
  </Card>
);
export const StatsCardSkeletonPage = ()=>{
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton
                    />
                    <StatsCardSkeleton
                    />
                    <StatsCardSkeleton
                    />
              </div>
}