import {  ChevronDown,  ChevronUp,  Star, Phone,  Mail,  Package,  Shield, Bike} from 'lucide-react';
import { DeliveryAgentType, VehicleType } from '@/types/deliveryAgentType';
import  USER_DEFAULT_PROFILE_PIC  from "@/assets/user_deault_profile_pic.png";
import { Button } from '@/components/ui/button';
import { FaBicycle } from 'react-icons/fa';
import { PiScooter } from 'react-icons/pi';

interface DeliveryAgentCardProps {
  deliveryAgent: DeliveryAgentType;
  expandedRow: string | null;
  toggleRowExpansion: (agentId: string) => void;
}

const DeliveryAgentCard = ({ deliveryAgent, expandedRow, toggleRowExpansion }: DeliveryAgentCardProps) => {
  const isExpanded = expandedRow === deliveryAgent._id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
      case 'Available':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-200 dark:border-green-700';
      case 'OnDelivery':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-700';
      case 'Break':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700';
      case 'Offline':
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700';
    }
  };

  const getVehicleIcon = (vehicleType: VehicleType) => {
    switch (vehicleType){
      case "Scooter":
        return <PiScooter className="w-4 h-4" />
      case "Bicycle": 
        return <FaBicycle className="w-4 h-4" />
      case "Bike" :
        return <Bike className="w-4 h-4" />
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0">
              <img
                src={deliveryAgent.user.profilePic || USER_DEFAULT_PROFILE_PIC}
                alt={deliveryAgent.user.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {deliveryAgent.user.fullName}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(deliveryAgent.status)}`}>
                  {deliveryAgent.status}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-1">
                  {getVehicleIcon(deliveryAgent.vehicleType)}
                  <span>{deliveryAgent.vehicleType}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>{deliveryAgent.licenseNumber}</span>
                </div>

                {deliveryAgent.ratingCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{deliveryAgent.avgRating}</span>
                    <span className="text-gray-400 dark:text-gray-500">({deliveryAgent.ratingCount})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{deliveryAgent.totalDeliveries} deliveries</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              <div>Joined: {new Date(deliveryAgent.createdAt).toLocaleDateString()}</div>
            </div>

            <button
              onClick={() => toggleRowExpansion(deliveryAgent._id)}
              className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  <span>Email:</span>
                  <span className="text-gray-900 dark:text-white">{deliveryAgent.user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                  <span>Phone:</span>
                  <span className="text-gray-900 dark:text-white">{deliveryAgent.user.contact}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{deliveryAgent.totalDeliveries}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Deliveries</div>
                </div>
                {deliveryAgent.ratingCount > 0 && (
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{deliveryAgent.avgRating}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Average Rating</div>
                  </div>
                )}
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{deliveryAgent.totalDeliveries}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed Orders</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </Button>
              <Button className="px-4 py-2 bg-green-800 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                Contact Agent
              </Button>
              <Button variant="outline">
                View Orders
              </Button>
              <Button variant="destructive">
                Suspend Agent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgentCard;