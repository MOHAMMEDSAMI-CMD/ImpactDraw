
import React from "react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-green-700 px-6 py-24 text-center text-white">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest">
          ImpactDraw
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          How It Works
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-green-50">
          Play your game, support a charity, and get a chance
          to win every month.
        </p>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-6 py-20">

        <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
          Simple. Meaningful. Rewarding.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {/* Step 1 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              1
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Become a Member
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              Choose a monthly or yearly ImpactDraw membership
              and become part of our community.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              2
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Choose Your Charity
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              Select a charity you care about and decide how much
              of your membership contribution goes towards it.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              3
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Add Your Scores
            </h3>

            <p className="mt-4 leading-7 text-gray-600">
              Enter your latest Stableford golf scores.
              We keep your five most recent scores.
            </p>
          </div>

        </div>
      </section>

      {/* Draw */}
      <section className="bg-white px-6 py-20">

        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Monthly Draw
            </p>

            <h2 className="mt-3 text-4xl font-bold text-gray-900">
              Three ways to win
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-gray-600">
              Every month, eligible members participate in our
              draw-based reward system.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
              <span className="text-4xl font-bold text-green-700">
                40%
              </span>

              <h3 className="mt-5 text-2xl font-bold">
                5 Number Match
              </h3>

              <p className="mt-4 text-gray-600">
                The main jackpot. If there is no winner,
                the jackpot rolls over to the next month.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
              <span className="text-4xl font-bold text-green-700">
                35%
              </span>

              <h3 className="mt-5 text-2xl font-bold">
                4 Number Match
              </h3>

              <p className="mt-4 text-gray-600">
                This prize pool is shared equally between
                qualifying winners.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8">
              <span className="text-4xl font-bold text-green-700">
                25%
              </span>

              <h3 className="mt-5 text-2xl font-bold">
                3 Number Match
              </h3>

              <p className="mt-4 text-gray-600">
                Qualifying winners share this prize pool
                automatically.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Charity Impact */}
      <section className="bg-gray-950 px-6 py-24 text-white">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            More than golf
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Your membership creates an impact.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Every membership can support a charity selected by
            the member. The minimum charity contribution is 10%.
          </p>

          <Link
            to="/charities"
            className="mt-8 inline-block rounded-full bg-green-600 px-7 py-3 font-semibold transition hover:bg-green-500"
          >
            Explore Charities
          </Link>

        </div>

      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">

        <h2 className="text-4xl font-bold text-gray-900">
          Ready to join ImpactDraw?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Choose your membership, select a charity and enter
          the monthly draw.
        </p>

        <Link
          to="/signup"
          className="mt-8 inline-block rounded-full bg-gray-900 px-8 py-4 font-semibold text-white transition hover:bg-green-700"
        >
          Get Started
        </Link>

      </section>

    </div>
  );
};

export default HowItWorks;

