import { useEffect, useState } from "react";
import {
  Trophy,
  IndianRupee,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import Loading from "../components/Loading";

const MyWinnings = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // LOAD WINNINGS
  // ==========================================

  const loadWinnings = async () => {
    try {
      const { data } = await api.get("/user/winners");

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load winnings"
        );
      }

      setWinners(data.winners || []);
    } catch (error) {
      console.error("My winnings error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load winnings"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadWinnings();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWinnings();
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount = 0) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // ==========================================
  // MATCH LABEL
  // ==========================================

  const getMatchLabel = (matchType) => {
    if (matchType === "5-number") {
      return "5 Numbers";
    }

    if (matchType === "4-number") {
      return "4 Numbers";
    }

    if (matchType === "3-number") {
      return "3 Numbers";
    }

    return matchType || "Winner";
  };

  // ==========================================
  // VERIFICATION BADGE
  // ==========================================

  const getVerificationBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
          <CheckCircle size={15} />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold">
          <XCircle size={15} />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
        <Clock size={15} />
        Pending
      </span>
    );
  };

  // ==========================================
  // PAYOUT BADGE
  // ==========================================

  const getPayoutBadge = (status) => {
    if (status === "paid") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
          <CheckCircle size={15} />
          Paid
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
        <Wallet size={15} />
        Pending
      </span>
    );
  };

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalPrize = winners.reduce(
    (total, winner) =>
      total + Number(winner.prize || 0),
    0
  );

  const paidPrize = winners
    .filter(
      (winner) =>
        winner.payoutStatus === "paid"
    )
    .reduce(
      (total, winner) =>
        total + Number(winner.prize || 0),
      0
    );

  const pendingPrize = winners
    .filter(
      (winner) =>
        winner.payoutStatus !== "paid"
    )
    .reduce(
      (total, winner) =>
        total + Number(winner.prize || 0),
      0
    );

  const paidCount = winners.filter(
    (winner) =>
      winner.payoutStatus === "paid"
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loading />;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="container-main py-10">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            REWARDS
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            My Winnings
          </h1>

          <p className="text-gray-500 mt-2">
            Your monthly draw rewards and payout history.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-5 py-3 rounded-xl bg-gray-100 font-bold inline-flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ======================================
          SUMMARY
      ====================================== */}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

        {/* TOTAL WINS */}

        <div className="card p-6">

          <Trophy
            size={26}
            className="text-[#d89b28]"
          />

          <p className="text-sm text-gray-500 mt-5">
            Total Wins
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {winners.length}
          </h3>

        </div>

        {/* TOTAL PRIZE */}

        <div className="card p-6">

          <IndianRupee
            size={26}
            className="text-[#d89b28]"
          />

          <p className="text-sm text-gray-500 mt-5">
            Total Prize
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {formatMoney(totalPrize)}
          </h3>

        </div>

        {/* PAID */}

        <div className="card p-6">

          <CheckCircle
            size={26}
            className="text-green-600"
          />

          <p className="text-sm text-gray-500 mt-5">
            Paid Prize
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {formatMoney(paidPrize)}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {paidCount} paid
          </p>

        </div>

        {/* PENDING */}

        <div className="card p-6">

          <Wallet
            size={26}
            className="text-yellow-600"
          />

          <p className="text-sm text-gray-500 mt-5">
            Pending Prize
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {formatMoney(pendingPrize)}
          </h3>

        </div>

      </section>

      {/* ======================================
          EMPTY
      ====================================== */}

      {winners.length === 0 && (

        <section className="mt-8">

          <div className="card p-10 text-center">

            <div className="w-16 h-16 rounded-full bg-[#e9f1eb] text-[#173f2b] grid place-items-center mx-auto">

              <Trophy size={30} />

            </div>

            <h2 className="text-2xl font-black text-[#173f2b] mt-5">
              No winnings yet
            </h2>

            <p className="text-gray-500 mt-2">
              Participate in monthly draws to win rewards.
            </p>

          </div>

        </section>

      )}

      {/* ======================================
          WINNERS
      ====================================== */}

      {winners.length > 0 && (

        <section className="mt-8">

          <div className="space-y-6">

            {winners.map((winner) => {

              const matchedNumbers =
                winner.matchedNumbers || [];

              const winningNumbers =
                winner.draw?.numbers ||
                winner.numbers ||
                [];

              return (

                <div
                  key={winner._id}
                  className="card p-6"
                >

                  {/* HEADER */}

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center shrink-0">

                        <Trophy size={23} />

                      </div>

                      <div>

                        <h2 className="text-xl font-black text-[#173f2b]">

                          {getMatchLabel(
                            winner.matchType
                          )}

                        </h2>

                        <p className="text-sm text-gray-500 mt-1">

                          {winner.draw?.month ||
                            "Unknown"}{" "}

                          {winner.draw?.year ||
                            ""}

                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {getVerificationBadge(
                            winner.verificationStatus
                          )}

                          {getPayoutBadge(
                            winner.payoutStatus
                          )}

                        </div>

                      </div>

                    </div>

                    {/* PRIZE */}

                    <div className="lg:text-right">

                      <p className="text-sm text-gray-500">
                        Prize
                      </p>

                      <p className="text-3xl font-black text-[#173f2b] mt-1">
                        {formatMoney(
                          winner.prize
                        )}
                      </p>

                    </div>

                  </div>

                  {/* =================================
                      DRAW DETAILS
                  ================================= */}

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Draw
                      </p>

                      <p className="font-black text-[#173f2b] mt-1">

                        {winner.draw?.month ||
                          "Unknown"}{" "}

                        {winner.draw?.year ||
                          ""}

                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Match
                      </p>

                      <p className="font-black text-[#173f2b] mt-1">
                        {getMatchLabel(
                          winner.matchType
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Verification
                      </p>

                      <div className="mt-2">

                        {getVerificationBadge(
                          winner.verificationStatus
                        )}

                      </div>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Payout
                      </p>

                      <div className="mt-2">

                        {getPayoutBadge(
                          winner.payoutStatus
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =================================
                      WINNING NUMBERS
                  ================================= */}

                  <div className="mt-7">

                    <p className="text-sm font-bold text-[#173f2b] mb-3">
                      Winning Numbers
                    </p>

                    <div className="flex flex-wrap gap-3">

                      {winningNumbers.map(
                        (number, index) => {

                          const matched =
                            matchedNumbers.includes(
                              number
                            );

                          return (

                            <span
                              key={`${number}-${index}`}
                              className={`w-11 h-11 rounded-full grid place-items-center font-black ${
                                matched
                                  ? "bg-[#173f2b] text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {number}
                            </span>

                          );

                        }
                      )}

                    </div>

                  </div>

                  {/* =================================
                      MATCHED NUMBERS
                  ================================= */}

                  <div className="mt-6">

                    <p className="text-sm font-bold text-[#173f2b] mb-3">
                      Your Matched Numbers
                    </p>

                    <div className="flex flex-wrap gap-3">

                      {matchedNumbers.length > 0 ? (

                        matchedNumbers.map(
                          (number, index) => (

                            <span
                              key={`${number}-${index}`}
                              className="w-11 h-11 rounded-full bg-green-600 text-white grid place-items-center font-black"
                            >
                              {number}
                            </span>

                          )
                        )

                      ) : (

                        <p className="text-sm text-gray-500">
                          No matched numbers.
                        </p>

                      )}

                    </div>

                  </div>

                  {/* =================================
                      DATES
                  ================================= */}

                  <div className="flex flex-wrap gap-5 mt-6 text-xs text-gray-500">

                    {winner.verifiedAt && (

                      <span>
                        Verified:{" "}
                        {new Date(
                          winner.verifiedAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>

                    )}

                    {winner.paidAt && (

                      <span>
                        Paid:{" "}
                        {new Date(
                          winner.paidAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>

                    )}

                    {winner.createdAt && (

                      <span>
                        Won:{" "}
                        {new Date(
                          winner.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>

                    )}

                  </div>

                  {/* =================================
                      PAID MESSAGE
                  ================================= */}

                  {winner.payoutStatus ===
                    "paid" && (

                    <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-4 flex items-center gap-3">

                      <CheckCircle
                        className="text-green-600 shrink-0"
                        size={22}
                      />

                      <div>

                        <p className="font-bold text-green-800">
                          Prize Paid Successfully
                        </p>

                        <p className="text-sm text-green-700 mt-1">
                          Your prize of{" "}
                          {formatMoney(
                            winner.prize
                          )}{" "}
                          has been marked as paid.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        </section>

      )}

    </div>
  );
};

export default MyWinnings;