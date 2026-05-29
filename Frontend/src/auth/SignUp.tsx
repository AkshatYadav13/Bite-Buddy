import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleSignUpInputState, googleSignUpSchema, SignUpInputState, userSignUpSchema } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import { Label } from "@radix-ui/react-label";
import {
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  User,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase.ts";
import { toast } from "sonner";

const SignUp = () => {
  const [input, setInput] = useState<SignUpInputState>({
    fullName: "",
    email: "",
    password: "",
    contact: "",
    role: "Customer"
  });

  const [errors, setErrors] = useState<Partial<SignUpInputState>>({});

  const { signup, googleSignup,loading } = useUserStore();

  function inputChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  }

  function roleChangeHandler(role: "Customer" | "Applicant") {
    setInput((prev) => ({ ...prev, role }));
  }

  async function submitHandler(e: FormEvent) {
    e.preventDefault();

    const inputValidation = userSignUpSchema.safeParse(input);
    if (!inputValidation.success) {
      const fieldErrors = inputValidation.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<SignUpInputState>);
      return;
    }
    await signup(input);
    setErrors({});
  }

  async function googleAuthHandler() {
    if (!input.contact) {
      toast.error("Contact number required for Google SignUp.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const googleInput = {
        fullName: result.user.displayName!,
        email: result.user.email!,
        contact: input.contact,
        role: input.role,
      } as GoogleSignUpInputState;

      const inputValidation = googleSignUpSchema.safeParse(googleInput);
      if (!inputValidation.success) {
        const fieldErrors = inputValidation.error.formErrors.fieldErrors;
        setErrors(fieldErrors as Partial<SignUpInputState>);
        return;
      }
      await googleSignup(googleInput);

      setErrors({});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 dark:bg-input/110 min-h-screen pt-10">
      <div className="pb-10 px-5 w-[min(100%,850px)]">
        <h1 className="title-font font-bold text-center text-2xl">
          Bite Buddy
        </h1>
        
        <form className="w-full mb-8" onSubmit={submitHandler}>
          {/* Role Selection */}
          <div className="my-8">
            <Label className="text-gray-500 block mb-3 text-center">
              I want to sign up as
            </Label>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => roleChangeHandler("Customer")}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                  input.role === "Customer"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : "border-gray-300 hover:border-orange-300"
                }`}
              >
                <UserCircle
                  className={`w-12 h-12 mb-2 ${
                    input.role === "Customer"
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    input.role === "Customer"
                      ? "text-orange-500"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Customer
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  Order food & enjoy
                </span>
              </button>

              <button
                type="button"
                onClick={() => roleChangeHandler("Applicant")}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
                  input.role === "Applicant"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                    : "border-gray-300 hover:border-orange-300"
                }`}
              >
                <Briefcase
                  className={`w-12 h-12 mb-2 ${
                    input.role === "Applicant"
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    input.role === "Applicant"
                      ? "text-orange-500"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Applicant
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">
                  Join as restaurant / delivery partner
                </span>
              </button>
            </div>
            {errors.role && (
              <span className="text-sm text-red-500 block text-center mt-2">
                {errors.role}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 my-10 gap-7 md:gap-10">
            <div className="relative">
              <Label className="text-gray-500">Name</Label>
              <Input
                type="text"
                className="pl-10 my-1"
                name="fullName"
                value={input.fullName}
                onChange={inputChangeHandler}
                required
              />
              <User className="absolute top-9 left-2 text-gray-500 w-6 h-5"></User>
              {errors && (
                <span className="text-sm text-red-500">{errors.fullName}</span>
              )}
            </div>

            <div className="relative">
              <Label className="text-gray-500">Contact Number</Label>
              <Input
                type="tel"
                name="contact"
                placeholder="1234567890"
                pattern="[0-9]{10}"
                value={input.contact}
                onChange={inputChangeHandler}
                className="pl-10 my-1"
                required
              ></Input>
              <Phone className="absolute top-9 left-2 text-gray-500 w-6 h-5"></Phone>
              {errors && (
                <span className="text-sm text-red-500">{errors.contact}</span>
              )}
            </div>

            <div className="relative">
              <Label className="text-gray-500">Email</Label>
              <Input
                type="email"
                className="pl-10 my-1"
                name="email"
                placeholder="example@gmail.com"
                value={input.email}
                onChange={inputChangeHandler}
                required
              />
              <Mail className="absolute top-9 left-2 text-gray-500 w-6 h-5"></Mail>
              {errors && (
                <span className="text-sm text-red-500">{errors.email}</span>
              )}
            </div>

            <div className="relative">
              <Label className="text-gray-500">Password</Label>
              <Input
                type="password"
                placeholder="Contains at least 6 characters"
                className="pl-10 my-1"
                name="password"
                value={input.password}
                onChange={inputChangeHandler}
                required
              ></Input>
              <LockKeyhole className="absolute top-9 left-2 text-gray-500 w-6 h-5"></LockKeyhole>
              {errors && (
                <span className="text-sm text-red-500">{errors.password}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mt-14">
            {loading.signupBtn ? (
              <Button className="my-gradient-btn w-full max-w-100" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                <span>Please wait</span>
              </Button>
            ) : (
              <Button className="my-gradient-btn w-full max-w-100">
                SignUp
              </Button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-center">
          {loading.googleSignupBtn ? (
            <Button className="my-gradient-btn w-full max-w-100" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
              <span>Please wait</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="btn w-full max-w-100"
              onClick={googleAuthHandler}
              title="Contact number is required to continue with Google signup"
            >
              <FcGoogle className="mr-1"></FcGoogle>
              <span>SignUp with Google</span>
            </Button>
          )}
        </div>

        <p className="text-center mt-10">
          Already have an account?
          <Link to="/auth/login" className="text-blue-600">
            {" "}
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

/*
using required to prevent empty submissions 
using zod for validating submitted input
*/