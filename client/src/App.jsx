import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AppProvider } from "./context/AppContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Charities from "./pages/Charities";
import CharityDetails from "./pages/CharityDetails";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import Wallet from "./pages/Wallet";
import PaymentHistory from "./pages/PaymentHistory";

// Draw pages
import DrawResults from "./pages/DrawResults";
import DrawHistory from "./pages/DrawHistory";
import LatestDraw from "./pages/LatestDraw";
import DrawEntry from "./pages/DrawEntry";
import PaymentSuccess from "./pages/PaymentSuccess";
import EnterDraw from "./pages/EnterDraw";
import Withdrawal from "./pages/Withdrawal";



// User pages
import Profile from "./pages/Profile.jsx";
import MyWinnings from "./pages/MyWinnings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCharities from "./pages/admin/AdminCharities";
import AdminDraws from "./pages/admin/AdminDraws";
import AdminWinners from "./pages/admin/AdminWinners";
import AdminReports from "./pages/admin/AdminReports";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";

import "./index.css";

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>

          {/* =====================================
              PUBLIC ROUTES
          ===================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/charities"
            element={<Charities />}
          />

          <Route
            path="/charities/:id"
            element={<CharityDetails />}
          />

          <Route
            path="/pricing"
            element={<Pricing />}
          />

          <Route
            path="/how-it-works"
            element={<HowItWorks />}
          />

          <Route
            path="/draw-results"
            element={<DrawResults />}
          />

          <Route
            path="/draws/history"
            element={<DrawHistory />}
          />

          <Route
            path="/draws/latest"
            element={<LatestDraw />}
          />

          <Route
            path="/draws/enter"
            element={<DrawEntry />}
          />

          <Route
            path="/withdrawal"
            element={<Withdrawal />}
          />

          

          <Route
            path="/wallet"
            element={<Wallet />}
          />

          <Route
            path="/payment-success"
            element={<PaymentSuccess />}
          />


          {/* =====================================
              USER PROTECTED ROUTES
          ===================================== */}

          <Route element={<ProtectedRoute />}>

            {/* User Dashboard */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* User Profile */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* My Winnings */}

            <Route
              path="/my-winnings"
              element={<MyWinnings />}
            />

          </Route>

          <Route
  path="/payment-history"
  element={<PaymentHistory />}
/>


          {/* =====================================
              ADMIN PROTECTED ROUTES
          ===================================== */}

          <Route element={<AdminRoute />}>

            {/* Admin Dashboard */}

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />


            {/* Admin Users */}

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />


            {/* Admin Charities */}

            <Route
              path="/admin/charities"
              element={<AdminCharities />}
            />


            {/* Admin Draws */}

            <Route
              path="/admin/draws"
              element={<AdminDraws />}
            />


            {/* Admin Winners */}

            <Route
              path="/admin/winners"
              element={<AdminWinners />}
            />


            <Route
              path="/admin/withdrawals"
              element={<AdminWithdrawals />}
            />

            {/* Admin Reports */}

            <Route
              path="/admin/reports"
              element={<AdminReports />}
            />

          </Route>




          {/* =====================================
              404
          ===================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

        <Footer />

      </BrowserRouter>
    </AppProvider>
  );
};

export default App;