import { Loader2 } from "lucide-react";
import React, { ChangeEvent, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DialogContent, Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type InputOtpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) =>Promise<boolean>;
  loading: boolean;
  title: string;
  description: string;
};

const InputOtpDialog = ({
  open,
  onOpenChange,
  onVerify,
  loading,
  title,
  description,
}: InputOtpDialogProps) => {
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // Reset OTP when dialog opens
  useEffect(() => {
    if (open) {
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      // Focus first input after dialog opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [open, OTP_LENGTH]);

  const validateInput = useCallback((value: string): boolean => {
    return /^[0-9]$/.test(value) || value === "";
  }, []);

  const inputChangeHandler = useCallback((value: string, idx: number) => {
    // Clear any previous errors
    setError("");

    // Only allow single digits or empty string
    const sanitizedValue = value.slice(-1); // Take only the last character
    
    if (!validateInput(sanitizedValue)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[idx] = sanitizedValue;
    setOtp(newOtp);

    // Auto-focus next input if current input has value and not last input
    if (sanitizedValue && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, [otp, validateInput, OTP_LENGTH]);

  const keyDownHandler = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    // Handle backspace - move to previous input if current is empty
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
        // Also clear the previous input
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
      }
      setError(""); // Clear errors on backspace
    }
    
    // Handle left/right arrow keys for navigation
    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputRefs.current[idx - 1]?.focus();
    }
    
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }

    // Handle Delete key
    if (e.key === "Delete") {
      const newOtp = [...otp];
      newOtp[idx] = "";
      setOtp(newOtp);
      setError("");
    }

    // Handle Enter key to submit if OTP is complete
    if (e.key === "Enter") {
      e.preventDefault();
      const otpValue = otp.join("");
      if (otpValue.length === OTP_LENGTH) {
        submitHandler();
      }
    }
  }, [otp, OTP_LENGTH]);

  const otpPasteHandler = useCallback(async (e: React.ClipboardEvent) => {
    e.preventDefault();
    setError("");

    try {
      const textPasted = await navigator.clipboard.readText();
      
      // Sanitize pasted content - only allow numbers
      const numbersOnly = textPasted.replace(/\D/g, '');
      
      if (numbersOnly.length === OTP_LENGTH) {
        const newOtp = numbersOnly.split("");
        setOtp(newOtp);
        // Focus last input after paste
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      } else if (numbersOnly.length > 0) {
        // If pasted content is shorter, fill from current position
        const newOtp = [...otp];
        const pasteLength = Math.min(numbersOnly.length, OTP_LENGTH);
        
        for (let i = 0; i < pasteLength; i++) {
          newOtp[i] = numbersOnly[i];
        }
        setOtp(newOtp);
        
        // Focus next empty input or last input
        const nextEmptyIndex = newOtp.findIndex(digit => digit === "");
        const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : OTP_LENGTH - 1;
        inputRefs.current[focusIndex]?.focus();
      }
    } catch (err) {
      // Clipboard access might fail in some browsers/contexts
      console.warn("Failed to read clipboard:", err);
    }
  }, [otp, OTP_LENGTH]);

  const submitHandler = useCallback(async () => {
    setError("");

    const verificationToken = otp.join("");
    
    // Validate OTP is complete
    if (verificationToken.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    // Validate OTP contains only numbers
    if (!/^\d+$/.test(verificationToken)) {
      setError("OTP must contain only numbers");
      return;
    }

    const isSuccess = await onVerify(verificationToken);
    if(isSuccess){
      onOpenChange(false)
    }
    setOtp(Array(OTP_LENGTH).fill(""));

  }, [otp, onVerify, OTP_LENGTH]);

  
  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when input is focused for better UX
    e.target.select();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby={error ? "otp-error" : undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div>
          <div className="flex justify-center items-center gap-2 md:gap-3 my-6">
            {otp.map((digit: string, idx: number) => (
              <Input
                key={`otp-${idx}`}
                className={`sm:w-12 sm:h-12 text-center font-semibold text-lg border-2 transition-colors ${
                  error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                value={digit}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  inputChangeHandler(e.target.value, idx)
                }
                onKeyDown={(e) => keyDownHandler(e, idx)}
                onPaste={otpPasteHandler}
                onFocus={handleInputFocus}
                maxLength={1}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                aria-invalid={error ? 'true' : 'false'}
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <div 
              id="otp-error" 
              className="text-red-500 text-sm text-center mb-4"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            {loading ? (
              <Button 
                className="w-full my-gradient-btn" 
                disabled
                aria-describedby="loading-text"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span id="loading-text">Please wait</span>
              </Button>
            ) : (
              <Button 
                onClick={submitHandler}
                className="w-full my-gradient-btn"
                disabled={otp.join("").length !== OTP_LENGTH}
              >
                Verify OTP
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InputOtpDialog;