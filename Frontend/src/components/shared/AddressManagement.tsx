import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Home,
  Building2,
  MapPin,
  Loader2,
  Plus,
  Trash2,
  Check,
  Edit,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { IUserAddress } from "@/types/userType";
import { useAppStore } from "@/store/useAppStore";
import AcceptAddress from "./AcceptAddress";

const AddressManagement = () => {
  const { user, setDefaultAddress, deleteAddress, loading, getUserAddress } =
    useUserStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IUserAddress | null>(
    null,
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const addresses = user?.addresses || [];

  const handleSetDefault = async (id: string) => {
    setProcessingId(id);
    await setDefaultAddress(id);
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    await deleteAddress(id);
    setProcessingId(null);
  };

  const openAddDialog = () => {
    setSelectedAddress(null);
    setOpenDialog(true);
  };

  const openEditDialog = (address: IUserAddress) => {
    setSelectedAddress(address);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (user?.addresses.length == 0) {
      getUserAddress();
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Delivery Addresses
        </h3>
        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No addresses saved yet
          </p>
          <Button onClick={() => openAddDialog} variant="outline" size="sm">
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                address.isDefault
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {/* Address Icon */}
              <div className="mt-1">
                {address.label.toLowerCase().includes("home") ? (
                  <Home className="w-5 h-5 text-orange-500" />
                ) : (
                  <Building2 className="w-5 h-5 text-orange-500" />
                )}
              </div>

              {/* Address Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {address.label}
                  </h4>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      <Check className="w-3 h-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {address.address}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!address.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(address._id!)}
                    variant="outline"
                    size="sm"
                    disabled={processingId === address._id}
                  >
                    {processingId === address._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Set Default"
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    openEditDialog(address);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  disabled={selectedAddress?._id === address._id}
                >
                  {loading.editAddressBtn && selectedAddress?._id === address._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={() => handleDelete(address._id!)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  disabled={processingId === address._id}
                >
                  {processingId === address._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAddressDialog
        open={openDialog}
        setOpen={setOpenDialog}
        selectedAddress={selectedAddress}
      />
    </div>
  );
};

export default AddressManagement;


const AddAddressDialog = ({
  open,
  setOpen,
  selectedAddress = null,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedAddress?: IUserAddress | null;
}) => {
  const {userLocation} = useAppStore()
  
  const emptyAddress: IUserAddress = {
    label: "",
    address: userLocation?.address || "",
    latitude: userLocation?.latitude || 0,
    longitude: userLocation?.longitude || 0,
    isDefault: false,
  };
  
  const { addAddress, editAddress, loading } = useUserStore();
  const [input, setInput] = useState<IUserAddress>(emptyAddress);

  const isEditing = Boolean(selectedAddress);
  const [errors, setErrors] = useState<Partial<IUserAddress>>({});

  useEffect(() => {
    if (selectedAddress) setInput(selectedAddress);
    else setInput(emptyAddress);
  }, [selectedAddress, open]);

  const validateForm = () => {
    const err: Partial<any> = {};
    if (!input.label.trim()) err.label = "Label required";
    if (!input.address.trim()) err.address = "Address required";
    if (!input.latitude) err.latitude = "Invalid location";
    if (!input.longitude) err.longitude = "Invalid location";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submitHandler = async () => {
    if (!validateForm()) return;

    isEditing
      ? await editAddress(selectedAddress!._id!, input)
      : await addAddress(input);

    setOpen(false);
    setInput(emptyAddress);
  };

  useEffect(() => {
    if (!open) {
      setErrors({});
      setInput(emptyAddress);
    }
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Address" : "Add Address"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label>Address Label *</Label>
            <Input
              value={input.label}
              onChange={(e) =>
                setInput((p) => ({ ...p, label: e.target.value }))
              }
            />
            {errors.label && (
              <p className="text-red-500 text-sm">{errors.label}</p>
            )}
          </div>

          <AcceptAddress
            address={input.address}
            latitude={input.latitude}
            longitude={input.longitude}
            onChange={({ address, latitude, longitude }) => {
              setInput((p) => ({
                ...p,
                address,
                latitude,
                longitude,
              }));
            }}
            errorMsg={errors.address || errors.latitude?.toString() || errors.longitude?.toString()}
          />

          <Button
            disabled={loading.addAddressBtn || loading.editAddressBtn}
            onClick={submitHandler}
            className="w-full"
          >
            {loading.addAddressBtn || loading.editAddressBtn ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
