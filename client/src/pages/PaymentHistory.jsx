import { useEffect, useState } from "react";
import { CheckCircle, CreditCard } from "lucide-react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const PaymentHistory = () => {
  const { user, loadingUser } = useApp();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loadingUser) return;

    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const loadPaymentHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          "/subscriptions/history"
        );

        if (data.success) {
          setPayments(data.payments || []);
        } else {
          setError(
            data.message ||
              "Failed to load payment history"
          );
        }
      } catch (error) {
        console.error(
          "Payment history error:",
          error.response?.data || error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load payment history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaymentHistory();
  }, [user, loadingUser]);

  if (loadingUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading payment history...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Please login to view payment history.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] flex items-center justify-center">
              <CreditCard
                size={24}
                className="text-[#173f2b]"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Payment History
              </h1>

              <p className="text-gray-500 mt-1">
                View your subscription payments
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {/* PAYMENT LIST */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Subscription Payments
          </h2>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard
                size={48}
                className="mx-auto text-gray-300"
              />

              <p className="text-gray-500 mt-4">
                No subscription payments yet.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Your successful payments will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {payments.map((payment) => {

                const isYearly =
                  payment.plan === "yearly";

                const displayAmount =
                  payment.amount ||
                  (isYearly ? 9999 : 999);

                const displayPlan =
                  isYearly
                    ? "Yearly"
                    : "Monthly";

                const formattedDate =
                  payment.paidAt ||
                  payment.createdAt
                    ? new Date(
                        payment.paidAt ||
                          payment.createdAt
                      ).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date unavailable";

                return (
                  <div
                    key={payment._id}
                    className="border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >

                    {/* LEFT */}
                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                        <CheckCircle
                          size={22}
                          className="text-green-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          {displayPlan} Subscription
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {formattedDate}
                        </p>

                        {payment.stripeSessionId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Payment ID:{" "}
                            {payment.stripeSessionId}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-between md:justify-end gap-5">

                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#173f2b]">
                          ₹{displayAmount.toLocaleString("en-IN")}
                        </p>

                        <p className="text-xs text-gray-500">
                          {isYearly
                            ? "₹9,999 / year"
                            : "₹999 / month"}
                        </p>
                      </div>

                      <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                        {payment.status === "paid"
                          ? "Paid"
                          : payment.status || "Paid"}
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PaymentHistory;