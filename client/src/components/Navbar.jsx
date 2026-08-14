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

  // ==========================
  // LOAD WALLET
  // ==========================

  useEffect(() => {
    if (loadingUser || !user || user.isAdmin) {
      setWalletBalance(0);
      return;
    }

    const loadWallet = async () => {
      try {
        const { data } = await api.get("/wallet");

        if (data.success) {
          setWalletBalance(data.wallet?.balance || 0);
        }
      } catch (error) {
        console.log(
          "Navbar wallet error:",
          error.response?.data || error.message
        );
      }
    };

    loadWallet();
  }, [user, loadingUser]);

  // ==========================
  // LOGOUT
  // ==========================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Logout error:", error);
    }

    setOpen(false);
    navigate("/");
  };

  // ==========================
  // CLOSE MOBILE MENU
  // ==========================

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="container-main h-20 flex items-center justify-between">

        {/* ==========================
            LOGO
        ========================== */}

        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-black text-[#173f2b]"
        >
          Impact
          <span className="text-[#d89b28]">
            Draw
          </span>
        </Link>

        {/* ==========================
            DESKTOP NAV
        ========================== */}

        <div className="hidden md:flex items-center gap-7">

          {/* ==========================
              PUBLIC USER
          ========================== */}

          {!user && (
            <>
              <Link
                to="/"
                className="hover:text-[#d89b28]"
              >
                Home
              </Link>

              <Link
                to="/charities"
                className="hover:text-[#d89b28]"
              >
                Charities
              </Link>

              <Link
                to="/how-it-works"
                className="hover:text-[#d89b28]"
              >
                How It Works
              </Link>

              <Link
                to="/pricing"
                className="font-semibold text-[#d89b28]"
              >
                Pricing
              </Link>
            </>
          )}

          {/* ==========================
              NORMAL USER
          ========================== */}

          {user && !user.isAdmin && (
            <>
              <Link
                to="/"
                className="hover:text-[#d89b28]"
              >
                Home
              </Link>

              <Link
                to="/charities"
                className="hover:text-[#d89b28]"
              >
                Charities
              </Link>

              <Link
                to="/how-it-works"
                className="hover:text-[#d89b28]"
              >
                How It Works
              </Link>

              {/* PRICING */}

              <Link
                to="/pricing"
                className="font-semibold text-[#d89b28]"
              >
                Pricing
              </Link>

              {/* DRAW HISTORY */}

              <Link
                to="/draws/history"
                className="hover:text-[#d89b28]"
              >
                Draw History
              </Link>

              {/* DASHBOARD */}

              <Link
                to="/dashboard"
                className="hover:text-[#d89b28]"
              >
                Dashboard
              </Link>

              {/* ENTER DRAW */}

              <Link
                to="/draws/enter"
                className="hover:text-[#d89b28]"
              >
                Enter Draw
              </Link>

              {/* MY WINNINGS */}

              <Link
                to="/my-winnings"
                className="hover:text-[#d89b28]"
              >
                My Winnings
              </Link>

              {/* PAYMENT HISTORY */}

              <Link
                to="/payment-history"
                className="hover:text-[#d89b28]"
              >
                Payment History
              </Link>

              {/* WITHDRAWAL */}

              <Link
                to="/withdrawal"
                className="hover:text-[#d89b28]"
              >
                Withdrawal
              </Link>

              {/* WALLET */}

              <Link
                to="/wallet"
                className="font-semibold text-green-600"
              >
                Wallet ₹{walletBalance}
              </Link>
            </>
          )}

          {/* ==========================
              ADMIN NAV
          ========================== */}

          {user?.isAdmin && (
            <>
              <Link
                to="/admin"
                className="font-bold text-[#d89b28]"
              >
                Admin Panel
              </Link>

              <Link
                to="/admin/withdrawals"
                className="font-bold text-red-600"
              >
                Withdrawal Requests
              </Link>

              <Link
                to="/admin/draws"
                className="hover:text-[#d89b28]"
              >
                Manage Draws
              </Link>

              <Link
                to="/admin/users"
                className="hover:text-[#d89b28]"
              >
                Manage Users
              </Link>

              <Link
                to="/admin/charities"
                className="hover:text-[#d89b28]"
              >
                Charities
              </Link>

              <Link
                to="/admin/winners"
                className="hover:text-[#d89b28]"
              >
                Winners
              </Link>

              <Link
                to="/admin/reports"
                className="hover:text-[#d89b28]"
              >
                Reports
              </Link>
            </>
          )}

          {/* ==========================
              LOGIN / SIGNUP / LOGOUT
          ========================== */}

          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-[#d89b28]"
              >
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

        {/* ==========================
            MOBILE BUTTON
        ========================== */}

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </nav>

      {/* ==========================
          MOBILE MENU
      ========================== */}

      {open && (
        <div className="md:hidden bg-white border-t px-5 py-5 flex flex-col gap-4">

          {/* ==========================
              PUBLIC
          ========================== */}

          {!user && (
            <>
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
                to="/pricing"
                onClick={closeMenu}
                className="font-bold text-[#d89b28]"
              >
                Pricing
              </Link>

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

          {/* ==========================
              NORMAL USER
          ========================== */}

          {user && !user.isAdmin && (
            <>
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
                to="/pricing"
                onClick={closeMenu}
                className="font-bold text-[#d89b28]"
              >
                Pricing
              </Link>

              <Link
                to="/draws/history"
                onClick={closeMenu}
              >
                Draw History
              </Link>

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

              {/* PAYMENT HISTORY */}

              <Link
                to="/payment-history"
                onClick={closeMenu}
                className="font-semibold text-[#173f2b]"
              >
                Payment History
              </Link>

              <Link
                to="/withdrawal"
                onClick={closeMenu}
              >
                Withdrawal
              </Link>

              <Link
                to="/wallet"
                onClick={closeMenu}
                className="font-semibold text-green-600"
              >
                Wallet ₹{walletBalance}
              </Link>

              <button
                onClick={handleLogout}
                className="text-left font-semibold"
              >
                Logout
              </button>
            </>
          )}

          {/* ==========================
              ADMIN
          ========================== */}

          {user?.isAdmin && (
            <>
              <Link
                to="/admin"
                onClick={closeMenu}
                className="font-bold text-[#d89b28]"
              >
                Admin Panel
              </Link>

              <Link
                to="/admin/withdrawals"
                onClick={closeMenu}
                className="font-bold text-red-600"
              >
                Withdrawal Requests
              </Link>

              <Link
                to="/admin/draws"
                onClick={closeMenu}
              >
                Manage Draws
              </Link>

              <Link
                to="/admin/users"
                onClick={closeMenu}
              >
                Manage Users
              </Link>

              <Link
                to="/admin/charities"
                onClick={closeMenu}
              >
                Charities
              </Link>

              <Link
                to="/admin/winners"
                onClick={closeMenu}
              >
                Winners
              </Link>

              <Link
                to="/admin/reports"
                onClick={closeMenu}
              >
                Reports
              </Link>

              <button
                onClick={handleLogout}
                className="text-left font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;