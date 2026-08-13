import { useEffect, useState } from "react";
import {
  Trophy,
  CalendarDays,
  IndianRupee,
  Users,
  CheckCircle,
} from "lucide-react";

import api from "../services/api";
import Loading from "../components/Loading";

const LatestDraw = () => {
  const [draw, setDraw] = useState(null);
  const [winners, setWinners] = useState([]);
  const [winnerCounts, setWinnerCounts] = useState(null);
  const [prizeDistribution, setPrizeDistribution] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLatestDraw = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/draws/latest");

      console.log("LATEST DRAW:", data);

      if (!data.success) {
        throw new Error(data.message || "Failed to load latest draw");
      }

      setDraw(data.draw);
      setWinners(data.winners || []);
      setWinnerCounts(data.winnerCounts || null);
      setPrizeDistribution(data.prizeDistribution || null);
    } catch (error) {
      console.error(
        "Latest draw error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load latest draw."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestDraw();
  }, []);

  const formatMoney = (amount = 0) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const getMatchLabel = (matchType) => {
    if (matchType === "5-number") return "5 Numbers";
    if (matchType === "4-number") return "4 Numbers";
    if (matchType === "3-number") return "3 Numbers";

    return matchType || "Unknown";
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container-main py-16">
        <div className="max-w-xl mx-auto card p-10 text-center">
          <Trophy
            size={48}
            className="mx-auto text-[#d89b28]"
          />

          <h1 className="text-2xl font-black text-[#173f2b] mt-5">
            Unable to load latest draw
          </h1>

          <p className="text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={loadLatestDraw}
            className="mt-6 px-5 py-3 rounded-xl bg-[#173f2b] text-white font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="container-main py-16">
        <div className="max-w-xl mx-auto card p-10 text-center">
          <Trophy
            size={48}
            className="mx-auto text-[#d89b28]"
          />

          <h1 className="text-2xl font-black text-[#173f2b] mt-5">
            No Published Draw
          </h1>

          <p className="text-gray-500 mt-2">
            There is no published draw available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-10">

      {/* HEADER */}

      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[#d89b28] font-bold text-sm">
          LATEST DRAW
        </p>

        <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
          {draw.month} {draw.year}
        </h1>

        <p className="text-gray-500 mt-3">
          Latest published draw results and winners.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
          <CalendarDays size={17} />

          Published{" "}
          {draw.publishedAt
            ? new Date(draw.publishedAt).toLocaleDateString("en-IN")
            : "—"}
        </div>
      </div>

      {/* WINNING NUMBERS */}

      <section className="mt-10">
        <div className="card p-7 md:p-10">

          <div className="text-center">
            <p className="text-sm font-bold text-[#d89b28]">
              WINNING NUMBERS
            </p>

            <h2 className="text-2xl font-black text-[#173f2b] mt-2">
              Congratulations to all participants
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {(draw.numbers || []).map((number) => (
              <div
                key={number}
                className="w-16 h-16 rounded-full bg-[#173f2b] text-white grid place-items-center text-xl font-black shadow-sm"
              >
                {number}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* DRAW STATS */}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

        <div className="card p-6">
          <Users
            size={25}
            className="text-[#d89b28]"
          />

          <p className="text-sm text-gray-500 mt-5">
            Subscribers
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {draw.eligibleSubscribers || 0}
          </h3>
        </div>

        <div className="card p-6">
          <IndianRupee
            size={25}
            className="text-[#d89b28]"
          />

          <p className="text-sm text-gray-500 mt-5">
            Prize Pool
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {formatMoney(draw.prizePool)}
          </h3>
        </div>

        <div className="card p-6">
          <Trophy
            size={25}
            className="text-[#d89b28]"
          />

          <p className="text-sm text-gray-500 mt-5">
            Jackpot
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {formatMoney(draw.jackpot)}
          </h3>
        </div>

        <div className="card p-6">
          <CheckCircle
            size={25}
            className="text-green-600"
          />

          <p className="text-sm text-gray-500 mt-5">
            Total Winners
          </p>

          <h3 className="text-3xl font-black text-[#173f2b] mt-1">
            {winnerCounts?.total || 0}
          </h3>
        </div>

      </section>

      {/* WINNERS */}

      <section className="mt-10">

        <h2 className="text-2xl font-black text-[#173f2b]">
          Winners
        </h2>

        {winners.length === 0 ? (
          <div className="card p-8 text-center mt-5">
            <p className="text-gray-500">
              No winners recorded for this draw.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">

            {winners.map((winner) => (
              <div
                key={winner._id}
                className="card p-6"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
                      <Trophy size={21} />
                    </div>

                    <h3 className="text-xl font-black text-[#173f2b] mt-4">
                      {winner.user?.name || "Winner"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {winner.user?.email || ""}
                    </p>
                  </div>

                  <CheckCircle
                    size={22}
                    className="text-green-600 shrink-0"
                  />

                </div>

                <div className="mt-5 rounded-xl bg-gray-50 p-4">

                  <p className="text-xs text-gray-500">
                    Match
                  </p>

                  <p className="font-black text-[#173f2b] mt-1">
                    {getMatchLabel(winner.matchType)}
                  </p>

                </div>

                <div className="mt-3 rounded-xl bg-[#f5f7f2] p-4">

                  <p className="text-xs text-gray-500">
                    Prize
                  </p>

                  <p className="text-2xl font-black text-[#173f2b] mt-1">
                    {formatMoney(winner.prize)}
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* PRIZE DISTRIBUTION */}

      {prizeDistribution && (
        <section className="mt-10">

          <h2 className="text-2xl font-black text-[#173f2b]">
            Prize Distribution
          </h2>

          <div className="grid md:grid-cols-3 gap-5 mt-5">

            <div className="card p-6">
              <p className="text-sm text-gray-500">
                5 Numbers
              </p>

              <p className="text-3xl font-black text-[#173f2b] mt-2">
                {prizeDistribution.fiveNumber?.count || 0}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Prize per winner
              </p>

              <p className="font-black text-[#d89b28]">
                {formatMoney(
                  prizeDistribution.fiveNumber?.prizePerWinner
                )}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm text-gray-500">
                4 Numbers
              </p>

              <p className="text-3xl font-black text-[#173f2b] mt-2">
                {prizeDistribution.fourNumber?.count || 0}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Prize per winner
              </p>

              <p className="font-black text-[#d89b28]">
                {formatMoney(
                  prizeDistribution.fourNumber?.prizePerWinner
                )}
              </p>
            </div>

            <div className="card p-6">
              <p className="text-sm text-gray-500">
                3 Numbers
              </p>

              <p className="text-3xl font-black text-[#173f2b] mt-2">
                {prizeDistribution.threeNumber?.count || 0}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Prize per winner
              </p>

              <p className="font-black text-[#d89b28]">
                {formatMoney(
                  prizeDistribution.threeNumber?.prizePerWinner
                )}
              </p>
            </div>

          </div>

        </section>
      )}

    </div>
  );
};

export default LatestDraw;