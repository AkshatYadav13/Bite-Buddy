import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/useUserStore";
import { Loader2, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

// not using this component for now, will use it in future when attach mailtrap

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");

  const { loading } = useUserStore();

  async function submitHandler(e: FormEvent) {
    e.preventDefault();
    // await forgetPassword(email);
  }

  return (
    <div className="flex justify-center pt-30 bg-gray-50 dark:bg-input/110 h-screen">
      <form className="p-5 w-[min(100%,500px)]" onSubmit={submitHandler}>
        <div>
          <h1 className="title-font font-bold text-center text-2xl my-8">
            Forgot Password
          </h1>
          <p className="text-center text-gray-600 ">
            Enter your email address to reset your password
          </p>
        </div>

        <div className="relative my-5">
          <Input
            type="email"
            className="pl-10 my-1"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Mail className="absolute top-2 left-2 text-gray-500 w-6 h-5"></Mail>
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

export default ForgotPassword;
