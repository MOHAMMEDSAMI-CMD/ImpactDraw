import { Check, Heart, Trophy, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const Pricing = () => {
  const { user } = useApp();

  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "₹999",
      period: "/month",
      description: "Flexible monthly membership.",
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "₹9,999",
      period: "/year",
      description: "Best value for committed members.",
      popular: true,
    },
  ];

  const features = [
    "Monthly draw participation",
    "Latest 5 Stableford scores",
    "Choose your charity",
    "Minimum 10% charity contribution",
    "Access to draw history",
    "Winner verification support",
  ];

  // ==========================================
  // STRIPE CHECKOUT
  // ==========================================

  const selectPlan = async (plan) => {
    // User login check
    if (!user) {
      navigate("/login", {
        state: {
          from: "/pricing",
        },
      });

      return;
    }

    try {
      setLoadingPlan(plan);
      setError("");

      // Create Stripe Checkout Session
      const { data } = await api.post(
        "/subscriptions/create-checkout-session",
        {
          plan,
        }
      );

      console.log("STRIPE CHECKOUT:", data);

      if (data.success && data.url) {
        // Redirect user to Stripe Checkout
        window.location.href = data.url;

        return;
      }

      setError(
        data.message ||
          "Unable to create Stripe checkout session."
      );
    } catch (error) {
      console.error(
        "Stripe checkout error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to start payment. Please try again."
      );
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <div className="container-main py-14">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="text-center max-w-2xl mx-auto">

        <p className="text-[#d89b28] font-bold text-sm">
          MEMBERSHIP
        </p>

        <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
          Choose your way to make an impact.
        </h1>

        <p className="text-lg text-gray-600 mt-4">
          One membership connects your game,
          rewards and charitable contribution.
        </p>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="max-w-2xl mx-auto mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-center">
          {error}
        </div>
      )}


      {/* ==========================================
          PRICING CARDS
      ========================================== */}

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-12">

        {plans.map((plan) => (

          <div
            key={plan.id}
            className={`card p-8 relative ${
              plan.popular
                ? "border-2 border-[#d89b28]"
                : ""
            }`}
          >

            {/* BEST VALUE */}

            {plan.popular && (
              <div className="absolute top-0 right-6 -translate-y-1/2 px-4 py-1 rounded-full bg-[#d89b28] text-white text-xs font-black">
                BEST VALUE
              </div>
            )}


            {/* PLAN HEADER */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] grid place-items-center text-[#173f2b]">

                {plan.id === "yearly" ? (
                  <Zap size={22} />
                ) : (
                  <Heart size={22} />
                )}

              </div>

              <h2 className="text-2xl font-black text-[#173f2b]">
                {plan.name}
              </h2>

            </div>


            {/* DESCRIPTION */}

            <p className="text-gray-500 mt-5">
              {plan.description}
            </p>


            {/* PRICE */}

            <div className="mt-7">

              <span className="text-5xl font-black text-[#173f2b]">
                {plan.price}
              </span>

              <span className="text-gray-500">
                {plan.period}
              </span>

            </div>


            {/* FEATURES */}

            <div className="mt-7 space-y-4">

              {features.map((feature) => (

                <div
                  key={feature}
                  className="flex gap-3 items-start"
                >

                  <div className="mt-0.5 text-[#173f2b]">
                    <Check size={18} />
                  </div>

                  <span className="text-gray-600">
                    {feature}
                  </span>

                </div>

              ))}

            </div>


            {/* PAYMENT BUTTON */}

            <button
              onClick={() => selectPlan(plan.id)}
              disabled={loadingPlan !== ""}
              className="btn-primary w-full mt-9 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loadingPlan === plan.id
                ? "Redirecting to payment..."
                : `Choose ${plan.name}`}

            </button>

          </div>

        ))}

      </div>


      {/* ==========================================
          PRIZE INFORMATION
      ========================================== */}

      <section className="max-w-5xl mx-auto mt-14">

        <div className="card p-8 bg-[#173f2b] text-white">

          <div className="flex items-center gap-3">

            <Trophy className="text-[#d89b28]" />

            <h2 className="text-2xl font-black">
              How the prize pool works
            </h2>

          </div>


          <div className="grid md:grid-cols-3 gap-4 mt-7">

            {/* 5 NUMBER */}

            <div className="bg-white/10 rounded-2xl p-5">

              <p className="text-3xl font-black">
                40%
              </p>

              <p className="text-white/70 mt-2">
                5-number jackpot
              </p>

            </div>


            {/* 4 NUMBER */}

            <div className="bg-white/10 rounded-2xl p-5">

              <p className="text-3xl font-black">
                35%
              </p>

              <p className="text-white/70 mt-2">
                4-number match
              </p>

            </div>


            {/* 3 NUMBER */}

            <div className="bg-white/10 rounded-2xl p-5">

              <p className="text-3xl font-black">
                25%
              </p>

              <p className="text-white/70 mt-2">
                3-number match
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Pricing;