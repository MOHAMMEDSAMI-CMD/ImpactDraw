import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { checkSession } = useApp();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId =
          searchParams.get("session_id");

        if (!sessionId) {
          setMessage(
            "Payment session not found."
          );
          setLoading(false);
          return;
        }

        const { data } = await api.get(
          `/subscriptions/verify?session_id=${sessionId}`
        );

        console.log(
          "PAYMENT VERIFY:",
          data
        );

        if (data.success) {
          setSuccess(true);

          setMessage(
            "Your subscription has been activated successfully."
          );

          await checkSession();

          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setMessage(
            data.message ||
              "Payment verification failed."
          );
        }
      } catch (error) {
        console.error(
          "Payment verification error:",
          error.response?.data || error
        );

        setMessage(
          error.response?.data?.message ||
            "Unable to verify payment."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, checkSession]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">

      <div className="text-center max-w-lg">

        {/* LOADING */}

        {loading && (
          <>
            <div className="w-14 h-14 mx-auto border-4 border-[#173f2b] border-t-transparent rounded-full animate-spin" />

            <h1 className="text-3xl font-black text-[#173f2b] mt-6">
              Verifying Payment...
            </h1>

            <p className="text-gray-500 mt-3">
              Please wait while we confirm your payment.
            </p>
          </>
        )}


        {/* SUCCESS */}

        {!loading && success && (
          <>
            <CheckCircle
              size={80}
              className="mx-auto text-green-600"
            />

            <h1 className="text-3xl font-black text-[#173f2b] mt-6">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mt-3">
              {message}
            </p>

            <p className="text-sm text-gray-400 mt-4">
              Redirecting to dashboard...
            </p>
          </>
        )}


        {/* ERROR */}

        {!loading && !success && (
          <>
            <XCircle
              size={80}
              className="mx-auto text-red-500"
            />

            <h1 className="text-3xl font-black text-red-600 mt-6">
              Payment Verification Failed
            </h1>

            <p className="text-gray-600 mt-3">
              {message}
            </p>

            <button
              onClick={() => navigate("/pricing")}
              className="mt-6 px-6 py-3 rounded-xl bg-[#173f2b] text-white font-bold"
            >
              Back to Pricing
            </button>
          </>
        )}

      </div>

    </div>
  );
};

export default PaymentSuccess;