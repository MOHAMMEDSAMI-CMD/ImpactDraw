import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-main py-20 md:py-28 grid lg:grid-cols-2 gap-14 items-center">

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9f1eb] text-[#173f2b] font-semibold text-sm">
              <Sparkles size={16} />
              Play with purpose
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.02] tracking-tight text-[#173f2b] mt-6">
              Your score
              <br />
              can do
              <br />
              <span className="text-[#d89b28]">more.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl mt-7 leading-relaxed">
              Enter your latest Stableford scores, participate in
              monthly prize draws and support a charity you care about.
            </p>

            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                to="/signup"
                className="btn-primary inline-flex items-center gap-2"
              >
                Join the movement
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/charities"
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white font-bold hover:bg-gray-50"
              >
                Explore charities
              </Link>
            </div>
          </div>

          {/* Impact Card */}
          <div className="relative">
            <div className="card bg-[#173f2b] text-white p-8 md:p-10 overflow-hidden">

              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#d89b28]/20" />

              <p className="text-white/60 text-sm font-bold">
                THIS MONTH'S POTENTIAL JACKPOT
              </p>

              <div className="text-6xl md:text-7xl font-black mt-4">
                ₹40K+
              </div>

              <p className="text-white/70 mt-3">
                The 5-number jackpot can roll over when unclaimed.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-10">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-black">40%</div>
                  <div className="text-xs text-white/60 mt-1">
                    Jackpot
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-black">35%</div>
                  <div className="text-xs text-white/60 mt-1">
                    4 Match
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-black">25%</div>
                  <div className="text-xs text-white/60 mt-1">
                    3 Match
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container-main">

          <div className="max-w-2xl">
            <p className="text-[#d89b28] font-bold text-sm">
              SIMPLE BY DESIGN
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-[#173f2b] mt-3">
              Play. Win. Give.
            </h2>

            <p className="text-gray-600 text-lg mt-4">
              Everything you need is built around three simple actions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">

            <div className="card p-7">
              <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
                <Target />
              </div>

              <p className="text-sm font-bold text-[#d89b28] mt-7">
                01
              </p>

              <h3 className="text-2xl font-black text-[#173f2b] mt-2">
                Enter
              </h3>

              <p className="text-gray-600 mt-3">
                Keep your latest five Stableford scores updated
                in seconds.
              </p>
            </div>

            <div className="card p-7">
              <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
                <Trophy />
              </div>

              <p className="text-sm font-bold text-[#d89b28] mt-7">
                02
              </p>

              <h3 className="text-2xl font-black text-[#173f2b] mt-2">
                Win
              </h3>

              <p className="text-gray-600 mt-3">
                Your scores become part of the monthly draw
                experience.
              </p>
            </div>

            <div className="card p-7">
              <div className="w-12 h-12 rounded-xl bg-[#e9f1eb] text-[#173f2b] grid place-items-center">
                <Heart />
              </div>

              <p className="text-sm font-bold text-[#d89b28] mt-7">
                03
              </p>

              <h3 className="text-2xl font-black text-[#173f2b] mt-2">
                Give
              </h3>

              <p className="text-gray-600 mt-3">
                A portion of your subscription supports the
                charity you choose.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-main">
          <div className="rounded-3xl bg-[#e9f1eb] p-8 md:p-14 text-center">

            <h2 className="text-4xl md:text-5xl font-black text-[#173f2b]">
              Ready to make your score count?
            </h2>

            <p className="text-gray-600 max-w-xl mx-auto mt-4 text-lg">
              Join the platform, choose your charity and
              start your journey.
            </p>

            <Link
              to="/signup"
              className="btn-primary inline-flex items-center gap-2 mt-8"
            >
              Get started
              <ArrowRight size={18} />
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;