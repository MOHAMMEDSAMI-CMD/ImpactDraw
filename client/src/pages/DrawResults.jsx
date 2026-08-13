import { useEffect, useState } from "react";
import { Trophy, CalendarDays, Users, IndianRupee } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";

const DrawResults = () => {
  const [draw, setDraw] = useState(null);
  const [winners, setWinners] = useState([]);
  const [winnerCounts, setWinnerCounts] = useState({
    five: 0,
    four: 0,
    three: 0,
    total: 0,
  });
  const [prizeDistribution, setPrizeDistribution] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLatestDraw = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/draws/latest");

      console.log("LATEST DRAW RESPONSE:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to load draw"
        );
      }

      setDraw(response.data.draw);
      setWinners(response.data.winners || []);
      setWinnerCounts(
        response.data.winnerCounts || {
          five: 0,
          four: 0,
          three: 0,
          total: 0,
        }
      );
      setPrizeDistribution(
        response.data.prizeDistribution || null
      );
    } catch (error) {
      console.error(
        "Latest draw error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load latest draw."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestDraw();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container-main py-16">
        <div className="max-w-xl mx-auto text-center card p-10">
          <Trophy
            size={48}
            className="mx-auto text-[#d89b28]"
          />

          <h1 className="text-2xl font-black text-[#173f2b] mt-5">
            Draw Results
          </h1>

          <p className="text-gray-500 mt-3">
            {error}
          </p>

          <button
            onClick={loadLatestDraw}
            className="btn-primary mt-6"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="container-main py-16">
        <div className="card p-10 text-center">
          <Trophy
            size={48}
            className="mx-auto text-[#d89b28]"
          />

          <h1 className="text-3xl font-black text-[#173f2b] mt-5">
            No Draw Results Yet
          </h1>

          <p className="text-gray-500 mt-3">
            No published draw is available yet.
          </p>
        </div>
      </div>
    );
  }

  const getPrize = (type) => {
    if (!prizeDistribution) return 0;

    if (type === "5-number") {
      return prizeDistribution.fiveNumber?.prizePerWinner || 0;
    }

    if (type === "4-number") {
      return prizeDistribution.fourNumber?.prizePerWinner || 0;
    }

    return prizeDistribution.threeNumber?.prizePerWinner || 0;
  };

  return (
    <div className="container-main py-10">

      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto">

        <p className="text-[#d89b28] font-bold text-sm">
          LATEST DRAW
        </p>

        <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
          {draw.month} {draw.year}
        </h1>

        <p className="text-gray-500 mt-3">
          Official published draw results
        </p>

      </div>

      {/* WINNING NUMBERS */}
      <section className="card p-8 mt-10 max-w-4xl mx-auto">

        <div className="flex items-center justify-center gap-3">

          <Trophy className="text-[#d89b28]" />

          <h2 className="text-2xl font-black text-[#173f2b]">
            Winning Numbers
          </h2>

        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">

          {draw.numbers?.map((number) => (
            <div
              key={number}
              className="w-16 h-16 rounded-full bg-[#173f2b] text-white grid place-items-center text-xl font-black"
            >
              {number}
            </div>
          ))}

        </div>

        <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mt-7">

          <CalendarDays size={16} />

          Published{" "}
          {draw.publishedAt
            ? new Date(
                draw.publishedAt
              ).toLocaleDateString()
            : "—"}

        </div>

      </section>

      {/* STATS */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        <div className="card p-6">

          <Users className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Eligible subscribers
          </p>

          <p className="text-3xl font-black mt-1">
            {draw.eligibleSubscribers || 0}
          </p>

        </div>

        <div className="card p-6">

          <IndianRupee className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Prize pool
          </p>

          <p className="text-3xl font-black mt-1">
            ₹{draw.prizePool || 0}
          </p>

        </div>

        <div className="card p-6">

          <Trophy className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Jackpot
          </p>

          <p className="text-3xl font-black mt-1">
            ₹{draw.jackpot || 0}
          </p>

        </div>

        <div className="card p-6">

          <Trophy className="text-[#d89b28]" />

          <p className="text-gray-500 text-sm mt-5">
            Total winners
          </p>

          <p className="text-3xl font-black mt-1">
            {winnerCounts.total}
          </p>

        </div>

      </section>

      {/* WINNER COUNTS */}
      <section className="mt-8">

        <h2 className="text-2xl font-black text-[#173f2b]">
          Prize Distribution
        </h2>

        <div className="grid md:grid-cols-3 gap-5 mt-5">

          {/* 5 NUMBER */}
          <div className="card p-6">

            <p className="text-sm text-gray-500">
              5-number match
            </p>

            <p className="text-4xl font-black text-[#173f2b] mt-2">
              {winnerCounts.five}
            </p>

            <p className="text-gray-500 mt-2">
              Winner(s)
            </p>

            <div className="border-t mt-5 pt-4">

              <p className="text-sm text-gray-500">
                Prize per winner
              </p>

              <p className="text-xl font-black mt-1">
                ₹{getPrize("5-number")}
              </p>

            </div>

          </div>

          {/* 4 NUMBER */}
          <div className="card p-6">

            <p className="text-sm text-gray-500">
              4-number match
            </p>

            <p className="text-4xl font-black text-[#173f2b] mt-2">
              {winnerCounts.four}
            </p>

            <p className="text-gray-500 mt-2">
              Winner(s)
            </p>

            <div className="border-t mt-5 pt-4">

              <p className="text-sm text-gray-500">
                Prize per winner
              </p>

              <p className="text-xl font-black mt-1">
                ₹{getPrize("4-number")}
              </p>

            </div>

          </div>

          {/* 3 NUMBER */}
          <div className="card p-6">

            <p className="text-sm text-gray-500">
              3-number match
            </p>

            <p className="text-4xl font-black text-[#173f2b] mt-2">
              {winnerCounts.three}
            </p>

            <p className="text-gray-500 mt-2">
              Winner(s)
            </p>

            <div className="border-t mt-5 pt-4">

              <p className="text-sm text-gray-500">
                Prize per winner
              </p>

              <p className="text-xl font-black mt-1">
                ₹{getPrize("3-number")}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* WINNERS */}
      <section className="mt-10">

        <div className="flex items-center gap-3">

          <Trophy className="text-[#d89b28]" />

          <h2 className="text-2xl font-black text-[#173f2b]">
            Winners
          </h2>

        </div>

        {winners.length === 0 ? (

          <div className="card p-8 mt-5 text-center text-gray-500">
            No winners for this draw.
          </div>

        ) : (

          <div className="card mt-5 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-[#f5f7f2]">

                  <tr>

                    <th className="text-left p-4">
                      Winner
                    </th>

                    <th className="text-left p-4">
                      Match
                    </th>

                    <th className="text-left p-4">
                      Prize
                    </th>

                    <th className="text-left p-4">
                      Verification
                    </th>

                    <th className="text-left p-4">
                      Payout
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {winners.map((winner) => (

                    <tr
                      key={winner._id}
                      className="border-t"
                    >

                      <td className="p-4">

                        <p className="font-bold">
                          {winner.user?.name ||
                            "Unknown"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {winner.user?.email ||
                            ""}
                        </p>

                      </td>

                      <td className="p-4 font-semibold">
                        {winner.matchType}
                      </td>

                      <td className="p-4 font-black">
                        ₹{winner.prize || 0}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            winner.verificationStatus ===
                            "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {winner.verificationStatus}
                        </span>

                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            winner.payoutStatus ===
                            "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {winner.payoutStatus}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </section>

    </div>
  );
};

export default DrawResults;