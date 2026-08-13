import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] grid place-items-center px-5">

      <div className="text-center">

        <p className="text-7xl font-black text-[#173f2b]">
          404
        </p>

        <h1 className="text-3xl font-black mt-4">
          Page not found
        </h1>

        <p className="text-gray-500 mt-3">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="btn-primary inline-block mt-7"
        >
          Back home
        </Link>

      </div>

    </div>
  );
};

export default NotFound;