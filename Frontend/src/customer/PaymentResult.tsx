import { InvalidAccess } from "@/components/shared/utilityComponents";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const result = searchParams.get("result");
  const isSuccess = result === "success" || false;
  const paymentId = searchParams.get("paymentId");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  const { clearCart } = useCartStore();

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess]);

  if (!paymentId && !amount) {
    return <InvalidAccess />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-input/110 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-lg w-full border dark:border-gray-700">
        <div className="flex flex-col items-center">
          {isSuccess ? (
            <CheckCircle className="text-green-500 w-16 h-16" />
          ) : (
            <XCircle className="text-red-500 w-16 h-16" />
          )}

          <h2
            className={`text-xl sm:text-2xl font-semibold mt-4 ${
              isSuccess ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {isSuccess ? "Payment Successful" : "Payment Failed"}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mt-2 text-center text-sm sm:text-base">
            {isSuccess
              ? "Thank you! Your payment was processed successfully."
              : "Sorry, there was an issue with your payment."}
          </p>

          <div className="w-full my-10 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-medium">Payment ID:</span>
              <span>{paymentId ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span>₹{amount}</span>
            </div>
          </div>

          <Button
            onClick={() =>
              (window.location.href = isSuccess
                ? "/orders/active"
                : `shipping?orderId=${orderId}&retry=true`)
            }
            className={`w-full text-white ${
              isSuccess
                ? "bg-green-700 hover:bg-green-600"
                : "bg-red-700 hover:bg-red-600"
            }`}
          >
            {isSuccess ? "Track your order" : "Try Again"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
