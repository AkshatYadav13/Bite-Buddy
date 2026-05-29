import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

// TODO: not using this component for now, will use it in future when attach mailtrap


const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");

  // const params = useParams();
  // const { token } = params;

  const {  loading } = useUserStore();

  async function submitHandler(e: FormEvent) {
    e.preventDefault();
    // await resetPassword(newPassword, token!);
  }

  return (
    <div className="flex justify-center pt-30 bg-gray-50 dark:bg-input/110 h-screen">
      <form className="p-5 w-[min(100%,500px)]" onSubmit={submitHandler}>
        <div>
          <h1 className="title-font font-bold text-center text-2xl my-8">
            Reset Password
          </h1>
          <p className="text-center text-gray-600 ">
            Create atleast a 6 digit strong password.
          </p>
        </div>

        <div className="relative my-5">
          <Input
            type="password"
            placeholder="Enter new password"
            className="text-sm pl-10 my-1"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <LockKeyhole className="absolute top-2 left-2 text-gray-500 w-6 h-5"></LockKeyhole>
        </div>

        {loading ? (
          <Button className="my-gradient-btn w-full my-5" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
            <span>Please wait</span>
          </Button>
        ) : (
          <Button className="my-gradient-btn w-full my-5">Send Reset Link</Button>
        )}

        <p className="text-center">
          Back to Login
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            {" "}
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
