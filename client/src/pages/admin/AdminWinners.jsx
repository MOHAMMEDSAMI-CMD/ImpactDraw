import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Wallet,
  Clock,
  Users,
  IndianRupee,
} from "lucide-react";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminWinners = () => {
  const [winners, setWinners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [verificationFilter, setVerificationFilter] =
    useState("all");

  const [payoutFilter, setPayoutFilter] =
    useState("all");

  // ==========================================
  // LOAD WINNERS
  // ==========================================

  const loadWinners = async () => {
    try {
      const { data } = await api.get(
        "/admin/winners"
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load winners"
        );
      }

      setWinners(data.winners || []);
    } catch (error) {
      console.error(
        "Load winners error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load winners"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWinners();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWinners();
  };

  // ==========================================
  // APPROVE WINNER
  // ==========================================

  const approveWinner = async (winnerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this winner?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(winnerId);

      const { data } = await api.patch(
        `/admin/winners/${winnerId}/approve`
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to approve winner"
        );
      }

      await loadWinners();

      alert(
        data.message ||
          "Winner approved successfully"
      );
    } catch (error) {
      console.error(
        "Approve winner error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to approve winner"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // REJECT WINNER
  // ==========================================

  const rejectWinner = async (winnerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this winner?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(winnerId);

      const { data } = await api.patch(
        `/admin/winners/${winnerId}/reject`
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to reject winner"
        );
      }

      await loadWinners();

      alert(
        data.message ||
          "Winner rejected successfully"
      );
    } catch (error) {
      console.error(
        "Reject winner error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to reject winner"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // MARK PAYOUT PAID
  // ==========================================

  const markAsPaid = async (winnerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this prize as paid?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(winnerId);

      const { data } = await api.patch(
        `/admin/winners/${winnerId}/pay`
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to process payout"
        );
      }

      await loadWinners();

      alert(
        data.message ||
          "Prize marked as paid successfully"
      );
    } catch (error) {
      console.error(
        "Payout error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to process payout"
      );
    } finally {
      setProcessingId(null);
    }
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
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FILTER WINNERS
  // ==========================================

  const filteredWinners = useMemo(() => {
    return winners.filter((winner) => {
      const verificationMatch =
        verificationFilter === "all" ||
        winner.verificationStatus ===
          verificationFilter;

      const payoutMatch =
        payoutFilter === "all" ||
        winner.payoutStatus === payoutFilter;

      return (
        verificationMatch &&
        payoutMatch
      );
    });
  }, [
    winners,
    verificationFilter,
    payoutFilter,
  ]);

  // ==========================================
  // STATS
  // ==========================================

  const totalPrize = winners.reduce(
    (sum, winner) =>
      sum + Number(winner.prize || 0),
    0
  );

  const paidPrize = winners
    .filter(
      (winner) =>
        winner.payoutStatus === "paid"
    )
    .reduce(
      (sum, winner) =>
        sum + Number(winner.prize || 0),
      0
    );

  const pendingPrize = winners
    .filter(
      (winner) =>
        winner.payoutStatus === "pending"
    )
    .reduce(
      (sum, winner) =>
        sum + Number(winner.prize || 0),
      0
    );

  const pendingVerification =
    winners.filter(
      (winner) =>
        winner.verificationStatus ===
        "pending"
    ).length;

  const approvedWinners =
    winners.filter(
      (winner) =>
        winner.verificationStatus ===
        "approved"
    ).length;

  const paidWinners =
    winners.filter(
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

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            ADMIN
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            Winners
          </h1>

          <p className="text-gray-500 mt-2">
            Verify winners and manage prize payouts.
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

      {/* =====================================
          STATS
      ===================================== */}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

        {/* TOTAL WINNERS */}

        <div className="card p-6">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Total Winners
              </p>

              <h2 className="text-3xl font-black text-[#173f2b] mt-2">
                {winners.length}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 grid place-items-center">
              <Trophy
                className="text-[#d89b28]"
                size={22}
              />
            </div>

          </div>

        </div>

        {/* TOTAL PRIZE */}

        <div className="card p-6">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Total Prize
              </p>

              <h2 className="text-3xl font-black text-[#173f2b] mt-2">
                {formatMoney(totalPrize)}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-yellow-50 grid place-items-center">
              <IndianRupee
                className="text-[#d89b28]"
                size={22}
              />
            </div>

          </div>

        </div>

        {/* PAID */}

        <div className="card p-6">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Paid Prize
              </p>

              <h2 className="text-3xl font-black text-green-700 mt-2">
                {formatMoney(paidPrize)}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 grid place-items-center">
              <CheckCircle
                className="text-green-600"
                size={22}
              />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-2">
            {paidWinners} paid
          </p>

        </div>

        {/* PENDING */}

        <div className="card p-6">

          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm text-gray-500">
                Pending Prize
              </p>

              <h2 className="text-3xl font-black text-orange-600 mt-2">
                {formatMoney(pendingPrize)}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-orange-50 grid place-items-center">
              <Clock
                className="text-orange-500"
                size={22}
              />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-2">
            {pendingVerification} pending verification
          </p>

        </div>

      </section>

      {/* =====================================
          FILTERS
      ===================================== */}

      <section className="card p-6 mt-8">

        <div className="flex flex-col md:flex-row gap-5">

          {/* VERIFICATION */}

          <div className="flex-1">

            <label className="text-sm font-bold text-gray-700">
              Verification Status
            </label>

            <select
              value={verificationFilter}
              onChange={(e) =>
                setVerificationFilter(
                  e.target.value
                )
              }
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#173f2b]"
            >
              <option value="all">
                All
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

          </div>

          {/* PAYOUT */}

          <div className="flex-1">

            <label className="text-sm font-bold text-gray-700">
              Payout Status
            </label>

            <select
              value={payoutFilter}
              onChange={(e) =>
                setPayoutFilter(
                  e.target.value
                )
              }
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#173f2b]"
            >
              <option value="all">
                All
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* =====================================
          WINNERS
      ===================================== */}

      <section className="mt-8">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-2xl font-black text-[#173f2b]">
              Winner Records
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredWinners.length} of{" "}
              {winners.length} winners
            </p>
          </div>

        </div>

        {filteredWinners.length === 0 ? (

          <div className="card p-10 text-center">

            <Trophy
              size={45}
              className="mx-auto text-gray-300"
            />

            <h3 className="text-xl font-bold text-gray-700 mt-4">
              No winners found
            </h3>

            <p className="text-gray-500 mt-2">
              There are no winners matching the
              selected filters.
            </p>

          </div>

        ) : (

          <div className="grid gap-6">

            {filteredWinners.map(
              (winner) => {

                const isProcessing =
                  processingId ===
                  winner._id;

                return (

                  <div
                    key={winner._id}
                    className="card p-6"
                  >

                    {/* HEADER */}

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-xl bg-green-50 grid place-items-center">

                          <Trophy
                            className="text-[#d89b28]"
                            size={26}
                          />

                        </div>

                        <div>

                          <h3 className="text-xl font-black text-[#173f2b]">
                            {winner.user?.name ||
                              "Unknown User"}
                          </h3>

                          <p className="text-sm text-gray-500">
                            {winner.user?.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                      {/* PRIZE */}

                      <div className="lg:text-right">

                        <p className="text-sm text-gray-500">
                          Prize
                        </p>

                        <p className="text-3xl font-black text-green-700">
                          {formatMoney(
                            winner.prize
                          )}
                        </p>

                      </div>

                    </div>

                    {/* DRAW INFO */}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Draw
                        </p>

                        <p className="font-bold text-[#173f2b] mt-1">
                          {winner.draw?.month}{" "}
                          {winner.draw?.year}
                        </p>

                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Match
                        </p>

                        <p className="font-bold text-[#173f2b] mt-1">
                          {winner.matchType ||
                            "—"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Created
                        </p>

                        <p className="font-bold text-[#173f2b] mt-1">
                          {formatDate(
                            winner.createdAt
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Proof
                        </p>

                        {winner.proofUrl ? (

                          <a
                            href={
                              winner.proofUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-600 mt-1 inline-block"
                          >
                            View Proof
                          </a>

                        ) : (

                          <p className="font-bold text-gray-500 mt-1">
                            No proof
                          </p>

                        )}

                      </div>

                    </div>

                    {/* NUMBERS */}

                    <div className="grid md:grid-cols-2 gap-6 mt-6">

                      {/* DRAW NUMBERS */}

                      <div>

                        <p className="font-bold text-[#173f2b]">
                          Winning Numbers
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {winner.draw?.numbers?.map(
                            (number) => (

                              <span
                                key={number}
                                className="w-10 h-10 rounded-full bg-[#173f2b] text-white grid place-items-center font-black"
                              >
                                {number}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                      {/* MATCHED NUMBERS */}

                      <div>

                        <p className="font-bold text-[#173f2b]">
                          Matched Numbers
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {winner.matchedNumbers?.length >
                          0 ? (

                            winner.matchedNumbers.map(
                              (number) => (

                                <span
                                  key={number}
                                  className="w-10 h-10 rounded-full bg-green-600 text-white grid place-items-center font-black"
                                >
                                  {number}
                                </span>

                              )
                            )

                          ) : (

                            <p className="text-gray-500 text-sm">
                              No matched numbers
                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="grid md:grid-cols-2 gap-4 mt-6">

                      {/* VERIFICATION */}

                      <div
                        className={`rounded-xl p-5 ${
                          winner.verificationStatus ===
                          "approved"
                            ? "bg-green-50"
                            : winner.verificationStatus ===
                              "rejected"
                            ? "bg-red-50"
                            : "bg-yellow-50"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          {winner.verificationStatus ===
                          "approved" ? (

                            <CheckCircle
                              className="text-green-600"
                            />

                          ) : winner.verificationStatus ===
                            "rejected" ? (

                            <XCircle
                              className="text-red-600"
                            />

                          ) : (

                            <Clock
                              className="text-yellow-600"
                            />

                          )}

                          <div>

                            <p className="text-sm text-gray-500">
                              Verification
                            </p>

                            <p className="font-black capitalize">
                              {
                                winner.verificationStatus
                              }
                            </p>

                          </div>

                        </div>

                        {winner.verifiedAt && (

                          <p className="text-xs text-gray-500 mt-3">
                            Verified on{" "}
                            {formatDate(
                              winner.verifiedAt
                            )}
                          </p>

                        )}

                      </div>

                      {/* PAYOUT */}

                      <div
                        className={`rounded-xl p-5 ${
                          winner.payoutStatus ===
                          "paid"
                            ? "bg-green-50"
                            : "bg-orange-50"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <Wallet
                            className={
                              winner.payoutStatus ===
                              "paid"
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          />

                          <div>

                            <p className="text-sm text-gray-500">
                              Payout
                            </p>

                            <p className="font-black capitalize">
                              {
                                winner.payoutStatus
                              }
                            </p>

                          </div>

                        </div>

                        {winner.paidAt && (

                          <p className="text-xs text-gray-500 mt-3">
                            Paid on{" "}
                            {formatDate(
                              winner.paidAt
                            )}
                          </p>

                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 pt-6 border-t">

                      <div className="flex flex-wrap gap-3">

                        {/* APPROVE */}

                        {winner.verificationStatus !==
                          "approved" &&
                          winner.verificationStatus !==
                            "rejected" && (

                            <button
                              onClick={() =>
                                approveWinner(
                                  winner._id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold inline-flex items-center gap-2 disabled:opacity-50"
                            >

                              <CheckCircle
                                size={17}
                              />

                              {isProcessing
                                ? "Processing..."
                                : "Approve"}

                            </button>

                          )}

                        {/* REJECT */}

                        {winner.verificationStatus !==
                          "rejected" &&
                          winner.payoutStatus !==
                            "paid" && (

                            <button
                              onClick={() =>
                                rejectWinner(
                                  winner._id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold inline-flex items-center gap-2 disabled:opacity-50"
                            >

                              <XCircle
                                size={17}
                              />

                              Reject

                            </button>

                          )}

                        {/* PAY */}

                        {winner.verificationStatus ===
                          "approved" &&
                          winner.payoutStatus ===
                            "pending" && (

                            <button
                              onClick={() =>
                                markAsPaid(
                                  winner._id
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              className="px-5 py-3 rounded-xl bg-[#173f2b] text-white font-bold inline-flex items-center gap-2 disabled:opacity-50"
                            >

                              <Wallet
                                size={17}
                              />

                              {isProcessing
                                ? "Processing..."
                                : "Mark as Paid"}

                            </button>

                          )}

                        {/* PAID */}

                        {winner.payoutStatus ===
                          "paid" && (

                          <span className="px-5 py-3 rounded-xl bg-green-50 text-green-700 font-bold inline-flex items-center gap-2">

                            <CheckCircle
                              size={17}
                            />

                            Prize Paid

                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
};

export default AdminWinners;