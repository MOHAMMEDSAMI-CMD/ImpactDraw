import { useEffect, useState } from "react";
import { CalendarDays, Trophy } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";

const DrawHistory = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/draws/history");

      console.log("DRAW HISTORY:", response.data);

      setDraws(response.data.draws || []);
    } catch (error) {
      console.error(
        "Draw history error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load draw history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-main py-10">

      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto">

        <p className="text-[#d89b28] font-bold text-sm">
          DRAW HISTORY
        </p>

        <h1 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
          Previous Draws
        </h1>

        <p className="text-gray-500 mt-3">
          View previous published draw results,
          winning numbers and prize pools.
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="max-w-xl mx-auto mt-8 p-4 rounded-xl bg-red-50 text-red-600 text-center">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {!error && draws.length === 0 && (
        <div className="card max-w-xl mx-auto mt-10 p-10 text-center">

          <Trophy
            size={48}
            className="mx-auto text-[#d89b28]"
          />

          <h2 className="text-2xl font-black text-[#173f2b] mt-5">
            No Draws Yet
          </h2>

          <p className="text-gray-500 mt-2">
            No published draws are available yet.
          </p>

        </div>
      )}

      {/* DRAW LIST */}
      <div className="max-w-5xl mx-auto mt-10 space-y-5">

        {draws.map((draw) => (

          <div
            key={draw._id}
            className="card p-6 md:p-8"
          >

            {/* TOP */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={20}
                    className="text-[#d89b28]"
                  />

                  <h2 className="text-2xl font-black text-[#173f2b]">
                    {draw.month} {draw.year}
                  </h2>

                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Published{" "}
                  {draw.publishedAt
                    ? new Date(
                        draw.publishedAt
                      ).toLocaleDateString()
                    : "—"}
                </p>

              </div>

              <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold w-fit">
                Published
              </span>

            </div>

            {/* NUMBERS */}
            <div className="mt-7">

              <p className="text-sm font-bold text-gray-500">
                Winning Numbers
              </p>

              <div className="flex flex-wrap gap-3 mt-3">

                {(draw.numbers || []).map(
                  (number) => (

                    <div
                      key={number}
                      className="w-12 h-12 rounded-full bg-[#173f2b] text-white grid place-items-center font-black"
                    >
                      {number}
                    </div>

                  )
                )}

                {/* WINNERS */}
{draw.winners?.length > 0 && (
  <div className="mt-7">

    <p className="text-sm font-bold text-gray-500">
      Winners
    </p>

    <div className="mt-3 space-y-3">
      {draw.winners.map((winner) => (
        <div
          key={winner._id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-[#f5f7f2] p-4"
        >

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-[#173f2b] text-white grid place-items-center">
              <Trophy size={18} />
            </div>

            <div>
              <p className="font-black text-[#173f2b]">
                {winner.user?.name || "Winner"}
              </p>

              <p className="text-sm text-gray-500">
                {winner.matchType === "5-number"
                  ? "5 Numbers"
                  : winner.matchType === "4-number"
                  ? "4 Numbers"
                  : winner.matchType === "3-number"
                  ? "3 Numbers"
                  : winner.matchType}
              </p>
            </div>

          </div>

          <div className="sm:text-right">
            <p className="text-xs text-gray-500">
              Prize
            </p>

            <p className="text-xl font-black text-[#173f2b]">
              ₹{Number(
                winner.prize || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

        </div>
      ))}
    </div>

  </div>
)}

              </div>

            </div>

            {/* STATS */}
            <div className="grid sm:grid-cols-3 gap-4 mt-7">

              <div className="bg-[#f5f7f2] rounded-2xl p-4">

                <p className="text-sm text-gray-500">
                  Subscribers
                </p>

                <p className="text-xl font-black text-[#173f2b] mt-1">
                  {draw.eligibleSubscribers || 0}
                </p>

              </div>

              <div className="bg-[#f5f7f2] rounded-2xl p-4">

                <p className="text-sm text-gray-500">
                  Prize Pool
                </p>

                <p className="text-xl font-black text-[#173f2b] mt-1">
                  ₹{draw.prizePool || 0}
                </p>

              </div>

              <div className="bg-[#f5f7f2] rounded-2xl p-4">

                <p className="text-sm text-gray-500">
                  Jackpot
                </p>

                <p className="text-xl font-black text-[#173f2b] mt-1">
                  ₹{draw.jackpot || 0}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default DrawHistory;