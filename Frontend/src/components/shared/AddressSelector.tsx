import React, { useState } from "react";
import { MapPin, Check } from "lucide-react";
import { IUserAddress } from "@/types/userType";

interface AddressSelectorProps {
  addresses: IUserAddress[];
  onSelectAddress: (address: IUserAddress) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  onSelectAddress,
}) => {
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
  const [selectedAddress, setSelectedAddress] =
    useState<IUserAddress>(defaultAddress);

  const handleSelect = (address: IUserAddress) => {
    setSelectedAddress(address);
    onSelectAddress(address);
  };

  return (
    <div className="w-full mx-auto">
      <h3 className="text-md font-semibold mb-4 text-gray-800 dark:text-white">
        Select Delivery Address
      </h3>

      <div className="space-y-4 my-2">
        {addresses.map((address, index) => (
          <div
            key={index}
            onClick={() => handleSelect(address)}
            className={`
        relative p-4 border-2 rounded-lg cursor-pointer transition-all
        ${
          selectedAddress === address
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
        }
      `}
          >
            <div className="flex items-start gap-3">
              <MapPin
                className={`
            w-5 h-5 mt-1 flex-shrink-0
            ${
              selectedAddress === address
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            }
          `}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {address.label}
                  </span>

                  {address.isDefault && (
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded
                               bg-green-100 text-green-700
                               dark:bg-green-900/30 dark:text-green-400"
                    >
                      Default
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {address.address}
                </p>
              </div>

              {selectedAddress === address && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressSelector;


