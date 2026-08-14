
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Heart,
  CalendarDays,
  Plus,
  Award,
} from "lucide-react";

import api from "../services/api";
import { useApp } from "../context/AppContext";
import Loading from "../components/Loading";

const Dashboard = () => {
  const { user, loadingUser, checkSession } = useApp();

  // =====================================================
  // STATES
  // =====================================================

  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [latestDraw, setLatestDraw] = useState(null);

  const [score, setScore] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [message, setMessage] = useState("");

  const [loadingScores, setLoadingScores] = useState(true);
  const [charityLoading, setCharityLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editDate, setEditDate] = useState("");

  const [charityPercentage, setCharityPercentage] = useState(10);
  const [updatingCharity, setUpdatingCharity] = useState(false);


  

  // =====================================================
  // LOAD SCORES
  // =====================================================

  const loadScores = async () => {
    try {
      setLoadingScores(true);

      const { data } = await api.get("/scores");

      console.log("SCORES:", data);

      setScores(
        Array.isArray(data?.scores)
          ? data.scores
          : []
      );
    } catch (error) {
      console.error(
        "LOAD SCORES ERROR:",
        error.response?.data || error
      );

      setScores([]);
    } finally {
      setLoadingScores(false);
    }
  };

  // =====================================================
  // LOAD CHARITIES
  // =====================================================

  const loadCharities = async () => {
    try {
      setCharityLoading(true);

      const { data } = await api.get("/charities");

      console.log("CHARITIES:", data);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.charities)
        ? data.charities
        : [];

      setCharities(list);
    } catch (error) {
      console.error(
        "LOAD CHARITIES ERROR:",
        error.response?.data || error
      );

      setCharities([]);
    } finally {
      setCharityLoading(false);
    }
  };

  // =====================================================
  // LOAD LATEST DRAW
  // =====================================================

  const loadLatestDraw = async () => {
    try {
      setDrawLoading(true);

      const { data } = await api.get("/draws/latest");

      console.log("LATEST DRAW:", data);

      if (data?.success && data?.draw) {
        setLatestDraw(data);
      } else {
        setLatestDraw(null);
      }
    } catch (error) {
      console.error(
        "LOAD DRAW ERROR:",
        error.response?.data || error
      );

      setLatestDraw(null);
    } finally {
      setDrawLoading(false);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadDashboard = async () => {
    await Promise.all([
      loadScores(),
      loadCharities(),
      loadLatestDraw(),
    ]);
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!user) return;

    setCharityPercentage(
      Number(user.charityPercentage) || 10
    );

    loadDashboard();
  }, [user]);

  // =====================================================
  // LOADING USER
  // =====================================================

  if (loadingUser) {
    return <Loading />;
  }

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Please login to access your dashboard.
          </p>

          <Link
            to="/login"
            className="inline-block mt-4 btn-primary"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // ADD SCORE
  // =====================================================

  const addScore = async (e) => {
    e.preventDefault();

    setMessage("");

    const numericScore = Number(score);

    if (!score || !date) {
      setMessage("Score and date are required.");
      return;
    }

    if (
      Number.isNaN(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      setMessage(
        "Stableford score must be between 1 and 45."
      );
      return;
    }

    try {
      const { data } = await api.post("/scores", {
        score: numericScore,
        date,
      });

      console.log("ADD SCORE:", data);

      if (Array.isArray(data?.scores)) {
        setScores(data.scores);
      } else {
        await loadScores();
      }

      setScore("");
      setMessage("Score added successfully.");

      await checkSession();
    } catch (error) {
      console.error(
        "ADD SCORE ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to add score."
      );
    }
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditScore(item.score ?? "");

    setEditDate(
      item.date
        ? new Date(item.date)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setMessage("");
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {
    setEditingId(null);
    setEditScore("");
    setEditDate("");
  };

  // =====================================================
  // UPDATE SCORE
  // =====================================================

  const updateScore = async (id) => {
    setMessage("");

    const numericScore = Number(editScore);

    if (!editScore || !editDate) {
      setMessage("Score and date are required.");
      return;
    }

    if (
      Number.isNaN(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      setMessage(
        "Stableford score must be between 1 and 45."
      );
      return;
    }

    try {
      const { data } = await api.put(
        `/scores/${id}`,
        {
          score: numericScore,
          date: editDate,
        }
      );

      console.log("UPDATE SCORE:", data);

      if (Array.isArray(data?.scores)) {
        setScores(data.scores);
      } else {
        await loadScores();
      }

      cancelEdit();

      setMessage("Score updated successfully.");
    } catch (error) {
      console.error(
        "UPDATE SCORE ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to update score."
      );
    }
  };

  // =====================================================
  // DELETE SCORE
  // =====================================================

  const deleteScore = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) return;

    try {
      const { data } = await api.delete(
        `/scores/${id}`
      );

      console.log("DELETE SCORE:", data);

      if (Array.isArray(data?.scores)) {
        setScores(data.scores);
      } else {
        await loadScores();
      }

      setMessage("Score deleted successfully.");
    } catch (error) {
      console.error(
        "DELETE SCORE ERROR:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to delete score."
      );
    }
  };

  // =====================================================
  // UPDATE CHARITY
  // =====================================================

  
const updateCharitySettings = async ({
  charity,
  charityPercentage,
}) => {
  try {
    setUpdatingCharity(true);
    setMessage("");

    const payload = {};

    if (charity !== undefined) {
      payload.charity = charity;
    }

    if (charityPercentage !== undefined) {
      payload.charityPercentage = Number(charityPercentage);
    }

    const { data } = await api.patch("/profile", payload);

    console.log("PROFILE UPDATE:", data);

    await checkSession();

    setMessage("Charity settings updated successfully.");
    return true;
  } catch (error) {
    console.error(
      "PROFILE UPDATE ERROR:",
      error.response?.data || error
    );

    setMessage(
      error.response?.data?.message ||
        "Unable to update charity settings."
    );

    return false;
  } finally {
    setUpdatingCharity(false);
  }
};
     

  // =====================================================
  // SELECT CHARITY
  // =====================================================

  const selectCharity = async (e) => {
    const charityId =
      e.target.value || null;

    const percentage =
      Number(charityPercentage) || 10;

    await updateCharitySettings({
      charity: charityId,
      charityPercentage: percentage,
    });
  };

  // =====================================================
  // UPDATE CHARITY PERCENTAGE
  // =====================================================

  const updatePercentage = async (e) => {
    const value = Number(e.target.value);

    if (
      Number.isNaN(value) ||
      value < 10 ||
      value > 100
    ) {
      return;
    }

    const previousValue =
      Number(user.charityPercentage) || 10;

    setCharityPercentage(value);

    const success =
      await updateCharitySettings({
        charity:
          user.charity?._id ||
          user.charity ||
          null,
        charityPercentage: value,
      });

    if (!success) {
      setCharityPercentage(
        previousValue
      );
    }
  };

  // =====================================================
  // DRAW DATA
  // =====================================================

  const draw =
    latestDraw?.draw || null;

  const winners =
    Array.isArray(latestDraw?.winners)
      ? latestDraw.winners
      : [];

  const winnerCounts =
    latestDraw?.winnerCounts || {
      five: 0,
      four: 0,
      three: 0,
      total: 0,
    };

  // =====================================================
  // USER WINNINGS
  // =====================================================

  const myWinnings = winners.filter(
    (winner) => {
      const winnerUserId =
        winner.user?._id ||
        winner.user;

      return (
        String(winnerUserId) ===
        String(user._id)
      );
    }
  );

  const currentUserWinner =
    myWinnings[0] || null;

  // =====================================================
  // MATCH LABEL
  // =====================================================

  const getMatchLabel = (matchType) => {
    if (matchType === "5-number") {
      return "5 Numbers Match";
    }

    if (matchType === "4-number") {
      return "4 Numbers Match";
    }

    if (matchType === "3-number") {
      return "3 Numbers Match";
    }

    return matchType || "Prize Winner";
  };

  // =====================================================
  // CHARITY ID
  // =====================================================

  const selectedCharity =
    user.charity?._id ||
    user.charity ||
    "";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="container-main py-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

        <div>
          <p className="text-gray-500">
            Welcome back
          </p>

          <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-1">
            {user.name}
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your scores, charity impact
            and draw participation.
          </p>
        </div>

        <span
          className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-bold ${
            user.subscriptionStatus ===
            "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {user.subscriptionStatus ||
            "inactive"}
        </span>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="mt-5 p-4 rounded-xl bg-gray-50 border text-sm text-gray-700">
          {message}
        </div>
      )}

      {/* =================================================
          SUBSCRIPTION CTA
      ================================================= */}

      {user.subscriptionStatus !==
        "active" && (
        <div className="mt-8 rounded-3xl bg-[#173f2b] text-white p-8 md:p-10">

          <p className="text-white/60 text-sm font-bold">
            MEMBERSHIP
          </p>

          <h2 className="text-3xl font-black mt-2">
            Unlock your monthly draw entry
          </h2>

          <p className="text-white/70 mt-3 max-w-xl">
            Activate a monthly or yearly plan
            to participate in the draw and
            support your chosen charity.
          </p>

          <Link
            to="/pricing"
            className="inline-block mt-6 px-5 py-3 bg-white text-[#173f2b] rounded-xl font-bold hover:bg-gray-100 transition"
          >
            View plans
          </Link>

        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        <div className="card p-6">
          <Trophy className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Draws entered
          </p>

          <p className="text-3xl font-black mt-1">
            {user.drawsEntered || 0}
          </p>
        </div>

        <div className="card p-6">
          <CalendarDays className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Upcoming draws
          </p>

          <p className="text-3xl font-black mt-1">
            1
          </p>
        </div>

        <div className="card p-6">
          <Heart className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Charity contribution
          </p>

          <p className="text-3xl font-black mt-1">
            {charityPercentage}%
          </p>
        </div>

        <div className="card p-6">
          <Trophy className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Winnings
          </p>

          <p className="text-3xl font-black mt-1">
            ₹
            {Number(
              user.totalPrizeMoney || 0
            ).toLocaleString("en-IN")}
          </p>
        </div>

      </div>

      {/* =================================================
          LATEST DRAW
      ================================================= */}

      <div className="card p-7 mt-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <p className="text-[#d89b28] text-sm font-bold">
              LATEST DRAW
            </p>

            <h2 className="text-2xl font-black text-[#173f2b] mt-1">
              {draw
                ? `${draw.month} ${draw.year}`
                : "Latest Draw"}
            </h2>

            <p className="text-gray-500 mt-1">
              Published winning numbers
            </p>
          </div>

          {draw?.status ===
            "published" && (
            <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
              Published
            </span>
          )}

        </div>

        {drawLoading ? (
          <div className="py-10 text-center text-gray-500">
            Loading latest draw...
          </div>
        ) : !draw ? (
          <div className="py-10 text-center text-gray-500">
            No published draw available yet.
          </div>
        ) : (
          <>

            {/* WINNING NUMBERS */}

            <div className="mt-7">

              <p className="text-sm font-bold text-gray-500 mb-4">
                Winning numbers
              </p>

              <div className="flex flex-wrap gap-3">

                {(draw.numbers || []).map(
                  (number, index) => (
                    <div
                      key={`${number}-${index}`}
                      className="w-12 h-12 rounded-full bg-[#173f2b] text-white grid place-items-center font-black text-lg"
                    >
                      {number}
                    </div>
                  )
                )}

              </div>

            </div>

            {/* DRAW INFO */}

            <div className="grid sm:grid-cols-3 gap-4 mt-8">

              <div className="bg-[#f5f7f2] rounded-2xl p-5">
                <p className="text-sm text-gray-500">
                  Eligible subscribers
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {draw.eligibleSubscribers ??
                    0}
                </p>
              </div>

              <div className="bg-[#f5f7f2] rounded-2xl p-5">
                <p className="text-sm text-gray-500">
                  Prize pool
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  ₹
                  {Number(
                    draw.prizePool || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-[#f5f7f2] rounded-2xl p-5">
                <p className="text-sm text-gray-500">
                  Jackpot
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  ₹
                  {Number(
                    draw.jackpot || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>

            </div>

            {/* WINNER COUNTS */}

            <div className="grid sm:grid-cols-4 gap-4 mt-6">

              <div className="rounded-2xl bg-yellow-50 p-5">
                <p className="text-sm text-gray-500">
                  5-number winners
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {winnerCounts.five || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  4-number winners
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {winnerCounts.four || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-gray-500">
                  3-number winners
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {winnerCounts.three || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Total winners
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  {winnerCounts.total || 0}
                </p>
              </div>

            </div>

            {/* CURRENT USER WINNER */}

            {currentUserWinner && (
              <div className="mt-7 p-5 rounded-2xl bg-green-50 border border-green-200">

                <div className="flex items-start gap-3">

                  <Trophy
                    className="text-[#d89b28] mt-1"
                    size={24}
                  />

                  <div>

                    <p className="font-black text-green-800">
                      Congratulations! 🎉
                    </p>

                    <p className="text-green-700 text-sm mt-1">
                      You won the{" "}
                      <strong>
                        {getMatchLabel(
                          currentUserWinner.matchType
                        )}
                      </strong>{" "}
                      prize.
                    </p>

                    <p className="text-green-800 font-black text-xl mt-2">
                      ₹
                      {Number(
                        currentUserWinner.prize ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="text-green-700 text-xs mt-1">
                      Verification:{" "}
                      {currentUserWinner.verificationStatus ||
                        "pending"}
                    </p>

                    <p className="text-green-700 text-xs">
                      Payout:{" "}
                      {currentUserWinner.payoutStatus ||
                        "pending"}
                    </p>

                    {currentUserWinner.payoutStatus ===
                      "paid" && (
                      <p className="text-green-800 text-sm font-bold mt-2">
                        ✓ Prize has been paid
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )}

          </>
        )}

      </div>

      {/* =================================================
          MY WINNINGS
      ================================================= */}

      <section className="mt-8">

        <div className="flex items-center justify-between mb-5">

          <div>
            <p className="text-[#d89b28] text-sm font-bold">
              MY WINNINGS
            </p>

            <h2 className="text-2xl font-black text-[#173f2b] mt-1">
              Winning history
            </h2>

            <p className="text-gray-500 mt-1">
              View your winning prizes and payout status.
            </p>
          </div>

          <Award
            className="text-[#d89b28]"
            size={30}
          />

        </div>

        {myWinnings.length === 0 ? (
          <div className="card p-8 text-center">

            <Trophy
              size={42}
              className="mx-auto text-gray-300"
            />

            <h3 className="text-xl font-black text-[#173f2b] mt-4">
              No winnings yet
            </h3>

            <p className="text-gray-500 mt-2">
              Your winning records will appear here
              when you win a draw.
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {myWinnings.map(
              (winner) => (
                <div
                  key={winner._id}
                  className="card p-6"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center shrink-0">
                        <Trophy size={23} />
                      </div>

                      <div>

                        <h3 className="text-xl font-black text-[#173f2b]">
                          {getMatchLabel(
                            winner.matchType
                          )}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {draw?.month}{" "}
                          {draw?.year}
                        </p>

                      </div>

                    </div>

                    <div className="md:text-right">

                      <p className="text-sm text-gray-500">
                        Prize
                      </p>

                      <p className="text-3xl font-black text-[#173f2b]">
                        ₹
                        {Number(
                          winner.prize || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Verification
                      </p>

                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                          winner.verificationStatus ===
                          "approved"
                            ? "bg-green-100 text-green-700"
                            : winner.verificationStatus ===
                              "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {winner.verificationStatus ||
                          "pending"}
                      </span>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Payout
                      </p>

                      <span
                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                          winner.payoutStatus ===
                          "paid"
                            ? "bg-green-100 text-green-700"
                            : winner.payoutStatus ===
                              "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {winner.payoutStatus ||
                          "pending"}
                      </span>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-5 mt-5 text-xs text-gray-500">

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
                        Created:{" "}
                        {new Date(
                          winner.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          SCORES + CHARITY
      ================================================= */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        {/* =================================================
            SCORES
        ================================================= */}

        <div className="card p-7">

          <div>
            <h2 className="text-2xl font-black text-[#173f2b]">
              Your latest scores
            </h2>

            <p className="text-gray-500 mt-1">
              Keep your five most recent scores updated.
            </p>
          </div>

          {/* ADD SCORE */}

          <form
            onSubmit={addScore}
            className="grid grid-cols-2 gap-3 mt-7"
          >

            <input
              className="input"
              type="number"
              min="1"
              max="45"
              placeholder="Score 1–45"
              value={score}
              onChange={(e) =>
                setScore(e.target.value)
              }
              required
            />

            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />

            <button
              type="submit"
              className="btn-primary col-span-2 inline-flex justify-center items-center gap-2"
            >
              <Plus size={18} />
              Add score
            </button>

          </form>

          {/* SCORE LIST */}

          <div className="mt-7">

            {loadingScores ? (
              <div className="py-8 text-center text-gray-500">
                Loading scores...
              </div>
            ) : scores.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No scores added yet.
              </div>
            ) : (
              scores.map(
                (item, index) => (
                  <div
                    key={item._id}
                    className="border-b last:border-0 py-4"
                  >

                    {editingId ===
                    item._id ? (
                      <div className="space-y-3">

                        <div className="grid grid-cols-2 gap-3">

                          <input
                            type="number"
                            min="1"
                            max="45"
                            className="input"
                            value={editScore}
                            onChange={(e) =>
                              setEditScore(
                                e.target.value
                              )
                            }
                          />

                          <input
                            type="date"
                            className="input"
                            value={editDate}
                            onChange={(e) =>
                              setEditDate(
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              updateScore(
                                item._id
                              )
                            }
                            className="btn-primary"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelEdit
                            }
                            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          <div className="w-9 h-9 rounded-full bg-[#e9f1eb] grid place-items-center font-bold text-[#173f2b]">
                            {index + 1}
                          </div>

                          <div>

                            <p className="font-bold">
                              Stableford score:{" "}
                              {item.score}
                            </p>

                            <p className="text-sm text-gray-500">
                              {item.date
                                ? new Date(
                                    item.date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"}
                            </p>

                          </div>

                        </div>

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                item
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-semibold hover:bg-gray-200"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteScore(
                                item._id
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* =================================================
            CHARITY
        ================================================= */}

        <div className="card p-7">

          <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] grid place-items-center text-[#173f2b]">
            <Heart />
          </div>

          <h2 className="text-2xl font-black text-[#173f2b] mt-5">
            Your charity
          </h2>

          <p className="text-gray-500 mt-2">
            Choose where your impact goes.
          </p>

          {/* CHARITY SELECT */}

          <select
            className="input mt-7"
            value={selectedCharity}
            onChange={selectCharity}
            disabled={
              updatingCharity ||
              charityLoading
            }
          >

            <option value="">
              Select a charity
            </option>

            {charities.map(
              (charity) => (
                <option
                  key={charity._id}
                  value={charity._id}
                >
                  {charity.name}
                </option>
              )
            )}

          </select>

          {charityLoading ? (
            <p className="text-sm text-gray-500 mt-2">
              Loading charities...
            </p>
          ) : charities.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              No charities available yet.
            </p>
          ) : null}

          {/* CONTRIBUTION */}

          <div className="mt-8">

            <div className="flex justify-between">

              <label className="font-bold">
                Contribution
              </label>

              <span className="font-black text-[#173f2b]">
                {charityPercentage}%
              </span>

            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              className="w-full mt-4 accent-[#173f2b] cursor-pointer"
              value={charityPercentage}
              onChange={updatePercentage}
              disabled={updatingCharity}
            />

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>
                10% minimum
              </span>

              <span>
                100%
              </span>
            </div>

          </div>

          {/* INFO */}

          <div className="mt-8 p-4 rounded-2xl bg-[#f5f7f2]">

            <p className="text-sm text-gray-600">
              Your contribution is separate
              from your draw participation and
              supports the charity you choose.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;

