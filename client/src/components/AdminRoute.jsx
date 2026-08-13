
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Loading from "./Loading";

const AdminRoute = () => {
  const { user, loadingUser } = useApp();
  const location = useLocation();

  // Session check ho raha hai
  if (loadingUser) {
    return <Loading />;
  }

  // Login nahi hai
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Admin check
  if (user.isAdmin !== true) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // Admin hai
  return <Outlet />;
};

export default AdminRoute;

