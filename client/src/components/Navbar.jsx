import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import api from "../services/api";

const Navbar = () => {
  const { user, logout, loadingUser } = useApp();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // ==========================================
  // LOAD WALLET BALANCE
  // ==========================================

  useEffect(() => {
    if (loadingUser || !user) {
      setWalletBalance(0);
      return;
    }

    const loadWalletBalance = async () => {
      try {
        const { data } = await api.get("/wallet");

        console.log("NAVBAR WALLET:", data);

        if (data?.success) {
          setWalletBalance(data.wallet?.balance ?? 0);
        }
      } catch (error) {
        console.error(
          "Navbar wallet error:",
          error.response?.data || error.message
        );
      }
    };

    loadWalletBalance();
  }, [user, loadingUser]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="container-main h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-black tracking-tight text-[#173f2b]"
        >
          Impact<span className="text-[#d89b28]">Draw</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-7">

          <Link to="/">Home</Link>

          <Link to="/charities">Charities</Link>

          <Link to="/how-it-works">
            How It Works
          </Link>

          <Link to="/draws/history">
            Draw History
          </Link>

          <Link to="/pricing">Pricing</Link>

          {user ? (
            <>
              <Link to="/dashboard">
                Dashboard
              </Link>

              <Link
                to="/draws/enter"
                className="text-[#173f2b] font-semibold"
              >
                Enter Draw
              </Link>

              <Link to="/my-winnings">
                My Winnings
              </Link>

              {/* WALLET */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 font-semibold text-[#173f2b] hover:text-[#d89b28] transition"
              >
                <span>Wallet</span>

                <span className="text-green-600 font-bold">
                  ₹{walletBalance}
                </span>
              </Link>

              {/* ADMIN */}
              {user.isAdmin === true && (
                <Link
                  to="/admin"
                  className="font-bold text-[#d89b28]"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-gray-100 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link
                to="/signup"
                className="btn-primary"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t px-5 py-5 flex flex-col gap-4">

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/charities"
            onClick={closeMenu}
          >
            Charities
          </Link>

          <Link
            to="/how-it-works"
            onClick={closeMenu}
          >
            How It Works
          </Link>

          <Link
            to="/draws/history"
            onClick={closeMenu}
          >
            Draw History
          </Link>

          <Link
            to="/pricing"
            onClick={closeMenu}
          >
            Pricing
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={closeMenu}
              >
                Dashboard
              </Link>

              <Link
                to="/draws/enter"
                onClick={closeMenu}
              >
                Enter Draw
              </Link>

              <Link
                to="/my-winnings"
                onClick={closeMenu}
              >
                My Winnings
              </Link>

              {/* WALLET */}
              <Link
                to="/wallet"
                onClick={closeMenu}
                className="flex items-center justify-between font-semibold text-[#173f2b]"
              >
                <span>Wallet</span>

                <span className="text-green-600 font-bold">
                  ₹{walletBalance}
                </span>
              </Link>

              {/* ADMIN */}
              {user.isAdmin === true && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="font-bold text-[#d89b28]"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-left font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className="btn-primary text-center"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;