import { useEffect, useState } from "react";
import {
  Trophy,
  RefreshCw,
  Play,
  CheckCircle,
  Users,
  IndianRupee,
  Clock,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import Loading from "../../components/Loading";

const AdminDraws = () => {
  const [draw, setDraw] = useState(null);
  const [mode, setMode] = useState("random");
  const [simulation, setSimulation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // LOAD CURRENT DRAW
  // GET /api/admin/draws/current
  // ==========================================

  const loadDraw = async () => {
    try {
      const { data } = await api.get("/admin/draws/current");

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load current draw"
        );
      }

      setDraw(data.draw || null);

      // Published draw ke liye simulation clear
      if (data.draw?.status === "published") {
        setSimulation(null);
      }
    } catch (error) {
      console.error("Load draw error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to load current draw"
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
    loadDraw();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDraw();
  };

  // ==========================================
  // SIMULATE DRAW
  // POST /api/admin/draws/simulate
  // ==========================================

  const simulateDraw = async () => {
    try {
      setSimulating(true);
      setSimulation(null);

      const { data } = await api.post(
        "/admin/draws/simulate",
        {
          mode,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Simulation failed"
        );
      }

      setSimulation(data);
    } catch (error) {
      console.error("Simulation error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to simulate draw"
      );
    } finally {
      setSimulating(false);
    }
  };

  // ==========================================
  // PUBLISH DRAW
  // POST /api/admin/draws/publish
  // ==========================================

  const publishDraw = async () => {
    if (!simulation) {
      alert("Please simulate the draw first.");
      return;
    }

    if (!simulation.drawId) {
      alert("Draw ID is missing.");
      return;
    }

    if (
      !Array.isArray(simulation.numbers) ||
      simulation.numbers.length !== 5
    ) {
      alert("Exactly 5 winning numbers are required.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to publish this draw?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setPublishing(true);

      const { data } = await api.post(
        "/admin/draws/publish",
        {
          drawId: simulation.drawId,
          numbers: simulation.numbers,
          mode: simulation.mode || mode,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to publish draw"
        );
      }

      alert(
        data.message ||
          "Draw published successfully"
      );

      // Simulation remove
      setSimulation(null);

      // Current draw reload
      await loadDraw();
    } catch (error) {
      console.error(
        "Publish draw error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to publish draw"
      );
    } finally {
      setPublishing(false);
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
  // STATUS BADGE
  // ==========================================

  const getStatusBadge = (status) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold">
          <CheckCircle size={14} />
          Published
        </span>
      );
    }

    if (status === "simulated") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
          <Play size={14} />
          Simulated
        </span>
      );
    }

    if (status === "open") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-bold">
          <Clock size={14} />
          Open
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
        <Clock size={14} />
        {status || "Pending"}
      </span>
    );
  };

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

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">

        <div>
          <p className="text-sm font-bold text-[#d89b28]">
            ADMIN
          </p>

          <h1 className="text-4xl font-black text-[#173f2b] mt-2">
            Monthly Draws
          </h1>

          <p className="text-gray-500 mt-2">
            Simulate, manage and publish monthly draws.
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

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {/* ========================================
          CURRENT DRAW
      ======================================== */}

      <section className="mt-10">

        <div className="card p-7">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

            {/* DRAW INFO */}

            <div>

              <p className="text-sm font-bold text-[#d89b28]">
                CURRENT MONTHLY DRAW
              </p>

              <h2 className="text-3xl font-black text-[#173f2b] mt-2">
                {draw?.month || "Current Draw"}{" "}
                {draw?.year || ""}
              </h2>

              <div className="flex flex-wrap gap-3 mt-4">

                {getStatusBadge(draw?.status)}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                  <Users size={14} />

                  {draw?.eligibleSubscribers || 0}{" "}
                  eligible subscribers
                </span>

              </div>

            </div>

            {/* PRIZE */}

            <div className="lg:text-right">

              <p className="text-sm text-gray-500">
                Prize Pool
              </p>

              <p className="text-3xl font-black text-[#173f2b] mt-1">
                {formatMoney(draw?.prizePool)}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Jackpot:{" "}
                <span className="font-bold text-[#173f2b]">
                  {formatMoney(draw?.jackpot)}
                </span>
              </p>

            </div>

          </div>

          {/* ======================================
              PUBLISHED NUMBERS
          ====================================== */}

          {draw?.status === "published" &&
            Array.isArray(draw?.numbers) &&
            draw.numbers.length > 0 && (

              <div className="mt-7 pt-7 border-t">

                <div className="flex items-center gap-2">

                  <Trophy
                    size={20}
                    className="text-[#d89b28]"
                  />

                  <p className="font-bold text-[#173f2b]">
                    Winning Numbers
                  </p>

                </div>

                <div className="flex flex-wrap gap-3 mt-4">

                  {draw.numbers.map(
                    (number, index) => (
                      <div
                        key={`${number}-${index}`}
                        className="w-12 h-12 rounded-full bg-[#173f2b] text-white grid place-items-center font-black shadow-sm"
                      >
                        {number}
                      </div>
                    )
                  )}

                </div>

                {draw.publishedAt && (
                  <p className="text-xs text-gray-500 mt-4">
                    Published on{" "}
                    {new Date(
                      draw.publishedAt
                    ).toLocaleString("en-IN")}
                  </p>
                )}

              </div>
            )}

        </div>

      </section>

      {/* ========================================
          SIMULATION
      ======================================== */}

      {draw?.status !== "published" && (

        <section className="mt-8">

          <div className="card p-7">

            {/* TITLE */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
                <Trophy size={21} />
              </div>

              <div>

                <p className="text-sm font-bold text-[#d89b28]">
                  DRAW SIMULATION
                </p>

                <h2 className="text-2xl font-black text-[#173f2b]">
                  Generate Winning Numbers
                </h2>

              </div>

            </div>

            <p className="text-gray-500 mt-3">
              Select a mode and simulate the current
              monthly draw before publishing it.
            </p>

            {/* ==================================
                DRAW MODE
            ================================== */}

            <div className="mt-7">

              <p className="font-bold text-sm text-gray-700">
                Draw mode
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mt-3">

                {/* RANDOM */}

                <button
                  type="button"
                  onClick={() =>
                    setMode("random")
                  }
                  disabled={simulating}
                  className={`p-5 rounded-xl border-2 text-left transition ${
                    mode === "random"
                      ? "border-[#173f2b] bg-[#e9f1eb]"
                      : "border-gray-200 hover:border-gray-300"
                  } disabled:opacity-60`}
                >

                  <div className="flex items-center justify-between">

                    <p className="font-black text-[#173f2b]">
                      Random
                    </p>

                    {mode === "random" && (
                      <CheckCircle
                        size={20}
                        className="text-[#173f2b]"
                      />
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Generate five random numbers.
                  </p>

                </button>

                {/* ALGORITHMIC */}

                <button
                  type="button"
                  onClick={() =>
                    setMode("algorithmic")
                  }
                  disabled={simulating}
                  className={`p-5 rounded-xl border-2 text-left transition ${
                    mode === "algorithmic"
                      ? "border-[#173f2b] bg-[#e9f1eb]"
                      : "border-gray-200 hover:border-gray-300"
                  } disabled:opacity-60`}
                >

                  <div className="flex items-center justify-between">

                    <p className="font-black text-[#173f2b]">
                      Algorithmic
                    </p>

                    {mode === "algorithmic" && (
                      <CheckCircle
                        size={20}
                        className="text-[#173f2b]"
                      />
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Use score frequency to generate numbers.
                  </p>

                </button>

              </div>

            </div>

            {/* ==================================
                SIMULATE BUTTON
            ================================== */}

            <button
              onClick={simulateDraw}
              disabled={simulating}
              className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-50"
            >

              <Play
                size={17}
                className={
                  simulating
                    ? "animate-pulse"
                    : ""
                }
              />

              {simulating
                ? "Simulating..."
                : "Simulate Draw"}

            </button>

          </div>

        </section>

      )}

      {/* ========================================
          SIMULATION RESULT
      ======================================== */}

      {simulation && (

        <section className="mt-8">

          <div className="card p-7">

            {/* RESULT HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <p className="text-sm font-bold text-[#d89b28]">
                  SIMULATION RESULT
                </p>

                <h2 className="text-2xl font-black text-[#173f2b] mt-1">
                  {simulation.mode ===
                  "algorithmic"
                    ? "Algorithmic Draw"
                    : "Random Draw"}
                </h2>

              </div>

              <CheckCircle
                className="text-green-600"
                size={28}
              />

            </div>

            {/* ==================================
                WINNING NUMBERS
            ================================== */}

            <div className="mt-7">

              <p className="font-bold text-[#173f2b]">
                Winning Numbers
              </p>

              <div className="flex flex-wrap gap-4 mt-4">

                {simulation.numbers?.map(
                  (number, index) => (
                    <div
                      key={`${number}-${index}`}
                      className="w-14 h-14 rounded-full bg-[#173f2b] text-white grid place-items-center text-lg font-black shadow-sm"
                    >
                      {number}
                    </div>
                  )
                )}

              </div>

            </div>

            {/* ==================================
                BASIC STATS
            ================================== */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

              <div className="rounded-xl bg-green-50 p-5">

                <Users
                  size={23}
                  className="text-green-700"
                />

                <p className="text-sm text-gray-500 mt-4">
                  Eligible Subscribers
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {simulation.eligibleSubscribers ||
                    0}
                </p>

              </div>

              <div className="rounded-xl bg-yellow-50 p-5">

                <IndianRupee
                  size={23}
                  className="text-yellow-700"
                />

                <p className="text-sm text-gray-500 mt-4">
                  Prize Pool
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {formatMoney(
                    simulation.prizePool
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 p-5">

                <Trophy
                  size={23}
                  className="text-blue-700"
                />

                <p className="text-sm text-gray-500 mt-4">
                  Jackpot
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {formatMoney(
                    simulation.jackpot
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-purple-50 p-5">

                <Users
                  size={23}
                  className="text-purple-700"
                />

                <p className="text-sm text-gray-500 mt-4">
                  Total Winners
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {(simulation.matches?.five ||
                    0) +
                    (simulation.matches?.four ||
                      0) +
                    (simulation.matches?.three ||
                      0)}
                </p>

              </div>

            </div>

            {/* ==================================
                MATCH RESULTS
            ================================== */}

            <div className="mt-8">

              <p className="font-bold text-[#173f2b]">
                Match Results
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                {/* 5 NUMBERS */}

                <div className="rounded-xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        5 Numbers
                      </p>

                      <p className="text-2xl font-black text-[#173f2b] mt-1">
                        {simulation.matches?.five ||
                          0}
                      </p>

                    </div>

                    <Trophy
                      size={24}
                      className="text-[#d89b28]"
                    />

                  </div>

                  <div className="mt-4 pt-4 border-t">

                    <p className="text-xs text-gray-500">
                      Total Prize
                    </p>

                    <p className="font-black text-[#173f2b]">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.fiveNumber
                          ?.totalPrize
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-3">
                      Per Winner
                    </p>

                    <p className="font-black text-green-600">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.fiveNumber
                          ?.prizePerWinner
                      )}
                    </p>

                  </div>

                </div>

                {/* 4 NUMBERS */}

                <div className="rounded-xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        4 Numbers
                      </p>

                      <p className="text-2xl font-black text-[#173f2b] mt-1">
                        {simulation.matches?.four ||
                          0}
                      </p>

                    </div>

                    <Users
                      size={24}
                      className="text-blue-600"
                    />

                  </div>

                  <div className="mt-4 pt-4 border-t">

                    <p className="text-xs text-gray-500">
                      Total Prize
                    </p>

                    <p className="font-black text-[#173f2b]">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.fourNumber
                          ?.totalPrize
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-3">
                      Per Winner
                    </p>

                    <p className="font-black text-green-600">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.fourNumber
                          ?.prizePerWinner
                      )}
                    </p>

                  </div>

                </div>

                {/* 3 NUMBERS */}

                <div className="rounded-xl border border-gray-200 p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        3 Numbers
                      </p>

                      <p className="text-2xl font-black text-[#173f2b] mt-1">
                        {simulation.matches?.three ||
                          0}
                      </p>

                    </div>

                    <CheckCircle
                      size={24}
                      className="text-green-600"
                    />

                  </div>

                  <div className="mt-4 pt-4 border-t">

                    <p className="text-xs text-gray-500">
                      Total Prize
                    </p>

                    <p className="font-black text-[#173f2b]">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.threeNumber
                          ?.totalPrize
                      )}
                    </p>

                    <p className="text-xs text-gray-500 mt-3">
                      Per Winner
                    </p>

                    <p className="font-black text-green-600">
                      {formatMoney(
                        simulation
                          .prizeDistribution
                          ?.threeNumber
                          ?.prizePerWinner
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================
                PUBLISH SECTION
            ================================== */}

            <div className="mt-8 pt-7 border-t">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <p className="font-bold text-[#173f2b]">
                    Ready to publish?
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Publishing will save the winning
                    numbers and create winner records
                    for eligible users.
                  </p>

                </div>

                <button
                  onClick={publishDraw}
                  disabled={publishing}
                  className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >

                  <CheckCircle size={17} />

                  {publishing
                    ? "Publishing..."
                    : "Publish Draw"}

                </button>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* ========================================
          PUBLISHED DRAW SUMMARY
      ======================================== */}

      {draw?.status === "published" && (

        <section className="mt-8">

          <div className="card p-7">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 grid place-items-center shrink-0">
                <CheckCircle size={25} />
              </div>

              <div>

                <h2 className="text-xl font-black text-[#173f2b]">
                  Draw Published Successfully
                </h2>

                <p className="text-gray-500 mt-1">
                  The August 2026 draw has been
                  published and winner records have
                  been created.
                </p>

              </div>

            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Status
                </p>

                <div className="mt-2">
                  {getStatusBadge(
                    draw.status
                  )}
                </div>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Eligible Subscribers
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {draw.eligibleSubscribers ||
                    0}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Prize Pool
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {formatMoney(
                    draw.prizePool
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Jackpot
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {formatMoney(
                    draw.jackpot
                  )}
                </p>

              </div>

            </div>

          </div>

        </section>

      )}

      {/* ========================================
          INFO CARDS
      ======================================== */}

      <section className="grid md:grid-cols-3 gap-5 mt-8">

        {/* ELIGIBLE */}

        <div className="card p-6">

          <Users
            className="text-[#d89b28]"
            size={25}
          />

          <p className="text-gray-500 text-sm mt-5">
            Eligible Subscribers
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {draw?.eligibleSubscribers || 0}
          </h3>

        </div>

        {/* PRIZE POOL */}

        <div className="card p-6">

          <IndianRupee
            className="text-[#d89b28]"
            size={25}
          />

          <p className="text-gray-500 text-sm mt-5">
            Prize Pool
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {formatMoney(
              draw?.prizePool
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
            Jackpot
          </p>

          <h3 className="text-2xl font-black text-[#173f2b] mt-1">
            {formatMoney(
              draw?.jackpot
            )}
          </h3>

        </div>

      </section>

      {/* ========================================
          HELP / WARNING
      ======================================== */}

      {draw?.status === "published" && (
        <section className="mt-8">

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">

            <div className="flex items-start gap-3">

              <CheckCircle
                size={20}
                className="text-blue-600 mt-0.5 shrink-0"
              />

              <div>

                <p className="font-bold text-blue-900">
                  What happens next?
                </p>

                <p className="text-sm text-blue-800 mt-1">
                  Go to the Winners section to verify
                  winners and process their prize
                  payouts.
                </p>

              </div>

            </div>

          </div>

        </section>
      )}

    </div>
  );
};

export default AdminDraws;