const Footer = () => {
  return (
    <footer className="bg-[#173f2b] text-white mt-20">
      <div className="container-main py-12 grid md:grid-cols-3 gap-10">

        <div>
          <h2 className="text-2xl font-black">
            Impact<span className="text-[#d89b28]">Draw</span>
          </h2>

          <p className="text-white/70 mt-4 max-w-sm">
            Your score can do more. Play your game,
            participate in the monthly draw and support
            a charity you care about.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">
            Platform
          </h3>

          <div className="space-y-2 text-white/70">
            <p>How It Works</p>
            <p>Charities</p>
            <p>Draws</p>
            <p>Pricing</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4">
            Support
          </h3>

          <div className="space-y-2 text-white/70">
            <p>Contact</p>
            <p>Terms & Conditions</p>
            <p>Privacy Policy</p>
          </div>
        </div>

      </div>

      <div className="border-t border-white/10">
        <div className="container-main py-5 text-sm text-white/50">
          © 2026 ImpactDraw. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;