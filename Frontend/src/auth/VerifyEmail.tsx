import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";


// not using this component for now, will use it in future when attach mailtrap

const OTP_LENGTH = 6;

const VerifyEmail = () => {
    
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  let loading = false

  const inputRefs = useRef<any[]>([]);

  function inputChangeHandler(value: string, idx: number) {
    if (/^[a-zA-Z0-9]$/.test(value) || value === "") {
      let newOpt = [...otp];
      newOpt[idx] = value;
      setOtp(newOpt);
    }

    if (value !== "" && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1].focus();
    }
  }

  function keyDownHandler(
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) {
    if (idx > 0 && e.key === "Backspace" && !otp[idx]) {
      inputRefs.current[idx - 1].focus();
    }
  }

  async function otpPasteHandler() {
    const textPasted = await navigator.clipboard.readText();

    if (textPasted.length === OTP_LENGTH) {
      setOtp(textPasted.split(""));
      inputRefs.current[OTP_LENGTH - 1].focus();
    }
  }

  async function submitHandler(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    // const verificationToken = otp.join("");
  }

  return (
    <div className="flex bg-gray-50 dark:bg-input/110 h-screen justify-center pt-30">
      <form className="px-2 w-[min(100%,500px)]" onSubmit={submitHandler}>
        <div>
          <h1 className="title-font font-bold text-center text-2xl my-8">
            Verify your email
          </h1>
          <p className="text-center text-gray-600 ">
            Enter the 6 digit code sent to your email address
          </p>
        </div>

        <div className="flex justify-center items-center gap-3 md:gap-5 my-10 ">
          {otp.map((digit: string, idx: number) => (
            <Input
              className="py-5 text-center font-semibold "
              type="text"
              key={idx+digit}
              value={digit}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                inputChangeHandler(e.target.value, idx)
              }
              onKeyDown={(e) => keyDownHandler(e, idx)}
              onPaste={otpPasteHandler}
              maxLength={1}
            />
          ))}
        </div>

        {loading ? (
          <Button className="my-gradient-btn w-full my-5" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
            <span>Please wait</span>
          </Button>
        ) : (
          <Button className="my-gradient-btn w-full my-5">Verify Otp</Button>
        )}
      </form>
    </div>
  );
};

export default VerifyEmail;
