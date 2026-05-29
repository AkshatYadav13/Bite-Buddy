import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  LoginInputState,
  LoginRoles,
  userLoginSchema,
} from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { Label } from "@radix-ui/react-label";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const Login = () => {
  const [input, setInput] = useState<LoginInputState>({
    email: "",
    password: "",
    role: "Customer",
  });

  const [errors, setErrors] = useState<Partial<LoginInputState>>({});
  const { login, loading, googleLogin } = useUserStore();

  function inputChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }

  async function submitHandler(e: FormEvent) {
    e.preventDefault();

    const inputValidation = userLoginSchema.safeParse(input);
    if (!inputValidation.success) {
      const fieldErrors = inputValidation.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<LoginInputState>);
      return;
    }

    await login(input);
    setErrors({});
  }

  async function googleAuthHandler() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const googleInput = {
        email: result.user.email!,
      } as Partial<LoginInputState>;

      await googleLogin(googleInput);
      setErrors({});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-input/110 px-4">
      <div className="w-full max-w-md bg-white dark:bg-background rounded-xl shadow-md p-6">
        <h1 className="title-font font-bold text-center text-2xl mb-6">
          Bite Buddy
        </h1>

        <form onSubmit={submitHandler} className="space-y-5">
          <div className="relative">
            <Label className="text-gray-500">Email</Label>
            <Input
              type="email"
              className="pl-10 mt-1"
              name="email"
              value={input.email}
              onChange={inputChangeHandler}
              required
            />
            <Mail className="absolute top-9 left-3 text-gray-500 w-5 h-5" />
            {errors?.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          <div className="relative">
            <Label className="text-gray-500">Password</Label>
            <Input
              type="password"
              className="pl-10 mt-1"
              name="password"
              value={input.password}
              onChange={inputChangeHandler}
              required
            />
            <LockKeyhole className="absolute top-9 left-3 text-gray-500 w-5 h-5" />
            {errors?.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>

          <div>
            <Label className="text-gray-500">Role</Label>

            <Select
              value={input.role}
              onValueChange={(value) =>
                setInput((prev) => ({
                  ...prev,
                  role: value as LoginInputState["role"],
                }))
              }
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent >
                {LoginRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors?.role && (
              <span className="text-xs text-red-500">{errors.role}</span>
            )}
          </div>

          <Button className="my-gradient-btn w-full" disabled={loading.loginBtn}>
            {loading.loginBtn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading.loginBtn ? "Please wait" : "Login"}
          </Button>
        </form>

        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full"
            onClick={googleAuthHandler}
            disabled={loading.googleLoginBtn}
          >
            <FcGoogle className="mr-2" />
            Sign up with Google
          </Button>
        </div>

        <p className="text-center mt-4">
          <Link
            to="/auth/forgotPassword"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>

        <Separator className="my-5" />

        <p className="text-center text-sm">
          Don’t have an account?
          <Link
            to="/auth/signup"
            className="ml-1 text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
