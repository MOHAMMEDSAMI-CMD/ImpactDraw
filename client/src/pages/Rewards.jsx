import { useEffect, useState } from "react";
import { CheckCircle, Clock, Trophy, Wallet } from "lucide-react";
import api from "../services/api";

const Rewards = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD MY WINNINGS
  // ==========================================

  const loadWinnings = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        "/draws/my-winners"
      );

      console.log("MY WINNERS:", data);

      if (data.success) {
        setWinners(data.winners || []);
      } else {
        setWinners([]);
        setError(
          data.message || "Unable to load winnings."
        );
      }
    } catch (error) {
      console.error(
        "Rewards error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load your winnings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWinnings();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-black text-[#173f2b]">
            Loading rewards...
          </div>

          <p className="text-gray-500 mt-2">
            Checking your draw winnings.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-main py-10">

        {/* HEADER */}

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            REWARDS
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            My Winnings
          </h1>

          <p className="text-gray-600 mt-2">
            Your monthly draw rewards and payout
            history.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* NO WINNINGS */}

        {!error && winners.length === 0 && (
          <div className="mt-10 bg-white border rounded-2xl p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-[#e9f1eb] grid place-items-center">
              <Trophy
                size={30}
                className="text-[#d89b28]"
              />
            </div>

            <h2 className="text-2xl font-black text-[#173f2b] mt-5">
              No winnings yet
            </h2>

            <p className="text-gray-500 mt-2">
              Participate in monthly draws to win
              rewards.
            </p>

          </div>
        )}

        {/* WINNERS */}

        {winners.length > 0 && (
          <div className="mt-8 space-y-6">

            {winners.map((winner) => {

              const draw = winner.draw;

              const numbers =
                winner.numbers || [];

              const matchedNumbers =
                winner.matchedNumbers || [];

              return (
                <div
                  key={winner._id}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >

                  {/* CARD HEADER */}

                  <div className="p-6 border-b">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-xl bg-[#173f2b] grid place-items-center">
                          <Trophy
                            size={24}
                            className="text-[#d89b28]"
                          />
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Draw
                          </p>

                          <h2 className="text-2xl font-black text-[#173f2b]">
                            {draw?.month}{" "}
                            {draw?.year}
                          </h2>
                        </div>

                      </div>

                      {/* MATCH TYPE */}

                      <div className="px-4 py-2 rounded-full bg-[#e9f1eb] text-[#173f2b] font-bold text-sm">
                        {winner.matchType}
                      </div>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-6">

                    <div className="grid md:grid-cols-2 gap-6">

                      {/* NUMBERS */}

                      <div>

                        <p className="text-sm text-gray-500">
                          Your Numbers
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {numbers.length > 0 ? (
                            numbers.map(
                              (number) => (
                                <span
                                  key={number}
                                  className="w-10 h-10 rounded-full bg-[#173f2b] text-white grid place-items-center font-bold"
                                >
                                  {number}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-gray-500">
                              Numbers not available
                            </span>
                          )}

                        </div>

                      </div>

                      {/* MATCHED */}

                      <div>

                        <p className="text-sm text-gray-500">
                          Matched Numbers
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {matchedNumbers.length >
                          0 ? (
                            matchedNumbers.map(
                              (number) => (
                                <span
                                  key={number}
                                  className="w-10 h-10 rounded-full bg-[#d89b28] text-white grid place-items-center font-bold"
                                >
                                  {number}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-gray-500">
                              No matched numbers
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* PRIZE */}

                    <div className="mt-7 p-5 rounded-2xl bg-[#173f2b] text-white">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <Wallet
                            className="text-[#d89b28]"
                            size={24}
                          />

                          <div>
                            <p className="text-sm text-white/60">
                              Prize
                            </p>

                            <p className="text-3xl font-black">
                              ₹
                              {Number(
                                winner.prize || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="grid md:grid-cols-2 gap-4 mt-6">

                      {/* VERIFICATION */}

                      <div className="p-4 rounded-xl bg-gray-50 border">

                        <p className="text-sm text-gray-500">
                          Verification
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          {winner.verificationStatus ===
                          "approved" ? (
                            <CheckCircle
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <Clock
                              size={20}
                              className="text-yellow-600"
                            />
                          )}

                          <span
                            className={`font-bold capitalize ${
                              winner.verificationStatus ===
                              "approved"
                                ? "text-green-700"
                                : winner.verificationStatus ===
                                  "rejected"
                                ? "text-red-600"
                                : "text-yellow-700"
                            }`}
                          >
                            {
                              winner.verificationStatus
                            }
                          </span>

                        </div>

                      </div>

                      {/* PAYOUT */}

                      <div className="p-4 rounded-xl bg-gray-50 border">

                        <p className="text-sm text-gray-500">
                          Payout
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          {winner.payoutStatus ===
                          "paid" ? (
                            <CheckCircle
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <Clock
                              size={20}
                              className="text-yellow-600"
                            />
                          )}

                          <span
                            className={`font-bold capitalize ${
                              winner.payoutStatus ===
                              "paid"
                                ? "text-green-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {winner.payoutStatus}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default Rewards;