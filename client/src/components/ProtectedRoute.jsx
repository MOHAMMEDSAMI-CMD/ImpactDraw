import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Loading from "./Loading";

const ProtectedRoute = () => {
  const { user, loadingUser } = useApp();
  const location = useLocation();

  if (loadingUser) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;