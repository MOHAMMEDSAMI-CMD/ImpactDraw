import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Trophy,
  IndianRupee,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Clock,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount = 0) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      const { data } = await api.get(
        "/admin/dashboard/stats"
      );

      console.log("ADMIN DASHBOARD DATA:", data);

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setStats(data);
    } catch (error) {
      console.error(
        "Admin dashboard stats error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load admin dashboard"
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
    loadDashboard();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
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

  const users = stats?.users || {};
  const charities = stats?.charities || {};
  const draws = stats?.draws || {};
  const winners = stats?.winners || {};
  const prizes = stats?.prizes || {};

  const currentDraw = stats?.recentDraws?.[0] || null;

  const recentWinners = stats?.recentWinners || [];

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
            ADMIN
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage users, charities, monthly draws and
            winner payouts.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="
            px-5
            py-3
            rounded-xl
            bg-gray-100
            font-bold
            inline-flex
            items-center
            gap-2
            w-fit
            disabled:opacity-50
          "
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
          TOP STAT CARDS
      ====================================== */}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">

        {/* USERS */}

        <div className="card p-6">

          <div className="flex items-center justify-between">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-50
                text-blue-600
                grid
                place-items-center
              "
            >
              <Users size={24} />
            </div>

            <span className="text-xs font-bold text-gray-400">
              USERS
            </span>

          </div>

          <p className="text-gray-500 text-sm mt-5">
            Total Users
          </p>

          <h2 className="text-3xl font-black text-[#173f2b] mt-1">
            {users.total || 0}
          </h2>

          <p className="text-sm text-green-600 font-bold mt-2">
            {users.active || 0} active
          </p>

        </div>


        {/* CHARITIES */}

        <div className="card p-6">

          <div className="flex items-center justify-between">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-green-50
                text-green-700
                grid
                place-items-center
              "
            >
              <Building2 size={24} />
            </div>

            <span className="text-xs font-bold text-gray-400">
              CHARITIES
            </span>

          </div>

          <p className="text-gray-500 text-sm mt-5">
            Charities
          </p>

          <h2 className="text-3xl font-black text-[#173f2b] mt-1">
            {charities.total || 0}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Charity organizations
          </p>

        </div>


        {/* DRAW */}

        <div className="card p-6">

          <div className="flex items-center justify-between">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-yellow-50
                text-[#d89b28]
                grid
                place-items-center
              "
            >
              <CalendarDays size={24} />
            </div>

            <span className="text-xs font-bold text-gray-400">
              MONTHLY DRAW
            </span>

          </div>

          <p className="text-gray-500 text-sm mt-5">
            Monthly Draw
          </p>

          <h2 className="text-2xl font-black text-[#173f2b] mt-1">
            {currentDraw?.status === "published"
              ? "Published"
              : "Pending"}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {currentDraw
              ? `${currentDraw.month} ${currentDraw.year}`
              : "No current draw"}
          </p>

        </div>


        {/* WINNERS */}

        <div className="card p-6">

          <div className="flex items-center justify-between">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-purple-50
                text-purple-600
                grid
                place-items-center
              "
            >
              <Trophy size={24} />
            </div>

            <span className="text-xs font-bold text-gray-400">
              WINNERS
            </span>

          </div>

          <p className="text-gray-500 text-sm mt-5">
            Winners
          </p>

          <h2 className="text-3xl font-black text-[#173f2b] mt-1">
            {winners.total || 0}
          </h2>

          <p className="text-sm text-green-600 font-bold mt-2">
            {winners.paid || 0} paid
          </p>

        </div>

      </section>


      {/* ======================================
          CURRENT DRAW
      ====================================== */}

      <section className="mt-8">

        <div className="card p-7">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                CURRENT DRAW
              </p>

              <h2 className="text-3xl font-black text-[#173f2b] mt-2">

                {currentDraw
                  ? `${currentDraw.month} ${currentDraw.year}`
                  : "No Current Draw"}

              </h2>

              {currentDraw && (

                <div className="flex flex-wrap gap-3 mt-4">

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-green-50
                      text-green-700
                      text-sm
                      font-bold
                    "
                  >
                    {currentDraw.status}
                  </span>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-gray-100
                      text-gray-700
                      text-sm
                      font-bold
                    "
                  >
                    {currentDraw.eligibleSubscribers || 0}
                    {" "}eligible subscribers
                  </span>

                </div>

              )}

            </div>


            {currentDraw && (

              <div className="text-left lg:text-right">

                <p className="text-sm text-gray-500">
                  Prize Pool
                </p>

                <p className="text-3xl font-black text-[#173f2b]">
                  {formatMoney(
                    currentDraw.prizePool
                  )}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Jackpot:{" "}
                  <span className="font-bold text-[#d89b28]">
                    {formatMoney(
                      currentDraw.jackpot
                    )}
                  </span>
                </p>

              </div>

            )}

          </div>


          {/* WINNING NUMBERS */}

          {currentDraw?.status === "published" &&
            currentDraw?.numbers?.length > 0 && (

              <div className="mt-7 pt-7 border-t">

                <p className="font-bold text-[#173f2b]">
                  Winning Numbers
                </p>

                <div className="flex flex-wrap gap-3 mt-4">

                  {currentDraw.numbers.map(
                    (number) => (

                      <div
                        key={number}
                        className="
                          w-12
                          h-12
                          rounded-full
                          bg-[#173f2b]
                          text-white
                          grid
                          place-items-center
                          font-black
                        "
                      >
                        {number}
                      </div>

                    )
                  )}

                </div>


                {currentDraw.publishedAt && (

                  <p className="text-sm text-gray-500 mt-4">
                    Published on{" "}
                    {formatDate(
                      currentDraw.publishedAt
                    )}
                  </p>

                )}

              </div>

            )}

        </div>

      </section>


      {/* ======================================
          WINNER STATISTICS
      ====================================== */}

      <section className="mt-8">

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* TOTAL WINNERS */}

          <div className="card p-6">

            <Trophy
              className="text-[#d89b28]"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Total Winners
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {winners.total || 0}
            </h3>

          </div>


          {/* APPROVED */}

          <div className="card p-6">

            <CheckCircle
              className="text-green-600"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Approved Winners
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {winners.approved || 0}
            </h3>

          </div>


          {/* PAID */}

          <div className="card p-6">

            <IndianRupee
              className="text-green-600"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Paid Winners
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {winners.paid || 0}
            </h3>

          </div>


          {/* PENDING */}

          <div className="card p-6">

            <Clock
              className="text-orange-500"
              size={25}
            />

            <p className="text-gray-500 text-sm mt-5">
              Pending Payout
            </p>

            <h3 className="text-3xl font-black text-[#173f2b] mt-1">
              {formatMoney(
                winners.pendingPayout
              )}
            </h3>

          </div>

        </div>

      </section>


      {/* ======================================
          PRIZE SUMMARY
      ====================================== */}

      <section className="mt-8">

        <div className="card p-7">

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-[#e9f1eb]
                text-[#173f2b]
                grid
                place-items-center
              "
            >
              <IndianRupee size={21} />
            </div>

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                PRIZE SUMMARY
              </p>

              <h2 className="text-2xl font-black text-[#173f2b]">
                Winner Payout Overview
              </h2>

            </div>

          </div>


          <div className="grid sm:grid-cols-3 gap-5 mt-7">

            {/* TOTAL */}

            <div className="rounded-xl bg-blue-50 p-5">

              <p className="text-sm text-gray-500">
                Total Prize
              </p>

              <p className="text-3xl font-black text-[#173f2b] mt-1">
                {formatMoney(
                  prizes.total
                )}
              </p>

            </div>


            {/* PAID */}

            <div className="rounded-xl bg-green-50 p-5">

              <p className="text-sm text-gray-500">
                Paid Prize
              </p>

              <p className="text-3xl font-black text-green-700 mt-1">
                {formatMoney(
                  prizes.paid
                )}
              </p>

            </div>


            {/* PENDING */}

            <div className="rounded-xl bg-yellow-50 p-5">

              <p className="text-sm text-gray-500">
                Pending Prize
              </p>

              <p className="text-3xl font-black text-[#d89b28] mt-1">
                {formatMoney(
                  prizes.pending
                )}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <section className="mt-8">

        <div className="card p-7">

          <p className="text-sm font-bold text-[#d89b28]">
            QUICK ACTIONS
          </p>

          <h2 className="text-2xl font-black text-[#173f2b] mt-1">
            Manage Platform
          </h2>

          <p className="text-gray-500 mt-2">
            Quickly access the main admin sections.
          </p>


          <div className="grid md:grid-cols-3 gap-5 mt-7">

            {/* CHARITIES */}

            <Link
              to="/admin/charities"
              className="
                rounded-2xl
                border
                border-gray-200
                p-6
                hover:border-[#173f2b]
                hover:shadow-md
                transition
              "
            >

              <Building2
                className="text-[#d89b28]"
                size={27}
              />

              <h3 className="font-black text-[#173f2b] mt-5">
                Manage Charities
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Add or remove charity organizations.
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-[#173f2b] mt-5">
                Manage Charities
                <ArrowRight size={16} />
              </div>

            </Link>


            {/* DRAWS */}

            <Link
              to="/admin/draws"
              className="
                rounded-2xl
                border
                border-gray-200
                p-6
                hover:border-[#173f2b]
                hover:shadow-md
                transition
              "
            >

              <CalendarDays
                className="text-[#d89b28]"
                size={27}
              />

              <h3 className="font-black text-[#173f2b] mt-5">
                Monthly Draws
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Simulate and publish winning draws.
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-[#173f2b] mt-5">
                Manage Draws
                <ArrowRight size={16} />
              </div>

            </Link>


            {/* WINNERS */}

            <Link
              to="/admin/winners"
              className="
                rounded-2xl
                border
                border-gray-200
                p-6
                hover:border-[#173f2b]
                hover:shadow-md
                transition
              "
            >

              <Trophy
                className="text-[#d89b28]"
                size={27}
              />

              <h3 className="font-black text-[#173f2b] mt-5">
                Winners
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                View winner records and manage prize payouts.
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-[#173f2b] mt-5">
                Manage Winners
                <ArrowRight size={16} />
              </div>

            </Link>

          </div>

        </div>

      </section>


      {/* ======================================
          ADMIN TOOLS
      ====================================== */}

      <section className="mt-8">

        <div className="card p-7">

          <p className="text-sm font-bold text-[#d89b28]">
            ADMIN TOOLS
          </p>

          <h2 className="text-2xl font-black text-[#173f2b] mt-1">
            Platform Management
          </h2>


          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-7">

            {/* USERS */}

            <Link
              to="/admin/users"
              className="
                p-5
                rounded-xl
                bg-gray-50
                hover:bg-[#e9f1eb]
                transition
              "
            >

              <Users
                className="text-[#173f2b]"
                size={23}
              />

              <h3 className="font-bold text-[#173f2b] mt-4">
                Users
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Manage platform users.
              </p>

            </Link>


            {/* CHARITIES */}

            <Link
              to="/admin/charities"
              className="
                p-5
                rounded-xl
                bg-gray-50
                hover:bg-[#e9f1eb]
                transition
              "
            >

              <Building2
                className="text-[#173f2b]"
                size={23}
              />

              <h3 className="font-bold text-[#173f2b] mt-4">
                Charities
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Manage charity organizations.
              </p>

            </Link>


            {/* DRAWS */}

            <Link
              to="/admin/draws"
              className="
                p-5
                rounded-xl
                bg-gray-50
                hover:bg-[#e9f1eb]
                transition
              "
            >

              <CalendarDays
                className="text-[#173f2b]"
                size={23}
              />

              <h3 className="font-bold text-[#173f2b] mt-4">
                Draws
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Simulate and publish draws.
              </p>

            </Link>


            {/* WINNERS */}

            <Link
              to="/admin/winners"
              className="
                p-5
                rounded-xl
                bg-gray-50
                hover:bg-[#e9f1eb]
                transition
              "
            >

              <Trophy
                className="text-[#173f2b]"
                size={23}
              />

              <h3 className="font-bold text-[#173f2b] mt-4">
                Winners
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Manage winner payouts.
              </p>

            </Link>


            {/* REPORTS */}

            <Link
              to="/admin/reports"
              className="
                p-5
                rounded-xl
                bg-gray-50
                hover:bg-[#e9f1eb]
                transition
              "
            >

              <IndianRupee
                className="text-[#173f2b]"
                size={23}
              />

              <h3 className="font-bold text-[#173f2b] mt-4">
                Reports
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Review platform activity and statistics.
              </p>

            </Link>

          </div>

        </div>

      </section>


      {/* ======================================
          RECENT WINNERS
      ====================================== */}

      <section className="mt-8">

        <div className="card p-7">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                RECENT WINNERS
              </p>

              <h2 className="text-2xl font-black text-[#173f2b] mt-1">
                Winner Activity
              </h2>

            </div>

            <Link
              to="/admin/winners"
              className="
                text-sm
                font-bold
                text-[#173f2b]
                inline-flex
                items-center
                gap-2
              "
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>


          {recentWinners.length === 0 ? (

            <div className="py-10 text-center">

              <Trophy
                className="mx-auto text-gray-300"
                size={40}
              />

              <p className="text-gray-500 mt-3">
                No winners yet.
              </p>

            </div>

          ) : (

            <div className="grid gap-4 mt-7">

              {recentWinners.map(
                (winner) => (

                  <div
                    key={winner._id}
                    className="
                      border
                      border-gray-200
                      rounded-xl
                      p-5
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                      gap-5
                    "
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className="
                          w-12
                          h-12
                          rounded-xl
                          bg-green-50
                          text-green-700
                          grid
                          place-items-center
                        "
                      >
                        <Trophy size={23} />
                      </div>

                      <div>

                        <h3 className="font-black text-[#173f2b]">
                          {winner.user?.name ||
                            "Unknown User"}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {winner.user?.email ||
                            "—"}
                        </p>

                      </div>

                    </div>


                    <div>

                      <p className="text-xs text-gray-500">
                        Prize
                      </p>

                      <p className="font-black text-green-700">
                        {formatMoney(
                          winner.prize
                        )}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-gray-500">
                        Draw
                      </p>

                      <p className="font-bold text-[#173f2b]">
                        {winner.draw?.month}{" "}
                        {winner.draw?.year}
                      </p>

                    </div>


                    <div>

                      <p className="text-xs text-gray-500">
                        Match
                      </p>

                      <p className="font-bold text-[#173f2b]">
                        {winner.matchType}
                      </p>

                    </div>


                    <div className="flex gap-2">

                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-green-50
                          text-green-700
                          text-xs
                          font-bold
                        "
                      >
                        {winner.verificationStatus}
                      </span>

                      <span
                        className="
                          px-3
                          py-1
                          rounded-full
                          bg-blue-50
                          text-blue-700
                          text-xs
                          font-bold
                        "
                      >
                        {winner.payoutStatus}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* ======================================
          CURRENT DRAW QUICK LINK
      ====================================== */}

      <section className="mt-8">

        <Link
          to="/admin/draws"
          className="
            card
            p-7
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-5
            hover:shadow-lg
            transition
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-[#e9f1eb]
                text-[#173f2b]
                grid
                place-items-center
              "
            >
              <CalendarDays size={24} />
            </div>

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                MONTHLY DRAW
              </p>

              <h2 className="text-xl font-black text-[#173f2b]">
                Manage Current Draw
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Generate winning numbers and publish the draw.
              </p>

            </div>

          </div>

          <ArrowRight
            className="text-[#173f2b]"
            size={22}
          />

        </Link>

      </section>

    </div>
  );
};

export default AdminDashboard;