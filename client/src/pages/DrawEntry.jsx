import { useEffect, useState } from "react";
import api from "../services/api";

const DrawEntry = () => {
  // ==============================
  // STATES
  // ==============================

  const [numbers, setNumbers] = useState([]);
  const [activeDraw, setActiveDraw] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [alreadyEntered, setAlreadyEntered] = useState(false);

  const [message, setMessage] = useState("");

  const allNumbers = Array.from(
    { length: 45 },
    (_, i) => i + 1
  );

  // ==============================
  // GET ACTIVE DRAW
  // ==============================

  const getActiveDraw = async () => {
    try {
      setLoading(true);

      // Get active/published draw
      const { data } = await api.get("/draws/active");

      console.log("ACTIVE DRAW:", data);

      if (data.success) {
        setActiveDraw(data.draw);
      } else {
        setActiveDraw(null);
      }

      // ============================
      // CHECK USER ENTRY
      // ============================

      try {
        const entryResponse = await api.get(
          "/draws/my-entry"
        );

        console.log(
          "MY ENTRY:",
          entryResponse.data
        );

        if (entryResponse.data.success) {
          setAlreadyEntered(
            entryResponse.data.entered
          );

          // If already entered, show saved numbers
          if (
            entryResponse.data.entry?.numbers
          ) {
            setNumbers(
              entryResponse.data.entry.numbers
            );
          }
        }
      } catch (entryError) {
        console.log(
          "My entry check error:",
          entryError.response?.data ||
            entryError
        );
      }
    } catch (error) {
      console.log(
        "Active draw error:",
        error.response?.data || error
      );

      setActiveDraw(null);

      setMessage(
        error.response?.data?.message ||
          "Unable to load active draw."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD ON PAGE OPEN
  // ==============================

  useEffect(() => {
    getActiveDraw();
  }, []);

  // ==============================
  // SELECT / UNSELECT NUMBER
  // ==============================

  const toggleNumber = (num) => {
    // Already entered -> don't allow changes
    if (alreadyEntered) {
      return;
    }

    // Remove number
    if (numbers.includes(num)) {
      setNumbers(
        numbers.filter(
          (number) => number !== num
        )
      );

      setMessage("");

      return;
    }

    // Maximum 5 numbers
    if (numbers.length >= 5) {
      setMessage(
        "You can select only 5 numbers."
      );

      return;
    }

    // Add number
    setNumbers([
      ...numbers,
      num,
    ]);

    setMessage("");
  };

  // ==============================
  // ENTER DRAW
  // ==============================

  const submitEntry = async () => {
    // Already entered
    if (alreadyEntered) {
      setMessage(
        "You have already entered this draw."
      );

      return;
    }

    // Need exactly 5
    if (numbers.length !== 5) {
      setMessage(
        "Select exactly 5 numbers."
      );

      return;
    }

    // No draw
    if (!activeDraw) {
      setMessage(
        "No active draw available."
      );

      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const { data } = await api.post(
        "/draws/enter",
        {
          numbers,
        }
      );

      console.log(
        "DRAW ENTRY RESPONSE:",
        data
      );

      if (data.success) {
        setMessage(
          data.message ||
            "Draw entry successful."
        );

        // User has now entered
        setAlreadyEntered(true);
      } else {
        setMessage(
          data.message ||
            "Entry failed."
        );
      }
    } catch (error) {
      console.log(
        "Entry error:",
        error.response?.data ||
          error
      );

      setMessage(
        error.response?.data?.message ||
          "Entry failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#173f2b]">
            Loading draw...
          </div>

          <p className="text-gray-500 mt-2">
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-main py-10">

        {/* ==========================
            HEADER
        ========================== */}

        <div>
          <h1 className="text-4xl font-black text-[#173f2b]">
            Enter Draw
          </h1>

          <p className="mt-2 text-gray-600">
            Select your lucky 5 numbers
          </p>
        </div>

        {/* ==========================
            DRAW INFORMATION
        ========================== */}

        {activeDraw ? (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-sm text-[#d89b28] font-bold">
                  CURRENT DRAW
                </p>

                <h2 className="text-2xl font-black text-[#173f2b] mt-1">
                  {activeDraw.month}{" "}
                  {activeDraw.year}
                </h2>
              </div>

              <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                Published
              </span>

            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">

              <div className="bg-[#f5f7f2] rounded-xl p-4">

                <p className="text-sm text-gray-500">
                  Prize Pool
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  ₹
                  {Number(
                    activeDraw.prizePool || 0
                  ).toLocaleString("en-IN")}
                </p>

              </div>

              <div className="bg-[#f5f7f2] rounded-xl p-4">

                <p className="text-sm text-gray-500">
                  Jackpot
                </p>

                <p className="text-2xl font-black text-[#173f2b] mt-1">
                  ₹
                  {Number(
                    activeDraw.jackpot || 0
                  ).toLocaleString("en-IN")}
                </p>

              </div>

            </div>

          </div>
        ) : (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">

            <h2 className="font-bold text-yellow-700">
              No active draw available
            </h2>

            <p className="text-yellow-600 mt-1">
              Please check again when a new
              draw is published.
            </p>

          </div>
        )}

        {/* ==========================
            NUMBER SELECTION
        ========================== */}

        <div className="mt-8 bg-white rounded-2xl shadow-sm border p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>
              <h2 className="text-xl font-black text-[#173f2b]">
                Select 5 Numbers
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Choose numbers from 1 to 45.
              </p>
            </div>

            <div className="text-sm font-bold">
              Selected{" "}
              <span className="text-[#d89b28]">
                {numbers.length}/5
              </span>
            </div>

          </div>

          {/* NUMBER GRID */}

          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-4 mt-7">

            {allNumbers.map((num) => {

              const isSelected =
                numbers.includes(num);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() =>
                    toggleNumber(num)
                  }
                  disabled={
                    alreadyEntered ||
                    submitting
                  }
                  className={`
                    h-12
                    w-12
                    rounded-full
                    font-bold
                    border
                    transition
                    mx-auto

                    ${
                      isSelected
                        ? "bg-[#173f2b] text-white border-[#173f2b] scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }

                    ${
                      alreadyEntered
                        ? "cursor-not-allowed opacity-80"
                        : ""
                    }
                  `}
                >
                  {num}
                </button>
              );
            })}

          </div>

          {/* ========================
              SELECTED NUMBERS
          ======================== */}

          <div className="mt-8 p-4 rounded-xl bg-[#f5f7f2]">

            <p className="text-sm text-gray-500">
              Your selected numbers
            </p>

            <p className="font-black text-[#173f2b] mt-1">
              {numbers.length > 0
                ? numbers.join(", ")
                : "No numbers selected"}
            </p>

          </div>

          {/* ========================
              ALREADY ENTERED
          ======================== */}

          {alreadyEntered && (
            <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-200">

              <p className="font-bold text-green-800">
                ✓ You have already entered
                this draw.
              </p>

              <p className="text-sm text-green-700 mt-1">
                Your selected numbers are locked
                for this draw.
              </p>

            </div>
          )}

          {/* ========================
              MESSAGE
          ======================== */}

          {message && (
            <div
              className={`
                mt-5
                p-4
                rounded-xl
                text-sm
                font-semibold

                ${
                  alreadyEntered
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-700"
                }
              `}
            >
              {message}
            </div>
          )}

          {/* ========================
              SUBMIT
          ======================== */}

          <button
            type="button"
            onClick={submitEntry}
            disabled={
              submitting ||
              alreadyEntered ||
              numbers.length !== 5 ||
              !activeDraw
            }
            className={`
              mt-6
              px-8
              py-3
              rounded-xl
              text-white
              font-bold
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed

              ${
                alreadyEntered
                  ? "bg-gray-400"
                  : "bg-[#d89b28] hover:bg-[#c88e23]"
              }
            `}
          >
            {alreadyEntered
              ? "✓ Already Entered"
              : submitting
              ? "Submitting..."
              : "Enter Draw"}
          </button>

        </div>

        {/* ==========================
            FOOTER
        ========================== */}

        <div className="mt-10 bg-[#173f2b] text-white rounded-2xl p-8">

          <h2 className="text-3xl font-black">
            ImpactDraw
          </h2>

          <p className="mt-3 text-gray-200 max-w-2xl">
            Your score can do more. Play your
            game, participate in the monthly draw
            and support a charity you care about.
          </p>

        </div>

      </div>
    </div>
  );
};

export default DrawEntry;