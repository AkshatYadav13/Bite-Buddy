import {
  Bike,
  ChartColumn,
  ChevronDown,
  FileUser,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  PackageCheck,
  ShoppingCart,
  SquareMenu,
  Sun,
  Truck,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Menubar,
  MenubarTrigger,
  MenubarItem,
  MenubarMenu,
  MenubarContent,
} from "../ui/menubar";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";
import USER_DEFAULT_PROFILE_PIC from "@/assets/user_deault_profile_pic.png";
import { useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";

const NavLinks = [
  {
    id: "home",
    link: "/",
    access: "All",
  },
  {
    id: "profile",
    link: "/profile",
    access: "All",
  },
  {
    id: "Active Orders",
    link: "orders/active",
    access: "Customer",
  },
];

const NavBar = () => {
  const { user } = useUserStore();
  const { cart } = useCartStore();
  const { setTheme, theme, userLocation } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("home");
  const { newOrderIds, activeOrders } = useOrderStore();
  const { deliveryAgentDetails } = useDeliveryAgentStore();

  const visibleNavLinks = NavLinks.filter(
    (l) => l.access === "All" || l.access === user?.role,
  );

  const hasActiveOrder =
    deliveryAgentDetails?.status === "OnDelivery" || activeOrders.length > 0;

  const [openAgentLocDialog, setOpenAgentLocDialog] = useState(false);


  return (
    <div className="sticky z-30 top-0 w-full border-b shadow-sm min-h-[64px] flex justify-between items-center px-4 lg:px-8 bg-white dark:bg-[#020619]">
    
    <LocationInMapDialog
      open={openAgentLocDialog}
      onOpenChange={setOpenAgentLocDialog}
      latitude={deliveryAgentDetails?.lastLocation?.latitude!}
      longitude={deliveryAgentDetails?.lastLocation?.longitude!}
    />
      
      {/* Logo & Location Section */}
      <div className="flex items-center gap-4 lg:gap-6">
        <Link to="/" className="flex-shrink-0">
          <h1 className="title-font font-bold text-xl lg:text-2xl bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-pink-600 transition-all">
            Bite Buddy
          </h1>
        </Link>

        {/* Location Display - Only show for Delivery Agent */}
        {
          user?.role === "Delivery_Agent" ? (
          <Button variant={"ghost"} size={"icon"} className="rounded-full" onClick={() => setOpenAgentLocDialog(true)}>
            <MapPin className="w-5 h-5 text-orange-500" />
          </Button>
          ) : (
            userLocation && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span
                  title={userLocation.address}
                  className="text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {userLocation.area || userLocation.city}
                </span>
              </div>
            )
          )
        }
      </div>

      {/* Right Section - Nav Links & Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {/* Nav Links */}
          <div className="flex items-center gap-6 text-base">
            {visibleNavLinks.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={tab.link}
                  className={`capitalize font-medium transition-all relative ${
                    isActive
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.id}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Role-based Menu Panels */}
          {user?.role === "Restaurant_Owner" && (
            <Menubar className="border-none">
              <MenubarMenu>
                <MenubarTrigger className="font-medium">
                  Restaurant Panel
                </MenubarTrigger>
                <MenubarContent>
                  <Link to="/">
                    <MenubarItem>Dashboard</MenubarItem>
                  </Link>
                  <Link to="/resOwner/restaurant">
                    <MenubarItem>Restaurant</MenubarItem>
                  </Link>
                  <Link to="/resOwner/menu">
                    <MenubarItem>Menu</MenubarItem>
                  </Link>
                  <Link to="/orders/active">
                    <MenubarItem>
                      <div className="flex items-center justify-between w-full">
                        <span>Active Orders</span>
                        {newOrderIds.length > 0 && (
                          <NotificationBadge count={newOrderIds.length} />
                        )}
                      </div>
                    </MenubarItem>
                  </Link>

                  <Link to="/orders/history">
                    <MenubarItem>Order History</MenubarItem>
                  </Link>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}

          {user?.role === "Delivery_Agent" && (
            <Menubar className="border-none">
              <MenubarMenu>
                <MenubarTrigger className="font-medium">
                  Agent Panel
                </MenubarTrigger>
                <MenubarContent>
                  <Link to="/">
                    <MenubarItem>Dashboard</MenubarItem>
                  </Link>

                  <Link to="/deliveryAgent/orders/page">
                    <MenubarItem>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {hasActiveOrder
                            ? `Active Order (${activeOrders.length})`
                            : "Accept Order"}
                        </span>

                        {hasActiveOrder ? (
                          <NotificationBadge isAnimate />
                        ) : (
                          newOrderIds.length > 0 && (
                            <NotificationBadge count={newOrderIds.length} />
                          )
                        )}
                      </div>
                    </MenubarItem>
                  </Link>

                  <Link to="/orders/history">
                    <MenubarItem>Orders History</MenubarItem>
                  </Link>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}

          {user?.role === "Admin" && (
            <Menubar className="border-none">
              <MenubarMenu>
                <MenubarTrigger className="font-medium">
                  Admin Panel
                </MenubarTrigger>
                <MenubarContent>
                  <Link to="/">
                    <MenubarItem>Dashboard</MenubarItem>
                  </Link>
                  <Link to="/admin/restaurantList">
                    <MenubarItem>Restaurants</MenubarItem>
                  </Link>
                  <Link to="/admin/deliveryAgentList">
                    <MenubarItem>Delivery Agents</MenubarItem>
                  </Link>
                  <Link to="/admin/application/restaurantList">
                    <MenubarItem>Restaurant Applications</MenubarItem>
                  </Link>
                  <Link to="/admin/application/deliveryAgentList">
                    <MenubarItem>Delivery Agent Applications</MenubarItem>
                  </Link>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Moon
              className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
                theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
              }`}
            />
            <Sun
              className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
                theme === "light" ? "rotate-90 scale-0" : "rotate-0 scale-100"
              }`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Cart - Only show for customers */}
          {user?.role === "Customer" && (
            <Link to="/customer/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="w-5 h-5" />
              </Button>
              {cart && cart.length > 0 && (
                <NotificationBadge
                  count={cart.length}
                  classes="absolute top-0 right-0"
                />
              )}
            </Link>
          )}
        </div>

        {/* Mobile Sidebar Toggle */}
        <SideBar />
      </div>
    </div>
  );
};

export default NavBar;

const SideBar = () => {
  const { logout, loading, user } = useUserStore();
  const { setTheme, theme } = useAppStore();
  const { cart } = useCartStore();
  const { newOrderIds, activeOrders } = useOrderStore();
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const { deliveryAgentDetails } = useDeliveryAgentStore();

  const hasActiveOrder = deliveryAgentDetails?.status === "OnDelivery" || activeOrders.length > 0;

  const MenuItem = ({
    to,
    icon: Icon,
    children,
    badge,
    isAnimated = false,
  }: {
    to: string;
    icon: any;
    children: React.ReactNode;
    badge?: number;
    isAnimated?: boolean;
  }) => (
    <Link
      to={to}
      className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-sm"
    >
      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
      <span className="flex-1 group-hover:text-gray-900 dark:group-hover:text-white">
        {children}
      </span>
      {badge !== undefined && badge > 0 && (
        <NotificationBadge count={badge} isAnimate={isAnimated} />
      )}
    </Link>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </div>
  );

  return (
    <div className="relative z-30">
      <Sheet>
        <SheetTrigger className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Menu className="w-6 h-6" />
        </SheetTrigger>
        <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader>
            <SheetTitle>
              <Link to="/" className="w-fit flex">
                <h2 className="title-font font-bold text-xl bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Bite Buddy
                </h2>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto my-scrollbar space-y-6 mt-6">
            {/* General Section */}
            <div className="space-y-1">
              <SectionTitle>General</SectionTitle>
              <div className="space-y-1">
                <MenuItem to="/profile" icon={User}>
                  Profile
                </MenuItem>

                {/* Orders and Cart - Only for Customers */}
                {user?.role === "Customer" && (
                  <>
                    <MenuItem
                      to="/customer/cart"
                      icon={ShoppingCart}
                      badge={cart?.length}
                    >
                      Shopping Cart
                    </MenuItem>

                    <MenuItem
                      to="/orders/active"
                      icon={Package}
                      badge={newOrderIds.length}
                      isAnimated={newOrderIds.length > 0}
                    >
                      Active Orders
                    </MenuItem>

                    <MenuItem to="/orders/history" icon={PackageCheck}>
                      Orders History
                    </MenuItem>
                  </>
                )}
              </div>
            </div>

            {/* Restaurant Owner Section */}
            {user?.role === "Restaurant_Owner" && (
              <div className="space-y-1">
                <SectionTitle>Restaurant Management</SectionTitle>
                <div className="space-y-1">
                  <MenuItem to="/" icon={ChartColumn}>
                    Dashboard
                  </MenuItem>
                  <MenuItem to="/resOwner/restaurant" icon={UtensilsCrossed}>
                    Restaurant
                  </MenuItem>
                  <MenuItem to="/resOwner/menu" icon={SquareMenu}>
                    Menu
                  </MenuItem>
                  <MenuItem
                    to="/orders/active"
                    icon={Package}
                    badge={newOrderIds.length}
                    isAnimated={newOrderIds.length > 0}
                  >
                    Active Orders
                  </MenuItem>

                  <MenuItem to="/orders/history" icon={PackageCheck}>
                    Orders History
                  </MenuItem>
                </div>
              </div>
            )}

            {/* Admin Section */}
            {user?.role === "Admin" && (
              <div className="space-y-1">
                <SectionTitle>Administration</SectionTitle>
                <div className="space-y-1">
                  <MenuItem to="/" icon={ChartColumn}>
                    Dashboard
                  </MenuItem>
                  <MenuItem to="/admin/restaurantList" icon={UtensilsCrossed}>
                    Restaurants
                  </MenuItem>
                  <MenuItem to="/admin/deliveryAgentList" icon={Truck}>
                    Delivery Agents
                  </MenuItem>

                  {/* Applications Dropdown */}
                  <Menubar className="w-full border-0 bg-transparent rounded-none p-0 h-fit">
                    <MenubarMenu>
                      <MenubarTrigger
                        tabIndex={-1}
                        className="shadow-none border-none w-full justify-start gap-3 py-3 pl-4 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700"
                      >
                        <FileUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="flex-1 text-left">Applications</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </MenubarTrigger>
                      <MenubarContent className="w-56">
                        <Link to="/admin/application/restaurantList">
                          <MenubarItem>
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            Restaurant Applications
                          </MenubarItem>
                        </Link>
                        <Link to="/admin/application/deliveryAgentList">
                          <MenubarItem>
                            <Truck className="w-4 h-4 mr-2" />
                            Delivery Agent Applications
                          </MenubarItem>
                        </Link>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>
              </div>
            )}

            {/* Delivery Agent Section */}
            {user?.role === "Delivery_Agent" && (
              <div className="space-y-1">
                <SectionTitle>Delivery</SectionTitle>

                <div className="space-y-1">
                  <MenuItem to="/" icon={ChartColumn}>
                    Dashboard
                  </MenuItem>

                  <MenuItem
                    to="/deliveryAgent/orders/page"
                    icon={Bike}
                    badge={!hasActiveOrder ? newOrderIds.length : undefined}
                    isAnimated={hasActiveOrder}
                  >
                    {hasActiveOrder ? "Active Orders" : "Accept Order"}
                  </MenuItem>


                  <MenuItem to="/orders/history" icon={PackageCheck}>
                    Orders History
                  </MenuItem>
                </div>
              </div>
            )}

            {/* Settings Section */}
            <div className="space-y-1">
              <SectionTitle>Settings</SectionTitle>
              <div className="space-y-1">
                <button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors" />
                      <span className="flex-1 text-left group-hover:text-gray-900 dark:group-hover:text-white">
                        Dark Mode
                      </span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition-colors" />
                      <span className="flex-1 text-left group-hover:text-gray-900 dark:group-hover:text-white">
                        Light Mode
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {user?.role === "Customer" && (
              <div className="space-y-1">
                <SectionTitle>Opportunities</SectionTitle>
                <button
                  onClick={() => setOpenJoinDialog(true)}
                  className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700"
                >
                  <FileUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  Join Bite Buddy
                </button>

                <JoinUsMessage
                  open={openJoinDialog}
                  onOpenChange={setOpenJoinDialog}
                />
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Link
              to="/profile"
              className="flex items-center gap-3 cursor-pointer w-full mb-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar>
                <AvatarImage
                  src={user?.profilePic || USER_DEFAULT_PROFILE_PIC}
                />
                <AvatarFallback>
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.fullName}</span>
            </Link>

            {loading.logoutBtn ? (
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                disabled
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button
                onClick={async () => await logout()}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const NotificationBadge = ({
  count,
  isAnimate = false,
  classes = "",
}: {
  count?: number;
  isAnimate?: boolean;
  classes?: string;
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center min-h-[18px] min-w-[18px] px-1.5 bg-orange-600 text-[10px] font-semibold text-center rounded-full text-white ${
        isAnimate ? "animate-pulse" : ""
      } ${classes}`}
    >
      {count}
    </span>
  );
};

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { LocationInMapDialog } from "./utilityComponents";

interface JoinUsMessageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinUsMessage = ({ open, onOpenChange }: JoinUsMessageProps) => {
  const { logout } = useUserStore();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="space-y-5 p-6 text-center">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Start Your Journey With Us
              </DialogTitle>
              <DialogDescription>
                Thanks for your interest in joining us 🎉
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Complete your application anytime using your new account.
            </p>
            <Button
              onClick={async () => await logout()}
              title="To continue, please log out from this account and sign up with a new account."
              className="w-full"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};


