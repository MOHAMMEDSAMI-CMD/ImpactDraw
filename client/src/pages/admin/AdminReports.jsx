import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  Heart,
  Trophy,
  IndianRupee,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // LOAD REPORTS
  // ==========================================

  const loadReports = async () => {
    try {
      const { data } = await api.get(
        "/admin/dashboard/reports"
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load reports"
        );
      }

      setReport(data);
    } catch (error) {
      console.error(
        "Reports error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
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
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loading />;
  }

  // ==========================================
  // SAFE DATA
  // ==========================================

  const users = report?.users || {};
  const charities = report?.charities || {};
  const draws = report?.draws || {};
  const winners = report?.winners || {};
  const prizes = report?.prizes || {};
  const matchSummary =
    report?.matchSummary || {};

  const recentDraws =
    report?.recentDraws || [];

  const recentWinners =
    report?.recentWinners || [];

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
            Reports
          </h1>

          <p className="text-gray-500 mt-2">
            Review platform activity, draw performance
            and prize statistics.
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
          PLATFORM OVERVIEW
      ===================================== */}

      <section className="mt-10">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#d89b28]">
              PLATFORM OVERVIEW
            </p>

            <h2 className="text-2xl font-black text-[#173f2b]">
              Platform Statistics
            </h2>
          </div>

        </div>


        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">


          {/* USERS */}

          <div className="card p-6">

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
                <Users size={22} />
              </div>

              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {users.active || 0} active
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-5">
              Total Users
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {users.total || 0}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              {users.activeSubscribers || 0} active subscribers
            </p>

          </div>


          {/* CHARITIES */}

          <div className="card p-6">

            <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 grid place-items-center">
              <Heart size={22} />
            </div>

            <p className="text-gray-500 text-sm mt-5">
              Charities
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {charities.total || 0}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Charity organizations
            </p>

          </div>


          {/* DRAWS */}

          <div className="card p-6">

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 grid place-items-center">
                <Trophy size={22} />
              </div>

              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {draws.published || 0} published
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-5">
              Total Draws
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {draws.total || 0}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Published monthly draws
            </p>

          </div>


          {/* WINNERS */}

          <div className="card p-6">

            <div className="flex justify-between items-start">

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 grid place-items-center">
                <Target size={22} />
              </div>

              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                {winners.paid || 0} paid
              </span>

            </div>

            <p className="text-gray-500 text-sm mt-5">
              Total Winners
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {winners.total || 0}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              {winners.pendingVerification || 0} pending verification
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          FINANCIAL REPORT
      ===================================== */}

      <section className="mt-10">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
            <IndianRupee size={21} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#d89b28]">
              FINANCIAL REPORT
            </p>

            <h2 className="text-2xl font-black text-[#173f2b]">
              Prize Statistics
            </h2>
          </div>

        </div>


        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">


          {/* PRIZE POOL */}

          <div className="card p-6">

            <IndianRupee
              className="text-[#d89b28]"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Total Prize Pool
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {formatMoney(
                draws.totalPrizePool
              )}
            </h3>

          </div>


          {/* JACKPOT */}

          <div className="card p-6">

            <Trophy
              className="text-[#d89b28]"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Total Jackpot
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {formatMoney(
                draws.totalJackpot
              )}
            </h3>

          </div>


          {/* PAID */}

          <div className="card p-6">

            <CheckCircle
              className="text-green-600"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Paid Prizes
            </p>

            <h3 className="text-3xl font-black text-green-700 mt-1">
              {formatMoney(
                prizes.paid
              )}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Successfully paid
            </p>

          </div>


          {/* PENDING */}

          <div className="card p-6">

            <Clock
              className="text-yellow-600"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Pending Prizes
            </p>

            <h3 className="text-3xl font-black text-yellow-700 mt-1">
              {formatMoney(
                prizes.pending
              )}
            </h3>

            <p className="text-xs text-gray-400 mt-2">
              Awaiting payout
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          MATCH SUMMARY
      ===================================== */}

      <section className="mt-10">

        <div className="card p-7">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 grid place-items-center">
              <Trophy size={21} />
            </div>

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                MATCH SUMMARY
              </p>

              <h2 className="text-2xl font-black text-[#173f2b]">
                Winner Distribution
              </h2>

            </div>

          </div>


          <div className="grid md:grid-cols-3 gap-5 mt-7">


            {/* 5 */}

            <div className="rounded-2xl border p-6">

              <div className="flex justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    5 Numbers
                  </p>

                  <h3 className="text-3xl font-black text-[#173f2b] mt-1">
                    {matchSummary.fiveNumber?.count || 0}
                  </h3>
                </div>

                <Trophy
                  className="text-[#d89b28]"
                  size={25}
                />

              </div>

              <div className="mt-5 pt-4 border-t">

                <p className="text-sm text-gray-500">
                  Total Prize
                </p>

                <p className="text-xl font-black text-green-700 mt-1">
                  {formatMoney(
                    matchSummary.fiveNumber?.prize
                  )}
                </p>

              </div>

            </div>


            {/* 4 */}

            <div className="rounded-2xl border p-6">

              <div className="flex justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    4 Numbers
                  </p>

                  <h3 className="text-3xl font-black text-[#173f2b] mt-1">
                    {matchSummary.fourNumber?.count || 0}
                  </h3>
                </div>

                <Target
                  className="text-blue-600"
                  size={25}
                />

              </div>

              <div className="mt-5 pt-4 border-t">

                <p className="text-sm text-gray-500">
                  Total Prize
                </p>

                <p className="text-xl font-black text-green-700 mt-1">
                  {formatMoney(
                    matchSummary.fourNumber?.prize
                  )}
                </p>

              </div>

            </div>


            {/* 3 */}

            <div className="rounded-2xl border p-6">

              <div className="flex justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    3 Numbers
                  </p>

                  <h3 className="text-3xl font-black text-[#173f2b] mt-1">
                    {matchSummary.threeNumber?.count || 0}
                  </h3>
                </div>

                <CheckCircle
                  className="text-green-600"
                  size={25}
                />

              </div>

              <div className="mt-5 pt-4 border-t">

                <p className="text-sm text-gray-500">
                  Total Prize
                </p>

                <p className="text-xl font-black text-green-700 mt-1">
                  {formatMoney(
                    matchSummary.threeNumber?.prize
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          RECENT DRAWS
      ===================================== */}

      <section className="mt-10">

        <div className="card p-7">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                DRAW ACTIVITY
              </p>

              <h2 className="text-2xl font-black text-[#173f2b] mt-1">
                Recent Draws
              </h2>

            </div>

            <Trophy
              className="text-[#d89b28]"
              size={25}
            />

          </div>


          {recentDraws.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No draws available.
            </div>

          ) : (

            <div className="mt-6 overflow-x-auto">

              <table className="w-full text-left">

                <thead>

                  <tr className="border-b">

                    <th className="py-4 pr-4 text-sm text-gray-500">
                      Draw
                    </th>

                    <th className="py-4 pr-4 text-sm text-gray-500">
                      Numbers
                    </th>

                    <th className="py-4 pr-4 text-sm text-gray-500">
                      Subscribers
                    </th>

                    <th className="py-4 pr-4 text-sm text-gray-500">
                      Prize Pool
                    </th>

                    <th className="py-4 pr-4 text-sm text-gray-500">
                      Status
                    </th>

                    <th className="py-4 text-sm text-gray-500">
                      Published
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentDraws.map(
                    (draw) => (

                      <tr
                        key={draw._id}
                        className="border-b last:border-0"
                      >

                        <td className="py-5 pr-4">

                          <p className="font-black text-[#173f2b]">
                            {draw.month}{" "}
                            {draw.year}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {draw.mode || "random"}
                          </p>

                        </td>


                        <td className="py-5 pr-4">

                          <div className="flex gap-2 flex-wrap">

                            {draw.numbers?.map(
                              (number) => (

                                <span
                                  key={number}
                                  className="w-8 h-8 rounded-full bg-[#173f2b] text-white grid place-items-center text-xs font-bold"
                                >
                                  {number}
                                </span>

                              )
                            )}

                          </div>

                        </td>


                        <td className="py-5 pr-4 font-bold">
                          {draw.eligibleSubscribers || 0}
                        </td>


                        <td className="py-5 pr-4 font-bold">
                          {formatMoney(
                            draw.prizePool
                          )}
                        </td>


                        <td className="py-5 pr-4">

                          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold capitalize">
                            {draw.status}
                          </span>

                        </td>


                        <td className="py-5 text-sm text-gray-500">
                          {formatDate(
                            draw.publishedAt
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>


      {/* =====================================
          RECENT WINNERS
      ===================================== */}

      <section className="mt-10">

        <div className="card p-7">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                WINNER ACTIVITY
              </p>

              <h2 className="text-2xl font-black text-[#173f2b] mt-1">
                Recent Winners
              </h2>

            </div>

            <CheckCircle
              className="text-green-600"
              size={25}
            />

          </div>


          {recentWinners.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No winners available.
            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              {recentWinners.map(
                (winner) => (

                  <div
                    key={winner._id}
                    className="rounded-2xl border p-6"
                  >

                    {/* USER */}

                    <div className="flex justify-between gap-4">

                      <div>

                        <h3 className="font-black text-[#173f2b]">
                          {winner.user?.name ||
                            "Unknown User"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {winner.user?.email ||
                            "No email"}
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-xs text-gray-500">
                          Prize
                        </p>

                        <p className="text-xl font-black text-green-700">
                          {formatMoney(
                            winner.prize
                          )}
                        </p>

                      </div>

                    </div>


                    {/* DRAW */}

                    <div className="mt-5 pt-5 border-t">

                      <div className="flex justify-between">

                        <div>

                          <p className="text-xs text-gray-500">
                            Draw
                          </p>

                          <p className="font-bold text-[#173f2b] mt-1">
                            {winner.draw?.month}{" "}
                            {winner.draw?.year}
                          </p>

                        </div>


                        <div className="text-right">

                          <p className="text-xs text-gray-500">
                            Match
                          </p>

                          <p className="font-bold text-[#173f2b] mt-1">
                            {winner.matchType}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* NUMBERS */}

                    <div className="mt-5">

                      <p className="text-xs text-gray-500">
                        Matched Numbers
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">

                        {winner.matchedNumbers?.map(
                          (number) => (

                            <span
                              key={number}
                              className="w-9 h-9 rounded-full bg-[#173f2b] text-white grid place-items-center text-xs font-bold"
                            >
                              {number}
                            </span>

                          )
                        )}

                      </div>

                    </div>


                    {/* STATUS */}

                    <div className="flex flex-wrap gap-2 mt-5">

                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold capitalize">
                        {winner.verificationStatus}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold capitalize">
                        {winner.payoutStatus}
                      </span>

                    </div>


                    <p className="text-xs text-gray-400 mt-4">
                      Created{" "}
                      {formatDate(
                        winner.createdAt
                      )}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* =====================================
          FOOTER INFO
      ===================================== */}

      <div className="mt-10 p-6 rounded-2xl bg-[#173f2b] text-white">

        <div className="flex items-start gap-4">

          <BarChart3
            size={25}
            className="text-[#d89b28] mt-1"
          />

          <div>

            <h3 className="font-black text-lg">
              Reports Summary
            </h3>

            <p className="text-white/70 text-sm mt-2">
              The report shows current platform
              activity, monthly draw performance,
              winner distribution and prize payout
              statistics.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminReports;