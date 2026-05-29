import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import UpdateProfile from "./UpdateProfile";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Heart, Loader2 } from "lucide-react";
import { changePasswordSchema, ChangePasswordState } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { PageSkeleton } from "./shared/utilityComponents";
import { Link } from "react-router-dom";
import AddressManagement from "./shared/AddressManagement";

const Profile = () => {
  const [openChangePassDialog, setOpenChangePassDialog] = useState<boolean>(false);
  const {user, loading} = useUserStore();
  const isCustomer = user?.role === "Customer"

  if (loading.pageLoad) {
    return <PageSkeleton />;
  }

  return (
    <div className="py-5 flex justify-center bg-gray-50 dark:bg-input/10 min-h-screen">
      <div className="w-full sm:w-[min(100%,85vw)] space-y-6">
        {/* Profile Update Section */}
        <UpdateProfile />
        
        <Separator className="my-6" />

        {/* Address Management Section */}
        {
          isCustomer &&(
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                <AddressManagement />
              </div>
              <Separator className="my-6" />
            </>
          )
        }


        {/* Action Buttons */}
        <div className="px-4 sm:px-0 flex flex-wrap gap-4">
          <Button
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-9"
            onClick={() => setOpenChangePassDialog((prev) => !prev)}
          >
            Change Password
          </Button>
          {
            isCustomer &&(
              <>
              <Link to="/customer/favorites">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-9">
                  <Heart className="mr-2" />
                  View Favorites
                </Button>
              </Link>
              <Link to="/customer/canceled/transaction">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-9">
                  <Heart className="mr-2" />
                  Canceled Orders Refunds
                </Button>
              </Link>
              </>
            )
          }
        </div>
      </div>
      
      <ChangePassword
        open={openChangePassDialog}
        setOpen={() => setOpenChangePassDialog(false)}
      />
    </div>
  );
};

export default Profile;


export const ChangePassword = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: () => void;
}) => {
  const emptyData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  }

  const { changePassword,loading } = useUserStore();

  const [input, setInput] = useState<ChangePasswordState>(emptyData);

  const [errors, setErrors] = useState<Partial<ChangePasswordState>>({});

  function changeInputHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }

  async function submitHandler() {
    setErrors({});

    const inputValidation = changePasswordSchema.safeParse(input);
    if (!inputValidation.success) {
      const fieldErrors = inputValidation.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<ChangePasswordState>);
      return;
    }

    await changePassword(input);
    setOpen();
  }

  useEffect(()=>{
    return () => {
      setInput(emptyData);
      setErrors({});
    }
  },[open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Please enter your current password and a new password that is at least 6
            characters long
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-5">
          <div>
            <Label className="mb-3">Current Password</Label>
            <Input
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              value={input.currentPassword}
              onChange={changeInputHandler}
            />
            {errors && (
              <span className="text-sm text-red-500">{errors.currentPassword}</span>
            )}
          </div>
          <div>
            <Label className="mb-3">New Password</Label>
            <Input
              type="password"
              name="newPassword"
              placeholder="Create new password"
              value={input.newPassword}
              onChange={changeInputHandler}
            />
            {errors && (
              <span className="text-sm text-red-500">{errors.newPassword}</span>
            )}
          </div>
          <div>
            <Label className="mb-3">Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Re-Enter new password"
              value={input.confirmPassword}
              onChange={changeInputHandler}
            />
            {errors && (
              <span className="text-sm text-red-500">{errors.confirmPassword}</span>
            )}
          </div>
          {loading.changePasswordBtn ? (
            <Button
              className="bg-gradient-to-r from-orange-500 to-pink-500 w-full mt-7"
              disabled
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Please wait</span>
            </Button>
          ) : (
            <Button
              onClick={submitHandler}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 w-full mt-7"
            >
              Confirm
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};