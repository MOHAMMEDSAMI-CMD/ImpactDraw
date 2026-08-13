
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(
        form.email,
        form.password
      );

      console.log("LOGIN USER:", data.user);
      console.log("IS ADMIN:", data.user?.isAdmin);

      // Admin → Admin Dashboard
      if (data.user?.isAdmin === true) {
        navigate("/admin");
      } else {
        // Normal User → User Dashboard
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-5 py-12">

      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8"
      >

        <div className="text-center">

          <h1 className="text-3xl font-black text-[#173f2b]">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Continue your impact journey.
          </p>

        </div>

        {error && (
          <div className="mt-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">

          <label className="font-semibold text-sm">
            Email
          </label>

          <input
            name="email"
            type="email"
            className="input mt-2"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

        </div>

        <div className="mt-5">

          <label className="font-semibold text-sm">
            Password
          </label>

          <input
            name="password"
            type="password"
            className="input mt-2"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-7 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}

          <Link
            to="/signup"
            className="font-bold text-[#173f2b]"
          >
            Create one
          </Link>

        </p>

      </form>

    </div>
  );
};

export default Login;

