import {
  ChevronRight,
  Store,
  Bike,
  Briefcase,
  Check,
  ShieldAlert,
  FileText,
} from "lucide-react";
import RestaurantForm from "./RestaurantForm";
import { useEffect, useState } from "react";
import { Loading, MyUnderLine } from "../components/shared/utilityComponents";
import { Button } from "../components/ui/button";
import { DeliveryAgentForm } from "./DeliveryAgentForm";
import { useUserStore } from "@/store/useUserStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import { Link } from "react-router-dom";
import ApplicationSubmitted from "./ApplicationSubmitted";
import {
  DeliveryApplication,
  RestaurantApplication,
} from "@/types/applicationType";

type RoleType = "Restaurant" | "DeliveryAgent" | null;

const roles = [
  {
    type: "Restaurant" as RoleType,
    icon: Store,
    title: "Restaurant Owner",
    description: "List your restaurant and reach thousands of customers",
    benefits: [
      "Expand your customer base",
      "Easy order management",
      "Real-time analytics",
    ],
  },
  {
    type: "DeliveryAgent" as RoleType,
    icon: Bike,
    title: "Delivery Partner",
    description: "Earn flexible income by delivering food",
    benefits: [
      "Flexible working hours",
      "Competitive earnings",
      "Weekly payouts",
    ],
  },
];

const JoinUsPage = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
  };

  const { user } = useUserStore();
  const { getUserApplicationDetails, userApplication,loading } = useApplicationStore();

  useEffect(() => {
    if (user?.applicationId) {
      getUserApplicationDetails(user.applicationId);
    }
  }, []);

  return (
    <div className="min-h-screen py-6">
      {loading.pageLoad ? (
        <Loading message="Loading user..." />
      ) : (user?.applicationId && userApplication) ?(
          <ApplicationSubmitted application={userApplication} />
      ) 
      : selectedRole === "Restaurant" ? (
        <RestaurantForm clearSelectedRole={() => setSelectedRole(null)} />
      ) : selectedRole === "DeliveryAgent" ? (
        <DeliveryAgentForm clearSelectedRole={() => setSelectedRole(null)} />
      ) : (
        <div className="min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Join Our Platform
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Choose how you'd like to partner with us
              </p>
              <div className="flex justify-center mt-4">
                <MyUnderLine />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.type}
                    onClick={() => handleRoleSelect(role.type)}
                    className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-500"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 rounded-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold ml-4 text-gray-900 dark:text-white">
                        {role.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {role.description}
                    </p>
                    <ul className="space-y-3">
                      {role.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 flex items-center justify-center">
                      Get Started <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Placeholder for future job postings */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-6">
                <Briefcase className="w-8 h-8 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Career Opportunities
                </h2>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Job postings coming soon!
                </p>
                <p className="text-gray-400 mt-2">
                  Check back later for exciting career opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinUsPage;

export const AlreadyApplied = ({
  userApplication,
}: {
  userApplication: RestaurantApplication | DeliveryApplication;
}) => {
  return (
    <div className="pt-30">
      <div className="max-w-xl mx-auto p-8 shadow-2xl rounded-2xl border border-red-200 text-center dark:bg-input/30">
        <div className="flex flex-col items-center justify-center gap-4">
          <ShieldAlert size={48} className="text-red-500" />
          <h2 className="text-2xl font-semibold">
            You’ve already submitted a {userApplication?.applicationType}{" "}
            application!
          </h2>
          <p className="text-gray-600 max-w-md">
            Our team is currently reviewing your application. If you'd like to
            update your submission or have any questions,please contact support.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Link to={`/application?type=${userApplication?.applicationType}`}>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-all">
                <FileText size={18} />
                View Your Application
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
